# iOS Code Signing & Provisioning for SwipeSavvy - Complete Guide

## SECTION 1: PREPARE CERTIFICATE SIGNING REQUEST (CSR)

### Step 1.1: Open Keychain Access
```bash
# On Mac, launch Keychain Access
open /Applications/Utilities/Keychain\ Access.app
```

### Step 1.2: Create Certificate Signing Request
```
1. Menu: Keychain Access > Certificate Assistant > Request a Certificate from a Certificate Authority
2. In the dialog:
   - User Email Address: your-email@swipesavvy.com
   - Common Name: SwipeSavvy iOS Distribution
   - CA Email Address: [LEAVE BLANK]
   - Request is: Saved to disk
3. Click "Continue"
4. Save file as: SwipeSavvy-iOS-Distribution.certSigningRequest
5. Save location: Desktop or Documents folder
6. Click "Save"
```

Your CSR file is now ready for upload to Apple Developer.

---

## SECTION 2: CREATE DISTRIBUTION CERTIFICATE (PRODUCTION)

### Step 2.1: Log Into Apple Developer
```
1. Go to: https://developer.apple.com/account
2. Sign in with your Apple ID
3. Click "Certificates, Identifiers & Profiles"
```

### Step 2.2: Create Distribution Certificate
```
Location: Certificates, Identifiers & Profiles > Certificates > All

1. Click "+" button (Create a new certificate)
2. Select "Apple Distribution"
   - This is for App Store distribution
   - NOT "Apple Development" (that's for testing)
3. Click "Continue"
4. Follow the instructions: "Choose File"
5. Select your CSR file: SwipeSavvy-iOS-Distribution.certSigningRequest
6. Click "Continue"
7. Click "Download"
   - File downloaded: ios_distribution.cer

SAVE THIS FILE SAFELY - You need it next.
```

### Step 2.3: Add Certificate to Keychain
```bash
# Double-click the downloaded ios_distribution.cer file
# OR drag it into Keychain Access
# It will automatically add to your login keychain

# Verify it was added:
# Keychain Access > Certificates
# Look for: Apple Distribution: [Your Name] ([Team ID: CL5DJUWXZY])
```

---

## SECTION 3: REGISTER APP ID

### Step 3.1: Create or Verify App ID
```
Location: Certificates, Identifiers & Profiles > Identifiers > All

1. Click "+" button
2. Select "App IDs"
3. Register the following:

   Description: SwipeSavvy
   
   Bundle ID: com.swipesavvy.mobileapp
             (Explicit type - not wildcard)
   
   Capabilities to ENABLE:
   ✓ Push Notifications
   ✓ Sign in with Apple  
   ✓ Associated Domains
   ✓ Keychain Sharing
   
   Optional (not needed for v1.0.0):
   □ HomeKit
   □ Wallet (Apple Pay)
   □ In-App Purchase
   □ HealthKit

4. Click "Continue"
5. Review the configuration
6. Click "Register"

NOTE: If the App ID already exists, just verify the capabilities 
are correct and enabled.
```

---

## SECTION 4: CONFIGURE PUSH NOTIFICATIONS (APNS)

### Step 4.1: Create APNs Keys
```
Location: Certificates, Identifiers & Profiles > Keys > All

1. Click "+" button
2. Key Name: SwipeSavvy-APNS-Production
3. Check: Apple Push Notifications service (APNs)
4. Click "Continue"
5. Click "Register"
6. Click "Download"
   - File downloaded: AuthKey_[KEY_ID].p8
   
   IMPORTANT: You can only download this ONCE
   Save it in a secure location:
   - Location: ~/.ssh/AuthKey_[KEY_ID].p8
   - Backup: Save in password manager

7. Note your Key ID (shown in the file name)
   - Format: A22449LZT3 (already have this)
   - Your Team ID: CL5DJUWXZY

This key is already in AWS SNS, so you're good here.
```

---

## SECTION 5: CREATE APP STORE PROVISIONING PROFILE

### Step 5.1: Create Provisioning Profile
```
Location: Certificates, Identifiers & Profiles > Profiles > All

1. Click "+" button
2. Select "App Store"
   - NOT "Ad Hoc" or "Development"
   - App Store is for production submission
3. Click "Continue"

4. Select App ID: com.swipesavvy.mobileapp
5. Click "Continue"

6. Select Certificate: 
   - Look for "Apple Distribution: [Your Name]"
   - This is the certificate you created in Step 2
7. Click "Continue"

8. Profile Name: SwipeSavvy-AppStore-Production
   (Make it descriptive)

9. Click "Generate"

10. Click "Download"
    - File downloaded: SwipeSavvy-AppStore-Production.mobileprovision
    
SAVE THIS FILE - You'll need it for Xcode.
```

### Step 5.2: Install Provisioning Profile in Xcode
```bash
# Method 1: Automatic (Xcode 12+)
# Just add to Xcode - it handles it automatically

# Method 2: Manual
# Copy to the correct location:
cp SwipeSavvy-AppStore-Production.mobileprovision \
   ~/Library/MobileDevice/Provisioning\ Profiles/

# Verify installation:
ls ~/Library/MobileDevice/Provisioning\ Profiles/ | grep -i swipesavvy
```

---

## SECTION 6: XCODE CONFIGURATION

### Step 6.1: Set Up Signing in Xcode
```
1. Open Xcode project
   - File > Open > ios/Podfile.lock
   - Actually, open the .xcworkspace file:
   
   open ios/SwipeSavvy.xcworkspace

2. Select Target: SwipeSavvy (not Pods)

3. Go to: Signing & Capabilities tab

4. Configure Signing:
   - Team: [Your Team Name] (CL5DJUWXZY)
   - Bundle Identifier: com.swipesavvy.mobileapp
   - Signing Certificate: Apple Distribution
   - Provisioning Profile: SwipeSavvy-AppStore-Production

5. Verify Capabilities:
   ✓ Push Notifications (enabled)
   ✓ Sign in with Apple (enabled)
   ✓ Associated Domains (enabled)
   ✓ Keychain Sharing (enabled)

6. Check for any red warning icons - should be none
```

### Step 6.2: Verify Code Signing Identity
```bash
# In Xcode Build Settings, search for "signing"

# Should show:
# Code Signing Identity: Apple Distribution
# Signing Certificate: AppleDistribution
# Provisioning Profile: SwipeSavvy-AppStore-Production
# Team ID: CL5DJUWXZY
```

---

## SECTION 7: BUILD FOR ARCHIVE (PRODUCTION BUILD)

### Step 7.1: Clean Build
```bash
# In terminal, in your project directory:
cd /path/to/swipe-savvy-rewards

# Clean previous builds
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean Expo cache
expo prebuild --clean
```

### Step 7.2: Create Production Entitlements File

The entitlements file should be at:
```
ios/SwipeSavvy/SwipeSavvy.entitlements
```

If it doesn't exist, create it. We've already created:
`swipe-savvy-rewards.entitlements`

Copy it to the correct location:
```bash
cp swipe-savvy-rewards.entitlements ios/SwipeSavvy/SwipeSavvy.entitlements
```

Content should include:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
         "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>
    
    <key>keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.swipesavvy.mobileapp</string>
    </array>
    
    <key>associated-domains</key>
    <array>
        <string>applinks:swipesavvy.com</string>
        <string>webcredentials:swipesavvy.com</string>
    </array>
    
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
</dict>
</plist>
```

### Step 7.3: Build Using EAS CLI (Recommended)

```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Configure for production build
# File: eas.json (should have production profile)

# Build for App Store
eas build --platform ios --build-profile production

# This will:
# ✓ Use your code signing credentials
# ✓ Build with correct entitlements
# ✓ Generate IPA file for submission
# ✓ Upload to your EAS project

# Monitor build status at:
# https://expo.dev/build/[project-id]
```

### Step 7.4: Manual Build Using Xcode (If EAS fails)

```bash
# Step 1: Prebuild for iOS
expo prebuild --platform ios --clean

# Step 2: Open Xcode workspace
open ios/SwipeSavvy.xcworkspace

# Step 3: In Xcode:
# - Select: Product > Scheme > SwipeSavvy
# - Verify: Generic iOS Device (or your connected device)
# - Menu: Product > Build

# Step 4: Create Archive for Submission
# - Menu: Product > Archive
# - Wait for build to complete
# - Archive organizer opens automatically
# - Select your archive
# - Click: Distribute App

# Step 5: In Distribute App dialog:
# - Method: App Store Connect
# - Automatically manage signing: YES
# - Certificate: Apple Distribution
# - Profile: SwipeSavvy-AppStore-Production

# Step 6: Upload to App Store Connect
# - System will prompt for authentication
# - App Store Connect credentials required
# - Upload completes in few minutes
```

---

## SECTION 8: VERIFICATION STEPS

### Step 8.1: Verify Code Signing
```bash
# Check if certificate is valid
security find-identity -v -p codesigning | grep Apple\ Distribution

# Output should show:
# Apple Distribution: [Your Name] ([TEAM_ID])
```

### Step 8.2: Verify Entitlements
```bash
# If you built manually, check entitlements were included:
codesign -d --entitlements :- /path/to/built/app

# Should show:
# <key>aps-environment</key>
# <string>production</string>
```

### Step 8.3: Verify Provisioning Profile
```bash
# Check provisioning profile details
security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/SwipeSavvy-AppStore-Production.mobileprovision | grep -A 5 AppIDName

# Should show:
# AppIDName: SwipeSavvy
```

---

## SECTION 9: TROUBLESHOOTING

### Problem: "No matching provisioning profiles found"

**Solution:**
```bash
# 1. Re-download provisioning profile from Apple Developer
# 2. Delete old one:
rm ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision

# 3. Re-add new one:
cp SwipeSavvy-AppStore-Production.mobileprovision \
   ~/Library/MobileDevice/Provisioning\ Profiles/

# 4. Restart Xcode:
killall Xcode
open ios/SwipeSavvy.xcworkspace

# 5. In Xcode > Signing & Capabilities:
# - Change Provisioning Profile to "None"
# - Change back to: SwipeSavvy-AppStore-Production
# - Let Xcode auto-select
```

### Problem: "Certificate Expired"

**Solution:**
```bash
# Create a NEW certificate:
# 1. Apple Developer > Certificates
# 2. Click "+" > Apple Distribution
# 3. Upload NEW CSR (follow Section 1)
# 4. Download and add to Keychain
# 5. Create NEW Provisioning Profile (Section 5)
# 6. Update in Xcode Signing & Capabilities
```

### Problem: "Code Signing Identity does not match"

**Solution:**
```bash
# 1. Check Team ID matches:
# Xcode Build Settings > Code Signing > Team ID
# Should be: CL5DJUWXZY

# 2. Check Bundle ID matches:
# Build Settings > Product Bundle Identifier
# Should be: com.swipesavvy.mobileapp

# 3. Check Certificate is in Keychain:
open /Applications/Utilities/Keychain\ Access.app
# Look for: "Apple Distribution: [Name]"

# 4. If not in Keychain:
# Double-click ios_distribution.cer to add
```

### Problem: "Push Notification Entitlement Missing"

**Solution:**
```bash
# 1. Verify entitlements file exists:
ls -la ios/SwipeSavvy/SwipeSavvy.entitlements

# 2. Check content includes:
grep -A 1 "aps-environment" ios/SwipeSavvy/SwipeSavvy.entitlements
# Should show: <string>production</string>

# 3. In Xcode > Signing & Capabilities:
# - Tab: Signing & Capabilities
# - Click "+" Capability
# - Add: Push Notifications
# - Verify: ✓ checked

# 4. Rebuild
```

---

## SECTION 10: NEXT STEPS

After successful build:

### Step 10.1: Upload to App Store Connect
```
If using EAS Build:
- Build completes automatically
- Asks permission to upload to App Store Connect
- Select "Yes"
- Build available in App Store Connect immediately

If using manual Xcode build:
- Archive > Distribute > Upload
- Authenticate with Apple ID
- Wait for upload to complete (~5 minutes)
```

### Step 10.2: Monitor Upload
```
1. Go to: https://appstoreconnect.apple.com
2. Select your app: SwipeSavvy
3. Go to: iOS App
4. Look for build in "Builds" section
5. Wait for processing to complete (5-10 minutes)
6. Status changes from "Processing" to "Ready to Submit"
```

### Step 10.3: Submit for Review
```
1. In App Store Connect
2. Go to: Version Release or Submission
3. Verify all metadata is correct:
   ✓ Screenshots uploaded
   ✓ Description is complete
   ✓ Privacy policy URL is live
   ✓ Support URL is working
   ✓ Build is selected
4. Click: "Submit for Review"
5. Expected review time: 24-48 hours
```

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| Bundle ID | com.swipesavvy.mobileapp |
| Team ID | CL5DJUWXZY |
| App ID Name | SwipeSavvy |
| Certificate Type | Apple Distribution |
| Profile Type | App Store |
| Profile Name | SwipeSavvy-AppStore-Production |
| Min iOS Version | 14.0 |
| Capabilities | Push Notifications, Sign in with Apple, Keychain |
| Build Method | EAS Build (recommended) |

---

## FILES YOU NEED

Before submitting, have these ready:

```
Required Files:
✓ ios_distribution.cer - Distribution certificate
✓ SwipeSavvy-AppStore-Production.mobileprovision - Provisioning profile
✓ SwipeSavvy.entitlements - Entitlements file
✓ app.json - Expo app config
✓ eas.json - EAS build config

Backup Files (save safely):
✓ SwipeSavvy-iOS-Distribution.certSigningRequest - CSR (for future use)
✓ AuthKey_[KEY_ID].p8 - APNs key (KEEP SECURE - never commit to git)
```

---

**READY TO BUILD AND SUBMIT!**

Next step: Generate app screenshots and complete App Store Connect metadata.
