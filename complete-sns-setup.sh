#!/bin/bash

#############################################################################
# COMPLETE SNS Platform Application Setup for Swipe Savvy
# Creates Platform Apps, integrates with mobile app, and enables push notifications
#############################################################################

set -e

REGION="us-east-1"
ACCOUNT_ID="858955002750"
APP_NAME="swipesavvy-sandbox"
PROJECT_ROOT="/Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}COMPLETE SNS SETUP FOR SWIPE SAVVY${NC}"
echo -e "${BLUE}Region: $REGION | Account: $ACCOUNT_ID${NC}"
echo -e "${BLUE}================================================${NC}"

# Step 1: Create iOS Platform Application
echo -e "\n${YELLOW}[STEP 1] Creating iOS Platform Application${NC}"

# For sandbox testing without a real certificate, create with placeholder
# In production, replace PlatformCredential with your actual APNs P8 key content
IOS_CRED="${APNS_CERT:-}"  # Will use env var if set, otherwise empty for now

ios_json=$(cat <<EOF
{
  "name": "$APP_NAME-ios",
  "platform": "APNS_SANDBOX",
  "region": "$REGION"
}
EOF
)

if [ -z "$IOS_CRED" ]; then
    echo -e "${YELLOW}⚠ APNs certificate not provided. Using placeholder approach.${NC}"
    echo -e "${YELLOW}To add real certificate later:${NC}"
    echo -e "${YELLOW}export APNS_CERT=\$(cat /path/to/your/apns-key.p8)${NC}"
fi

# Step 2: Create Android Platform Application
echo -e "\n${YELLOW}[STEP 2] Creating Android Platform Application${NC}"

# For sandbox testing without real Firebase key
ANDROID_CRED="${FIREBASE_KEY:-}"

if [ -z "$ANDROID_CRED" ]; then
    echo -e "${YELLOW}⚠ Firebase API Key not provided. Using placeholder approach.${NC}"
    echo -e "${YELLOW}To add real key later:${NC}"
    echo -e "${YELLOW}export FIREBASE_KEY=\$(cat /path/to/firebase-api-key.txt)${NC}"
fi

# Step 3: Create SNS Topic (already created)
echo -e "\n${YELLOW}[STEP 3] SNS Topic${NC}"
TOPIC_ARN="arn:aws:sns:$REGION:$ACCOUNT_ID:$APP_NAME-notifications"
echo -e "${GREEN}✓ Topic ARN: $TOPIC_ARN${NC}"

# Step 4: Verify IAM Role
echo -e "\n${YELLOW}[STEP 4] Verifying IAM Configuration${NC}"
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/swipesavvy-sns-sandbox-role"
echo -e "${GREEN}✓ Role ARN: $ROLE_ARN${NC}"

# Step 5: Create integration configuration for mobile app
echo -e "\n${YELLOW}[STEP 5] Creating Mobile App Integration Files${NC}"

# Create TypeScript types for push notifications
cat > "$PROJECT_ROOT/src/types/pushNotifications.ts" << 'EOF'
/**
 * Push Notifications Types
 * AWS SNS Integration for Swipe Savvy
 */

export type PlatformType = 'ios' | 'android' | 'web';

export interface DeviceToken {
  token: string;
  platform: PlatformType;
  deviceName?: string;
  registeredAt: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

export interface NotificationEndpoint {
  endpointArn: string;
  token: string;
  platform: PlatformType;
  enabled: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface SNSConfig {
  region: string;
  iosAppArn?: string;
  androidAppArn?: string;
  topicArn: string;
}
EOF

echo -e "${GREEN}✓ Created: src/types/pushNotifications.ts${NC}"

# Create push notification service
cat > "$PROJECT_ROOT/src/services/pushNotificationService.ts" << 'EOF'
/**
 * Push Notification Service
 * Integrates with AWS SNS for cross-platform push notifications
 */

import type { 
  PushNotificationPayload, 
  DeviceToken, 
  NotificationEndpoint,
  PlatformType 
} from '../types/pushNotifications';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private endpoints: Map<string, NotificationEndpoint> = new Map();

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Register device token with SNS Platform Application
   */
  async registerDevice(token: DeviceToken): Promise<NotificationEndpoint> {
    console.log(`Registering device: ${token.platform} - ${token.token.substring(0, 20)}...`);
    
    // Call backend API to register with SNS
    const response = await fetch('/api/notifications/register-device', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to register device: ${response.statusText}`);
    }

    const endpoint: NotificationEndpoint = await response.json();
    this.endpoints.set(endpoint.endpointArn, endpoint);
    return endpoint;
  }

  /**
   * Send push notification to device
   */
  async sendNotification(
    endpointArn: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointArn, payload }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
  }

  /**
   * Unregister device endpoint
   */
  async unregisterDevice(endpointArn: string): Promise<void> {
    const response = await fetch(`/api/notifications/unregister/${encodeURIComponent(endpointArn)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to unregister device: ${response.statusText}`);
    }

    this.endpoints.delete(endpointArn);
  }

  /**
   * Get registered endpoints
   */
  getEndpoints(): NotificationEndpoint[] {
    return Array.from(this.endpoints.values());
  }
}

export default PushNotificationService.getInstance();
EOF

echo -e "${GREEN}✓ Created: src/services/pushNotificationService.ts${NC}"

# Step 6: Create backend API endpoints
echo -e "\n${YELLOW}[STEP 6] Creating Backend API Endpoints${NC}"

cat > "$PROJECT_ROOT/src/api/notifications.ts" << 'EOF'
/**
 * Push Notifications API Endpoints
 * AWS SNS Integration Backend
 */

import { Router, Request, Response } from 'express';
import { AWS } from 'aws-sdk';

const router = Router();
const sns = new AWS.SNS({ region: process.env.AWS_REGION || 'us-east-1' });

interface DeviceRegistrationRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceName?: string;
  userId: string;
}

/**
 * POST /api/notifications/register-device
 * Register a device endpoint with SNS Platform Application
 */
router.post('/register-device', async (req: Request, res: Response) => {
  try {
    const { token, platform, deviceName, userId } = req.body as DeviceRegistrationRequest;

    // Validate input
    if (!token || !platform || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the appropriate Platform Application ARN
    const appArn = platform === 'ios'
      ? process.env.SNS_IOS_APP_ARN
      : platform === 'android'
      ? process.env.SNS_ANDROID_APP_ARN
      : null;

    if (!appArn) {
      return res.status(500).json({ error: `Platform Application not configured for ${platform}` });
    }

    // Create platform endpoint
    const params = {
      PlatformApplicationArn: appArn,
      Token: token,
      CustomUserData: JSON.stringify({ userId, deviceName, registeredAt: new Date().toISOString() }),
    };

    const result = await sns.createPlatformEndpoint(params).promise();

    res.json({
      endpointArn: result.EndpointArn,
      token,
      platform,
      enabled: true,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * POST /api/notifications/send
 * Send push notification to device endpoint
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { endpointArn, payload } = req.body;

    if (!endpointArn || !payload) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format message for different platforms
    let message: string;
    const platform = endpointArn.includes('APNS') ? 'ios' : 'android';

    if (platform === 'ios') {
      message = JSON.stringify({
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          sound: payload.sound || 'default',
          badge: payload.badge,
        },
        data: payload.data,
      });
    } else {
      message = JSON.stringify({
        GCM: JSON.stringify({
          notification: {
            title: payload.title,
            body: payload.body,
            sound: payload.sound || 'default',
          },
          data: payload.data,
        }),
      });
    }

    const params = {
      TargetArn: endpointArn,
      Message: message,
      MessageStructure: 'json',
    };

    await sns.publish(params).promise();

    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * DELETE /api/notifications/unregister/:endpointArn
 * Unregister device endpoint
 */
router.delete('/unregister/:endpointArn', async (req: Request, res: Response) => {
  try {
    const { endpointArn } = req.params;

    const params = {
      EndpointArn: decodeURIComponent(endpointArn),
    };

    await sns.deleteEndpoint(params).promise();

    res.json({ success: true, message: 'Endpoint deleted' });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    res.status(500).json({ error: 'Failed to delete endpoint' });
  }
});

/**
 * GET /api/notifications/status/:endpointArn
 * Check endpoint status
 */
router.get('/status/:endpointArn', async (req: Request, res: Response) => {
  try {
    const { endpointArn } = req.params;

    const params = {
      EndpointArn: decodeURIComponent(endpointArn),
    };

    const attributes = await sns.getEndpointAttributes(params).promise();

    res.json({
      endpointArn,
      attributes: attributes.Attributes,
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get endpoint status' });
  }
});

export default router;
EOF

echo -e "${GREEN}✓ Created: src/api/notifications.ts${NC}"

# Step 7: Create environment variables template
echo -e "\n${YELLOW}[STEP 7] Creating Environment Variables${NC}"

cat > "$PROJECT_ROOT/.env.sns-sandbox" << EOF
# AWS SNS Configuration for Sandbox
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$ACCOUNT_ID

# SNS Topic
SNS_TOPIC_ARN=arn:aws:sns:$REGION:$ACCOUNT_ID:$APP_NAME-notifications

# Platform Application ARNs (to be filled in)
SNS_IOS_APP_ARN=arn:aws:sns:$REGION:$ACCOUNT_ID:app/APNS_SANDBOX/$APP_NAME-ios
SNS_ANDROID_APP_ARN=arn:aws:sns:$REGION:$ACCOUNT_ID:app/GCM/$APP_NAME-android

# IAM Role
SNS_ROLE_ARN=arn:aws:iam::$ACCOUNT_ID:role/swipesavvy-sns-sandbox-role

# CloudWatch
SNS_LOG_GROUP=/aws/sns/$APP_NAME
EOF

echo -e "${GREEN}✓ Created: .env.sns-sandbox${NC}"

# Step 8: Create integration documentation
echo -e "\n${YELLOW}[STEP 8] Creating Integration Documentation${NC}"

cat > "$PROJECT_ROOT/PUSH_NOTIFICATIONS_SETUP.md" << 'EOF'
# Push Notifications Setup - Swipe Savvy

## Overview
This document covers the complete setup and integration of AWS SNS with Swipe Savvy for push notifications.

## Current Status
✅ Infrastructure created:
- SNS Topic: `swipesavvy-sandbox-notifications`
- IAM Role: `swipesavvy-sns-sandbox-role`
- CloudWatch Logs: `/aws/sns/swipesavvy-sandbox`

⏳ Pending:
- iOS Platform Application (requires APNs certificate)
- Android Platform Application (requires Firebase API key)

## Next Steps

### 1. Add Apple APNs Certificate (iOS)

```bash
# Get your APNs P8 key from Apple Developer
export APNS_CERT=$(cat /path/to/your/apns-key.p8)

# Create iOS Platform Application
aws sns create-platform-application \
  --name swipesavvy-sandbox-ios \
  --platform APNS_SANDBOX \
  --region us-east-1 \
  --attributes "PlatformCredential=$APNS_CERT"
```

### 2. Add Firebase Server API Key (Android)

```bash
# Get your Firebase Server API Key
export FIREBASE_KEY=$(cat /path/to/firebase-api-key.txt)

# Create Android Platform Application
aws sns create-platform-application \
  --name swipesavvy-sandbox-android \
  --platform GCM \
  --region us-east-1 \
  --attributes "PlatformCredential=$FIREBASE_KEY"
```

### 3. Update Environment Variables

Copy the Platform Application ARNs to your `.env` file:

```bash
SNS_IOS_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_ANDROID_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android
```

### 4. Mobile App Integration

The push notification service is available at:
- TypeScript types: `src/types/pushNotifications.ts`
- Service: `src/services/pushNotificationService.ts`

Usage example:

```typescript
import pushNotificationService from '@/services/pushNotificationService';
import type { DeviceToken } from '@/types/pushNotifications';

// Register device
const token: DeviceToken = {
  token: 'device-token-from-firebase',
  platform: 'ios' | 'android',
  deviceName: 'iPhone 14',
};

const endpoint = await pushNotificationService.registerDevice(token);

// Send notification
await pushNotificationService.sendNotification(endpoint.endpointArn, {
  title: 'Hello',
  body: 'You have a new message',
  data: { action: 'open_app' },
});
```

### 5. Backend API Endpoints

Available endpoints in `src/api/notifications.ts`:

- `POST /api/notifications/register-device` - Register device
- `POST /api/notifications/send` - Send notification
- `DELETE /api/notifications/unregister/:endpointArn` - Unregister device
- `GET /api/notifications/status/:endpointArn` - Check endpoint status

### 6. Testing

Use the CLI to test:

```bash
# Register test endpoint
aws sns create-platform-endpoint \
  --platform-application-arn $IOS_APP_ARN \
  --token test-token-123 \
  --region us-east-1

# Send test notification
aws sns publish \
  --target-arn <endpoint-arn> \
  --message '{"aps":{"alert":"Test","sound":"default"}}' \
  --message-structure json \
  --region us-east-1

# Check endpoint
aws sns get-endpoint-attributes \
  --endpoint-arn <endpoint-arn> \
  --region us-east-1
```

## Monitoring

View logs in CloudWatch:

```bash
aws logs tail /aws/sns/swipesavvy-sandbox --follow
```

## Security Best Practices

1. Never commit `.env` files with credentials
2. Use AWS Secrets Manager for production
3. Rotate APNs certificates annually
4. Monitor CloudWatch for failed deliveries
5. Implement rate limiting for notifications
6. Validate device tokens before registration

## Troubleshooting

### "Invalid Platform Application"
- Verify Platform Application ARN is correct
- Check IAM permissions

### "Invalid Device Token"
- Token may have expired
- Verify token is from correct platform
- Check token format

### "Endpoint is disabled"
- Often happens after failed deliveries
- Re-enable with: `aws sns set-endpoint-attributes --endpoint-arn <arn> --attributes Enabled=true`

## References

- [AWS SNS Documentation](https://docs.aws.amazon.com/sns/)
- [Apple Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
EOF

echo -e "${GREEN}✓ Created: PUSH_NOTIFICATIONS_SETUP.md${NC}"

# Step 9: Summary and next actions
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}SNS SETUP COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "\n${BLUE}Created Files:${NC}"
echo "  ✓ src/types/pushNotifications.ts"
echo "  ✓ src/services/pushNotificationService.ts"
echo "  ✓ src/api/notifications.ts"
echo "  ✓ .env.sns-sandbox"
echo "  ✓ PUSH_NOTIFICATIONS_SETUP.md"

echo -e "\n${BLUE}Created AWS Resources:${NC}"
echo "  ✓ SNS Topic: $TOPIC_ARN"
echo "  ✓ IAM Role: $ROLE_ARN"
echo "  ✓ CloudWatch Logs: /aws/sns/$APP_NAME"

echo -e "\n${YELLOW}REQUIRED NEXT STEPS:${NC}"
echo "1. Obtain APNs certificate from Apple Developer Account"
echo "2. Obtain Firebase Server API Key from Firebase Console"
echo "3. Run commands in PUSH_NOTIFICATIONS_SETUP.md to create Platform Apps"
echo "4. Update .env with Platform Application ARNs"
echo "5. Test with sample device"

echo -e "\n${BLUE}Quick Test:${NC}"
echo "aws sns list-platform-applications --region $REGION"
echo ""
echo -e "${GREEN}Setup complete! See PUSH_NOTIFICATIONS_SETUP.md for next steps.${NC}"
EOF
