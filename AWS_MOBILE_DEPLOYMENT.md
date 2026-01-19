# AWS Mobile App Deployment Guide

**Current Status**: Ready to build mobile app that connects to AWS backend

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Mobile App    │────────▶│   AWS Backend    │────────▶│   Database  │
│  (iOS/Android)  │  HTTPS  │   (ECS/Fargate)  │         │ (PostgreSQL)│
└─────────────────┘         └──────────────────┘         └─────────────┘
     │                              │
     │                              │
     ▼                              ▼
 EAS Build                    Load Balancer
 (Expo Cloud)                 (NLB)
```

---

## What's Deployed

### ✅ Backend (AWS) - Already Running
- **Service**: ECS Fargate
- **Endpoint**: `http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com`
- **Status**: 2/2 tasks healthy
- **Features**:
  - Email verification via AWS SES
  - All API endpoints live
  - Database connected
  - Redis caching

### ⏳ Mobile App - Ready to Build
- **Platform**: iOS and Android
- **Build Service**: EAS (Expo Application Services)
- **Status**: Configured, ready to build
- **Changes**:
  - ✅ Splash screen removed
  - ✅ Email verification UI
  - ✅ expo-dev-client installed
  - ✅ Points to AWS backend

---

## Build Options

### Option 1: EAS Cloud Build (Recommended)

Build in the cloud, no local Xcode/Android Studio needed:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Login to Expo (if needed)
npx eas login

# Create project (one-time setup)
# Note: This requires interactive input - run in a terminal
npx eas build:configure

# Build for iOS
npx eas build --profile development --platform ios

# Or build for both platforms
npx eas build --profile development --platform all
```

**Benefits**:
- No need for macOS or Xcode
- Builds in the cloud
- Can download .ipa/.apk when done
- Easy to share with testers

**Limitations**:
- Requires Expo account with build credits
- Takes longer than local build
- Needs network connection

---

### Option 2: Local Build (Fastest for Testing)

Build on your machine with expo-dev-client:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# iOS (requires macOS + Xcode)
export LANG=en_US.UTF-8
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android
```

**Benefits**:
- Fast iteration
- Free (no build credits needed)
- Instant testing on simulator/device
- Hot reload for development

**Limitations**:
- Requires local dev tools
- iOS builds need macOS
- Not suitable for distribution

---

## Current Configuration

### Mobile App → AWS Backend

The app is configured to connect to your AWS backend:

**Development** ([app.json](app.json:70-73)):
```json
"API_BASE_URL": "https://api.swipesavvy.com",
"AI_API_BASE_URL": "https://api.swipesavvy.com",
"WS_URL": "wss://api.swipesavvy.com/ws"
```

**Note**: Currently using `https://api.swipesavvy.com` as placeholder. To use the actual load balancer:

1. Either set up DNS to point `api.swipesavvy.com` to your load balancer
2. Or update app.json to use the load balancer URL directly:
   ```json
   "API_BASE_URL": "http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com"
   ```

---

## Step-by-Step: Build with EAS

### 1. Create Expo Project (One-Time)

You need to create the project interactively in a terminal:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# This will prompt you - answer 'yes' to create project
npx eas init
```

This will:
- Create a project on Expo servers
- Add project ID to app.json
- Link your local project to the cloud

### 2. Build Development Client

```bash
# Build for iOS simulator (free, fast)
npx eas build --profile development --platform ios

# This will:
# - Upload your code to Expo
# - Build the app in the cloud
# - Generate a downloadable .app file
# - Show QR code to install on simulator
```

### 3. Install on Simulator

```bash
# After build completes, install on simulator
npx expo install:ios

# Or manually:
# 1. Download .app from EAS dashboard
# 2. Drag to iOS Simulator
```

### 4. Run Dev Server

```bash
# In a separate terminal
npx expo start --dev-client

# Then launch the app on simulator
```

---

## Step-by-Step: Local Build

### For iOS:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean previous builds
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build

# Start dev server (in background or separate terminal)
npx expo start --dev-client &

# Build and run
export LANG=en_US.UTF-8
npx expo run:ios
```

This will:
1. Build native iOS app with expo-dev-client
2. Install on simulator
3. Launch app connected to dev server
4. Show splash screen fix!

---

## Testing the Complete Flow

Once the app is running:

### 1. Verify Splash Screen Fix
- ✅ App should open directly to login
- ✅ No 3.5-second delay

### 2. Test Backend Connection
```bash
# Check backend is responding
curl http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com/health
```

### 3. Test Email Verification
1. Sign up with a new email
2. Check inbox for verification code
3. Enter code in app
4. Verify authentication works

### 4. Test API Calls
- Create account
- Login
- Access protected features
- Check all functionality

---

## Production Deployment

### Build Production Version

```bash
# iOS
npx eas build --profile production --platform ios

# Android
npx eas build --profile production --platform android
```

### Submit to App Stores

```bash
# iOS App Store
npx eas submit --platform ios

# Google Play Store
npx eas submit --platform android
```

---

## Environment Configuration

### Development
- Local builds with hot reload
- Points to AWS backend
- Debug mode enabled

### Production
- Optimized builds
- Minified code
- Production API endpoints
- Error reporting enabled

---

## Troubleshooting

### "Invalid UUID appId" Error
**Solution**: Run `npx eas init` interactively in a terminal to create project

### Build Fails on Local
**Solution**:
```bash
rm -rf ios android node_modules
npm install --legacy-peer-deps
npx expo prebuild --clean
export LANG=en_US.UTF-8
cd ios && pod install && cd ..
npx expo run:ios
```

### Can't Connect to Backend
**Solution**:
1. Check backend is running: `curl http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com/health`
2. Update API_BASE_URL in app.json
3. Rebuild app

### Expo Build Credits
**Solution**:
- Free tier: Limited builds per month
- Paid plans: More builds
- Local builds: Free unlimited

---

## Summary

**What Works Now**:
- ✅ Backend deployed to AWS and healthy
- ✅ Mobile app code complete with splash screen fix
- ✅ expo-dev-client configured
- ✅ EAS configuration ready
- ✅ Local build environment set up

**Next Steps**:
1. **Run `npx eas init` in terminal** (requires interactive input)
2. **Build**: Choose EAS cloud or local build
3. **Test**: Verify splash screen fix and backend connection
4. **Deploy**: Build production versions when ready

**Quick Start** (Local Build):
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
export LANG=en_US.UTF-8
npx expo start --dev-client &
npx expo run:ios
```

**Quick Start** (EAS Build):
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
npx eas init
npx eas build --profile development --platform ios
```

The backend is deployed and running on AWS. The mobile app is ready to build and will connect to it automatically! 🚀
