#!/bin/bash

#############################################################################
# SNS Platform Application Setup for SwipeSavvy Push Notifications
# Sandbox Environment Configuration
# Account: 858955002750
#############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}SwipeSavvy SNS Platform Application Setup${NC}"
echo -e "${BLUE}Environment: Sandbox${NC}"
echo -e "${BLUE}================================================${NC}"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
APP_NAME="swipesavvy-sandbox"
ENVIRONMENT="sandbox"

echo -e "\n${YELLOW}Configuration:${NC}"
echo "AWS Account ID: $ACCOUNT_ID"
echo "AWS Region: $REGION"
echo "App Name: $APP_NAME"
echo "Environment: $ENVIRONMENT"

# Check if we need to setup Apple APNs credentials
echo -e "\n${YELLOW}Step 1: Creating SNS Platform Application for Apple (APNs)${NC}"

# Check if platform app already exists
EXISTING_APP=$(aws sns list-platform-applications --region $REGION --query "PlatformApplications[?PlatformApplicationArn contains('$APP_NAME-ios')]" --output json 2>/dev/null || echo "[]")

if [ "$EXISTING_APP" != "[]" ]; then
    echo -e "${YELLOW}Apple iOS Platform Application already exists. Skipping creation.${NC}"
    IOS_APP_ARN=$(echo $EXISTING_APP | jq -r '.[0].PlatformApplicationArn')
else
    echo "APNs setup requires certificate. Please provide the path to your Apple Push Notification certificate."
    read -p "Enter path to your APNs Certificate (.p12 or .pem file): " APNS_CERT_PATH
    read -p "Enter APNs Certificate Password (or press Enter if none): " APNS_PASSWORD
    
    if [ -f "$APNS_CERT_PATH" ]; then
        # Create iOS Platform Application
        IOS_APP_ARN=$(aws sns create-platform-application \
            --name "$APP_NAME-ios" \
            --platform APNS_SANDBOX \
            --attributes \
                "PlatformCredential=${APNS_CERT_PATH},PlatformPrincipal=" \
            --region $REGION \
            --query 'PlatformApplicationArn' \
            --output text)
        
        echo -e "${GREEN}✓ iOS Platform Application created${NC}"
        echo "   ARN: $IOS_APP_ARN"
    else
        echo -e "${RED}✗ Certificate file not found: $APNS_CERT_PATH${NC}"
        echo "   Skipping iOS setup. You can add this later."
    fi
fi

# Setup for Android (GCM/FCM)
echo -e "\n${YELLOW}Step 2: Creating SNS Platform Application for Android (GCM/FCM)${NC}"

EXISTING_ANDROID_APP=$(aws sns list-platform-applications --region $REGION --query "PlatformApplications[?PlatformApplicationArn contains('$APP_NAME-android')]" --output json 2>/dev/null || echo "[]")

if [ "$EXISTING_ANDROID_APP" != "[]" ]; then
    echo -e "${YELLOW}Android Platform Application already exists. Skipping creation.${NC}"
    ANDROID_APP_ARN=$(echo $EXISTING_ANDROID_APP | jq -r '.[0].PlatformApplicationArn')
else
    echo "GCM setup requires API Key from Firebase Console."
    read -p "Enter your Firebase Server API Key: " GCM_API_KEY
    
    if [ -n "$GCM_API_KEY" ]; then
        ANDROID_APP_ARN=$(aws sns create-platform-application \
            --name "$APP_NAME-android" \
            --platform GCM \
            --attributes "PlatformCredential=$GCM_API_KEY" \
            --region $REGION \
            --query 'PlatformApplicationArn' \
            --output text)
        
        echo -e "${GREEN}✓ Android Platform Application created${NC}"
        echo "   ARN: $ANDROID_APP_ARN"
    else
        echo -e "${RED}✗ Firebase API Key not provided${NC}"
        echo "   Skipping Android setup. You can add this later."
    fi
fi

# Create IAM role for SNS if it doesn't exist
echo -e "\n${YELLOW}Step 3: Setting up IAM Role for SNS${NC}"

ROLE_NAME="swipesavvy-sns-sandbox-role"
ROLE_EXISTS=$(aws iam get-role --role-name $ROLE_NAME 2>/dev/null || echo "")

if [ -z "$ROLE_EXISTS" ]; then
    # Create trust policy
    cat > /tmp/sns-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "sns.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document file:///tmp/sns-trust-policy.json
    
    echo -e "${GREEN}✓ IAM Role created: $ROLE_NAME${NC}"
else
    echo -e "${YELLOW}IAM Role already exists: $ROLE_NAME${NC}"
fi

# Attach policy for SNS operations
POLICY_NAME="swipesavvy-sns-sandbox-policy"
POLICY_EXISTS=$(aws iam get-role-policy --role-name $ROLE_NAME --policy-name $POLICY_NAME 2>/dev/null || echo "")

if [ -z "$POLICY_EXISTS" ]; then
    cat > /tmp/sns-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:CreatePlatformEndpoint",
        "sns:DeleteEndpoint",
        "sns:GetEndpointAttributes",
        "sns:SetEndpointAttributes",
        "sns:Publish",
        "sns:ListEndpointsByPlatformApplication"
      ],
      "Resource": "*"
    }
  ]
}
EOF

    aws iam put-role-policy \
        --role-name $ROLE_NAME \
        --policy-name $POLICY_NAME \
        --policy-document file:///tmp/sns-policy.json
    
    echo -e "${GREEN}✓ SNS Policy attached to role${NC}"
else
    echo -e "${YELLOW}SNS Policy already attached to role${NC}"
fi

# Create CloudWatch Log Group for SNS
echo -e "\n${YELLOW}Step 4: Setting up CloudWatch Logs${NC}"

LOG_GROUP="/aws/sns/swipesavvy-sandbox"
LOG_GROUP_EXISTS=$(aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --region $REGION --query "logGroups[?logGroupName=='$LOG_GROUP']" --output json 2>/dev/null || echo "[]")

if [ "$LOG_GROUP_EXISTS" = "[]" ]; then
    aws logs create-log-group --log-group-name "$LOG_GROUP" --region $REGION
    aws logs put-retention-policy --log-group-name "$LOG_GROUP" --retention-in-days 30 --region $REGION
    echo -e "${GREEN}✓ CloudWatch Log Group created: $LOG_GROUP${NC}"
else
    echo -e "${YELLOW}CloudWatch Log Group already exists: $LOG_GROUP${NC}"
fi

# Create configuration file for reference
echo -e "\n${YELLOW}Step 5: Creating Configuration Files${NC}"

CONFIG_FILE="./sns-config-sandbox.json"
cat > "$CONFIG_FILE" << EOF
{
  "environment": "sandbox",
  "awsAccountId": "$ACCOUNT_ID",
  "awsRegion": "$REGION",
  "platforms": {
    "ios": {
      "name": "$APP_NAME-ios",
      "type": "APNS_SANDBOX",
      "platformApplicationArn": "${IOS_APP_ARN:-'NOT_SET'}",
      "status": "pending"
    },
    "android": {
      "name": "$APP_NAME-android",
      "type": "GCM",
      "platformApplicationArn": "${ANDROID_APP_ARN:-'NOT_SET'}",
      "status": "pending"
    }
  },
  "iamRole": {
    "name": "$ROLE_NAME",
    "policy": "$POLICY_NAME"
  },
  "cloudwatch": {
    "logGroup": "$LOG_GROUP",
    "retentionInDays": 30
  },
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo -e "${GREEN}✓ Configuration file created: $CONFIG_FILE${NC}"

# List all platform applications
echo -e "\n${YELLOW}Step 6: Platform Applications Summary${NC}"

aws sns list-platform-applications --region $REGION --output table

# Create endpoint for testing
echo -e "\n${YELLOW}Step 7: Creating Test Endpoints (Optional)${NC}"

read -p "Do you want to create test endpoints now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # iOS test endpoint
    if [ ! -z "${IOS_APP_ARN}" ] && [ "${IOS_APP_ARN}" != "NOT_SET" ]; then
        IOS_TEST_TOKEN="test_device_token_ios_$(date +%s)"
        IOS_ENDPOINT=$(aws sns create-platform-endpoint \
            --platform-application-arn "$IOS_APP_ARN" \
            --token "$IOS_TEST_TOKEN" \
            --region $REGION \
            --query 'EndpointArn' \
            --output text)
        
        echo -e "${GREEN}✓ iOS Test Endpoint created${NC}"
        echo "   Endpoint ARN: $IOS_ENDPOINT"
    fi
    
    # Android test endpoint
    if [ ! -z "${ANDROID_APP_ARN}" ] && [ "${ANDROID_APP_ARN}" != "NOT_SET" ]; then
        ANDROID_TEST_TOKEN="test_device_token_android_$(date +%s)"
        ANDROID_ENDPOINT=$(aws sns create-platform-endpoint \
            --platform-application-arn "$ANDROID_APP_ARN" \
            --token "$ANDROID_TEST_TOKEN" \
            --region $REGION \
            --query 'EndpointArn' \
            --output text)
        
        echo -e "${GREEN}✓ Android Test Endpoint created${NC}"
        echo "   Endpoint ARN: $ANDROID_ENDPOINT"
    fi
fi

# Summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}SNS Platform Application Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Update your application configuration with the Platform Application ARNs"
echo "2. Implement device registration in your mobile app"
echo "3. Test push notifications with sample payloads"
echo "4. Monitor CloudWatch Logs at: $LOG_GROUP"
echo ""
echo -e "${BLUE}Configuration saved to:${NC} $CONFIG_FILE"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "# List all endpoints for iOS app:"
echo "aws sns list-endpoints-by-platform-application --platform-application-arn ${IOS_APP_ARN:-'<ios-arn>'} --region $REGION"
echo ""
echo "# Send test notification to endpoint:"
echo "aws sns publish --target-arn <endpoint-arn> --message 'Test notification' --region $REGION"
echo ""
echo "# Check endpoint attributes:"
echo "aws sns get-endpoint-attributes --endpoint-arn <endpoint-arn> --region $REGION"

# Cleanup
rm -f /tmp/sns-trust-policy.json /tmp/sns-policy.json
