# Backend Setup Guide

## Prerequisites

1. Install Rust: https://rustup.rs/
2. Install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools
3. Install Anchor: https://www.anchor-lang.com/docs/installation

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the program:**
   ```bash
   anchor build
   ```

3. **Generate IDL (after build):**
   After building, copy the generated IDL to the frontend:
   ```bash
   cp target/idl/badger_tutors.json ../frontend/src/lib/solana-contract/idl.json
   ```
   
   Then update `frontend/src/lib/solana-contract/idl.ts` to import from the JSON file.

4. **Deploy to devnet:**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

5. **Update Program ID:**
   After deployment, update the `PROGRAM_ID` in:
   - `backend/lib/index.ts`
   - `frontend/src/lib/solana-contract/index.ts`
   - `backend/programs/badger-tutors/src/lib.rs` (declare_id!)

## Testing

```bash
anchor test
```

## Program Instructions

- `pay_solana`: Student pays SOL into escrow
- `confirm_session`: Confirm session completion
- `receive_solana`: Tutor receives payment
- `update_rating`: Submit tutor rating
- `cancel_session`: Cancel and refund

