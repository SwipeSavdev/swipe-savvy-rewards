#!/bin/bash
# SwipeSavvy Admin Portal Deployment Script
# This script deploys the admin portal to the production server
# Usage: ./deploy.sh

set -e  # Exit on any error

# Configuration
SERVER="ec2-user@54.224.8.14"
SSH_KEY="$HOME/.ssh/swipesavvy-prod-key.pem"
REMOTE_DIR="/var/www/swipesavvy-admin-portal"
LOCAL_SRC="$(dirname "$0")/src"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SwipeSavvy Admin Portal Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}ERROR: SSH key not found at $SSH_KEY${NC}"
    echo "Please ensure the SSH key is available"
    exit 1
fi

# Check if local src directory exists
if [ ! -d "$LOCAL_SRC" ]; then
    echo -e "${RED}ERROR: Local src directory not found at $LOCAL_SRC${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Stopping admin portal on server...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "pm2 stop swipesavvy-admin || true"

echo -e "${YELLOW}Step 2: Backing up current src directory...${NC}"
BACKUP_NAME="src_backup_$(date +%Y%m%d_%H%M%S)"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && [ -d src ] && mv src $BACKUP_NAME || echo 'No src to backup'"

echo -e "${YELLOW}Step 3: Creating fresh src directory...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "mkdir -p $REMOTE_DIR/src"

echo -e "${YELLOW}Step 4: Syncing src files to server...${NC}"
rsync -avz --progress \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_SRC/" "$SERVER:$REMOTE_DIR/src/"

echo -e "${YELLOW}Step 5: Clearing Vite cache...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && rm -rf node_modules/.vite .vite"

echo -e "${YELLOW}Step 6: Starting admin portal...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "pm2 restart swipesavvy-admin"

echo -e "${YELLOW}Step 7: Waiting for server to start...${NC}"
sleep 5

echo -e "${YELLOW}Step 8: Verifying deployment...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://54.224.8.14:5173/)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}SUCCESS: Admin portal is responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}WARNING: Admin portal returned HTTP $HTTP_STATUS${NC}"
fi

echo -e "${YELLOW}Step 9: Cleaning up old backups (keeping last 3)...${NC}"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER" "cd $REMOTE_DIR && ls -dt src_backup_* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Admin Portal URL: http://54.224.8.14:5173"
echo ""
echo "To check logs: ssh -i $SSH_KEY $SERVER 'pm2 logs swipesavvy-admin'"
