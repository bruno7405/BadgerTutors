# BadgerTutors Solana Smart Contract

This is the Solana smart contract (Anchor program) for the BadgerTutors platform.

## Instructions

1. **pay_solana**: Student pays SOL into escrow when booking a session
2. **confirm_session**: Student or tutor confirms session completion
3. **receive_solana**: Tutor receives payment after both parties confirm (or 24h deadline)
4. **update_rating**: Student can rate tutor after payment is released
5. **cancel_session**: Cancel session and refund student

## Setup

1. Install Anchor: https://www.anchor-lang.com/docs/installation
2. Install dependencies: `npm install`
3. Build: `anchor build`
4. Deploy: `anchor deploy`

## Development

- Test: `anchor test`
- Deploy to devnet: `anchor deploy --provider.cluster devnet`

