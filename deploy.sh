#!/bin/bash

# Device Monitor - Linux/Mac Deployment Script
# Run: chmod +x deploy.sh && ./deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "\n${CYAN}===> $1${NC}"
}

print_success() {
    echo -e "${GREEN}[OK] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[X] $1${NC}"
}

# Banner
echo -e "\n${MAGENTA}========================================"
echo "   Device Monitor - Deployment Script  "
echo -e "========================================${NC}\n"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check Node.js
print_step "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/ (v18 or later)"
    echo "Or use: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm is not installed!"
    exit 1
fi

# Backend Setup
print_step "Setting up Backend..."
cd "$SCRIPT_DIR/backend"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found in backend folder."
    echo -e "\n${YELLOW}Please provide the following environment variables:${NC}"
    
    read -p "SUPABASE_URL: " SUPABASE_URL
    read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    read -p "OPENROUTER_API_KEY (press Enter to skip): " OPENROUTER_API_KEY
    
    cat > .env << EOF
PORT=3001
NODE_ENV=production
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
EOF
    
    print_success "Created .env file"
else
    print_success "Backend .env file exists"
fi

# Install backend dependencies
print_step "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Build backend
print_step "Building backend..."
npm run build
print_success "Backend built successfully"

# Frontend Setup
print_step "Setting up Frontend..."
cd "$SCRIPT_DIR/frontend"

# Check/create frontend .env.local
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
    print_success "Created frontend .env.local"
else
    print_success "Frontend .env.local exists"
fi

# Install frontend dependencies
print_step "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build frontend
print_step "Building frontend..."
npm run build
print_success "Frontend built successfully"

cd "$SCRIPT_DIR"

# Check for PM2
print_step "Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    print_success "PM2 found: $PM2_VERSION"
else
    print_warning "PM2 not found. Installing globally..."
    sudo npm install -g pm2
    print_success "PM2 installed"
fi

# Start services with PM2
print_step "Starting services with PM2..."

# Stop existing instances if any
pm2 delete device-monitor-backend 2>/dev/null || true
pm2 delete device-monitor-frontend 2>/dev/null || true

# Start backend
cd "$SCRIPT_DIR/backend"
pm2 start dist/index.js --name "device-monitor-backend"
print_success "Backend started"

# Start frontend
cd "$SCRIPT_DIR/frontend"
pm2 start npm --name "device-monitor-frontend" -- start
print_success "Frontend started"

# Save PM2 configuration
pm2 save

cd "$SCRIPT_DIR"

# Get local IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ipconfig getifaddr en0 2>/dev/null || echo "")

# Done!
echo -e "\n${GREEN}========================================"
echo "   Deployment Complete!                "
echo -e "========================================${NC}\n"

echo -e "Your Device Monitor is now running!\n"

echo -e "${CYAN}Access URLs:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"

if [ -n "$LOCAL_IP" ]; then
    echo -e "\n${CYAN}Network Access (other devices):${NC}"
    echo "  Frontend:  http://${LOCAL_IP}:3000"
fi

echo -e "\n${YELLOW}Useful PM2 Commands:${NC}"
echo "  pm2 status          - View running services"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all services"
echo "  pm2 stop all        - Stop all services"

echo -e "\n${YELLOW}Auto-start on reboot:${NC}"
echo "  pm2 startup         - Generate startup script"
echo ""
