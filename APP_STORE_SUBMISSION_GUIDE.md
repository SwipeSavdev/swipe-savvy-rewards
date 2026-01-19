# SwipeSavvy App Store Submission - Complete Guide

**App Name**: SwipeSavvy  
**Bundle ID**: com.swipesavvy.mobileapp  
**Version**: 1.0.0  
**Target**: iOS App Store  
**Date**: January 19, 2026

---

## 📋 Table of Contents

1. [Pre-Submission Checklist](#pre-submission-checklist)
2. [Code Signing & Provisioning](#code-signing--provisioning)
3. [Push Notifications Setup](#push-notifications-setup)
4. [App Capabilities Configuration](#app-capabilities-configuration)
5. [Entitlements File](#entitlements-file)
6. [App Store Connect Setup](#app-store-connect-setup)
7. [Privacy & Compliance](#privacy--compliance)
8. [Build & Archive](#build--archive)
9. [TestFlight Beta Testing](#testflight-beta-testing)
10. [Submission to App Store](#submission-to-app-store)

---

## 🔍 Pre-Submission Checklist

### Apple Developer Account
- [ ] Apple Developer Program membership active ($99/year)
- [ ] Team ID: `CL5DJUWXZY`
- [ ] Account has Admin role
- [ ] Payment method on file

### App Information
- [ ] App name finalized: **SwipeSavvy**
- [ ] App category: **Finance**
- [ ] Pricing: **Free**
- [ ] Bundle ID: **com.swipesavvy.mobileapp** (verified)
- [ ] Version: **1.0.0**
- [ ] Build number: **1** (will increment for each build)

### Required Assets
- [ ] App icon (1024x1024 PNG)
- [ ] App screenshots (5-8 per device size)
- [ ] App preview video (optional but recommended)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

### Code Requirements
- [ ] Minimum iOS version: **14.0** (or specify your requirement)
- [ ] Code signing certificate valid
- [ ] Provisioning profiles created
- [ ] Push notification certificate enabled
- [ ] All permissions declared in Info.plist

---

## 🔐 Code Signing & Provisioning

### Step 1: Create Production Certificate

**In Apple Developer Account:**

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click "+" button
3. Select "Apple Distribution" (for App Store)
4. Upload a Certificate Signing Request (CSR):
   ```bash
   # Generate CSR on your Mac
   # Open: Applications → Utilities → Keychain Access
   # Menu: Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   # Save as: CertificateSigningRequest.certSigningRequest
   ```
5. Download the `.cer` file
6. Double-click to install in Keychain

### Step 2: Create App ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click "+" button
3. Select "App IDs"
4. Choose "App"
5. Register App ID:
   - **Description**: SwipeSavvy Production
   - **Bundle ID**: com.swipesavvy.mobileapp (Explicit)
6. Select Capabilities:
   - [x] Push Notifications
   - [x] Sign in with Apple (if applicable)
   - [x] Keychain Sharing
   - [ ] Other as needed
7. Click "Register"

### Step 3: Create Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click "+" button
3. Select "App Store"
4. Choose your App ID: com.swipesavvy.mobileapp
5. Select your Distribution Certificate
6. Name: "SwipeSavvy AppStore Distribution"
7. Download the `.mobileprovision` file
8. Double-click to install

### Step 4: Configure in Xcode

After building with EAS, when you're ready for manual signing:

```
Xcode → Project Settings → Signing & Capabilities
- Team: Select your team
- Provisioning Profile: Select "SwipeSavvy AppStore Distribution"
```

---

## 🔔 Push Notifications Setup

### ✅ Already Completed

Your push notifications are configured via AWS SNS:
- iOS Platform App: `arn:aws:sns:us-east-1:858955002750:app/APNS/swipesavvy-sandbox-ios`
- APNs Key: `A22449LZT3`
- Team ID: `CL5DJUWXZY`

### For Production (After Sandbox Testing)

1. In Apple Developer, create **APNS Production Certificate**:
   - Go to: https://developer.apple.com/account/resources/certificates/list
   - Click "+"
   - Select "Apple Push Notification service SSL (Sandbox & Production)"
   - Upload CSR
   - Download `.cer` file

2. In AWS SNS, create production platform app:
   ```bash
   aws sns create-platform-application \
     --name swipesavvy-ios-production \
     --platform APNS \
     --attributes PlatformPrincipal="your-prod-cert",PlatformCredential="your-prod-cert" \
     --region us-east-1
   ```

3. Update backend to use production app for production environment

---

## 🎯 App Capabilities Configuration

### Enable Required Capabilities in Xcode

```
Xcode → Project → Signing & Capabilities → + Capability
```

Add these capabilities:

1. **Push Notifications**
   - ✅ Already in app.json
   - Xcode will verify with Apple

2. **Sign in with Apple** (if applicable)
   - Add if you support Apple Sign-In

3. **Keychain Sharing**
   - Required for secure token storage
   - Keychain group: `group.com.swipesavvy.mobileapp`

4. **Network Framework**
   - Required for WebSocket connections
   - Already included in app dependencies

### Verify in Info.plist

Your app.json already includes:
```json
"infoPlist": {
  "NSFaceIDUsageDescription": "Allow SwipeSavvy to use Face ID for secure authentication",
  "NSLocationWhenInUseUsageDescription": "Allow SwipeSavvy to access your location for geo-based promotions",
  "NSMicrophoneUsageDescription": "Allow SwipeSavvy to use your microphone for voice commands",
  "NSCameraUsageDescription": "Allow SwipeSavvy to use your camera to scan checks"
}
```

✅ **This is correctly configured**

---

## 📄 Entitlements File

Create `entitlements.production.plist` in your iOS project:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>production</string>
    <key>com.apple.developer.icloud-container-identifiers</key>
    <array>
        <string>iCloud.com.swipesavvy.mobileapp</string>
    </array>
    <key>com.apple.developer.icloud-services</key>
    <array>
        <string>CloudKit</string>
    </array>
    <key>com.apple.developer.keychain-access-groups</key>
    <array>
        <string>$(AppIdentifierPrefix)com.swipesavvy.mobileapp</string>
    </array>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:swipesavvy.com</string>
        <string>webcredentials:swipesavvy.com</string>
    </array>
</dict>
</plist>
```

**For Expo/EAS builds**, add to `app.json`:

```json
"ios": {
  "entitlements": "./entitlements.production.plist"
}
```

---

## 🏪 App Store Connect Setup

### Step 1: Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com/
2. Click "My Apps"
3. Click "+" → "New App"
4. Fill in:
   - **Platform**: iOS
   - **Name**: SwipeSavvy
   - **Primary Language**: English
   - **Bundle ID**: com.swipesavvy.mobileapp
   - **SKU**: com.swipesavvy.mobileapp (unique identifier)
   - **User Access**: Select "Full Access"

### Step 2: App Information

**General Information**
- **Name**: SwipeSavvy
- **Subtitle**: Rewarding Your Financial Wellness (optional)
- **Category**: Finance
- **Privacy Policy URL**: https://swipesavvy.com/privacy
- **Support URL**: https://support.swipesavvy.com
- **Marketing URL**: https://swipesavvy.com (optional)

**App Type**
- [x] iOS App
- [ ] Mac App
- [ ] Apple Watch App

**Version Information**
- **Version**: 1.0.0
- **Build**: Will specify during submission

### Step 3: Pricing and Availability

1. **Pricing Tier**: Free
2. **Availability**:
   - Select countries/regions
   - Schedule release date
   - Suggested: Available on App Store release date

### Step 4: Ratings

Fill out app rating questionnaire:
- **Alcohol, Tobacco, Drugs**: No
- **Gambling**: No
- **Violence**: No
- **Horror**: No
- **Medical/Treatment Information**: No (unless applicable)
- **Profanity**: No
- **Sexual Content**: No
- **Mature Humor**: No
- **Other**: No

---

## 🔒 Privacy & Compliance

### Privacy Policy

Create comprehensive privacy policy covering:

**Required sections:**
- Information we collect
- How we use information
- Data sharing practices
- Your rights
- Children's privacy
- Changes to policy

**Payment Processing Privacy:**
Since you handle payments:
- Clearly state you use secure payment processing
- Mention PCI DSS compliance
- Explain financial data protection

**Location Services:**
- Explain why location is collected
- How long it's retained
- Whether it's shared

**Biometric Data (Face ID):**
- Explain it's only stored locally
- Never transmitted to servers

**Push Notifications:**
- Users can disable in Settings
- Explain notification types

**Example Privacy Policy Template:**
```
App Name: SwipeSavvy
Effective Date: January 19, 2026

1. INFORMATION WE COLLECT
- Account information (email, name, phone)
- Device information (device ID, OS version)
- Location data (with permission)
- Camera images (for check scanning)
- Biometric data (Face ID - stored locally only)
- Payment information (handled by secure provider)

2. HOW WE USE YOUR INFORMATION
- To provide app functionality
- To process payments
- To send push notifications
- To improve user experience
- To analyze app usage

3. DATA SECURITY
- All data encrypted in transit (TLS/SSL)
- Sensitive data encrypted at rest
- Regular security audits
- Compliance with industry standards

4. YOUR RIGHTS
- Access your data
- Delete your account
- Opt-out of notifications
- Opt-out of analytics

5. CONTACT US
Privacy Inquiries: privacy@swipesavvy.com
```

### App Privacy Report (Required by Apple)

In App Store Connect, you must declare:

1. **User Privacy & Data Practices**
   - Go to: App → Privacy
   - Select: "Yes" or "No" for each data type
   - Specify purposes

2. **Data Types to Declare:**
   - [x] User ID
   - [x] Email Address
   - [x] Name
   - [x] Phone Number
   - [x] Payment Information
   - [x] Photos or Videos
   - [x] Location
   - [x] Biometric Data
   - [x] Health & Fitness

3. **Data Practices:**
   - Is data tracked for advertising? No
   - Is data linked to user identity? Yes
   - Is data sold? No
   - Is data shared with third parties? Specify

---

## 🔨 Build & Archive

### Using EAS Build (Recommended)

```bash
# Configure EAS for production
eas build --platform ios --auto-submit

# Or manual submission:
eas build --platform ios

# This creates a signed .ipa file ready for submission
```

### Manual Build with Xcode

```bash
# Archive the app
xcodebuild -scheme SwipeSavvy \
  -configuration Release \
  -derivedDataPath build/DerivedData \
  archive -archivePath build/SwipeSavvy.xcarchive

# Export for app store
xcodebuild -exportArchive \
  -archivePath build/SwipeSavvy.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

**ExportOptions.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>CL5DJUWXZY</string>
    <key>uploadBitcode</key>
    <true/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
```

### Build & Submit via Transporter

1. Download build from EAS or build locally
2. Open Transporter app (free from App Store)
3. Add your .ipa file
4. Sign in with Apple ID
5. Click "Deliver"

---

## 🧪 TestFlight Beta Testing

### Step 1: Add Beta Testers

1. App Store Connect → TestFlight → Internal Testing
2. Click "+" to add testers
3. Enter Apple ID email addresses
4. Set roles:
   - Admin
   - Developer
   - Marketer
   - Tester

### Step 2: Create Beta Build

1. Go to TestFlight
2. Upload your build via Transporter
3. Apple processes it (~15-30 min)
4. Set build as "Testable"

### Step 3: Invite Testers

1. Create beta test group
2. Select testers to invite
3. Send invitation email
4. Testers accept via TestFlight app

### Step 4: Monitor Beta Testing

- Track crashes via TestFlight
- Review feedback from testers
- Fix critical issues
- Upload new builds as needed
- Minimum 24 hours in beta before submission

---

## 📤 Submission to App Store

### Pre-Submission Verification

**Checklist:**
- [ ] All code signing complete
- [ ] Push notifications configured
- [ ] Privacy policy live and accessible
- [ ] App rating questionnaire complete
- [ ] Pricing set to Free
- [ ] App category: Finance
- [ ] Supported devices configured
- [ ] Minimum iOS version set (14.0+)
- [ ] Screenshots uploaded (all sizes)
- [ ] App preview video uploaded (optional)
- [ ] Tested on multiple devices
- [ ] No crashes or major bugs
- [ ] All required permissions declared
- [ ] Biometric/Location data properly explained
- [ ] Payment processing secure and documented

### Build & Release

1. **Create Release Version in App Store Connect**
   - Go to: App → Prepare for Submission → Version
   - Create new version: 1.0.0
   - Set status: Prepare for Submission

2. **Add App Screenshots**
   - Minimum: 4-5 per device size
   - Recommended: 6-8 for better conversions
   - Sizes:
     - iPhone 6.7": 1290 x 2796 px
     - iPhone 6.1": 1170 x 2532 px
     - iPhone 5.5": 1242 x 2208 px

3. **Add App Preview (Optional but Recommended)**
   - 30-second video
   - Shows key app features
   - Format: .mov, H.264
   - Dimensions: Device-specific

4. **Complete Metadata**
   - Subtitle (optional)
   - Description: Describe key features
   - Keywords: App discovery
   - Support URL: Support page
   - Privacy Policy URL: Published privacy policy
   - Release Notes: What's new in this version

5. **Select Build**
   - Choose your signed build
   - Verify build number
   - Apple runs automated checks

### Submit for Review

1. Fill in review information:
   - **First Name/Last Name**: Your name
   - **Email**: Support email
   - **Phone**: Support phone
   - **Review Notes**: Information for reviewers

2. **Export Compliance**
   - Does app use encryption? Yes
   - Select: "I don't know" or specify
   - Apple determines ECCN

3. **Content Rights**
   - Confirm you have rights to all content
   - Confirm compliance with guidelines

4. **Click "Submit for Review"**

### Review Timeline

- **Standard Review**: 24-48 hours
- **Complex Review**: 3-5 days
- **Expedited Review**: Available for issues

### After Submission

1. **Monitor Review Status**
   - App Store Connect → Activity
   - Receives notifications to your email

2. **Possible Outcomes**
   - ✅ Approved → Released to App Store
   - ⚠️ Requires Action → Fix issues, resubmit
   - ❌ Rejected → Address feedback, resubmit

3. **If Rejected**
   - Read detailed feedback
   - Fix specified issues
   - Resubmit with new build number

---

## ⚠️ Common Rejection Reasons & Solutions

### Crashes or Performance Issues
- **Solution**: Test thoroughly in TestFlight
- **Fix**: Use Xcode console to identify crashes
- **Verify**: Run on minimum iOS version

### Incomplete Privacy Policy
- **Solution**: Make it comprehensive and accessible
- **Include**: Data collection, usage, rights
- **Link**: From both app and website

### Misleading Functionality
- **Solution**: Ensure features work as described
- **Include**: Screenshots matching actual functionality
- **Update**: If features not ready

### Excessive Permissions
- **Solution**: Only request needed permissions
- **Explain**: Why each permission is needed
- **Minimize**: Request at point of use

### Payment Issues
- **Solution**: Use In-App Purchase for digital goods
- **Ensure**: Clear pricing and terms
- **Test**: Transactions in sandbox mode

### Biometric Data Privacy
- **Solution**: Clearly state Face ID stored locally
- **Include**: In privacy policy and app description
- **Ensure**: No transmission to servers

---

## 🎬 Next Steps

1. **Prepare Assets**
   - Finalize app screenshots
   - Create preview video (optional)
   - Polish app icon and artwork

2. **Complete App Store Connect**
   - Fill in all metadata
   - Upload screenshots
   - Set pricing and availability

3. **Final Testing**
   - Test on multiple devices
   - Use TestFlight for beta
   - Collect feedback from testers

4. **Submit for Review**
   - Ensure all checklist items complete
   - Add review notes
   - Monitor email for status

5. **Post-Launch**
   - Monitor app ratings
   - Respond to reviews
   - Plan for updates

---

## 📞 Support Resources

- **Apple Developer Support**: https://developer.apple.com/support/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **TestFlight Documentation**: https://developer.apple.com/testflight/
- **Xcode Help**: https://help.apple.com/xcode/

---

**Status**: Ready for App Store Submission  
**Last Updated**: January 19, 2026  
**Next Review**: Upon submission
