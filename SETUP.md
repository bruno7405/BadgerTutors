# BadgerTutors - Solana Development Environment Setup

This guide will help you set up your Solana development environment for the BadgerTutors marketplace.

## Prerequisites

### 1. Install Rust

**Windows:**

1. Download and run the Rust installer from: https://rustup.rs/
2. Or use PowerShell:
   ```powershell
   Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe
   .\rustup-init.exe
   ```
3. Restart your terminal after installation

**Verify installation:**

```bash
rustc --version
cargo --version
```

### 2. Install Solana CLI

**Windows (PowerShell):**

**Option A: Use the provided script:**

```powershell
# Run the Windows installation script
.\install-solana-windows.ps1
```

**Option B: Manual installation:**

1. Download from: https://github.com/solana-labs/solana/releases
   - Look for `solana-release-x86_64-pc-windows-msvc.tar.bz2`
2. Extract using 7-Zip or Windows 10+ built-in tar
3. Add the `bin` folder to your PATH:
   - Open System Properties → Environment Variables
   - Edit PATH variable
   - Add the full path to the `bin` folder

**Option C: Using Git Bash or WSL (if available):**

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

**Note:** For detailed Windows-specific instructions, see [INSTALL_WINDOWS.md](./INSTALL_WINDOWS.md)

**Verify installation:**

```bash
solana --version
```

**Configure Solana CLI:**

```bash
# Set to localnet for development
solana config set --url localhost

# Generate a keypair if you don't have one
solana-keygen new

# Check your configuration
solana config get
```

### 3. Install Anchor Framework

**Windows (PowerShell):**

```powershell
# Install using cargo
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install Anchor using avm
avm install latest
avm use latest
```

**Verify installation:**

```bash
anchor --version
```

### 4. Install Node.js and Yarn

**Windows:**

1. Download Node.js from: https://nodejs.org/ (LTS version recommended)
2. Install Yarn globally:
   ```bash
   npm install -g yarn
   ```

**Verify installation:**

```bash
node --version
npm --version
yarn --version
```

## Project Setup

### 1. Install Project Dependencies

```bash
# Install client dependencies
cd client
yarn install

# Return to root
cd ..
```

### 2. Build the Solana Program

```bash
# Build the Anchor program
anchor build
```

### 3. Generate TypeScript Types

After building, Anchor will generate TypeScript types in `target/types/`. These will be used by your client.

### 4. Start Local Validator (Optional, for testing)

In a separate terminal:

```bash
solana-test-validator
```

This starts a local Solana blockchain for development and testing.

### 5. Deploy to Localnet

```bash
# Make sure test validator is running, then:
anchor deploy
```

## Development Workflow

1. **Write your Solana program** in `programs/badger-tutors/src/lib.rs`
2. **Build the program**: `anchor build`
3. **Test your program**: `anchor test`
4. **Deploy**: `anchor deploy`
5. **Use the client** in `client/src/` to interact with your program

## Project Structure

```
BadgerTutors/
├── Anchor.toml          # Anchor configuration
├── Cargo.toml           # Rust workspace configuration
├── programs/
│   └── badger-tutors/   # Your Solana program
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs   # Main program file
├── client/              # TypeScript client
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
└── tests/               # Integration tests (create as needed)
```

## Next Steps

1. Implement user registration with school ID verification
2. Implement transaction functionality
3. Add tests for your smart contract functions
4. Build the frontend to interact with your program

## Useful Commands

```bash
# Build program
anchor build

# Run tests
anchor test

# Deploy to localnet
anchor deploy

# Generate new keypair
solana-keygen new

# Check Solana CLI version
solana --version

# Check Anchor version
anchor --version

# Get account balance
solana balance

# Airdrop SOL (localnet only)
solana airdrop 2
```

## Troubleshooting

### Common Issues:

1. **Rust not found**: Make sure Rust is in your PATH and restart terminal
2. **Solana CLI not found**: Add Solana bin directory to PATH
3. **Anchor not found**: Make sure avm is in PATH and you've run `avm use latest`
4. **Build errors**: Make sure you're using compatible versions (Anchor 0.29.0)

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
