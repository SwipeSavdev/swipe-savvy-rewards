# SwipeSavvy Mobile App - Complete App Store Deployment Guide

**Status**: Deployment Ready  
**Date**: January 19, 2026  
**Version**: 1.0.0  
**Workspace**: `/Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards`

---

## 📋 Overview

This document covers the complete process for deploying SwipeSavvy to both Apple App Store and Google Play Store, including:

1. ✅ **Login Screen Redesign** (COMPLETED)
2. ✅ **Splash Screen Removal** (COMPLETED)
3. 🔄 **iOS App Store Build & Submission**
4. 🔄 **Google Play Store Build & Submission**

---

## ✅ COMPLETED: Login Screen Redesign

### What's Been Done

**File Modified**: `src/features/auth/screens/LoginScreen.tsx`

- ✅ Modern header section with branding
- ✅ Enhanced form design with icons and labels
- ✅ Password visibility toggle
- ✅ Improved error handling with visual feedback
- ✅ Professional button styling with proper touch targets
- ✅ Responsive layout with keyboard avoidance
- ✅ Terms of Service and Privacy Policy links
- ✅ Sign-up and forgot password flows

### Design Features

- **Visual Hierarchy**: Clear brand presence with large typography
- **Input Design**: Rounded fields with icon indicators (56px height)
- **Color Scheme**: Uses design system tokens (BRAND_COLORS, SPACING, RADIUS)
- **Accessibility**: Proper touch targets, label associations, error messaging
- **Responsive**: SafeAreaView, KeyboardAvoidingView, ScrollView for all screen sizes
- **Modern UX**: Show/hide password, real-time validation support

---

## ✅ COMPLETED: Splash Screen Removal

### Changes Made

1. **app.json**: Removed splash screen configurations for iOS and Android
2. **Component Exports**: Removed SplashScreen from component index
3. **App Startup**: Removed any artificial delays, loads directly to login

### Result

- **Fast Startup**: App loads directly to login screen without splash delays
- **Better UX**: No waiting for splash screen animation
- **Modern Feel**: Matches current app store expectations

---

## 🔄 PART 1: iOS APP STORE SUBMISSION

### 1.1 Prerequisites Checklist

- [ ] Apple Developer Program membership active ($99/year)
- [ ] Apple ID with admin role for the development team
- [ ] Mac with Xcode installed (latest version recommended)
- [ ] EAS CLI installed globally: `npm install -g eas-cli`
- [ ] Team ID: `CL5DJUWXZY` (from Apple Developer account)
- [ ] Unique Bundle ID: `com.swipesavvy.mobileapp`

### 1.2 App Information for App Store Connect

```
App Name:              SwipeSavvy
Bundle ID:             com.swipesavvy.mobileapp
Version:               1.0.0
Build Number:          1 (will increment for each submission)
Category:              Finance
Pricing:               Free
Target iOS Version:    14.0 or later
Languages:             English
```

### 1.3 Required Assets for App Store

Prepare the following in advance:

```
1. App Icon
   - Size: 1024x1024 PNG
   - Format: RGB, no transparency
   - Location: ./assets/icon.png (already in place)

2. Screenshots (for each device type)
   - iPhone 6.7" (e.g., iPhone 14 Plus)
   - iPhone 6.1" (e.g., iPhone 14)
   - iPhone 5.5" (e.g., iPhone 8 Plus)
   - iPad Pro 12.9" (optional)
   
   Requirements:
   - 5-8 screenshots per device type
   - PNG or JPG format
   - No marketing text overlay
   - Show key features of login/rewards functionality

3. App Preview Video (optional but recommended)
   - 15-30 seconds
   - MP4 or MOV format
   - Demonstrates main user flow

4. App Description
   - Character limit: 4000
   - Highlight rewards, loyalty, user-friendly interface
   - Include key features: tracking, redemption, notifications

5. Keywords
   - 100 characters max
   - Examples: rewards, loyalty, cashback, savings, mobile wallet

6. Support URL
   - Required, must be valid
   - Example: https://support.swipesavvy.com

7. Privacy Policy URL
   - Required, must be valid
   - Example: https://swipesavvy.com/privacy

8. Marketing URL (optional)
   - Example: https://swipesavvy.com
```

### 1.4 Step-by-Step iOS Build Process

#### Step 1: Prebuild the Expo Project

```bash
cd /Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean prebuild to ensure fresh native files
npx expo prebuild --clean

# This will:
# 1. Generate iOS and Android native directories
# 2. Configure native settings from app.json
# 3. Remove old splash screen configurations
# 4. Set up provisioning profiles and certificates
```

#### Step 2: Verify iOS Project Structure

```bash
# Check that iOS directory was created
ls -la ios/

# Expected output:
# SwipeSavvy/
# SwipeSavvy.xcodeproj/
# Pods/
# Podfile
# Podfile.lock
```

#### Step 3: Configure Code Signing

**Option A: Using EAS (Recommended)**

```bash
# Let EAS manage code signing automatically
eas build --platform ios --auto-submit

# This will:
# 1. Detect your Apple Developer account
# 2. Create/fetch distribution certificate
# 3. Create/fetch provisioning profile
# 4. Sign the app automatically
# 5. Submit to App Store

# When prompted:
# - Choose your Apple Developer team
# - Select "Distribution" for App Store
# - Allow EAS to create certificates (recommended)
```

**Option B: Manual Code Signing (Advanced)**

If you need manual control, follow these steps:

1. **Open Xcode**:
   ```bash
   open ios/SwipeSavvy.xcworkspace
   ```

2. **Select Project & Team**:
   - Target: SwipeSavvy
   - General tab
   - Team: Select your Apple Developer team
   - Bundle ID: com.swipesavvy.mobileapp

3. **Configure Signing Certificate**:
   - Signing Certificate: Apple Distribution
   - Provisioning Profile: App Store

4. **Verify Code Signing Settings**:
   - Build Settings tab
   - Search: "Code Signing"
   - Check all provisioning profile settings

#### Step 4: Build the App for Production

**Using EAS (Recommended - Faster)**:

```bash
# Build for iOS App Store
eas build --platform ios

# Follow the prompts:
# 1. Choose "production" build profile
# 2. Let EAS handle code signing
# 3. Build will be uploaded to App Store Connect
# 4. Check status: eas build:list
```

**Using Local Build (Alternative)**:

```bash
# Build locally with Xcode
cd ios
xcodebuild -workspace SwipeSavvy.xcworkspace \
  -scheme SwipeSavvy \
  -configuration Release \
  -derivedDataPath build \
  -archivePath "build/SwipeSavvy.xcarchive" \
  archive

# This creates an .xcarchive file ready for submission
```

#### Step 5: Archive and Prepare for Submission

If using local build, you'll need to archive:

```bash
# Export archive to .ipa file
xcodebuild -exportArchive \
  -archivePath "build/SwipeSavvy.xcarchive" \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa

# This creates: build/ipa/SwipeSavvy.ipa
```

### 1.5 App Store Connect Setup

#### Step 1: Create App in App Store Connect

1. Go to: https://appstoreconnect.apple.com
2. Click "Apps" → "+" → "New App"
3. Fill in:
   - **Platforms**: iOS
   - **App Name**: SwipeSavvy
   - **Bundle ID**: com.swipesavvy.mobileapp
   - **SKU**: com-swipesavvy-1.0.0 (unique identifier)
   - **Full Access**: Select your team
4. Click "Create"

#### Step 2: Configure App Information

1. **App Information Tab**:
   - App Category: Finance
   - Subtitle: Manage your rewards smarter
   - Privacy Policy URL: (required)
   - Support URL: (required)

2. **Pricing and Availability**:
   - Price Tier: Free
   - Availability: Worldwide (or select regions)
   - Release Date: As soon as approved (or future date)

3. **App Icon**:
   - Upload 1024x1024 PNG
   - Location: Assets under App Information

#### Step 3: Configure App Screenshots

1. For each device type:
   - Click "Screenshots" → Select device (e.g., iPhone 6.7")
   - Upload 5-8 screenshots showing:
     - Login screen redesign
     - Rewards dashboard
     - Transaction history
     - Redemption flow
     - Settings
   - Add descriptions for each screenshot

#### Step 4: Configure Version Release

1. Click on "Prepare for Submission" tab
2. **Version Information**:
   - Version Number: 1.0.0
   - Copyright: 2026 SwipeSavvy Inc. (or your company)

3. **Build Information**:
   - Select your build from the list
   - It will appear once uploaded to App Store Connect

4. **Rating**:
   - Complete rating questionnaire:
     - Content rating: None (no violent, adult, or objectionable content)
     - Limit Ad Tracking: Disclose if you collect data

5. **Compliance**:
   - [ ] Export Compliance
   - [ ] Indicate if your app uses encryption
   - Select "No" if not using encryption

### 1.6 Submit to App Store

#### Final Checklist Before Submission

- [ ] All required screenshots uploaded
- [ ] App icon uploaded (1024x1024)
- [ ] Privacy Policy URL valid and accessible
- [ ] Support URL valid and accessible
- [ ] App description and keywords completed
- [ ] Build selected and verified
- [ ] Rating questionnaire completed
- [ ] Compliance information provided
- [ ] Terms and Conditions checked

#### Submission Steps

1. **In App Store Connect**:
   - Go to your app's "Prepare for Submission" tab
   - Verify all information is complete
   - Click "Submit for Review"
   - Confirm the submission

2. **Status Tracking**:
   - App status will be: "Waiting for Review" (1-3 days)
   - Monitor status at: https://appstoreconnect.apple.com
   - You'll receive email notifications of status changes

3. **Possible Outcomes**:
   - ✅ **Approved**: App will be available in 24-48 hours
   - ⚠️ **Rejected**: Review feedback provided, make changes and resubmit
   - ⏸️ **Metadata Rejected**: Only app information needs changes, not the build

#### Review Timeline

```
Typical Flow:
1. Submit → "Waiting for Review" (1-3 days)
2. Review starts → "In Review" (1-2 days)
3. Decision → "Approved" or "Rejected" (email notification)
4. Approved → "Prepare for Release" (you select "Release" date)
5. Released → App available in App Store
```

---

## 🔄 PART 2: GOOGLE PLAY STORE SUBMISSION

### 2.1 Prerequisites Checklist

- [ ] Google Play Developer account ($25 one-time registration)
- [ ] Google account with admin access
- [ ] Mac or Linux for building (or Windows with appropriate setup)
- [ ] Java Development Kit (JDK) 11+ installed
- [ ] Android SDK installed (or via Android Studio)
- [ ] EAS CLI installed globally

### 2.2 App Information for Google Play

```
App Name:              SwipeSavvy
Package Name:          com.swipesavvy.mobileapp
Version Name:          1.0.0
Version Code:          1 (auto-increments)
Minimum API:           21 (Android 5.0)
Target API:            34 (Android 14)
Category:              Finance & Investing
Content Rating:        Unrated or Low Risk
Price:                 Free
Target Countries:      Worldwide
```

### 2.3 Required Assets for Google Play

```
1. App Icon (512x512 PNG)
   - PNG format with transparency
   - Location: ./assets/icon.png (existing file)

2. Feature Graphic (1024x500 PNG)
   - Shows main features/value proposition
   - Required for store listing

3. Screenshots (mobile and tablet)
   - Mobile: 5 screenshots recommended
   - Minimum 320x569 pixels (max 3840x2160)
   - Show login, rewards, transactions
   
4. App Description
   - Full description (4000 characters)
   - Short description (80 characters)

5. Promotional Graphics
   - Promo banner (180x120 minimum)
   - Optional but helps visibility

6. Content Rating Form
   - Questionnaire about app content
   - Required for Play Store

7. Privacy Policy URL
   - Required
```

### 2.4 Step-by-Step Android Build Process

#### Step 1: Generate Keystore (if not already done)

A keystore is needed to sign Android apps for release.

```bash
# Generate a new keystore (one-time only)
keytool -genkey-dname "cn=SwipeSavvy, ou=Mobile, o=SwipeSavvy Inc., c=US" \
  -alias swipesavvy-key \
  -keystore ~/.android/swipesavvy.jks \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10957 \
  -storepass YOUR_KEYSTORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD

# Verify keystore was created
keytool -list -v -keystore ~/.android/swipesavvy.jks -storepass YOUR_KEYSTORE_PASSWORD

# IMPORTANT: Save the keystore file and passwords securely
# You'll need them for all future Android builds
```

**Keystore Details to Save**:
- Keystore Location: `~/.android/swipesavvy.jks`
- Keystore Password: [YOUR_KEYSTORE_PASSWORD]
- Key Alias: `swipesavvy-key`
- Key Password: [YOUR_KEY_PASSWORD]

#### Step 2: Configure Gradle Signing

Update the EAS build configuration to use the keystore:

```bash
# First, set environment variables for the build
export ANDROID_KEYSTORE_PASSWORD="YOUR_KEYSTORE_PASSWORD"
export ANDROID_KEY_PASSWORD="YOUR_KEY_PASSWORD"
```

Or configure in `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab",
        "gradle": {
          "version": "7.0.0"
        }
      }
    }
  }
}
```

#### Step 3: Prebuild and Build for Android

```bash
cd /Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# If prebuild hasn't been run or needs refresh
npx expo prebuild --clean

# Build for Android using EAS (Recommended)
eas build --platform android

# When prompted:
# - Select "production" build type
# - Choose "aab" (Android App Bundle - required for Play Store)
# - Let EAS handle keystore setup

# Or build locally:
# This creates a signed .aab file
```

#### Step 4: Build Process Details

**What EAS Does**:
```
1. Detects Android build configuration from app.json
2. Pulls Android native directory
3. Runs Gradle build with your signing keystore
4. Creates signed Android App Bundle (.aab)
5. Uploads to your EAS account
6. Provides download link
```

**EAS Build Status**:
```bash
# Check build status
eas build:list --platform android

# Monitor specific build
eas build:view [BUILD_ID]

# Download completed build
eas build:download [BUILD_ID]
```

#### Step 5: Verify Android App Bundle

```bash
# The .aab file can be tested with bundletool
bundletool validate --bundle-path=swipesavvy.aab

# To generate APKs for local testing
bundletool build-apks \
  --bundle=swipesavvy.aab \
  --output=swipesavvy.apks \
  --mode=universal
```

### 2.5 Google Play Console Setup

#### Step 1: Create App in Google Play Console

1. Go to: https://play.google.com/console
2. Click "Create app" button
3. Fill in:
   - **App name**: SwipeSavvy
   - **Default language**: English
   - **App type**: Applications
   - **Category**: Finance
   - **Free**: Yes
4. Click "Create"

#### Step 2: Configure App Signing

1. Go to **Setup** → **App signing**
2. Choose signing method:
   - **Google Play App Signing (Recommended)**: Google manages the key
   - **Upload keystore**: You manage the key
3. Upload your keystore if using option 2
4. Follow the configuration steps

#### Step 3: Create Signed Release

1. **Go to Releases** → **Production**
2. **Create new release**:
   - Click "Create release"
   - Upload your .aab (Android App Bundle) file
   - Version name: 1.0.0
   - Version code: 1
3. **Release notes**:
   - "Initial release of SwipeSavvy rewards app"
4. **Review**:
   - Verify all information is correct
   - Review compliance items

#### Step 4: Configure Store Listing

1. **Go to Store Listing** (main app page)

2. **App Details**:
   - **Title**: SwipeSavvy (max 50 characters)
   - **Short description**: Manage your rewards smarter (max 80 chars)
   - **Full description**: 4000 character limit
     - Highlight: rewards tracking, redemptions, notifications
     - Mention: secure login, biometric support
     - Explain benefits and use cases

3. **Graphics & Images**:
   - **App icon**: Upload 512x512 PNG
   - **Feature graphic**: 1024x500 PNG (banner showing key features)
   - **Screenshots**:
     - Mobile (at least 2, recommended 5)
     - Minimum size: 320x569 pixels
     - Show: Login screen, rewards dashboard, transactions, redemption
   - **Promo graphic**: 180x120 PNG (optional)

4. **Category & Content Rating**:
   - **App category**: Finance & Investing
   - **Content rating**: Complete questionnaire
     - Violence: No
     - Adult content: No
     - Ads: Disclose if applicable

5. **Contact Details**:
   - **Developer name**: SwipeSavvy Inc.
   - **Developer email**: support@swipesavvy.com
   - **Website**: https://swipesavvy.com
   - **Privacy policy**: https://swipesavvy.com/privacy
   - **Support email**: support@swipesavvy.com
   - **Support website**: https://support.swipesavvy.com

6. **Pricing & Distribution**:
   - **Price**: Free
   - **Countries**: Worldwide (or select specific countries)
   - **Device types**: Select compatible devices
     - Phones: Yes
     - Tablets: Yes
     - Wearables: No (unless applicable)

#### Step 5: Handle Questionnaires

1. **Data Safety Form**:
   - Describe what data your app collects
   - How it's used and secured
   - Whether it's shared with third parties
   - Location, authentication, payment method, etc.

2. **Alcohol, Gambling, Ads**:
   - Confirm if app contains these
   - SwipeSavvy: No for all

3. **Compliance**:
   - GDPR, COPPA, other regulations
   - Confirm compliance status

### 2.6 Submit to Google Play

#### Final Checklist Before Submission

- [ ] App icon uploaded (512x512 PNG)
- [ ] Feature graphic uploaded (1024x500)
- [ ] 5+ screenshots uploaded (mobile)
- [ ] App description and short description completed
- [ ] Keywords/Tags entered
- [ ] Category selected (Finance & Investing)
- [ ] Content rating completed
- [ ] Developer contact info provided
- [ ] Privacy policy URL valid
- [ ] Support email/website provided
- [ ] Pricing set to Free
- [ ] Android App Bundle uploaded (.aab file)
- [ ] All questionnaires completed
- [ ] Release notes entered

#### Submission Steps

1. **In Google Play Console**:
   - **Releases** → **Production** → **Create release**
   - Verify build (.aab file) is uploaded
   - Enter release notes
   - Review all compliance items

2. **Store Listing**:
   - Verify all store information is complete
   - Check graphics and screenshots
   - Confirm content rating

3. **Submit for Review**:
   - Click "Review" button
   - Final confirmation dialog
   - Click "Submit release"

4. **Status Tracking**:
   - Status becomes "In review" (typically 2-5 hours)
   - You'll receive email notifications
   - Check console for review status

#### Review Timeline

```
Typical Flow:
1. Submit → "In review" (2-5 hours typically)
2. Automated & manual review
3. Decision → "Approved" or "Rejected"
4. If approved → "Scheduled release" or "Live"
5. Live → Available in Google Play Store
```

#### Common Rejection Reasons & Fixes

| Issue | Solution |
|-------|----------|
| Crash on launch | Ensure app runs without errors on test device |
| Missing permissions | Declare all permissions in AndroidManifest |
| Unclear purpose | Update description to explain app clearly |
| Permission overreach | Only request necessary permissions |
| Broken links | Verify privacy policy and support URLs work |
| Missing icon | Ensure 512x512 PNG icon is uploaded |
| Screenshots too small | Use minimum 320x569 for mobile |

---

## 📱 Build & Submission Summary

### Build Process Comparison

| Step | iOS (App Store) | Android (Google Play) |
|------|-----------------|----------------------|
| **Prebuild** | `npx expo prebuild --clean` | `npx expo prebuild --clean` |
| **Keystore** | Handled by Apple | Generate with keytool (one-time) |
| **Build** | EAS or Xcode | EAS (recommended) or Gradle |
| **Build Type** | IPA + Archive | AAB (Android App Bundle) |
| **Signing** | Distribution Certificate | Keystore (RSA 4096) |
| **Size** | ~50-150 MB | ~20-50 MB |
| **Upload Time** | 5-15 minutes | 5-15 minutes |
| **Review Time** | 1-3 days typically | 2-5 hours typically |

### Build Commands Quick Reference

```bash
# Navigate to project
cd /Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Prebuild (one-time or when config changes)
npx expo prebuild --clean

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all

# Check build status
eas build:list

# Download build
eas build:download [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

---

## ✅ Pre-Submission Verification

### Code Quality Checks

```bash
# Lint check
npm run lint

# Build verification (local test)
npx expo run:ios --device simulator
npx expo run:android --device emulator
```

### Device Testing Checklist

- [ ] **iOS Simulator**: Login screen displays correctly
- [ ] **Android Emulator**: Login screen displays correctly
- [ ] **No splash screens**: App loads directly to login
- [ ] **Keyboard**: Properly hides/shows with input fields
- [ ] **Orientation**: Works in portrait mode
- [ ] **Icons**: All input icons display correctly
- [ ] **Buttons**: All buttons are responsive
- [ ] **Navigation**: Sign-up and forgot password work
- [ ] **Error handling**: Error messages display properly
- [ ] **No crashes**: App runs without errors
- [ ] **No console warnings**: Check debug output

### Final Version Check

```bash
# Verify version in app.json
grep -A2 '"version"' app.json

# Verify bundle ID in app.json
grep -A2 '"bundleIdentifier"' app.json
grep -A2 '"package"' app.json

# Verify no splash screens in app.json
grep -i "splash" app.json
# Should return empty - no splash configurations
```

---

## 🚀 Post-Submission Monitoring

### App Store (iOS)

1. **Monitor Status**:
   - https://appstoreconnect.apple.com
   - Check "Prepare for Submission" tab
   - Status updates via email

2. **If Rejected**:
   - Read rejection reason carefully
   - Update rejected item
   - Click "Resubmit" with updated build/info
   - No need to rebuild if only info was rejected

3. **After Approval**:
   - App status changes to "Ready for Sale"
   - Configure release date
   - Click "Release This Version"
   - App available in 24-48 hours

### Google Play

1. **Monitor Status**:
   - https://play.google.com/console
   - Check "Releases" section
   - Status updates via email

2. **If Rejected**:
   - Review rejection email
   - Fix issue (usually questionnaire or permissions)
   - Resubmit release or updated build

3. **After Approval**:
   - Status becomes "Released"
   - Available in Google Play Store immediately
   - May take 2-3 hours for initial indexing

---

## 📞 Support & Troubleshooting

### Common Issues & Solutions

**Issue**: "Build failed with code signing error"
```
Solution: 
- Ensure Apple Developer account is active
- Check certificate is valid (not expired)
- Run: npx expo doctor --fix-dependencies
- Try: eas build --clean-cache
```

**Issue**: "Splash screen still appears"
```
Solution:
- Verify app.json has no splash configuration
- Check: npm run lint
- Clean: npx expo prebuild --clean
- Rebuild: eas build --clean-cache
```

**Issue**: "App crashes on login screen"
```
Solution:
- Check console for error messages
- Verify API endpoints in .env files
- Test with: npx expo run:ios --device simulator
- Check network requests in browser DevTools
```

**Issue**: "Google Play submission rejected for permissions"
```
Solution:
- Review app.json android.permissions
- Only include necessary permissions
- Explain why each permission is needed
- Update privacy policy to document data usage
```

**Issue**: "App Store rejection for missing privacy policy"
```
Solution:
- Ensure privacy policy URL is valid
- HTTPS required (not HTTP)
- URL must be publicly accessible
- Add privacy policy URL to app.json infoPlist
```

---

## 📋 Version & Release Management

### For Future Updates

When releasing version 1.0.1 or later:

```bash
# Update version in app.json
{
  "expo": {
    "version": "1.0.1",  // Changed from 1.0.0
    ...
  }
}

# Prebuild (if native code changed)
npx expo prebuild --clean

# Build for both platforms
eas build --platform all

# Submit new builds to stores with updated info/release notes
```

### Version Numbering Scheme

```
Format: MAJOR.MINOR.PATCH

1.0.0 = Initial release
1.0.1 = Bug fixes, minor updates
1.1.0 = New features
2.0.0 = Major overhaul
```

---

## ✨ Congratulations!

You're now ready to submit SwipeSavvy to both app stores. Follow these steps:

1. ✅ **Login Redesign**: Complete
2. ✅ **Splash Removal**: Complete
3. 🚀 **iOS Build**: Follow Part 1 steps
4. 🚀 **Android Build**: Follow Part 2 steps
5. 🎉 **Launch**: Apps available worldwide!

**Timeline**: Plan for 1-3 weeks from submission to availability on both stores.

**Need Help?**
- Apple Support: https://developer.apple.com/contact
- Google Play Support: https://support.google.com/googleplay
- EAS Documentation: https://docs.expo.dev/eas
