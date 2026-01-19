# SwipeSavvy App Store Connect Configuration Guide

## Application Details

**Bundle ID**: `com.swipesavvy.mobileapp`
**Team ID**: `CL5DJUWXZY`
**App Name**: SwipeSavvy
**Version**: 1.0.0
**Category**: Finance
**Pricing**: Free
**EAS Project ID**: `fb1e9b41-db33-4225-9fb5-2cd27901b579`

---

## 1. SETUP IN APP STORE CONNECT

### Step 1: Register New App ID
```
Location: Developer.apple.com > Certificates, Identifiers & Profiles > Identifiers
1. Click "+" to create new Identifier
2. Select "App IDs"
3. Enter:
   - Description: "SwipeSavvy"
   - Bundle ID: "com.swipesavvy.mobileapp"
4. Capabilities to enable:
   ✓ Push Notifications
   ✓ Sign in with Apple (recommended)
   ✓ Associated Domains
   ✓ HealthKit (optional)
5. Click Register
```

### Step 2: Create Production Certificate
```
Location: Certificates, Identifiers & Profiles > Certificates
1. Click "+" to create new certificate
2. Select "App Store and Ad Hoc"
3. Upload CSR (Certificate Signing Request)
   - Generate CSR via Keychain Access > Certificate Assistant > Request from CA
   - Leave "CA Email Address" blank
   - Click Continue
4. Download .cer file
5. Double-click to add to Keychain
```

### Step 3: Create Production Provisioning Profile
```
Location: Certificates, Identifiers & Profiles > Provisioning Profiles
1. Click "+" to create new profile
2. Select "App Store"
3. Select App ID: "com.swipesavvy.mobileapp"
4. Select Certificates: (select your production certificate)
5. Profile Name: "SwipeSavvy-AppStore"
6. Download .mobileprovision file
7. Add to Xcode: Drag into Xcode or Settings > Accounts > Download
```

---

## 2. CREATE APP STORE LISTING

### Step 1: Log Into App Store Connect
- Visit: https://appstoreconnect.apple.com
- Sign in with Apple ID
- Click "My Apps"

### Step 2: Create New App
```
1. Click "+" button
2. Select "New App"
3. Fill in:
   - Platform: iOS
   - Name: "SwipeSavvy"
   - Primary Language: English
   - Bundle ID: com.swipesavvy.mobileapp
   - SKU: swipesavvy-mobile-app-v1
   - Availability: Select all countries
4. Click Create
```

### Step 3: Fill App Information

**App Title**
- Title: "SwipeSavvy - Smart Rewards"
- Subtitle: "Earn rewards on every purchase"
- Character limit: 30 characters

**Description**
```
SwipeSavvy transforms how you earn rewards. Link your payment methods, 
shop at partner merchants, and earn points on every purchase. Redeem 
points for exclusive deals, cash back, or donations to charity.

Features:
• Secure card linking with bank-level encryption
• Real-time rewards tracking
• Exclusive partner merchant deals
• Biometric authentication (Face ID/Touch ID)
• Instant point notifications
• Charitable donation options

Start earning smarter today with SwipeSavvy!
```
- Character limit: 4000 characters

**Keywords**
```
rewards, cashback, loyalty, shopping, payments, discounts, offers, deals, earn
```
- Character limit: 100 characters

**Support URL** (required)
```
https://swipesavvy.com/support
```

**Privacy Policy URL** (required)
```
https://swipesavvy.com/privacy
```

**Marketing URL** (optional)
```
https://swipesavvy.com
```

---

## 3. RATING & RESTRICTIONS

### Age Rating Questionnaire
```
Medical/Health Information: No
Alcohol, Tobacco, Drugs: No
Gambling: No
Long-form creative writing: No
Cartoon or fantasy violence: No
Realistic violence: No
Sexual content: No
Profanity: No
Mature themes: No
Unrestricted web access: No
```

### Content Rights
- ✓ I confirm I own the trademark and content
- ✓ This app does not infringe third-party intellectual property
- ✓ I own the rights to all submitted content

---

## 4. APP PREVIEW & SCREENSHOTS

### iPhone 6.7" (Super Retina Max)
**Dimensions**: 1290 x 2796 pixels
**Required**: YES - At least 2 screenshots

Screenshots to create:
1. **Login/Onboarding**: Show SwipeSavvy logo with "Secure Login" text
2. **Card Linking**: Show how to link payment methods
3. **Dashboard**: Show rewards balance and earning progress
4. **Partner Merchants**: Show available deals and discounts
5. **Redeem Rewards**: Show redemption options

### iPhone 5.5" (Retina)
**Dimensions**: 1242 x 2208 pixels
**Required**: YES - At least 2 screenshots

### iPhone 6.1" (Retina)
**Dimensions**: 1170 x 2532 pixels
**Required**: YES - At least 2 screenshots

### iPad Pro 12.9-inch
**Dimensions**: 2048 x 2732 pixels
**Optional**: Recommended for iPad support

### App Preview
- **Format**: .mov (QuickTime) or .mp4
- **Duration**: 15-30 seconds
- **Resolution**: 1920x1080 or higher
- **Content**: Show app workflow (login → link card → earn rewards → redeem)
- **Audio**: Optional but recommended

---

## 5. BUILDS (After Screenshots)

### Version Release
1. Select build in App Store Connect
2. Set release notes: "Initial release: SwipeSavvy rewards platform"
3. Select submission method: Automatic release or Manual

### Testflight
```
Before submitting to App Store:
1. Upload build to TestFlight
2. Add internal testers (your team)
3. Test for minimum 24 hours
4. Verify push notifications work
5. Test all card linking features
6. Confirm payment processing
7. Check crash logs - must be 0
```

---

## 6. REVIEW INFORMATION

### Contact Information
```
Name: [Your Name]
Phone: [Your Phone]
Email: [Your Email]
Address: [Your Address]
```

### App Review Notes
```
This is a financial rewards application that links to payment methods 
and loyalty merchant networks. Users can:

1. Securely link payment cards (bank-level encryption)
2. Earn points on purchases at partner merchants
3. View real-time reward balances
4. Redeem points for cash back or partner offers
5. Receive push notifications for deals

Push notifications are sent via AWS SNS service.
All payment data is encrypted using industry-standard security.
Biometric authentication is supported but not required.

Testing Account: 
- Email: test@swipesavvy.com
- Password: [Standard test password for review]
- Test Card: 4111 1111 1111 1111 (Visa)
- Expiry: 12/25 | CVV: 123

The app requires iOS 14.0 or later.
```

---

## 7. CAPABILITIES CONFIGURATION

### Push Notifications
```
Status: ✓ ENABLED
Environment: Sandbox (APNs) for initial testing
Token: Already configured in AWS SNS
- iOS Platform App ARN: arn:aws:sns:us-east-1:858955002750:app/APNS/swipesavvy-sandbox-ios
```

### Sign In with Apple
```
Status: ✓ ENABLED (Recommended for compliance)
Configuration: In app code via expo-auth-session
```

### Keychain Access
```
Status: ✓ ENABLED
Usage: Secure storage of auth tokens via expo-secure-store
```

### Location Services
```
Status: ✓ ENABLED (for merchant location features)
Privacy Text: "SwipeSavvy uses your location to show nearby partner merchants"
```

### Camera
```
Status: ✓ ENABLED
Privacy Text: "Camera access used to verify identity during account setup"
```

---

## 8. PRIVACY & COMPLIANCE

### Data Collection
Declare in App Store Connect:

```
1. User ID
   - Linked to Device
   - Purpose: Analytics, Product Personalization, App Functionality

2. Purchase History
   - Linked to Device
   - Purpose: Analytics, App Functionality

3. Precise Location
   - Linked to Device  
   - Purpose: App Functionality

4. Coarse Location
   - Linked to Device
   - Purpose: App Functionality

5. User ID for Advertising
   - Linked to Device
   - Purpose: Third-Party Advertising
```

### Privacy Policy
- **URL**: https://swipesavvy.com/privacy
- **Checklist**:
  - ✓ Data we collect
  - ✓ How we use data
  - ✓ Third-party sharing
  - ✓ Security measures
  - ✓ User rights (GDPR/CCPA)
  - ✓ Contact information

---

## 9. SUBMISSION CHECKLIST

Before clicking "Submit for Review":

**General**
- ✓ App name is finalized
- ✓ Bundle ID matches Xcode project
- ✓ Version number matches build (1.0.0)
- ✓ All metadata is accurate
- ✓ Screenshots are optimized

**Build**
- ✓ Build is uploaded and processed
- ✓ Build number incremented
- ✓ Code signing is valid
- ✓ No crash logs in TestFlight

**Content**
- ✓ Description is complete
- ✓ Keywords are relevant
- ✓ Support and privacy URLs are working
- ✓ Screenshots are clear and professional

**Compliance**
- ✓ Age rating questionnaire is completed
- ✓ Content rights are confirmed
- ✓ Encryption declaration (if needed)
- ✓ Health claims (if any) are accurate

**Security**
- ✓ No hardcoded passwords/API keys
- ✓ SSL certificate validation enabled
- ✓ Code signing certificate is valid
- ✓ Provisioning profile is correct

---

## 10. POST-SUBMISSION STEPS

### Monitor Review Status
1. Check daily via App Store Connect
2. Respond to reviewer questions within 24 hours
3. Expected timeline: 24-48 hours

### Handle Rejection (if any)
```
Common reasons:
- Guideline 2.1: Functionality (must work as described)
- Guideline 3.1: Payment (must use In-App Purchase for digital goods)
- Guideline 4.2: Spam (no misleading content)
- Guideline 5.1: Legal (privacy policy, terms of service)

Response: Fix issue and resubmit via "Version Release" > "Resubmit"
```

### Launch Strategy
1. Set automatic release date (recommended: day after approval)
2. Prepare press release
3. Notify beta testers
4. Monitor crash logs daily
5. Be ready to push hotfix if needed

---

## REFERENCE INFORMATION

**Apple Developer Account**
- Team ID: CL5DJUWXZY
- Member: [Your Apple ID]

**AWS SNS Configuration**
- Topic: swipesavvy-sandbox-notifications
- iOS Platform App: arn:aws:sns:us-east-1:858955002750:app/APNS/swipesavvy-sandbox-ios
- Region: us-east-1
- Account: 858955002750

**EAS Configuration**
- Project ID: fb1e9b41-db33-4225-9fb5-2cd27901b579
- Build Command: `eas build --platform ios`
- Archive Command: `eas build --platform ios --build-profile production`

---

## NEXT IMMEDIATE ACTIONS

1. **TODAY**: Generate app screenshots (6-8 per device size)
2. **TODAY**: Create/publish privacy policy at https://swipesavvy.com/privacy
3. **TOMORROW**: Create code signing certificate in Apple Developer
4. **TOMORROW**: Create provisioning profile for App Store
5. **DAY 3**: Upload screenshots to App Store Connect
6. **DAY 3**: Fill in app metadata
7. **DAY 4**: Build for production with EAS
8. **DAY 4**: Upload to TestFlight
9. **DAY 5**: Submit to App Store for review
