# AWS SNS Push Notifications - Complete Migration Guide

## Overview

You're migrating from **Firebase Cloud Messaging (FCM)** direct integration to **AWS SNS Platform Applications** which manages push notifications via SNS endpoints.

**Key Change**: Instead of sending notifications directly to Firebase, tokens are registered with AWS SNS Platform Applications, which then forwards to APNs (iOS) or FCM (Android).

## Architecture Comparison

### Before (Firebase Direct)
```
Mobile App (gets Firebase token)
    ↓
Firebase Cloud Messaging (FCM)
    ↓
Device Notification
```

### After (AWS SNS)
```
Mobile App (gets Firebase token OR APNs token)
    ↓
AWS SNS Platform Application
    ↓
APNs (iOS) OR FCM (Android)
    ↓
Device Notification
```

## What Changed

### 1. Backend Service Files

**New File**: `swipesavvy-ai-agents/app/services/sns_push_notification_service.py`
- Replaces Firebase direct integration
- Uses AWS SNS client (boto3)
- Manages platform endpoints instead of Firebase tokens

**Updated File**: `swipesavvy-ai-agents/app/routes/notifications.py`
- Added new SNS-based endpoints under `/sns/*` prefix
- Old Firebase endpoints still available for backward compatibility
- New endpoints:
  - `POST /api/v1/notifications/sns/register-device`
  - `POST /api/v1/notifications/sns/send`
  - `DELETE /api/v1/notifications/sns/unregister/{endpoint_arn}`
  - `GET /api/v1/notifications/sns/status/{endpoint_arn}`

### 2. Mobile App - No Changes Required (Initially)

Your mobile app still works the same way:
- iOS: Gets APNs token from Apple Push Notification service
- Android: Gets Firebase token from FCM

The difference is that instead of sending the token to your backend for direct Firebase use, the backend now registers it with AWS SNS.

### 3. Environment Variables

Add to your `.env` file:

```bash
# AWS SNS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=858955002750
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications
SNS_IOS_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_ANDROID_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android
SNS_ROLE_ARN=arn:aws:iam::858955002750:role/swipesavvy-sns-sandbox-role
```

## Step-by-Step Migration

### Step 1: Install AWS SDK (if not already installed)

```bash
pip install boto3
```

### Step 2: Create Platform Applications (One-time)

If not already done:

```bash
# iOS Platform Application
aws sns create-platform-application \
  --name swipesavvy-sandbox-ios \
  --platform APNS_SANDBOX \
  --region us-east-1 \
  --attributes "PlatformCredential=$(cat /path/to/your/apns-key.p8)"

# Android Platform Application
aws sns create-platform-application \
  --name swipesavvy-sandbox-android \
  --platform GCM \
  --region us-east-1 \
  --attributes "PlatformCredential=<your-firebase-api-key>"
```

### Step 3: Update Backend Configuration

Update your application initialization to use SNS service:

```python
# Before
from app.services.firebase_service import FirebaseService
firebase_service = FirebaseService(credentials_json, database_url)

# After
from app.services.sns_push_notification_service import SNSPushNotificationService
sns_service = SNSPushNotificationService(
    aws_region='us-east-1',
    ios_app_arn=os.getenv('SNS_IOS_APP_ARN'),
    android_app_arn=os.getenv('SNS_ANDROID_APP_ARN')
)
```

### Step 4: Update API Calls (Mobile App Backend Integration)

**Old way (Firebase)**:
```typescript
// Mobile app sends token to backend
POST /api/v1/notifications/register-device
{
  "device_token": "firebase_token_...",
  "device_type": "ios"
}
```

**New way (SNS)**:
```typescript
// Mobile app sends same token, backend registers with SNS
POST /api/v1/notifications/sns/register-device
{
  "device_token": "firebase_token_...",
  "device_type": "ios"
}

// Response includes SNS endpoint ARN
{
  "success": true,
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
  "registered_at": "2024-01-15T10:30:00Z"
}
```

### Step 5: Update Device Registration in Mobile App

**React Native / Expo Example**:

```typescript
import * as Notifications from 'expo-notifications';
import { registerDevice } from '@/api/notifications';

export async function setupPushNotifications() {
  // Get token from Expo/Firebase
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Register with SNS instead of Firebase
  const response = await registerDevice({
    device_token: token.data,
    device_type: Platform.OS === 'ios' ? 'ios' : 'android',
    device_name: getDeviceName(),
  });
  
  // Store endpoint ARN for future notifications
  await AsyncStorage.setItem('endpointArn', response.endpoint_arn);
}
```

### Step 6: Update Notification Sending

**Old way**:
```python
firebase_service.send_notification(
    user_id=user_id,
    title="Hello",
    body="You have a message"
)
```

**New way**:
```python
sns_service.send_notification(
    endpoint_arn=user_endpoint_arn,
    title="Hello",
    body="You have a message"
)
```

## API Endpoint Migration

### Device Registration

**Endpoint**: `POST /api/v1/notifications/sns/register-device`

**Request**:
```json
{
  "device_token": "ExponentialPushToken[...]",
  "device_type": "ios",
  "device_name": "iPhone 14 Pro"
}
```

**Response**:
```json
{
  "success": true,
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/12345678-...",
  "device_token": "ExponentialPushToken[...]",
  "device_type": "ios",
  "registered_at": "2024-01-15T10:30:00Z"
}
```

### Send Notification

**Endpoint**: `POST /api/v1/notifications/sns/send`

**Request**:
```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
  "title": "Hello",
  "body": "You have a new message",
  "data": {
    "action": "open_chat",
    "chat_id": "123"
  },
  "badge": 1,
  "sound": "default"
}
```

**Response**:
```json
{
  "success": true,
  "message_id": "12345678-abcd-1234-abcd-123456789012",
  "platform": "ios",
  "sent_at": "2024-01-15T10:30:00Z"
}
```

### Check Endpoint Status

**Endpoint**: `GET /api/v1/notifications/sns/status/{endpoint_arn}`

**Response**:
```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
  "attributes": {
    "Enabled": "true",
    "Token": "...",
    "CustomUserData": "{\"user_id\": \"...\", ...}"
  }
}
```

### Unregister Device

**Endpoint**: `DELETE /api/v1/notifications/sns/unregister/{endpoint_arn}`

**Response**:
```json
{
  "success": true,
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
  "message": "Endpoint deleted successfully"
}
```

## Database Considerations

### Device Endpoint Storage

Previously, you might have stored Firebase tokens. Now store SNS endpoint ARNs instead:

```sql
-- Update device registration table
ALTER TABLE user_devices ADD COLUMN endpoint_arn VARCHAR(255);
UPDATE user_devices SET endpoint_arn = ... WHERE device_type IN ('ios', 'android');
```

### Migration Query

```python
# Pseudo-code for migrating Firebase tokens to SNS
for device in get_all_devices():
    result = sns_service.register_device(
        user_id=device.user_id,
        device_token=device.firebase_token,
        device_type=device.device_type
    )
    device.endpoint_arn = result['endpoint_arn']
    db.session.commit()
```

## Testing

### 1. Register Test Device

```bash
curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "test-token-123",
    "device_type": "ios",
    "device_name": "Test iPhone"
  }'
```

### 2. Send Test Notification

```bash
curl -X POST http://localhost:8000/api/v1/notifications/sns/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
    "title": "Test Notification",
    "body": "Hello from SNS!",
    "data": {"test": "true"}
  }'
```

### 3. Check Status

```bash
curl -X GET "http://localhost:8000/api/v1/notifications/sns/status/arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/..." \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Monitoring & Debugging

### CloudWatch Logs

```bash
# View SNS logs
aws logs tail /aws/sns/swipesavvy-sandbox --follow
```

### Check Delivery Status

```bash
# Get endpoint attributes
aws sns get-endpoint-attributes \
  --endpoint-arn "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/..." \
  --region us-east-1
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Platform Application not configured" | Ensure `SNS_IOS_APP_ARN` and `SNS_ANDROID_APP_ARN` env vars are set |
| "Invalid Device Token" | Token may be expired, re-register device |
| "Endpoint is disabled" | Re-enable with: `aws sns set-endpoint-attributes --endpoint-arn <arn> --attributes Enabled=true` |
| "InvalidParameter: PlatformCredential" | APNs cert or Firebase key not added to Platform Application |

## Backward Compatibility

The old Firebase endpoints (`/api/v1/notifications/*`) are still available if you haven't removed Firebase service. This allows gradual migration:

1. Keep Firebase working for existing code
2. Add SNS endpoints alongside Firebase
3. Gradually migrate endpoints one by one
4. Remove Firebase once everything is migrated

## Security Considerations

1. **Never commit credentials** to version control
2. **Use IAM roles** instead of access keys when running on EC2
3. **Enable CloudTrail** for audit logging
4. **Rotate APNs certificates** annually
5. **Validate tokens** before registration
6. **Rate limit** notification endpoints

## Summary

✅ **Created Files**:
- `swipesavvy-ai-agents/app/services/sns_push_notification_service.py` - SNS service
- `swipesavvy-ai-agents/app/routes/notifications.py` - Updated with SNS endpoints

✅ **Next Steps**:
1. Add credentials (APNs cert + Firebase key) to Platform Applications
2. Update `.env` with Platform Application ARNs
3. Update mobile app registration to use `/sns/register-device`
4. Test with real devices
5. Monitor CloudWatch logs
6. Gradually migrate production devices

🚀 **Ready for Sandbox Testing!**
