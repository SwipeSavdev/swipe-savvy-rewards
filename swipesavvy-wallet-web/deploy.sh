#!/bin/bash
# SwipeSavvy Wallet Web Deployment Script
# PRODUCTION MODE - Builds locally and deploys to S3/CloudFront
# Usage: ./deploy.sh
#
# IMPORTANT: This script deploys a PRODUCTION BUILD to AWS S3 + CloudFront
# - Builds the app locally with `npm run build`
# - Uploads the dist/ folder to S3
# - Invalidates CloudFront cache

set -e  # Exit on any error

# Configuration
S3_BUCKET="swipesavvy-wallet-web-prod"
CLOUDFRONT_DISTRIBUTION_ID="E1LRU6Y9QK43VI"
SCRIPT_DIR="$(dirname "$0")"
LOCAL_DIST="$SCRIPT_DIR/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SwipeSavvy Wallet Web Deployment${NC}"
echo -e "${GREEN}PRODUCTION BUILD -> S3 + CloudFront${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${YELLOW}Step 1: Building production bundle locally...${NC}"
cd "$SCRIPT_DIR"
npm run build
if [ ! -d "$LOCAL_DIST" ]; then
    echo -e "${RED}ERROR: Build failed - dist directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}Build successful!${NC}"

echo -e "${YELLOW}Step 2: Uploading to S3...${NC}"
aws s3 sync "$LOCAL_DIST/" "s3://$S3_BUCKET/" --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.json"

# Upload index.html with no cache
aws s3 cp "$LOCAL_DIST/index.html" "s3://$S3_BUCKET/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

echo -e "${GREEN}S3 upload complete!${NC}"

echo -e "${YELLOW}Step 3: Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
echo "CloudFront invalidation created: $INVALIDATION_ID"

echo -e "${YELLOW}Step 4: Verifying deployment...${NC}"
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://wallet.swipesavvy.com/)
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}SUCCESS: Wallet web is responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}NOTE: HTTP $HTTP_STATUS - CloudFront may still be propagating${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Wallet Web URL: https://wallet.swipesavvy.com"
echo "CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "S3 Bucket: $S3_BUCKET"
echo ""
echo -e "${GREEN}NOTE: CloudFront invalidation may take 1-2 minutes to fully propagate${NC}"
