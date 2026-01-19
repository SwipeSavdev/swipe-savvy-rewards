# AWS SNS Platform Applications - Credentials Setup Guide

## Overview
To create Platform Applications in AWS SNS, you need:
1. **APNs Authentication Key** (Apple) - for iOS push notifications
2. **Firebase Server Key** (Google/Firebase) - for Android push notifications

This guide walks you through getting both, then creating the Platform Applications in AWS.

---

## Part 1: Get APNs Authentication Key (iOS)

### Prerequisites
- Apple Developer Account (paid membership required)
- Access to Apple Developer Console

### Step-by-Step Instructions

#### 1.1 Go to Apple Developer Account
- Visit: https://developer.apple.com/account
- Sign in with your Apple ID
- Select "Certificates, Identifiers & Profiles"

#### 1.2 Create App ID (if not already created)
1. Click "Identifiers" in left sidebar
2. Click "+" button to create new identifier
3. Select "App IDs"
4. Choose "App" as the type
5. Enter:
   - **Description**: Swipe Savvy Sandbox
   - **Bundle ID**: Choose "Explicit" and enter: `com.swipesavvy.sandbox`
6. Under "Capabilities", enable "Push Notifications"
7. Click "Register"

#### 1.3 Create APNs Authentication Key
1. In left sidebar, click "Keys"
2. Click "+" to create a new key
3. Name it: `Swipe Savvy APNs Key`
4. Enable "Apple Push Notifications service (APNs)"
5. Click "Continue"
6. Click "Register"
7. **IMPORTANT**: Click "Download" immediately
   - Save as: `AuthKey_XXXXXXXXXX.p8` (Apple gives you the ID)
   - This file contains your private key - **keep it safe**

#### 1.4 Extract Key Content
You'll need the **Key ID** (shown in the file name, e.g., `XXXXXXXXXX`) and the file content.

**Option A - From Command Line:**
```bash
cat /path/to/AuthKey_XXXXXXXXXX.p8
```

**Option B - From Finder:**
- Open the .p8 file in TextEdit or VS Code
- Copy the entire content (should start with `-----BEGIN PRIVATE KEY-----`)

**Store these values:**
- **Key ID**: The 10-character code from filename
- **Team ID**: Apple Developer Team ID (find in Account Settings → Membership)
- **Key Content**: Full content of the .p8 file (including begin/end lines)

---

## Part 2: Get Firebase Server Key (Android)

### Prerequisites
- Firebase Project for Swipe Savvy
- Access to Firebase Console
- Google account with project permissions

### Step-by-Step Instructions

#### 2.1 Go to Firebase Console
- Visit: https://console.firebase.google.com
- Select your **Swipe Savvy** project

#### 2.2 Navigate to Service Accounts
1. Click ⚙️ (Settings) icon in top left
2. Select "Project Settings"
3. Click "Service Accounts" tab
4. Make sure "Firebase Admin SDK" is selected

#### 2.3 Generate Private Key
1. Scroll to "Firebase Admin SDK" section
2. Click "Generate New Private Key"
3. A JSON file will download automatically
   - Name: `[project-id]-firebase-adminsdk-[code].json`
   - Save in secure location

#### 2.4 Extract Key Content
Open the downloaded JSON file. You need:
- `private_key`: The full private key (multiline string starting with `-----BEGIN PRIVATE KEY-----`)

**Command to view:**
```bash
cat /path/to/downloaded/firebase-key.json | jq -r '.private_key'
```

**Store this value:**
- **Firebase Server Key**: The entire `private_key` value from the JSON

---

## Part 3: Create Platform Applications in AWS

Once you have both credentials, run these AWS CLI commands:

### 3.1 Create iOS Platform Application

```bash
#!/bin/bash

# Set your credentials
APNS_KEY_CONTENT='<PASTE_ENTIRE_APNs_KEY_HERE>'

aws sns create-platform-application \
  --name swipesavvy-sandbox-ios \
  --platform APNS_SANDBOX \
  --attributes PlatformPrincipal=$APNS_KEY_CONTENT,PlatformCredential=$APNS_KEY_CONTENT \
  --region us-east-1
```

**Steps:**
1. Open Terminal
2. Go to your project directory
3. Copy the code above to a file: `create-ios-app.sh`
4. Replace `<PASTE_ENTIRE_APNs_KEY_HERE>` with your actual APNs key content
5. Run: `bash create-ios-app.sh`
6. **Save the output** - you'll get an ARN like: `arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios`

### 3.2 Create Android Platform Application

```bash
#!/bin/bash

# Set your credentials
FIREBASE_SERVER_KEY='<PASTE_ENTIRE_FIREBASE_SERVER_KEY_HERE>'

aws sns create-platform-application \
  --name swipesavvy-sandbox-android \
  --platform GCM \
  --attributes PlatformCredential=$FIREBASE_SERVER_KEY \
  --region us-east-1
```

**Steps:**
1. Copy the code above to a file: `create-android-app.sh`
2. Replace `<PASTE_ENTIRE_FIREBASE_SERVER_KEY_HERE>` with your actual Firebase server key
3. Run: `bash create-android-app.sh`
4. **Save the output** - you'll get an ARN like: `arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android`

### 3.3 Verify Creation

```bash
aws sns list-platform-applications --region us-east-1
```

You should see both applications listed:
- `swipesavvy-sandbox-ios`
- `swipesavvy-sandbox-android`

---

## Part 4: Update Your Configuration

Once Platform Applications are created, update your environment variables:

### 4.1 Update `.env` File

```bash
# iOS
SNS_IOS_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios

# Android
SNS_ANDROID_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android

# AWS Region
SNS_AWS_REGION=us-east-1
```

### 4.2 Update Backend Code

In `swipesavvy-ai-agents/app/services/sns_push_notification_service.py`, update the initialization:

```python
self.ios_platform_arn = os.getenv('SNS_IOS_PLATFORM_APP_ARN')
self.android_platform_arn = os.getenv('SNS_ANDROID_PLATFORM_APP_ARN')
```

---

## Part 5: Test the Setup

### 5.1 Register a Device (iOS Example)

```bash
curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "device_token": "YOUR_IOS_DEVICE_TOKEN",
    "device_type": "ios",
    "device_name": "My iPhone"
  }'
```

**Expected Response:**
```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/12345678-1234-1234-1234-123456789012",
  "device_token": "YOUR_IOS_DEVICE_TOKEN",
  "device_type": "ios"
}
```

### 5.2 Send a Test Notification

```bash
curl -X POST http://localhost:8000/api/v1/notifications/sns/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
    "title": "Test Notification",
    "body": "This is a test from AWS SNS",
    "badge": 1,
    "sound": "default"
  }'
```

**Expected Response:**
```json
{
  "message_id": "12345678-1234-1234-1234-123456789012",
  "endpoint_arn": "arn:...",
  "status": "sent"
}
```

---

## Troubleshooting

### Issue: "Invalid parameter: PlatformCredential is not a valid Apple certificate"
**Solution:** Make sure you're pasting the entire `.p8` file content, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

### Issue: "Platform Application ARN not found in list"
**Solution:** Run `aws sns list-platform-applications --region us-east-1` to verify both apps are created.

### Issue: "NotAuthorizedException" when sending notifications
**Solution:** 
1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify IAM role has SNS permissions
3. Check endpoint ARN is correct

### Issue: "InvalidParameter" when registering device
**Solution:** Device token must be valid and in correct format for the platform.

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.p8` files or Firebase keys to Git
- Store credentials in AWS Secrets Manager for production
- Rotate APNs keys annually
- Use environment variables (not hardcoded values)
- Keep Firebase key private

---

## Checklist

- [ ] Apple Developer Account access confirmed
- [ ] APNs Authentication Key downloaded
- [ ] Key ID and Team ID recorded
- [ ] Firebase Console access confirmed
- [ ] Firebase Server Key downloaded
- [ ] iOS Platform Application created in AWS
- [ ] Android Platform Application created in AWS
- [ ] ARNs saved in environment variables
- [ ] Backend service configured with ARNs
- [ ] Test device registered successfully
- [ ] Test notification received on device

---

## Next Steps

Once Platform Applications are created:

1. **Install Dependencies**
   ```bash
   pip install boto3>=1.26.0 botocore>=1.29.0
   ```

2. **Update Backend Configuration**
   - Add SNS ARNs to `.env`
   - Verify imports in `notifications.py`

3. **Test with Real Devices**
   - Get actual device tokens from iOS and Android
   - Register devices via API
   - Send test notifications

4. **Monitor CloudWatch**
   ```bash
   aws logs tail /aws/sns/swipesavvy-sandbox --follow
   ```

---

## Support

If you encounter issues:
1. Check the AWS SNS console: https://console.aws.amazon.com/sns/
2. Review CloudWatch logs for detailed error messages
3. Verify credentials are valid in Apple Developer and Firebase consoles
4. Check AWS IAM permissions on the role

