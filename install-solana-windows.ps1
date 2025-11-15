# Solana CLI Installation Script for Windows
# Run this script in PowerShell (may require Administrator privileges)

Write-Host "Installing Solana CLI for Windows..." -ForegroundColor Green
Write-Host ""

# Check if we're running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Warning: Not running as Administrator. Some steps may require elevated privileges." -ForegroundColor Yellow
    Write-Host ""
}

# Determine architecture
$arch = if ([Environment]::Is64BitOperatingSystem) { "x86_64" } else { "x86" }

# Solana version (update as needed)
$solanaVersion = "stable"

# Installation directory
$installDir = "$env:USERPROFILE\.local\share\solana\install"

Write-Host "Architecture: $arch" -ForegroundColor Cyan
Write-Host "Install directory: $installDir" -ForegroundColor Cyan
Write-Host ""

# Create install directory
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download URL
$downloadUrl = "https://release.solana.com/$solanaVersion/solana-release-$arch-pc-windows-msvc.tar.bz2"
$downloadFile = "$env:TEMP\solana-release.tar.bz2"

Write-Host "Downloading Solana CLI..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadFile -UseBasicParsing
    Write-Host "✓ Download complete" -ForegroundColor Green
} catch {
    Write-Host "✗ Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://github.com/solana-labs/solana/releases" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Extracting Solana CLI..." -ForegroundColor Yellow

# Check if 7-Zip or tar is available
$has7zip = Get-Command "7z" -ErrorAction SilentlyContinue
$hasTar = Get-Command "tar" -ErrorAction SilentlyContinue

if ($hasTar) {
    # Use built-in tar (Windows 10+)
    $extractDir = "$env:TEMP\solana-extract"
    if (Test-Path $extractDir) {
        Remove-Item -Recurse -Force $extractDir
    }
    New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
    
    tar -xjf $downloadFile -C $extractDir
    Write-Host "✓ Extraction complete" -ForegroundColor Green
} elseif ($has7zip) {
    # Use 7-Zip
    $extractDir = "$env:TEMP\solana-extract"
    if (Test-Path $extractDir) {
        Remove-Item -Recurse -Force $extractDir
    }
    New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
    
    7z x $downloadFile -o"$extractDir" -y | Out-Null
    Write-Host "✓ Extraction complete" -ForegroundColor Green
} else {
    Write-Host "✗ No extraction tool found (tar or 7-Zip required)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install 7-Zip from https://www.7-zip.org/" -ForegroundColor Yellow
    Write-Host "Or use Windows 10+ which includes tar" -ForegroundColor Yellow
    exit 1
}

# Find the extracted solana-release directory
$solanaReleaseDir = Get-ChildItem -Path $extractDir -Directory -Filter "solana-release-*" | Select-Object -First 1

if (-not $solanaReleaseDir) {
    Write-Host "✗ Could not find extracted Solana directory" -ForegroundColor Red
    exit 1
}

# Copy to install directory
$versionDir = "$installDir\$solanaVersion"
if (Test-Path $versionDir) {
    Remove-Item -Recurse -Force $versionDir
}
Copy-Item -Path $solanaReleaseDir.FullName -Destination $versionDir -Recurse

# Create active_release symlink
$activeRelease = "$installDir\active_release"
if (Test-Path $activeRelease) {
    Remove-Item -Force $activeRelease
}
New-Item -ItemType SymbolicLink -Path $activeRelease -Target $versionDir | Out-Null

# Add to PATH
$binPath = "$activeRelease\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$binPath*") {
    Write-Host ""
    Write-Host "Adding Solana to PATH..." -ForegroundColor Yellow
    $newPath = "$currentPath;$binPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✓ Added to PATH" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please close and reopen your terminal for PATH changes to take effect!" -ForegroundColor Yellow
} else {
    Write-Host "✓ Solana bin directory already in PATH" -ForegroundColor Green
}

# Cleanup
Remove-Item $downloadFile -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $extractDir -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Solana CLI installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen your terminal" -ForegroundColor White
Write-Host "2. Verify installation: solana --version" -ForegroundColor White
Write-Host "3. Configure: solana config set --url localhost" -ForegroundColor White
Write-Host "4. Generate keypair: solana-keygen new" -ForegroundColor White

