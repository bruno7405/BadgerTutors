use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod student_registry {
    use super::*;

    /// Initialize the student registry
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.total_users = 0;
        registry.bump = ctx.bumps.registry;
        Ok(())
    }

    /// Register a new student
    /// Uses PDAs to ensure uniqueness of student_id, email, and wallet_key
    pub fn register_student(
        ctx: Context<RegisterStudent>,
        student_id: String,
        email: String,
    ) -> Result<()> {
        // Validate student ID is exactly 10 digits
        require!(
            student_id.len() == 10 && student_id.chars().all(|c| c.is_ascii_digit()),
            StudentRegistryError::InvalidStudentId
        );

        // Validate email ends with @wisc.edu
        require!(
            email.ends_with("@wisc.edu"),
            StudentRegistryError::InvalidEmail
        );

        let registry = &mut ctx.accounts.registry;
        let student_account = &mut ctx.accounts.student_account;
        let wallet_key = ctx.accounts.user.key();
        let clock = Clock::get()?;

        // The PDA accounts for uniqueness checks are created automatically
        // If they already exist, the init constraint will fail, ensuring uniqueness
        
        // Store student data
        student_account.student_id = student_id;
        student_account.email = email;
        student_account.wallet_key = wallet_key;
        student_account.registered_at = clock.unix_timestamp;
        student_account.bump = ctx.bumps.student_account;

        registry.total_users += 1;

        msg!("Student registered successfully!");
        msg!("Student ID: {}", student_account.student_id);
        msg!("Email: {}", student_account.email);
        msg!("Wallet: {}", student_account.wallet_key);
        Ok(())
    }

    /// Login/verify student credentials
    pub fn login_student(
        ctx: Context<LoginStudent>,
        student_id: String,
        email: String,
    ) -> Result<()> {
        let student_account = &ctx.accounts.student_account;

        require!(
            student_account.student_id == student_id,
            StudentRegistryError::InvalidCredentials
        );

        require!(
            student_account.email == email,
            StudentRegistryError::InvalidCredentials
        );

        require!(
            student_account.wallet_key == ctx.accounts.user.key(),
            StudentRegistryError::InvalidWallet
        );

        msg!("Login successful!");
        msg!("Welcome back, Student ID: {}", student_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + StudentRegistry::INIT_SPACE,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, StudentRegistry>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(student_id: String, email: String)]
pub struct RegisterStudent<'info> {
    #[account(
        mut,
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, StudentRegistry>,

    // Main student account - stores all student data
    #[account(
        init,
        payer = user,
        space = 8 + StudentAccount::INIT_SPACE,
        seeds = [
            b"student",
            student_id.as_bytes(),
            email.as_bytes()
        ],
        bump
    )]
    pub student_account: Account<'info, StudentAccount>,

    // PDA to ensure student_id uniqueness (acts as a hash map entry)
    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [b"student_id", student_id.as_bytes()],
        bump
    )]
    pub student_id_uniqueness: Account<'info, UniquenessMarker>,

    // PDA to ensure email uniqueness (acts as a hash map entry)
    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [b"email", email.as_bytes()],
        bump
    )]
    pub email_uniqueness: Account<'info, UniquenessMarker>,

    // PDA to ensure wallet_key uniqueness (acts as a hash map entry)
    #[account(
        init,
        payer = user,
        space = 8 + 1,
        seeds = [b"wallet", user.key().as_ref()],
        bump
    )]
    pub wallet_uniqueness: Account<'info, UniquenessMarker>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(student_id: String, email: String)]
pub struct LoginStudent<'info> {
    #[account(
        seeds = [b"registry"],
        bump = registry.bump
    )]
    pub registry: Account<'info, StudentRegistry>,

    #[account(
        seeds = [
            b"student",
            student_id.as_bytes(),
            email.as_bytes()
        ],
        bump = student_account.bump
    )]
    pub student_account: Account<'info, StudentAccount>,

    pub user: Signer<'info>,
}

#[account]
pub struct StudentRegistry {
    pub authority: Pubkey,
    pub total_users: u64,
    pub bump: u8,
}

impl Space for StudentRegistry {
    const INIT_SPACE: usize = 32 + // authority
        8 + // total_users
        1; // bump
}

#[account]
pub struct StudentAccount {
    pub student_id: String,
    pub email: String,
    pub wallet_key: Pubkey,
    pub registered_at: i64,
    pub bump: u8,
}

impl Space for StudentAccount {
    const INIT_SPACE: usize = 4 + 10 + // student_id (String: 4-byte length + content)
        4 + 100 + // email (String: 4-byte length + content)
        32 + // wallet_key (Pubkey)
        8 + // registered_at (i64)
        1; // bump (u8)
}

// Marker account to ensure uniqueness
// Each PDA acts as a hash map entry - if it exists, the value is taken
#[account]
pub struct UniquenessMarker {
    pub bump: u8,
}

#[error_code]
pub enum StudentRegistryError {
    #[msg("Invalid student ID. Must be exactly 10 digits.")]
    InvalidStudentId,
    #[msg("Invalid email format. Email must end with @wisc.edu")]
    InvalidEmail,
    #[msg("Student ID already exists.")]
    StudentIdAlreadyExists,
    #[msg("Email already exists.")]
    EmailAlreadyExists,
    #[msg("Wallet key already exists.")]
    WalletAlreadyExists,
    #[msg("Invalid credentials.")]
    InvalidCredentials,
    #[msg("Invalid wallet key.")]
    InvalidWallet,
}

