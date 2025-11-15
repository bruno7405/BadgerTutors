use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod badger_tutors {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("BadgerTutors program initialized");
        Ok(())
        
    }
}

#[derive(Accounts)]
pub struct Initialize {}

