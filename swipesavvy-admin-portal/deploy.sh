#!/bin/bash
# SwipeSavvy Admin Portal Deployment Script
# PRODUCTION MODE - Builds locally and deploys static files
# Usage: ./deploy.sh
#
# IMPORTANT: This script deploys a PRODUCTION BUILD (not dev mode)
# - Builds the app locally with `npm run build`
# - Uploads the dist/ folder to the server
# - Serves static files using `serve` package
# - DO NOT use Vite dev server (npm run dev) in production

set -e  # Exit on any error

# Configuration
SERVER="ec2-user@54.224.8.14"
SSH_KEY="$HOME/.ssh/swipesavvy-prod-key.pem"
REMOTE_DIR="/var/www/swipesavvy-admin-portal"
SCRIPT_DIR="$(dirname "$0")"
LOCAL_DIST="$SCRIPT_DIR/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SwipeSavvy Admin Portal Deployment${NC}"
echo -e "${GREEN}PRODUCTION BUILD${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    echo "Please ensure the SSH key is available"
    exit 1
fi

echo -e "${YELLOW}Step 1: Building production bundle locally...${NC}"
cd "$SCRIPT_DIR"
npm run build
if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}ERROR: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Stopping admin portal on server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "pm2 stop swipesavvy-admin || true"

echo -e "${YELLOW}Step 3: Backing up current dist directory...${NC}"
BACKUP_NAME="dist_backup_$(date +%Y%m%d_%H%M%S)"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && [ -d dist ] && mv dist $BACKUP_NAME || echo 'No dist to backup'"

echo -e "${YELLOW}Step 4: Creating fresh dist directory...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR/dist"

echo -e "${YELLOW}Step 5: Uploading production build to server...${NC}"
rsync -avz --progress \
    --delete \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_DIST/" "$SERVER:$REMOTE_DIR/dist/"

echo -e "${YELLOW}Step 6: Ensuring serve package is installed...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && npm list serve || npm install serve --save-dev"

echo -e "${YELLOW}Step 7: Starting production server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && pm2 delete swipesavvy-admin 2>/dev/null || true && pm2 start ./node_modules/.bin/serve --name swipesavvy-admin -- -s dist -l 5173 && pm2 save"

echo -e "${YELLOW}Step 8: Waiting for server to start...${NC}"
sleep 3

echo -e "${YELLOW}Step 9: Verifying deployment...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://54.224.8.14:5173/)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}SUCCESS: Admin portal is responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}WARNING: Admin portal returned HTTP $HTTP_STATUS${NC}"
fi

echo -e "${YELLOW}Step 10: Cleaning up old backups (keeping last 3)...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && ls -dt dist_backup_* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && ls -dt src_backup_* 2>/dev/null | xargs rm -rf 2>/dev/null || true"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Admin Portal URL: http://54.224.8.14:5173"
echo ""
echo -e "${GREEN}NOTE: Running in PRODUCTION mode (static files served by 'serve')${NC}"
echo "To check logs: ssh -i $SSH_KEY $SERVER 'pm2 logs swipesavvy-admin'"
