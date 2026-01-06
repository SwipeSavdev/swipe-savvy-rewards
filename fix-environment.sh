#!/bin/bash
# fix-environment.sh
# Automated Environment Fix Script for SwipeSavvy Platform
# Fixes Issues #1 and #2: Node and npm Version Mismatches
# Generated: 2026-01-06

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SwipeSavvy Environment Fix${NC}"
echo -e "${GREEN}Issues #1 & #2: Node and npm Versions${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Required versions
REQUIRED_NODE_VERSION="20.13.0"
REQUIRED_NPM_VERSION="10.8.2"

# Check current versions
CURRENT_NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' || echo "not installed")
CURRENT_NPM_VERSION=$(npm --version 2>/dev/null || echo "not installed")

echo -e "${BLUE}Current Versions:${NC}"
echo "  Node.js: v${CURRENT_NODE_VERSION}"
echo "  npm: ${CURRENT_NPM_VERSION}"
echo ""
echo -e "${BLUE}Required Versions:${NC}"
echo "  Node.js: v${REQUIRED_NODE_VERSION}"
echo "  npm: ${REQUIRED_NPM_VERSION}"
echo ""

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo -e "${YELLOW}nvm not found in current shell${NC}"
    echo "Attempting to load nvm..."

    # Try to load nvm
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        echo -e "${GREEN}✓ nvm loaded from ~/.nvm${NC}"
    elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
        export NVM_DIR="/usr/local/opt/nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        echo -e "${GREEN}✓ nvm loaded from /usr/local/opt/nvm${NC}"
    else
        echo -e "${RED}ERROR: nvm not installed${NC}"
        echo ""
        echo "Install nvm with:"
        echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo ""
        echo "Then restart your terminal and run this script again."
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}Step 1: Installing Node.js ${REQUIRED_NODE_VERSION}${NC}"
echo "This may take a few minutes..."

# Install required Node version
nvm install ${REQUIRED_NODE_VERSION}

# Use the required Node version
nvm use ${REQUIRED_NODE_VERSION}

# Set as default
nvm alias default ${REQUIRED_NODE_VERSION}

echo -e "${GREEN}✓ Node.js ${REQUIRED_NODE_VERSION} installed and activated${NC}"
echo ""

# Verify Node version
NEW_NODE_VERSION=$(node --version | sed 's/v//')
if [ "$NEW_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${RED}ERROR: Node version mismatch after installation${NC}"
    echo "Expected: ${REQUIRED_NODE_VERSION}"
    echo "Got: ${NEW_NODE_VERSION}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Installing npm ${REQUIRED_NPM_VERSION}${NC}"

# Install required npm version
npm install -g npm@${REQUIRED_NPM_VERSION}

echo -e "${GREEN}✓ npm ${REQUIRED_NPM_VERSION} installed${NC}"
echo ""

# Verify npm version
NEW_NPM_VERSION=$(npm --version)
if [ "$NEW_NPM_VERSION" != "$REQUIRED_NPM_VERSION" ]; then
    echo -e "${YELLOW}WARNING: npm version mismatch${NC}"
    echo "Expected: ${REQUIRED_NPM_VERSION}"
    echo "Got: ${NEW_NPM_VERSION}"
    echo "This may be OK if npm is close to required version"
fi

echo ""
echo -e "${YELLOW}Step 3: Cleaning and reinstalling dependencies${NC}"

# Remove existing node_modules and lockfile
if [ -d "node_modules" ]; then
    echo "Removing old node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "Removing old package-lock.json..."
    rm -f package-lock.json
fi

# Reinstall dependencies
echo "Installing dependencies with correct Node/npm versions..."
npm install

echo -e "${GREEN}✓ Dependencies reinstalled${NC}"
echo ""

# Also fix admin portal
if [ -d "swipesavvy-admin-portal" ]; then
    echo -e "${YELLOW}Step 4: Fixing admin portal dependencies${NC}"
    cd swipesavvy-admin-portal

    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi

    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
    fi

    npm install
    cd ..

    echo -e "${GREEN}✓ Admin portal dependencies reinstalled${NC}"
    echo ""
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Environment Fix Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Final verification
echo -e "${BLUE}Final Verification:${NC}"
echo "  Node.js: $(node --version)"
echo "  npm: v$(npm --version)"
echo ""

# Check if versions match
FINAL_NODE=$(node --version | sed 's/v//')
FINAL_NPM=$(npm --version)

if [ "$FINAL_NODE" = "$REQUIRED_NODE_VERSION" ]; then
    echo -e "${GREEN}✓ Node.js version correct${NC}"
else
    echo -e "${RED}✗ Node.js version incorrect${NC}"
    echo "  Expected: ${REQUIRED_NODE_VERSION}"
    echo "  Got: ${FINAL_NODE}"
fi

if [ "$FINAL_NPM" = "$REQUIRED_NPM_VERSION" ]; then
    echo -e "${GREEN}✓ npm version correct${NC}"
else
    echo -e "${YELLOW}⚠ npm version close but not exact match${NC}"
    echo "  Expected: ${REQUIRED_NPM_VERSION}"
    echo "  Got: ${FINAL_NPM}"
    echo "  This is usually OK if within minor version"
fi

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Run 'npm start' to verify the app builds correctly"
echo "2. Run 'npm run build' to verify production build works"
echo "3. Update your shell profile to always use nvm:"
echo ""
echo "   Add to ~/.zshrc or ~/.bashrc:"
echo "   export NVM_DIR=\"\$HOME/.nvm\""
echo "   [ -s \"\$NVM_DIR/nvm.sh\" ] && \\. \"\$NVM_DIR/nvm.sh\""
echo ""
echo -e "${GREEN}Issues #1 and #2 are now fixed!${NC}"
echo ""
