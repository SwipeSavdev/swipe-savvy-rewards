#!/bin/bash

# SwipeSavvy Platform Startup Script
# This script helps you run the entire platform locally

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                       ║${NC}"
echo -e "${BLUE}║          SwipeSavvy Platform Launcher                ║${NC}"
echo -e "${BLUE}║                                                       ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print step
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Check prerequisites
print_step "Step 1: Checking Prerequisites"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"

    if [ "$NODE_VERSION" != "v20.13.0" ]; then
        print_warning "Recommended Node.js version is v20.13.0"
        print_warning "Current version: $NODE_VERSION"
        echo ""
        echo "To fix this:"
        echo "  1. Install nvm: https://github.com/nvm-sh/nvm"
        echo "  2. Run: nvm install 20.13.0"
        echo "  3. Run: nvm use 20.13.0"
        echo ""
    fi
else
    print_error "Node.js not found! Please install Node.js v20.13.0"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"

    if [ "$NPM_VERSION" != "10.8.2" ]; then
        print_warning "Recommended npm version is 10.8.2"
        print_warning "Current version: $NPM_VERSION"
        echo ""
        echo "To fix this:"
        echo "  Run: npm install -g npm@10.8.2"
        echo ""
    fi
else
    print_error "npm not found!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found"
    print_step "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Step 2: Verify TypeScript
print_step "Step 2: Verifying TypeScript (should be 0 errors)"
if npx tsc --noEmit; then
    print_success "TypeScript check passed - 0 errors!"
else
    print_error "TypeScript errors found. Please fix them before continuing."
    exit 1
fi

# Step 3: Check environment files
print_step "Step 3: Checking Environment Configuration"

if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    print_success ".env file created"
    echo ""
    print_warning "IMPORTANT: Edit .env and add your API keys!"
    echo "  - EXPO_PUBLIC_TOGETHER_AI_API_KEY"
    echo "  - EXPO_PUBLIC_API_URL (if using backend)"
    echo ""
else
    print_success ".env file exists"
fi

# Step 4: Display startup options
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Choose How to Run the Platform             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "1. Start Mobile App (React Native + Expo)"
echo "2. Start Admin Portal (React + Vite)"
echo "3. Start Both (Mobile App + Admin Portal)"
echo "4. Run TypeScript Check Only"
echo "5. Run Tests"
echo "6. Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        print_step "Starting Mobile App..."
        echo ""
        echo -e "${GREEN}Mobile App will start on:${NC}"
        echo "  - Metro Bundler: http://localhost:8081"
        echo "  - Expo DevTools: Press 'w' for web, 'i' for iOS, 'a' for Android"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        npm start
        ;;
    2)
        print_step "Starting Admin Portal..."
        echo ""
        echo -e "${GREEN}Admin Portal will start on:${NC}"
        echo "  - http://localhost:5173"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        cd swipesavvy-admin-portal
        npm run dev
        ;;
    3)
        print_step "Starting Both Applications..."
        echo ""
        echo -e "${GREEN}This will open TWO terminal windows:${NC}"
        echo "  1. Mobile App - http://localhost:8081"
        echo "  2. Admin Portal - http://localhost:5173"
        echo ""

        # Check if we're on macOS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS - use osascript to open new Terminal windows
            osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && npm start\""
            sleep 2
            osascript -e "tell application \"Terminal\" to do script \"cd $(pwd)/swipesavvy-admin-portal && npm run dev\""
            print_success "Both applications started in separate Terminal windows"
        else
            # Linux/Other - provide manual instructions
            print_warning "Automatic terminal launching not supported on this OS"
            echo ""
            echo "Please open TWO separate terminal windows and run:"
            echo ""
            echo "Terminal 1 (Mobile App):"
            echo "  cd $(pwd)"
            echo "  npm start"
            echo ""
            echo "Terminal 2 (Admin Portal):"
            echo "  cd $(pwd)/swipesavvy-admin-portal"
            echo "  npm run dev"
        fi
        ;;
    4)
        print_step "Running TypeScript Check..."
        npx tsc --noEmit
        if [ $? -eq 0 ]; then
            print_success "TypeScript check passed - 0 errors!"
        else
            print_error "TypeScript errors found"
            exit 1
        fi
        ;;
    5)
        print_step "Running Tests..."
        npm test
        ;;
    6)
        print_step "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Done!"
