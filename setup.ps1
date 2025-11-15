# BadgerTutors Solana Environment Setup Script for Windows
# Run this script in PowerShell (may require Administrator privileges)

Write-Host "BadgerTutors - Solana Environment Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Rust is installed
Write-Host "Checking Rust installation..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version 2>&1
    Write-Host "✓ Rust is installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust is not installed" -ForegroundColor Red
    Write-Host "Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "Or run: Invoke-WebRequest -Uri https://win.rustup.rs/x86_64 -OutFile rustup-init.exe; .\rustup-init.exe" -ForegroundColor Yellow
    exit 1
}

# Check if Solana CLI is installed
Write-Host "Checking Solana CLI installation..." -ForegroundColor Yellow
try {
    $solanaVersion = solana --version 2>&1
    Write-Host "✓ Solana CLI is installed: $solanaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Solana CLI is not installed" -ForegroundColor Red
    Write-Host "Installing Solana CLI..." -ForegroundColor Yellow
    Write-Host "Please run: sh -c `"`$(curl -sSfL https://release.solana.com/stable/install)`"" -ForegroundColor Yellow
    Write-Host "Or download from: https://github.com/solana-labs/solana/releases" -ForegroundColor Yellow
}

# Check if Anchor is installed
Write-Host "Checking Anchor installation..." -ForegroundColor Yellow
try {
    $anchorVersion = anchor --version 2>&1
    Write-Host "✓ Anchor is installed: $anchorVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Anchor is not installed" -ForegroundColor Red
    Write-Host "Installing Anchor..." -ForegroundColor Yellow
    Write-Host "Run the following commands:" -ForegroundColor Yellow
    Write-Host "  cargo install --git https://github.com/coral-xyz/anchor avm --locked --force" -ForegroundColor Cyan
    Write-Host "  avm install latest" -ForegroundColor Cyan
    Write-Host "  avm use latest" -ForegroundColor Cyan
}

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
}

# Check if Yarn is installed
Write-Host "Checking Yarn installation..." -ForegroundColor Yellow
try {
    $yarnVersion = yarn --version 2>&1
    Write-Host "✓ Yarn is installed: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Yarn is not installed" -ForegroundColor Red
    Write-Host "Installing Yarn..." -ForegroundColor Yellow
    npm install -g yarn
}

Write-Host ""
Write-Host "Installing project dependencies..." -ForegroundColor Yellow

# Install client dependencies
if (Test-Path "client") {
    Set-Location client
    if (Test-Path "package.json") {
        Write-Host "Installing client dependencies..." -ForegroundColor Yellow
        yarn install
        Write-Host "✓ Client dependencies installed" -ForegroundColor Green
    }
    Set-Location ..
} else {
    Write-Host "Client directory not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure Solana: solana config set --url localhost" -ForegroundColor White
Write-Host "2. Generate keypair: solana-keygen new" -ForegroundColor White
Write-Host "3. Build program: anchor build" -ForegroundColor White
Write-Host "4. Start test validator: solana-test-validator" -ForegroundColor White
Write-Host "5. Deploy: anchor deploy" -ForegroundColor White
Write-Host ""
Write-Host "See SETUP.md for detailed instructions." -ForegroundColor Cyan

