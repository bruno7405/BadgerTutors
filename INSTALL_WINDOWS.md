# Windows Installation Guide for BadgerTutors

This is a step-by-step Windows-specific installation guide. Follow these steps in order.

## Step 1: Install Rust

### Option A: Using PowerShell (Recommended)
```powershell
# Download Rust installer
Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe

# Run installer
.\rustup-init.exe

# Follow the prompts (press Enter for default options)
```

### Option B: Manual Download
1. Go to https://rustup.rs/
2. Download and run `rustup-init.exe`
3. Follow the installation wizard

**After installation:**
- **Close and reopen your PowerShell/terminal**
- Verify installation:
```powershell
rustc --version
cargo --version
```

---

## Step 2: Install Solana CLI

### Option A: Using PowerShell (Recommended)
```powershell
# Download Solana installer script
Invoke-WebRequest -Uri https://release.solana.com/stable/install -OutFile install-solana.ps1

# Run the installer (may require Administrator)
.\install-solana.ps1

# Or if you have Git Bash or WSL:
# bash -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### Option B: Manual Installation
1. Go to https://github.com/solana-labs/solana/releases
2. Download the latest Windows release (e.g., `solana-release-x86_64-pc-windows-msvc.tar.bz2`)
3. Extract the archive
4. Add the `bin` folder to your PATH:
   - Open System Properties → Environment Variables
   - Edit PATH variable
   - Add the full path to the `bin` folder (e.g., `C:\solana\bin`)

**After installation:**
- **Close and reopen your PowerShell/terminal**
- Verify installation:
```powershell
solana --version
```

**Configure Solana:**
```powershell
# Set to localnet for development
solana config set --url localhost

# Generate a keypair
solana-keygen new

# Check configuration
solana config get
```

---

## Step 3: Install Anchor Framework

**Important:** Make sure Rust is installed first!

```powershell
# Install Anchor Version Manager (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest Anchor version
avm install latest

# Use the latest version
avm use latest
```

**After installation:**
- **Close and reopen your PowerShell/terminal**
- Verify installation:
```powershell
anchor --version
```

**If `anchor` command is not found:**
- Add Cargo's bin directory to PATH: `C:\Users\YourUsername\.cargo\bin`
- Restart your terminal

---

## Step 4: Install Node.js and Yarn

### Install Node.js
1. Go to https://nodejs.org/
2. Download the LTS version (recommended)
3. Run the installer
4. Follow the installation wizard

### Install Yarn
```powershell
npm install -g yarn
```

**Verify installation:**
```powershell
node --version
npm --version
yarn --version
```

---

## Step 5: Install Project Dependencies

```powershell
# Navigate to the client directory
cd client

# Install dependencies
yarn install

# Return to project root
cd ..
```

---

## Step 6: Build the Solana Program

```powershell
# Make sure you're in the project root directory
anchor build
```

This will:
- Compile your Solana program
- Generate TypeScript types in `target/types/`

---

## Step 7: Start Local Validator (for Testing)

Open a **new PowerShell window** and run:
```powershell
solana-test-validator
```

Keep this window open. This runs a local Solana blockchain.

---

## Step 8: Deploy to Localnet

In your **original PowerShell window** (not the validator window):
```powershell
# Make sure test validator is running first!
anchor deploy
```

---

## Troubleshooting

### "command not found" errors

1. **Rust commands not found:**
   - Restart your terminal after installing Rust
   - Check PATH includes: `C:\Users\YourUsername\.cargo\bin`

2. **Solana commands not found:**
   - Restart your terminal after installing Solana
   - Check PATH includes Solana's bin directory
   - Default location: `C:\Users\YourUsername\.local\share\solana\install\active_release\bin`

3. **Anchor commands not found:**
   - Make sure you ran `avm use latest`
   - Check PATH includes: `C:\Users\YourUsername\.cargo\bin`
   - Restart your terminal

### PowerShell Execution Policy Error

If you get an execution policy error:
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Build Errors

If `anchor build` fails:
- Make sure Rust is properly installed: `rustc --version`
- Make sure Anchor is installed: `anchor --version`
- Try cleaning and rebuilding:
  ```powershell
  anchor clean
  anchor build
  ```

### Port Already in Use

If `solana-test-validator` says port is in use:
- Kill the process using port 8899:
  ```powershell
  # Find process
  netstat -ano | findstr :8899
  # Kill process (replace PID with actual process ID)
  taskkill /PID <PID> /F
  ```

---

## Quick Verification Checklist

Run these commands to verify everything is installed:

```powershell
rustc --version      # Should show Rust version
cargo --version      # Should show Cargo version
solana --version     # Should show Solana version
anchor --version     # Should show Anchor version
node --version       # Should show Node.js version
yarn --version       # Should show Yarn version
```

All commands should work without errors!

---

## Next Steps

Once everything is installed:
1. Start building your smart contract in `programs/badger-tutors/src/lib.rs`
2. Write tests in the `tests/` directory
3. Build your frontend to interact with the program

