# Device Monitor - Windows Deployment Script
# Run this script in PowerShell as Administrator

param(
    [switch]$SkipEnvSetup,
    [switch]$DevMode
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($message) {
    Write-Host ""
    Write-Host "===> $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Write-Warning2($message) {
    Write-Host "[!] $message" -ForegroundColor Yellow
}

function Write-Error2($message) {
    Write-Host "[X] $message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   Device Monitor - Deployment Script  " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Check Node.js
Write-Step "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Error2 "Node.js is not installed!"
    Write-Host "Please install Node.js from https://nodejs.org/ (v18 or later)"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "npm found: $npmVersion"
} catch {
    Write-Error2 "npm is not installed!"
    exit 1
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Backend Setup
Write-Step "Setting up Backend..."
Set-Location "$scriptDir\backend"

# Check if .env exists
if (-not (Test-Path ".env") -and -not $SkipEnvSetup) {
    Write-Warning2 "No .env file found in backend folder."
    Write-Host ""
    Write-Host "Please provide the following environment variables:" -ForegroundColor Yellow
    
    $supabaseUrl = Read-Host "SUPABASE_URL"
    $supabaseKey = Read-Host "SUPABASE_ANON_KEY"
    $openrouterKey = Read-Host "OPENROUTER_API_KEY (press Enter to skip)"
    
    $envContent = @"
PORT=3001
NODE_ENV=production
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$supabaseKey
OPENROUTER_API_KEY=$openrouterKey
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Success "Created .env file"
} else {
    Write-Success "Backend .env file exists"
}

# Install backend dependencies
Write-Step "Installing backend dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Error2 "Failed to install backend dependencies"; exit 1 }
Write-Success "Backend dependencies installed"

# Build backend
Write-Step "Building backend..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error2 "Failed to build backend"; exit 1 }
Write-Success "Backend built successfully"

# Frontend Setup
Write-Step "Setting up Frontend..."
Set-Location "$scriptDir\frontend"

# Check/create frontend .env.local
if (-not (Test-Path ".env.local")) {
    $envLocalContent = @"
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
"@
    Set-Content -Path ".env.local" -Value $envLocalContent
    Write-Success "Created frontend .env.local"
} else {
    Write-Success "Frontend .env.local exists"
}

# Install frontend dependencies
Write-Step "Installing frontend dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Error2 "Failed to install frontend dependencies"; exit 1 }
Write-Success "Frontend dependencies installed"

# Build frontend
Write-Step "Building frontend..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error2 "Failed to build frontend"; exit 1 }
Write-Success "Frontend built successfully"

Set-Location $scriptDir

# Check for PM2
Write-Step "Checking PM2 installation..."
$pm2Installed = $false
try {
    $pm2Version = pm2 --version 2>$null
    $pm2Installed = $true
    Write-Success "PM2 found: $pm2Version"
} catch {
    Write-Warning2 "PM2 not found. Installing globally..."
    npm install -g pm2
    $pm2Installed = $true
    Write-Success "PM2 installed"
}

# Start services with PM2
Write-Step "Starting services with PM2..."

# Stop existing instances if any
pm2 delete device-monitor-backend 2>$null
pm2 delete device-monitor-frontend 2>$null

# Start using ecosystem config (handles cwd and paths correctly)
Set-Location $scriptDir
pm2 start ecosystem.config.js
Write-Success "Services started"

# Save PM2 configuration
pm2 save

# Wait a moment for services to start
Start-Sleep -Seconds 3

# Check status
pm2 list

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress

# Done!
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Deployment Complete!                " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Device Monitor is now running!" -ForegroundColor White
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:3001" -ForegroundColor White
if ($localIP) {
    Write-Host ""
    Write-Host "Network Access (other devices):" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://${localIP}:3000" -ForegroundColor White
}
Write-Host ""
Write-Host "Useful PM2 Commands:" -ForegroundColor Yellow
Write-Host "  pm2 status          - View running services"
Write-Host "  pm2 logs            - View logs"
Write-Host "  pm2 restart all     - Restart all services"
Write-Host "  pm2 stop all        - Stop all services"
Write-Host ""
