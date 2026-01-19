# AWS SNS Platform Applications - PROGRESS REPORT

## ✅ COMPLETED

### Android Platform Application (GCM)
- **Status**: ✅ CREATED
- **Name**: swipesavvy-sandbox-android
- **Platform**: GCM (Google Cloud Messaging)
- **ARN**: `arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android`
- **Enabled**: true
- **Credentials**: Firebase service account with full JSON
- **Created**: January 19, 2026

## ⏳ IN PROGRESS

### iOS Platform Application (APNS_SANDBOX)
- **Status**: ⏳ PENDING - Manual Setup Required
- **Name**: swipesavvy-sandbox-ios (to be created)
- **Platform**: APNS_SANDBOX (Apple Push Notification service)
- **Key ID**: A22449LZT3
- **Team ID**: CL5DJUWXZY
- **Key File**: AuthKey_A22449LZT3.p8

#### Why iOS needs manual setup?
AWS SNS has strict validation for APNs certificates. The key requires proper formatting and Apple authentication headers that are easier to set up through the AWS Console.

#### How to Create iOS Platform Application

**Method 1: AWS Console (Recommended - 2 minutes)**
1. Go to: https://console.aws.amazon.com/sns/
2. Navigate to: Mobile → Push notifications
3. Click: "Create platform application"
4. Fill in these details:
   ```
   Application name: swipesavvy-sandbox-ios
   Push notification platform: Apple Push Notification service (APNS)
   Sandbox or Production: APNS_SANDBOX
   Certificate type: Choose your key (.p8)
   Key file: /Users/papajr/Downloads/AuthKey_A22449LZT3.p8
   Key ID: A22449LZT3
   Team ID: CL5DJUWXZY
   ```
5. Click "Create platform application"
6. Copy the ARN from the response

**Method 2: AWS CLI with Base64**
```bash
cd /Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Create the iOS platform app with base64-encoded key
APNS_KEY=$(base64 -i /Users/papajr/Downloads/AuthKey_A22449LZT3.p8)

aws sns create-platform-application \
  --name swipesavvy-sandbox-ios \
  --platform APNS_SANDBOX \
  --attributes PlatformPrincipal="$APNS_KEY",PlatformCredential="$APNS_KEY" \
  --region us-east-1
```

---

## 📋 NEXT STEPS

### Step 1: Create iOS Platform Application
Use either method above. Once created, you'll get an ARN like:
```
arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
```

### Step 2: Update Configuration
Add both ARNs to your `.env` file:
```bash
# SNS Platform Applications
SNS_ANDROID_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android
SNS_IOS_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_AWS_REGION=us-east-1
```

### Step 3: Update Backend Code
The SNS service code is already in place. Just update `.env` and the service will use both platform apps automatically.

### Step 4: Test Both Platforms
```bash
# Test Android registration
curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "device_token": "YOUR_ANDROID_TOKEN",
    "device_type": "android",
    "device_name": "Test Android"
  }'

# Test iOS registration
curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "device_token": "YOUR_IOS_TOKEN",
    "device_type": "ios",
    "device_name": "Test iPhone"
  }'
```

---

## 📁 Files Created/Updated

### New Files
- `firebase-service-account.json` - Firebase credentials for Android
- `apns-key.pem` - APNs key for iOS
- `create-platform-apps.py` - Python script that created Android platform app
- `sns-platform-arns.json` - Android platform app ARN (iOS to be added)

### Key Infrastructure
- ✅ SNS Topic: `swipesavvy-sandbox-notifications`
- ✅ Android Platform App: Created and ready
- ⏳ iOS Platform App: Awaiting manual creation
- ✅ IAM Role: `swipesavvy-sns-sandbox-role`
- ✅ CloudWatch Logs: `/aws/sns/swipesavvy-sandbox`

---

## 🔐 Security Reminders

⚠️ **IMPORTANT:**
- `AuthKey_A22449LZT3.p8` - Keep in secure location, never commit to git
- `firebase-service-account.json` - Contains private key, never commit to git
- Use AWS Secrets Manager for production
- All credentials are environment variables only

---

## ✨ Summary

**Progress**: 50% Complete

**What's Working**:
- ✅ AWS SNS Infrastructure
- ✅ Android Platform Application created and verified
- ✅ Backend SNS service ready
- ✅ FastAPI endpoints deployed

**What's Left**:
- ⏳ Create iOS Platform Application (manual, ~2 minutes)
- ⏳ Update `.env` with both ARNs
- ⏳ Real device testing

**Estimated Time to Full Testing**: 30 minutes

---

**Status**: Ready for iOS Platform Application creation
**Last Updated**: January 19, 2026
