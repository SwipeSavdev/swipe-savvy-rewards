#!/bin/bash

#############################################################################
# Quick SNS Platform Application Setup
# Minimal setup for immediate testing
#############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGION="us-east-1"
APP_NAME="swipesavvy-sandbox"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Quick SNS Setup for SwipeSavvy Sandbox${NC}"
echo -e "${BLUE}================================================${NC}"

# Check for existing applications
echo -e "\n${YELLOW}Checking existing SNS Platform Applications...${NC}"

APPS=$(aws sns list-platform-applications --region $REGION --output json)
echo "$APPS" | jq '.'

# Create test endpoints for both platforms
echo -e "\n${YELLOW}Creating test Platform Applications...${NC}"

# For sandbox testing, we can use test credentials
# Note: In production, you'll need actual APNs and Firebase credentials

# Check if iOS app exists
IOS_EXIST=$(echo "$APPS" | jq -r ".PlatformApplications[] | select(.PlatformApplicationArn | contains(\"APNS_SANDBOX\")) | .PlatformApplicationArn" | head -1)

if [ -z "$IOS_EXIST" ]; then
    echo -e "${YELLOW}Creating iOS Platform Application...${NC}"
    # For sandbox testing, we create with minimal attributes
    IOS_ARN=$(aws sns create-platform-application \
        --name "$APP_NAME-ios" \
        --platform APNS_SANDBOX \
        --region $REGION \
        --attributes "PlatformCredential=,PlatformPrincipal=" \
        --query 'PlatformApplicationArn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$IOS_ARN" ] && [ "$IOS_ARN" != "None" ]; then
        echo -e "${GREEN}✓ iOS Platform Application: $IOS_ARN${NC}"
    else
        echo -e "${YELLOW}iOS app may already exist or requires credentials${NC}"
        IOS_ARN=$(aws sns list-platform-applications --region $REGION --output json | jq -r ".PlatformApplications[] | select(.PlatformApplicationArn | contains(\"APNS_SANDBOX\") and contains(\"$APP_NAME\")) | .PlatformApplicationArn" | head -1)
    fi
else
    IOS_ARN=$IOS_EXIST
    echo -e "${GREEN}✓ iOS Platform Application already exists: $IOS_ARN${NC}"
fi

# Check if Android app exists
ANDROID_EXIST=$(echo "$APPS" | jq -r ".PlatformApplications[] | select(.PlatformApplicationArn | contains(\"GCM\")) | .PlatformApplicationArn" | head -1)

if [ -z "$ANDROID_EXIST" ]; then
    echo -e "${YELLOW}Creating Android Platform Application...${NC}"
    ANDROID_ARN=$(aws sns create-platform-application \
        --name "$APP_NAME-android" \
        --platform GCM \
        --region $REGION \
        --attributes "PlatformCredential=" \
        --query 'PlatformApplicationArn' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$ANDROID_ARN" ] && [ "$ANDROID_ARN" != "None" ]; then
        echo -e "${GREEN}✓ Android Platform Application: $ANDROID_ARN${NC}"
    else
        echo -e "${YELLOW}Android app may already exist or requires credentials${NC}"
        ANDROID_ARN=$(aws sns list-platform-applications --region $REGION --output json | jq -r ".PlatformApplications[] | select(.PlatformApplicationArn | contains(\"GCM\") and contains(\"$APP_NAME\")) | .PlatformApplicationArn" | head -1)
    fi
else
    ANDROID_ARN=$ANDROID_EXIST
    echo -e "${GREEN}✓ Android Platform Application already exists: $ANDROID_ARN${NC}"
fi

# Create SNS Topic for notifications
echo -e "\n${YELLOW}Creating SNS Topic for notifications...${NC}"

TOPIC_ARN=$(aws sns create-topic \
    --name "swipesavvy-sandbox-notifications" \
    --region $REGION \
    --query 'TopicArn' \
    --output text)

echo -e "${GREEN}✓ SNS Topic created: $TOPIC_ARN${NC}"

# Create configuration file
echo -e "\n${YELLOW}Creating configuration file...${NC}"

cat > ./sns-config-sandbox.json << EOF
{
  "environment": "sandbox",
  "region": "$REGION",
  "platforms": {
    "ios": {
      "name": "$APP_NAME-ios",
      "type": "APNS_SANDBOX",
      "arn": "${IOS_ARN:-'PENDING'}",
      "requiresCredentials": true
    },
    "android": {
      "name": "$APP_NAME-android",
      "type": "GCM",
      "arn": "${ANDROID_ARN:-'PENDING'}",
      "requiresCredentials": true
    }
  },
  "topic": {
    "name": "swipesavvy-sandbox-notifications",
    "arn": "$TOPIC_ARN"
  },
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}✓ Configuration saved to: ./sns-config-sandbox.json${NC}"

# Display summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}SNS Setup Summary${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}Platform Applications:${NC}"
aws sns list-platform-applications --region $REGION --output table

echo -e "\n${BLUE}Topics:${NC}"
aws sns list-topics --region $REGION --output table

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Add real APNs certificate to iOS app:"
echo "   aws sns set-platform-application-attributes \\"
echo "     --platform-application-arn $IOS_ARN \\"
echo "     --attributes PlatformCredential=<your-p8-key> \\"
echo "     --region $REGION"
echo ""
echo "2. Add Firebase Server API Key to Android app:"
echo "   aws sns set-platform-application-attributes \\"
echo "     --platform-application-arn $ANDROID_ARN \\"
echo "     --attributes PlatformCredential=<your-firebase-key> \\"
echo "     --region $REGION"
echo ""
echo "3. Register device endpoint:"
echo "   aws sns create-platform-endpoint \\"
echo "     --platform-application-arn <app-arn> \\"
echo "     --token <device-token> \\"
echo "     --region $REGION"
echo ""
echo "4. Send test notification:"
echo "   aws sns publish \\"
echo "     --target-arn <endpoint-arn> \\"
echo "     --message 'Test' \\"
echo "     --region $REGION"

echo -e "\n${GREEN}Setup Complete!${NC}"
