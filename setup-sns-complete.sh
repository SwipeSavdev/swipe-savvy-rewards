#!/bin/bash

#############################################################################
# SNS Platform Application Setup for Swipe Savvy
# Creates platform apps and manages credentials
#############################################################################

set -e

REGION="us-east-1"
APP_NAME="swipesavvy-sandbox"

echo "================================================"
echo "SNS Platform Application Setup - Swipe Savvy"
echo "================================================"

# Function to create or update iOS app
setup_ios_app() {
    echo ""
    echo "Setting up iOS Platform Application..."
    
    # For sandbox testing, we need a valid APNs certificate
    # You can use a test certificate or convert existing .p8 key
    
    # Option 1: If you have a P8 key file
    if [ -f "$HOME/.swipesavvy/apns-key.p8" ]; then
        CERT_CONTENT=$(cat "$HOME/.swipesavvy/apns-key.p8")
        
        IOS_ARN=$(aws sns create-platform-application \
            --name "$APP_NAME-ios" \
            --platform APNS_SANDBOX \
            --region $REGION \
            --attributes "PlatformCredential=$CERT_CONTENT" \
            --query 'PlatformApplicationArn' \
            --output text)
        
        echo "✓ iOS Platform Application created: $IOS_ARN"
        echo "$IOS_ARN"
    else
        echo "⚠ iOS setup requires APNs certificate"
        echo "  Place your APNs P8 key at: $HOME/.swipesavvy/apns-key.p8"
        echo "  Then run this script again"
    fi
}

# Function to create or update Android app
setup_android_app() {
    echo ""
    echo "Setting up Android Platform Application..."
    
    # For Android, we need Firebase Server API Key
    if [ -f "$HOME/.swipesavvy/firebase-key.txt" ]; then
        API_KEY=$(cat "$HOME/.swipesavvy/firebase-key.txt")
        
        ANDROID_ARN=$(aws sns create-platform-application \
            --name "$APP_NAME-android" \
            --platform GCM \
            --region $REGION \
            --attributes "PlatformCredential=$API_KEY" \
            --query 'PlatformApplicationArn' \
            --output text)
        
        echo "✓ Android Platform Application created: $ANDROID_ARN"
        echo "$ANDROID_ARN"
    else
        echo "⚠ Android setup requires Firebase Server API Key"
        echo "  Place your Firebase Server API Key at: $HOME/.swipesavvy/firebase-key.txt"
        echo "  Then run this script again"
    fi
}

# Create IAM role for SNS
setup_iam_role() {
    echo ""
    echo "Setting up IAM Role for SNS..."
    
    ROLE_NAME="swipesavvy-sns-sandbox-role"
    
    # Check if role exists
    if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
        echo "✓ IAM Role already exists: $ROLE_NAME"
    else
        cat > /tmp/trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "sns.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file:///tmp/trust-policy.json
        
        echo "✓ IAM Role created: $ROLE_NAME"
    fi
    
    # Attach policy
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
        --policy-name sns-policy \
        --policy-document file:///tmp/sns-policy.json
    
    echo "✓ SNS Policy attached"
}

# Create SNS Topic
setup_sns_topic() {
    echo ""
    echo "Setting up SNS Topic..."
    
    TOPIC_ARN=$(aws sns create-topic \
        --name "swipesavvy-sandbox-notifications" \
        --region $REGION \
        --query 'TopicArn' \
        --output text)
    
    echo "✓ SNS Topic created: $TOPIC_ARN"
    echo "$TOPIC_ARN"
}

# Create CloudWatch Logs
setup_cloudwatch() {
    echo ""
    echo "Setting up CloudWatch Logs..."
    
    LOG_GROUP="/aws/sns/swipesavvy-sandbox"
    
    aws logs create-log-group --log-group-name "$LOG_GROUP" --region $REGION 2>/dev/null || true
    aws logs put-retention-policy --log-group-name "$LOG_GROUP" --retention-in-days 30 --region $REGION
    
    echo "✓ CloudWatch Log Group: $LOG_GROUP"
}

# Save configuration
save_config() {
    echo ""
    echo "Saving configuration..."
    
    CONFIG_FILE="./sns-config-sandbox.json"
    
    cat > "$CONFIG_FILE" << EOF
{
  "app": "swipesavvy",
  "environment": "sandbox",
  "region": "$REGION",
  "createdAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "instructions": {
    "ios": "Add APNs certificate to: $HOME/.swipesavvy/apns-key.p8",
    "android": "Add Firebase Server API Key to: $HOME/.swipesavvy/firebase-key.txt"
  }
}
EOF
    
    echo "✓ Configuration saved to: $CONFIG_FILE"
}

# Main setup
main() {
    setup_iam_role
    setup_cloudwatch
    TOPIC=$(setup_sns_topic)
    setup_ios_app
    setup_android_app
    save_config
    
    echo ""
    echo "================================================"
    echo "Setup Complete!"
    echo "================================================"
    echo ""
    echo "Next Steps:"
    echo "1. Add your APNs certificate to: $HOME/.swipesavvy/apns-key.p8"
    echo "2. Add your Firebase API Key to: $HOME/.swipesavvy/firebase-key.txt"
    echo "3. Run this script again to create Platform Apps"
    echo ""
    echo "Then you can:"
    echo "- Register device endpoints with platform app ARNs"
    echo "- Send test push notifications"
    echo "- Monitor in CloudWatch: /aws/sns/swipesavvy-sandbox"
}

main
