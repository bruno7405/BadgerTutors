# BadgerTutors

A Solana-based marketplace for tutors and students with school ID verification.

## Features

- **User Registration**: Store user information (students and tutors) with school ID verification
- **One Account Per Person**: Ensures only one person per account using school ID verification
- **Transaction Processing**: Handle transactions using smart contract data

## Tech Stack

- **Solana Blockchain**: Smart contracts for decentralized marketplace
- **Anchor Framework**: Solana development framework
- **Rust**: Solana program language
- **TypeScript**: Client-side interactions

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Rust** - [Install Rust](https://rustup.rs/)
2. **Solana CLI** - [Install Solana](https://docs.solana.com/cli/install-solana-cli-tools)
3. **Anchor Framework** - [Install Anchor](https://www.anchor-lang.com/docs/installation)
4. **Node.js** (v16+) and Yarn

### Setup

1. **Run the setup script** (Windows PowerShell):

   ```powershell
   .\setup.ps1
   ```

2. **Or follow manual setup**:
   - **Windows users**: See [INSTALL_WINDOWS.md](./INSTALL_WINDOWS.md) for step-by-step Windows installation
   - **All platforms**: See [SETUP.md](./SETUP.md) for general installation instructions

3. **Install dependencies**:

   ```bash
   cd client
   yarn install
   cd ..
   ```

4. **Build the program**:

   ```bash
   anchor build
   ```

5. **Start local validator** (in a separate terminal):

   ```bash
   solana-test-validator
   ```

6. **Deploy to localnet**:
   ```bash
   anchor deploy
   ```

## Project Structure

```
BadgerTutors/
├── Anchor.toml              # Anchor configuration
├── Cargo.toml               # Rust workspace config
├── programs/
│   └── badger-tutors/       # Solana program (smart contract)
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs       # Main program logic
├── client/                  # TypeScript client
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts         # Client implementation
└── tests/                   # Integration tests
```

## Development

### Build

```bash
anchor build
```

### Test

```bash
anchor test
```

### Deploy

```bash
anchor deploy
```

## Documentation

- [Setup Guide](./SETUP.md) - Detailed installation and setup instructions
- [Solana Docs](https://docs.solana.com/)
- [Anchor Docs](https://www.anchor-lang.com/)

## License

MIT
