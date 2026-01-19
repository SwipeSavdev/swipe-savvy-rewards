# AWS SNS Platform Application Setup Guide - Sandbox Environment

## Overview

This guide provides step-by-step instructions for setting up AWS SNS (Simple Notification Service) Platform Applications for Swipe Savvy push notifications testing in the Sandbox environment.

## Prerequisites

- AWS CLI v2+ installed and configured
- AWS Account with appropriate IAM permissions
- Apple Developer Account (for iOS push notifications)
- Firebase Project (for Android push notifications)
- Xcode (for iOS certificate generation)

## Part 1: Prepare Apple Push Notification (APNs) Credentials

### Step 1.1: Generate Apple APNs Certificate

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Under **Keys**, click the **+** button
4. Select **Apple Push Notifications service (APNs)**
5. Click **Continue** and then **Register**
6. Download the `.p8` key file (you'll need this for later)

### Step 1.2: Get Your Key ID and Team ID

- **Key ID**: Found in the Apple Developer portal (8-character alphanumeric)
- **Team ID**: Found in Apple Developer portal under Account
- **Bundle ID**: Your app's bundle identifier (e.g., `com.swipesavvy.sandbox`)

## Part 2: Prepare Firebase Credentials (Android)

### Step 2.1: Setup Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Store the JSON file securely
6. Under **Cloud Messaging**, copy your **Server API Key**

## Part 3: Run the Setup Script

### Option A: Interactive Setup (Recommended for First-Time)

```bash
cd /Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Make script executable
chmod +x setup-sns-platform-app.sh

# Run the setup
./setup-sns-platform-app.sh
```

The script will:
- Prompt for APNs certificate path
- Prompt for Firebase API Key
- Create SNS Platform Applications for both iOS and Android
- Setup IAM roles and policies
- Create CloudWatch Logs
- Generate configuration file

### Option B: Manual AWS CLI Commands

#### Create iOS Platform Application

```bash
# Using APNs Key Authentication (Recommended for Sandbox)
aws sns create-platform-application \
    --name swipesavvy-sandbox-ios \
    --platform APNS_SANDBOX \
    --attributes \
        "EventEndpointCreated=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications,\
         EventEndpointDeleted=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications,\
         EventEndpointUpdated=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications,\
         EventDeliveryFailure=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications" \
    --region us-east-1
```

#### Create Android Platform Application

```bash
aws sns create-platform-application \
    --name swipesavvy-sandbox-android \
    --platform GCM \
    --attributes "PlatformCredential=<your-firebase-server-api-key>" \
    --region us-east-1
```

## Part 4: Create Device Endpoints

### Register iOS Device

```bash
# Get your iOS Platform Application ARN first
IOS_APP_ARN="arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios"

# Register device with APNs token
aws sns create-platform-endpoint \
    --platform-application-arn $IOS_APP_ARN \
    --token <device-token-from-ios-app> \
    --region us-east-1
```

### Register Android Device

```bash
# Get your Android Platform Application ARN first
ANDROID_APP_ARN="arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android"

# Register device with FCM token
aws sns create-platform-endpoint \
    --platform-application-arn $ANDROID_APP_ARN \
    --token <fcm-token-from-android-app> \
    --region us-east-1
```

## Part 5: Test Push Notifications

### Send Test Notification to iOS Device

```bash
aws sns publish \
    --target-arn arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/<endpoint-id> \
    --message '{"aps":{"alert":"Test Notification","sound":"default"}}' \
    --message-structure json \
    --region us-east-1
```

### Send Test Notification to Android Device

```bash
aws sns publish \
    --target-arn arn:aws:sns:us-east-1:858955002750:endpoint/GCM/swipesavvy-sandbox-android/<endpoint-id> \
    --message '{"default":"Test notification","GCM":"{\"notification\":{\"title\":\"Test\",\"body\":\"Test notification\"}}"}' \
    --message-structure json \
    --region us-east-1
```

## Part 6: Integrate with Application Code

### Node.js/TypeScript Integration

```typescript
import * as AWS from 'aws-sdk';

const sns = new AWS.SNS({ region: 'us-east-1' });

interface DeviceRegistration {
  token: string;
  platform: 'ios' | 'android';
}

export const registerDevice = async (registration: DeviceRegistration) => {
  const appArn = registration.platform === 'ios'
    ? process.env.SNS_IOS_APP_ARN
    : process.env.SNS_ANDROID_APP_ARN;

  const params = {
    PlatformApplicationArn: appArn!,
    Token: registration.token,
  };

  return sns.createPlatformEndpoint(params).promise();
};

export const sendPushNotification = async (
  endpointArn: string,
  message: string,
  platform: 'ios' | 'android'
) => {
  let payload;
  
  if (platform === 'ios') {
    payload = JSON.stringify({
      aps: {
        alert: message,
        sound: 'default',
      },
    });
  } else {
    payload = JSON.stringify({
      default: message,
      GCM: JSON.stringify({
        notification: {
          title: 'Swipe Savvy',
          body: message,
        },
      }),
    });
  }

  const params = {
    TargetArn: endpointArn,
    Message: payload,
    MessageStructure: 'json',
  };

  return sns.publish(params).promise();
};
```

## Part 7: Monitoring and Debugging

### Check Endpoint Status

```bash
aws sns get-endpoint-attributes \
    --endpoint-arn arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/<endpoint-id> \
    --region us-east-1
```

### List All Endpoints

```bash
aws sns list-endpoints-by-platform-application \
    --platform-application-arn <ios-or-android-app-arn> \
    --region us-east-1
```

### Check CloudWatch Logs

```bash
# View recent logs
aws logs tail /aws/sns/swipesavvy-sandbox --follow --region us-east-1
```

### Check Application Events

```bash
aws sns get-platform-application-attributes \
    --platform-application-arn <app-arn> \
    --region us-east-1
```

## Part 8: Environment Variables

Add these to your `.env` or deployment configuration:

```bash
# SNS Configuration
SNS_REGION=us-east-1
SNS_IOS_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_ANDROID_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android

# IAM Role
SNS_ROLE_ARN=arn:aws:iam::858955002750:role/swipesavvy-sns-sandbox-role

# CloudWatch
SNS_LOG_GROUP=/aws/sns/swipesavvy-sandbox
```

## Troubleshooting

### Issue: "Invalid APNs Certificate"
- Ensure certificate is in correct format (.p8 or .pem)
- Verify certificate hasn't expired
- Check certificate is for Sandbox, not Production

### Issue: "InvalidToken" Error on Android
- Verify Firebase project credentials
- Ensure FCM token is valid and not expired
- Check Firebase Cloud Messaging is enabled in project

### Issue: "Endpoint is disabled"
- Check `Enabled` attribute of endpoint
- Often happens after failed delivery attempts
- Can be re-enabled with: `aws sns set-endpoint-attributes --endpoint-arn <arn> --attributes Enabled=true`

### Issue: "The device token was invalid"
- Ensure device token is properly formatted
- Verify token is from the correct platform (iOS vs Android)
- Tokens may expire - refresh device registration

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** instead of access keys when possible
3. **Rotate API keys** regularly
4. **Use Secrets Manager** for sensitive data
5. **Enable CloudTrail** for audit logging
6. **Restrict IAM policies** to least privilege
7. **Monitor CloudWatch** for suspicious activity

## Next Steps

1. ✅ Run the setup script
2. ✅ Test with sample devices
3. ✅ Implement device registration in mobile app
4. ✅ Monitor notifications in CloudWatch Logs
5. ✅ Set up alerts for failed deliveries
6. ✅ Document device registration flow in app
7. ✅ Plan migration to production when ready

## Reference Documentation

- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [Apple APNs Documentation](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [AWS SNS Platform Endpoints](https://docs.aws.amazon.com/sns/latest/dg/mobile-push-apns.html)

## Support

For issues or questions:
1. Check CloudWatch Logs in `/aws/sns/swipesavvy-sandbox`
2. Review AWS SNS documentation
3. Verify credentials in AWS Console
4. Check IAM permissions on your user account
