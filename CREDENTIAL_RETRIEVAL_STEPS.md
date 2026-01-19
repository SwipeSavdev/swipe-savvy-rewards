# Getting APNs and Firebase Credentials - Interactive Guide

## Step 1: Get APNs Authentication Key (5 minutes)

### 1.1 Open Apple Developer Account
```
Go to: https://developer.apple.com/account
Sign in with your Apple ID
```

### 1.2 Navigate to Keys
```
Left Sidebar → "Certificates, Identifiers & Profiles"
                    → "Keys" (under the middle section)
```

### 1.3 Create New Key
```
Click the "+" button (top left)
```

### 1.4 Configure Key
```
Key Name: "Swipe Savvy SNS Key"
Capabilities: Check "Apple Push Notifications service (APNs)"
Click "Register"
```

### 1.5 Download Key
```
Click "Download"
Saves as: AuthKey_XXXXXXXXXX.p8 (keep the filename)
IMPORTANT: Save this file in a safe place
This file contains your private key - you can only download once!
```

### 1.6 Get Key Content
Once downloaded, open Terminal and run:
```bash
cat ~/Downloads/AuthKey_XXXXXXXXXX.p8
```

**Copy the entire output** (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines)

**Also note:**
- Your **Key ID** (the XXXXXXXXXX part of the filename)
- Your **Apple Team ID** (go to Account Settings → Membership to find it)

---

## Step 2: Get Firebase Server Key (5 minutes)

### 2.1 Open Firebase Console
```
Go to: https://console.firebase.google.com
Select your Swipe Savvy project
```

### 2.2 Navigate to Service Accounts
```
Click ⚙️ (Settings) icon → "Project Settings"
Click "Service Accounts" tab
```

### 2.3 Generate Private Key
```
Look for "Firebase Admin SDK" section
Click "Generate New Private Key"
File downloads automatically (e.g., swipesavvy-xxxxx-firebase-adminsdk-xxxxx.json)
```

### 2.4 Get Key Content
Open Terminal and run:
```bash
cat ~/Downloads/swipesavvy-*-firebase-adminsdk-*.json | jq -r '.private_key'
```

**Copy the entire output** (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines)

---

## Step 3: Create a Temporary File with Credentials

Once you have both keys, create a temporary file to store them:

### 3.1 Create credentials file
```bash
cat > ~/credentials_temp.txt << 'EOF'
=== APPLE APNS KEY ===
[PASTE YOUR ENTIRE APNs KEY CONTENT HERE]

=== FIREBASE SERVER KEY ===
[PASTE YOUR ENTIRE FIREBASE SERVER KEY CONTENT HERE]

=== KEY IDS (for reference) ===
Apple Key ID: [YOUR_KEY_ID_FROM_FILENAME]
Apple Team ID: [YOUR_TEAM_ID]
EOF
```

### 3.2 Verify the file
```bash
cat ~/credentials_temp.txt
```

Make sure both keys are there and properly formatted.

---

## Step 4: Create Platform Applications in AWS

Once both credentials are ready, run these commands:

### 4.1 Create iOS Platform Application
```bash
# First, set your APNs key as a variable
APNS_KEY=$(cat ~/credentials_temp.txt | sed -n '/=== APPLE APNS KEY ===/,/=== FIREBASE SERVER KEY ===/p' | sed '1d;$d')

# Create the iOS platform app
aws sns create-platform-application \
  --name swipesavvy-sandbox-ios \
  --platform APNS_SANDBOX \
  --attributes PlatformPrincipal="$APNS_KEY",PlatformCredential="$APNS_KEY" \
  --region us-east-1
```

**Expected Output:**
```json
{
    "PlatformApplicationArn": "arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios"
}
```

**⬇️ SAVE THIS ARN** (you'll need it in your `.env` file)

### 4.2 Create Android Platform Application
```bash
# Set your Firebase server key as a variable
FIREBASE_KEY=$(cat ~/credentials_temp.txt | sed -n '/=== FIREBASE SERVER KEY ===/,/=== KEY IDS ===/p' | sed '1d;$d')

# Create the Android platform app
aws sns create-platform-application \
  --name swipesavvy-sandbox-android \
  --platform GCM \
  --attributes PlatformCredential="$FIREBASE_KEY" \
  --region us-east-1
```

**Expected Output:**
```json
{
    "PlatformApplicationArn": "arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android"
}
```

**⬇️ SAVE THIS ARN** (you'll need it in your `.env` file)

---

## Step 5: Verify Creation

Run this to confirm both apps were created:
```bash
aws sns list-platform-applications --region us-east-1
```

**Expected Output:**
```json
{
    "PlatformApplications": [
        {
            "PlatformApplicationArn": "arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios",
            "Attributes": {
                "Enabled": "true"
            }
        },
        {
            "PlatformApplicationArn": "arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android",
            "Attributes": {
                "Enabled": "true"
            }
        }
    ]
}
```

---

## Step 6: Update Environment Variables

### 6.1 Update your `.env` file

Add these lines (use the ARNs you saved from Step 4):

```bash
# SNS Platform Applications
SNS_IOS_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_ANDROID_PLATFORM_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android
SNS_AWS_REGION=us-east-1
```

### 6.2 Verify backend can access them
```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('iOS ARN:', os.getenv('SNS_IOS_PLATFORM_APP_ARN'))
print('Android ARN:', os.getenv('SNS_ANDROID_PLATFORM_APP_ARN'))
"
```

---

## Step 7: Test the Setup

### 7.1 Start your backend (if not already running)
```bash
cd swipesavvy-ai-agents
python main.py
```

### 7.2 Test device registration (iOS)
```bash
# Get a real iOS device token first, or use a test token
DEVICE_TOKEN="YOUR_REAL_IOS_DEVICE_TOKEN_HERE"

curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{
    \"device_token\": \"$DEVICE_TOKEN\",
    \"device_type\": \"ios\",
    \"device_name\": \"Test iPhone\"
  }"
```

**Expected Response:**
```json
{
    "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "device_token": "YOUR_REAL_IOS_DEVICE_TOKEN_HERE",
    "device_type": "ios"
}
```

### 7.3 Test sending a notification
```bash
ENDPOINT_ARN="arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/swipesavvy-sandbox-ios/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

curl -X POST http://localhost:8000/api/v1/notifications/sns/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{
    \"endpoint_arn\": \"$ENDPOINT_ARN\",
    \"title\": \"Hello from AWS SNS\",
    \"body\": \"This is a test notification\",
    \"badge\": 1,
    \"sound\": \"default\"
  }"
```

**Expected Response:**
```json
{
    "message_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "endpoint_arn": "arn:aws:sns:...",
    "status": "sent"
}
```

---

## Step 8: Clean Up

After you've verified everything works, delete the temporary credentials file:

```bash
rm ~/credentials_temp.txt
```

---

## Checklist

✅ **Check each item as you complete it:**

- [ ] Apple Developer Account accessed
- [ ] APNs Key downloaded (.p8 file)
- [ ] APNs Key content copied
- [ ] Apple Key ID noted
- [ ] Apple Team ID noted
- [ ] Firebase Console accessed
- [ ] Firebase Server Key downloaded (JSON)
- [ ] Firebase Server Key content copied
- [ ] Credentials file created (~/credentials_temp.txt)
- [ ] iOS Platform Application created in AWS
- [ ] iOS Platform App ARN saved
- [ ] Android Platform Application created in AWS
- [ ] Android Platform App ARN saved
- [ ] Credentials file deleted
- [ ] Environment variables updated in .env
- [ ] Backend started successfully
- [ ] Device registration tested
- [ ] Notification sending tested
- [ ] Notification received on device (if real device available)

---

## Troubleshooting

### "InvalidParameter: PlatformCredential is not a valid Apple certificate"
- Make sure you copied the **entire** APNs key content (including `-----BEGIN PRIVATE KEY-----` line)
- The key must be from an APNs Authentication Key (not other types)

### "File not found when trying to cat"
- Make sure you downloaded the files to `~/Downloads/` or adjust the path
- Check the exact filename: `ls ~/Downloads/ | grep AuthKey`

### "PlatformCredential is not a valid Firebase Server API Key"
- Make sure you extracted the `private_key` field from the JSON (not the whole file)
- The key should start with `-----BEGIN PRIVATE KEY-----`

### "Authorization failed when creating platform app"
- Run `aws sts get-caller-identity` to verify AWS credentials are working
- Make sure you have SNS permissions in your IAM role

### "Endpoint not receiving notifications"
- Verify device token is valid and current
- Check APNs/Firebase credentials are correct
- Monitor CloudWatch: `aws logs tail /aws/sns/swipesavvy-sandbox --follow`

---

## Next Steps After Successful Setup

1. **Test with real devices**
   - Register actual iOS and Android devices
   - Send notifications and verify they appear

2. **Set up monitoring**
   ```bash
   aws logs tail /aws/sns/swipesavvy-sandbox --follow
   ```

3. **Move to production**
   - Create APNS (production) instead of APNS_SANDBOX
   - Update Firebase to production project
   - Update environment variables
   - Run full integration tests

4. **Implement notification types**
   - Payment notifications
   - Campaign notifications
   - Support notifications
   - Security alerts
   - Feature announcements

