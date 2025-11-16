# Student Registry Smart Contract

A Solana smart contract built with Anchor that manages student registration and login using student ID, email, and crypto wallet key.

## Features

- **Unique Student ID**: Validates and ensures 10-digit student IDs are unique
- **Unique Email**: Ensures each email address can only be registered once
- **Unique Wallet Key**: Prevents the same wallet from registering multiple accounts
- **Secure Login**: Verifies student credentials (ID, email, and wallet signature)

## How It Works

The contract uses **Program Derived Addresses (PDAs)** to implement hash map-like functionality for ensuring uniqueness:

1. **Student ID Uniqueness**: Creates a PDA with seed `["student_id", student_id]` - if this PDA already exists, registration fails
2. **Email Uniqueness**: Creates a PDA with seed `["email", email]` - if this PDA already exists, registration fails
3. **Wallet Uniqueness**: Creates a PDA with seed `["wallet", wallet_pubkey]` - if this PDA already exists, registration fails

Each PDA acts as a hash map entry - if it exists, the value is already taken.

## Program Instructions

### `initialize`

Initializes the student registry. Must be called once before any registrations.

**Accounts:**

- `registry`: The main registry account (PDA)
- `authority`: The account that will own the registry
- `system_program`: Solana System Program

### `register_student`

Registers a new student with their 10-digit student ID, email, and wallet key.

**Parameters:**

- `student_id`: String - Must be exactly 10 digits
- `email`: String - Must contain '@wisc.edu' to ensure it is a valid university email

**Accounts:**

- `registry`: The main registry account
- `student_account`: The student's data account (PDA)
- `student_id_uniqueness`: PDA marker for student ID uniqueness
- `email_uniqueness`: PDA marker for email uniqueness
- `wallet_uniqueness`: PDA marker for wallet uniqueness
- `user`: The signing wallet (used as wallet_key)
- `system_program`: Solana System Program

**Validation:**

- Student ID must be exactly 10 digits
- Email must contain '@wisc.edu'
- Student ID must be unique
- Email must be unique
- Wallet key must be unique

### `login_student`

Verifies student credentials for login.

**Parameters:**

- `student_id`: String - The student's 10-digit ID
- `email`: String - The student's email

**Accounts:**

- `registry`: The main registry account
- `student_account`: The student's data account (PDA)
- `user`: The signing wallet (must match registered wallet_key)

**Validation:**

- Student ID must match registered ID
- Email must match registered email
- Signing wallet must match registered wallet_key

## Setup

1. Install Anchor: https://www.anchor-lang.com/docs/installation

2. Build the program:

```bash
anchor build
```

3. Deploy to localnet:

```bash
anchor deploy
```

## Usage Example

### TypeScript/JavaScript Client

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentRegistry } from "./target/types/student_registry";

// Initialize
await program.methods
  .initialize()
  .accounts({
    registry: registryPda,
    authority: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

// Register Student
await program.methods
  .registerStudent("1234567890", "student@university.edu")
  .accounts({
    registry: registryPda,
    studentAccount: studentAccountPda,
    studentIdUniqueness: studentIdUniquenessPda,
    emailUniqueness: emailUniquenessPda,
    walletUniqueness: walletUniquenessPda,
    user: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

// Login
await program.methods
  .loginStudent("1234567890", "student@university.edu")
  .accounts({
    registry: registryPda,
    studentAccount: studentAccountPda,
    user: provider.wallet.publicKey,
  })
  .rpc();
```

## Account Structure

### StudentRegistry

- `authority`: Pubkey - The authority that can manage the registry
- `total_users`: u64 - Total number of registered students
- `bump`: u8 - PDA bump seed

### StudentAccount

- `student_id`: String - 10-digit student ID
- `email`: String - Student email address
- `wallet_key`: Pubkey - The student's wallet public key
- `registered_at`: i64 - Unix timestamp of registration
- `bump`: u8 - PDA bump seed

## Error Codes

- `InvalidStudentId`: Student ID is not exactly 10 digits
- `InvalidEmail`: Email format is invalid
- `StudentIdAlreadyExists`: Student ID is already registered
- `EmailAlreadyExists`: Email is already registered
- `WalletAlreadyExists`: Wallet key is already registered
- `InvalidCredentials`: Student ID or email doesn't match
- `InvalidWallet`: Wallet key doesn't match registered wallet
