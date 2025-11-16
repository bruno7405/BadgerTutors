use anchor_lang::prelude::*;

declare_id!("BadgerTutors111111111111111111111111111");

#[program]
pub mod badger_tutors {
    use super::*;

    /// Initialize a new escrow account for a tutoring session
    /// Student pays SOL into escrow
    pub fn pay_solana(
        ctx: Context<PaySolana>,
        session_id: String,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.student = ctx.accounts.student.key();
        escrow.tutor = ctx.accounts.tutor.key();
        escrow.session_id = session_id;
        escrow.amount = amount;
        escrow.status = EscrowStatus::Locked;
        escrow.confirmed_by_student = false;
        escrow.confirmed_by_tutor = false;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.confirmation_deadline = Clock::get()?.unix_timestamp + (24 * 60 * 60); // 24 hours

        // Transfer SOL from student to escrow PDA
        anchor_lang::solana_program::program::invoke(
            &anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.student.key(),
                &ctx.accounts.escrow.key(),
                amount,
            ),
            &[
                ctx.accounts.student.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Escrow created: {} lamports locked for session {}", amount, escrow.session_id);
        Ok(())
    }

    /// Confirm session completion (can be called by student or tutor)
    pub fn confirm_session(
        ctx: Context<ConfirmSession>,
        is_student: bool,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        // Allow confirmation if locked or already awaiting confirmation
        require!(
            escrow.status == EscrowStatus::Locked || escrow.status == EscrowStatus::AwaitingConfirmation,
            BadgerTutorsError::EscrowNotLocked
        );

        // Prevent double confirmation
        if is_student {
            require!(
                !escrow.confirmed_by_student,
                BadgerTutorsError::Unauthorized
            );
            escrow.confirmed_by_student = true;
            escrow.student_confirmed_at = Some(Clock::get()?.unix_timestamp);
        } else {
            require!(
                !escrow.confirmed_by_tutor,
                BadgerTutorsError::Unauthorized
            );
            escrow.confirmed_by_tutor = true;
            escrow.tutor_confirmed_at = Some(Clock::get()?.unix_timestamp);
        }

        // Update status to awaiting confirmation (ready for release)
        escrow.status = EscrowStatus::AwaitingConfirmation;

        msg!("Session confirmed by {}", if is_student { "student" } else { "tutor" });
        Ok(())
    }

    /// Release payment to tutor (called automatically when both confirm or after deadline)
    pub fn receive_solana(ctx: Context<ReceiveSolana>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::AwaitingConfirmation || escrow.status == EscrowStatus::Locked,
            BadgerTutorsError::EscrowAlreadyReleased
        );

        let current_time = Clock::get()?.unix_timestamp;
        let deadline_passed = current_time >= escrow.confirmation_deadline;
        let both_confirmed = escrow.confirmed_by_student && escrow.confirmed_by_tutor;

        require!(
            deadline_passed || both_confirmed,
            BadgerTutorsError::CannotReleaseYet
        );

        escrow.status = EscrowStatus::Released;
        escrow.released_at = Some(current_time);

        // Transfer SOL from escrow PDA to tutor
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= escrow.amount;
        **ctx.accounts.tutor.to_account_info().try_borrow_mut_lamports()? += escrow.amount;

        msg!("Payment of {} lamports released to tutor", escrow.amount);
        Ok(())
    }

    /// Update tutor rating after session completion
    pub fn update_rating(
        ctx: Context<UpdateRating>,
        rating: u8,
        review_text: String,
    ) -> Result<()> {
        require!(
            rating >= 1 && rating <= 5,
            BadgerTutorsError::InvalidRating
        );

        let escrow = &ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Released,
            BadgerTutorsError::PaymentNotReleased
        );

        require!(
            escrow.student == ctx.accounts.student.key(),
            BadgerTutorsError::Unauthorized
        );

        let rating_account = &mut ctx.accounts.rating_account;
        rating_account.tutor = ctx.accounts.tutor.key();
        rating_account.student = ctx.accounts.student.key();
        rating_account.session_id = escrow.session_id.clone();
        rating_account.rating = rating;
        rating_account.review_text = review_text;
        rating_account.created_at = Clock::get()?.unix_timestamp;

        // Update tutor's aggregate rating
        let tutor_rating = &mut ctx.accounts.tutor_rating;
        tutor_rating.total_ratings += 1;
        tutor_rating.total_score += rating as u64;
        tutor_rating.average_rating = (tutor_rating.total_score as f64 / tutor_rating.total_ratings as f64) * 100.0; // Scale to 100

        msg!("Rating updated: {} stars for tutor {}", rating, tutor_rating.tutor);
        Ok(())
    }

    /// Cancel session and refund student
    pub fn cancel_session(ctx: Context<CancelSession>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Locked || escrow.status == EscrowStatus::AwaitingConfirmation,
            BadgerTutorsError::CannotCancel
        );

        escrow.status = EscrowStatus::Cancelled;

        // Refund SOL from escrow PDA to student
        **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= escrow.amount;
        **ctx.accounts.student.to_account_info().try_borrow_mut_lamports()? += escrow.amount;

        msg!("Session cancelled: {} lamports refunded to student", escrow.amount);
        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(session_id: String)]
pub struct PaySolana<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    /// CHECK: Tutor public key
    pub tutor: AccountInfo<'info>,
    
    #[account(
        init,
        payer = student,
        space = 8 + EscrowAccount::LEN,
        seeds = [b"escrow", session_id.as_bytes(), student.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmSession<'info> {
    #[account(mut)]
    pub confirmer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", escrow.session_id.as_bytes(), escrow.student.as_ref()],
        bump,
        constraint = confirmer.key() == escrow.student || confirmer.key() == escrow.tutor 
            @ BadgerTutorsError::Unauthorized
    )]
    pub escrow: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
pub struct ReceiveSolana<'info> {
    #[account(mut)]
    pub tutor: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", escrow.session_id.as_bytes(), escrow.student.as_ref()],
        bump,
        constraint = tutor.key() == escrow.tutor @ BadgerTutorsError::Unauthorized
    )]
    pub escrow: Account<'info, EscrowAccount>,
}

#[derive(Accounts)]
#[instruction(rating: u8, review_text: String)]
pub struct UpdateRating<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    /// CHECK: Tutor public key
    pub tutor: AccountInfo<'info>,
    
    pub escrow: Account<'info, EscrowAccount>,
    
    #[account(
        init,
        payer = student,
        space = 8 + RatingAccount::LEN,
        seeds = [b"rating", escrow.session_id.as_bytes(), student.key().as_ref()],
        bump
    )]
    pub rating_account: Account<'info, RatingAccount>,
    
    #[account(
        init_if_needed,
        payer = student,
        space = 8 + TutorRating::LEN,
        seeds = [b"tutor_rating", tutor.key().as_ref()],
        bump
    )]
    pub tutor_rating: Account<'info, TutorRating>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelSession<'info> {
    #[account(mut)]
    pub student: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"escrow", escrow.session_id.as_bytes(), escrow.student.as_ref()],
        bump,
        constraint = escrow.student == student.key() @ BadgerTutorsError::Unauthorized
    )]
    pub escrow: Account<'info, EscrowAccount>,
}

#[account]
pub struct EscrowAccount {
    pub student: Pubkey,
    pub tutor: Pubkey,
    pub session_id: String,
    pub amount: u64,
    pub status: EscrowStatus,
    pub confirmed_by_student: bool,
    pub confirmed_by_tutor: bool,
    pub student_confirmed_at: Option<i64>,
    pub tutor_confirmed_at: Option<i64>,
    pub created_at: i64,
    pub confirmation_deadline: i64,
    pub released_at: Option<i64>,
}

impl EscrowAccount {
    // Account size: 8 (discriminator) + fields
    // student: 32, tutor: 32, session_id: 4 (length) + 64 (max string), 
    // amount: 8, status: 1, confirmed_by_student: 1, confirmed_by_tutor: 1,
    // student_confirmed_at: 1 (Option) + 8, tutor_confirmed_at: 1 + 8,
    // created_at: 8, confirmation_deadline: 8, released_at: 1 + 8
    pub const LEN: usize = 32 + 32 + 4 + 64 + 8 + 1 + 1 + 1 + 9 + 9 + 8 + 8 + 9;
}

#[account]
pub struct RatingAccount {
    pub tutor: Pubkey,
    pub student: Pubkey,
    pub session_id: String,
    pub rating: u8,
    pub review_text: String,
    pub created_at: i64,
}

impl RatingAccount {
    // Account size: 8 (discriminator) + fields
    // tutor: 32, student: 32, session_id: 4 + 64, rating: 1,
    // review_text: 4 + 512 (max string), created_at: 8
    pub const LEN: usize = 32 + 32 + 4 + 64 + 1 + 4 + 512 + 8;
}

#[account]
pub struct TutorRating {
    pub tutor: Pubkey,
    pub total_ratings: u64,
    pub total_score: u64,
    pub average_rating: f64,
}

impl TutorRating {
    pub const LEN: usize = 32 + 8 + 8 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum EscrowStatus {
    Locked,
    AwaitingConfirmation,
    Released,
    Cancelled,
}

#[error_code]
pub enum BadgerTutorsError {
    #[msg("Escrow is not in locked status")]
    EscrowNotLocked,
    #[msg("Escrow has already been released")]
    EscrowAlreadyReleased,
    #[msg("Cannot release payment yet")]
    CannotReleaseYet,
    #[msg("Invalid rating (must be 1-5)")]
    InvalidRating,
    #[msg("Payment has not been released yet")]
    PaymentNotReleased,
    #[msg("Unauthorized action")]
    Unauthorized,
    #[msg("Cannot cancel session in current status")]
    CannotCancel,
}

