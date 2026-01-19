# SwipeSavvy App Store Deployment - Complete Checklist

**Project**: SwipeSavvy Mobile App v1.0.0  
**Status**: Ready for Deployment  
**Date**: January 19, 2026  
**Platforms**: iOS (App Store) + Android (Google Play)

---

## ✅ Pre-Deployment Checklist

### Code Quality & Testing
- [ ] Run lint check: `npm run lint`
- [ ] Test on iOS simulator: `npx expo run:ios --device simulator`
- [ ] Test on Android emulator: `npx expo run:android --device emulator`
- [ ] Verify login screen displays correctly (no splash screen)
- [ ] Test password visibility toggle
- [ ] Test error message display
- [ ] Test sign-up button navigation
- [ ] Test forgot password link
- [ ] Verify all icons display
- [ ] Check for console errors/warnings
- [ ] Verify responsive design on different screen sizes

### Configuration Verification
- [ ] Verify version in app.json: `1.0.0`
- [ ] Verify bundle ID (iOS): `com.swipesavvy.mobileapp`
- [ ] Verify package name (Android): `com.swipesavvy.mobileapp`
- [ ] Confirm no splash screen in app.json
- [ ] Verify API endpoints in .env files
- [ ] Check app icon exists: `assets/icon.png` (1024x1024)
- [ ] Confirm all required assets are in place

### Documentation Ready
- [ ] App description written (4000 characters max)
- [ ] Short description written (80 characters max for Play Store)
- [ ] Keywords/tags identified (100 characters max)
- [ ] Privacy policy URL ready and tested
- [ ] Support URL ready and tested
- [ ] Company information prepared

---

## 🍎 iOS App Store Deployment Checklist

### Prerequisites
- [ ] Apple Developer Program membership active ($99/year)
- [ ] Apple ID created with appropriate access level
- [ ] Mac with latest Xcode installed
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Expo CLI installed: `npm install -g expo-cli`
- [ ] Team ID identified: `CL5DJUWXZY`

### Development Certificate & Provisioning
- [ ] Distribution certificate created/renewed in Developer Account
- [ ] App ID registered: `com.swipesavvy.mobileapp`
- [ ] Push Notifications enabled (if using notifications)
- [ ] App Store provisioning profile created
- [ ] Certificate imported to Keychain Access
- [ ] All certs and profiles are valid (not expired)

### Xcode Project Setup
- [ ] Run: `npx expo prebuild --clean`
- [ ] iOS project regenerated successfully
- [ ] `ios/` directory exists and contains:
  - [ ] SwipeSavvy.xcworkspace/
  - [ ] SwipeSavvy.xcodeproj/
  - [ ] Podfile
  - [ ] Pods/

### App Store Connect Configuration
- [ ] Log in to App Store Connect: https://appstoreconnect.apple.com
- [ ] Create app entry:
  - [ ] App name: SwipeSavvy
  - [ ] Bundle ID: com.swipesavvy.mobileapp
  - [ ] SKU: com-swipesavvy-1.0.0
- [ ] Configure app information:
  - [ ] Privacy policy URL (HTTPS, valid)
  - [ ] Support URL (HTTPS, valid)
  - [ ] Marketing URL (optional)
  - [ ] Category: Finance
  - [ ] Content rating: Completed questionnaire
- [ ] Upload app icon (1024x1024 PNG)
- [ ] Add screenshots:
  - [ ] iPhone 6.7" - minimum 5 screenshots
  - [ ] iPhone 6.1" - minimum 5 screenshots
  - [ ] iPhone 5.5" - minimum 5 screenshots
  - [ ] iPad (optional)
- [ ] Add app preview video (optional)
- [ ] Write app description (≤ 4000 characters)
- [ ] Add keywords (≤ 100 characters)
- [ ] Set pricing: Free
- [ ] Configure release version:
  - [ ] Version number: 1.0.0
  - [ ] Copyright: 2026 SwipeSavvy Inc.

### Building for App Store
- [ ] Build iOS app: `./build-ios-production.sh`
- [ ] Wait for EAS build to complete (10-15 minutes)
- [ ] Check build status: `eas build:list --platform ios`
- [ ] Build auto-uploads to App Store Connect
- [ ] Verify build appears in App Store Connect within 5-10 minutes

### Pre-Submission Review
- [ ] Review complete app listing in App Store Connect
- [ ] Check all screenshots are visible and properly ordered
- [ ] Verify app icon displays correctly
- [ ] Confirm pricing and availability settings
- [ ] Review privacy policy content
- [ ] Check support email is responsive
- [ ] Verify no broken URLs

### Submission
- [ ] In App Store Connect, go to "Prepare for Submission"
- [ ] Review all information one final time
- [ ] Select the correct build to submit
- [ ] Check "Submit for Review" button
- [ ] Review submission confirmation
- [ ] Confirm submission (email confirmation will be sent)
- [ ] Status becomes "Waiting for Review"

### Post-Submission Monitoring
- [ ] Monitor email for status updates
- [ ] Check App Store Connect daily for review progress
- [ ] Status timeline: 1-3 days typically
- [ ] Possible outcomes:
  - [ ] ✅ Approved → Click "Release This Version"
  - [ ] ⚠️ Rejected → Review feedback, fix, resubmit
  - [ ] ⏸️ Metadata Rejected → Update info, resubmit (no rebuild needed)

### Release
- [ ] Once approved, status shows "Ready for Sale"
- [ ] Click "Release This Version"
- [ ] Choose release date (immediate or scheduled)
- [ ] Confirm release
- [ ] App appears in App Store within 24-48 hours
- [ ] Announce availability on website/social media

---

## 🤖 Android Google Play Deployment Checklist

### Prerequisites
- [ ] Google Play Developer account ($25 one-time registration)
- [ ] Google account with admin access to Play Console
- [ ] Mac/Linux for building (or Windows with setup)
- [ ] Java Development Kit (JDK) 11+ installed
- [ ] Android SDK available
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Expo CLI installed: `npm install -g expo-cli`

### Android Keystore Setup (One-time)
- [ ] Run: `./setup-android-keystore.sh`
- [ ] Generate keystore at: `~/.android/swipesavvy.jks`
- [ ] Key alias: `swipesavvy-key`
- [ ] Save keystore password securely
- [ ] Save key password securely
- [ ] Save configuration file securely
- [ ] Do NOT commit credentials to git

### Android Project Setup
- [ ] Run: `npx expo prebuild --clean`
- [ ] Android project regenerated successfully
- [ ] `android/` directory exists and contains:
  - [ ] app/
  - [ ] gradle/
  - [ ] build.gradle
  - [ ] settings.gradle
- [ ] Verify build.gradle has correct:
  - [ ] applicationId: com.swipesavvy.mobileapp
  - [ ] versionCode: 1
  - [ ] versionName: 1.0.0
  - [ ] targetSdkVersion: 34
  - [ ] minSdkVersion: 21

### Google Play Console Configuration
- [ ] Log in: https://play.google.com/console
- [ ] Create app:
  - [ ] App name: SwipeSavvy
  - [ ] Category: Finance & Investing
  - [ ] Free app
- [ ] Create store listing:
  - [ ] Title: SwipeSavvy (≤ 50 characters)
  - [ ] Short description: Manage your rewards smarter (≤ 80 characters)
  - [ ] Full description: 4000 characters max
  - [ ] Upload app icon (512x512 PNG)
  - [ ] Upload feature graphic (1024x500 PNG)
  - [ ] Upload screenshots (min 2, recommended 5):
    - [ ] Minimum size: 320x569 pixels
    - [ ] Show login, rewards, transactions
  - [ ] Upload promo graphic (optional)
  - [ ] Add keywords/tags
- [ ] Configure content rating:
  - [ ] Complete questionnaire
  - [ ] Select content rating category
- [ ] Configure data safety:
  - [ ] List all data collected
  - [ ] Explain how data is used
  - [ ] Confirm security measures
  - [ ] Declare if data is shared
- [ ] Provide contact information:
  - [ ] Developer name
  - [ ] Developer email
  - [ ] Support email
  - [ ] Support website
  - [ ] Privacy policy URL (HTTPS, valid)
  - [ ] Website URL
  - [ ] Developer account deleted policy (if applicable)

### Building for Google Play
- [ ] Build Android app: `./build-android-production.sh`
- [ ] Build type: Android App Bundle (.aab)
- [ ] Wait for EAS build to complete (10-15 minutes)
- [ ] Check build status: `eas build:list --platform android`
- [ ] Download the .aab file for testing or direct submission
- [ ] Verify file size is reasonable (20-50 MB typical)

### Pre-Submission Review (Google Play)
- [ ] Review complete store listing
- [ ] Verify all screenshots are correct
- [ ] Check app icon displays properly
- [ ] Confirm all links work (privacy policy, support, etc.)
- [ ] Test on emulator/device if possible
- [ ] Verify no broken content or broken links
- [ ] Check rating questionnaire completeness

### Create Release
- [ ] In Play Console, go to "Releases" → "Production"
- [ ] Click "Create new release"
- [ ] Upload .aab file
- [ ] Verify upload is successful
- [ ] Fill in release notes: "Initial release of SwipeSavvy rewards app"
- [ ] Version name: 1.0.0 (auto-detected from build)
- [ ] Version code: 1 (auto-detected from build)
- [ ] Review all compliance items:
  - [ ] Ads questionnaire: (if applicable)
  - [ ] Alcohol/Gambling: Confirm
  - [ ] GDPR/Privacy: Confirm
  - [ ] Ads SDKs: List if used
  - [ ] Sensitive info: Confirm handling

### Submission
- [ ] Review entire release configuration
- [ ] Click "Review" button
- [ ] Final review of all information
- [ ] Click "Submit release"
- [ ] Status becomes "In review" (typically 2-5 hours)
- [ ] Email confirmation sent

### Post-Submission Monitoring
- [ ] Monitor email for status updates
- [ ] Check Play Console daily
- [ ] Status timeline: 2-5 hours typically (can be up to 24 hours)
- [ ] Possible outcomes:
  - [ ] ✅ Approved → Auto-released or scheduled release
  - [ ] ⚠️ Rejected → Review feedback, fix issues, resubmit
  - [ ] ⏸️ Issues → Address before approval

### Release & Monitoring
- [ ] Once approved, status shows "Approved"
- [ ] App is released or scheduled based on your settings
- [ ] Typically available within 1-2 hours of approval
- [ ] Appears in Google Play Store
- [ ] Announce availability on website/social media
- [ ] Monitor user reviews and ratings

---

## 📊 Side-by-Side Comparison

| Activity | iOS | Android |
|----------|-----|---------|
| **Account Setup** | Developer ($99/yr) | Developer ($25 one-time) |
| **Project Prep** | `npx expo prebuild --clean` | `npx expo prebuild --clean` |
| **Keystore/Cert** | Handled by Apple | Generate with keytool |
| **Build Command** | `./build-ios-production.sh` | `./build-android-production.sh` |
| **Build Format** | IPA + Archive | AAB (App Bundle) |
| **Build Time** | 10-15 minutes | 10-15 minutes |
| **Upload Time** | 5-10 minutes | 5-10 minutes |
| **Review Time** | 1-3 days | 2-5 hours |
| **Screenshots** | 5+ per device type | 5+ mobile shots |
| **Review Process** | Manual + Automated | Mostly Automated |
| **Status Updates** | Email + Dashboard | Email + Dashboard |
| **Total Timeline** | 1-3 days | 1-2 hours |

---

## 🎯 Success Indicators

### App Launch Success Looks Like:
- ✅ Both apps appear in respective stores (within 24-48 hours of approval)
- ✅ Apps are searchable by name and keywords
- ✅ Correct app icon and screenshots visible
- ✅ Star ratings and reviews appearing
- ✅ Download count increasing
- ✅ No crashes or negative reviews
- ✅ User feedback is positive

### Monitoring After Launch:
- [ ] Check App Store daily for reviews
- [ ] Respond to user feedback/reviews
- [ ] Monitor crash reports (if configured)
- [ ] Track download/installation numbers
- [ ] Monitor user engagement metrics
- [ ] Plan for next version/updates

---

## 🆘 Common Issues & Solutions

### iOS Issues

| Issue | Solution |
|-------|----------|
| Splash screen appears | Verify app.json has no splash config; run `npx expo prebuild --clean` |
| Build fails with code signing | Check Apple Developer cert is valid; run `eas build --clean-cache` |
| App crashes on launch | Check console logs; verify API endpoints; test on simulator |
| Rejected for privacy policy | Update privacy policy URL in app.json; ensure HTTPS and valid |
| Screenshots not visible | Ensure PNG format, correct dimensions (various device sizes) |
| Metadata rejected | Fix app description/keywords/pricing and resubmit (no rebuild) |

### Android Issues

| Issue | Solution |
|-------|----------|
| Keystore not found | Run `./setup-android-keystore.sh` to generate |
| Build fails with keystore error | Verify keystore path and passwords are correct |
| APK too large | AAB format is more efficient; ensure unused assets are removed |
| Store listing rejected | Review Google Play policies; update description/ratings if needed |
| Screenshots incorrect size | Min 320x569; max 3840x2160; check aspect ratio |
| Data safety form incomplete | Fill out all fields about data collection and usage |

---

## 📱 Quick Emergency Reference

**If build fails:**
```bash
npm run lint           # Check for code errors
npm install            # Update dependencies
npx expo prebuild --clean  # Regenerate native code
eas build --clean-cache    # Clear EAS cache
```

**If stuck on approval:**
- iOS: Contact Apple Developer Support
- Android: Check Play Console "Help" section
- EAS: Check build logs: `eas build:view [BUILD_ID]`

**If need to resubmit:**
- iOS: Click "Resubmit" in App Store Connect
- Android: Create new release with updated build or info

---

## 📞 Support Resources

**Apple Support**
- Developer Portal: https://developer.apple.com/account
- App Store Connect: https://appstoreconnect.apple.com
- Contact: https://developer.apple.com/contact

**Google Support**
- Play Console: https://play.google.com/console
- Policies: https://play.google.com/about/developer-content-policy/
- Support: https://support.google.com/googleplay

**EAS Documentation**
- Home: https://docs.expo.dev/eas
- Building: https://docs.expo.dev/eas-update/introduction/

---

## ✨ Final Notes

1. **Take Your Time**: Don't rush the process. Review everything carefully.
2. **Keep Records**: Save build IDs, approval emails, and release dates.
3. **Plan for Iterations**: Your first version may have feedback. Plan updates.
4. **Monitor Feedback**: Users will provide valuable feedback in reviews.
5. **Celebrate**: You've built and deployed a production mobile app! 🎉

---

**Status**: ✅ Ready to Deploy  
**Next Step**: Start with iOS or Android checklist above  
**Questions**: Refer to detailed guide: `COMPLETE_APP_STORE_DEPLOYMENT.md`

Good luck with your launch! 🚀
