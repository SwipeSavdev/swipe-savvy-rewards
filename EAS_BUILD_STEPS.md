# EAS Cloud Build - Step by Step Guide

**Status**: Ready to build, requires one interactive command first

---

## Quick Start (Copy & Paste)

Open your terminal and run these commands:

```bash
# Navigate to project
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Step 1: Initialize EAS project (one-time, interactive)
npx eas init

# When prompted "Would you like to create a project for @austin.smith10/swipesavvy-mobile-app?"
# Press: y [ENTER]

# Step 2: Build development version for iOS
npx eas build --profile development --platform ios

# Step 3: Wait for build to complete (check status on web dashboard)
```

---

## Detailed Steps

### Step 1: Initialize EAS Project

```bash
npx eas init
```

**What this does**:
- Creates a project on Expo servers
- Generates a unique project ID
- Adds the ID to your [app.json](app.json:3)
- Links local code to cloud project

**Expected output**:
```
✔ Would you like to create a project for @austin.smith10/swipesavvy-mobile-app? … yes
✔ Created project @austin.smith10/swipesavvy-mobile-app
✔ Linked local project to EAS project
```

**Time**: ~10 seconds

---

### Step 2: Start the Build

```bash
npx eas build --profile development --platform ios
```

**What this does**:
1. Uploads your code to Expo servers
2. Installs dependencies in cloud
3. Runs `expo prebuild` in cloud
4. Compiles native iOS app
5. Creates downloadable .app file

**Expected prompts**:
```
? Generate a new Apple Distribution Certificate? › Yes
? Generate a new Apple Provisioning Profile? › Yes
```

**Build time**: 10-20 minutes

**Expected output**:
```
✔ Build completed!
🎉 Build artifact: https://expo.dev/accounts/austin.smith10/projects/swipesavvy-mobile-app/builds/...

Download: npx expo install:ios
View online: https://expo.dev/...
```

---

### Step 3: Install on Simulator

Once build completes:

```bash
# Option 1: Auto-install (recommended)
npx expo install:ios

# Option 2: Manual download
# 1. Click the build URL from Step 2
# 2. Download the .app file
# 3. Drag to iOS Simulator
```

---

### Step 4: Run Development Server

```bash
# Start the dev server
npx expo start --dev-client

# The app will auto-connect when you launch it
```

**Expected**:
- App opens directly to login (no splash delay!)
- Connected to dev server
- Hot reload enabled

---

## What You'll See

### 1. During Build

On the web dashboard (link shown in terminal):
- ✅ Queue position
- ✅ Build progress (Installing dependencies → Building → Uploading)
- ✅ Build logs
- ✅ Success/failure status

### 2. After Build

```bash
Build completed!

Download URL: https://expo.dev/accounts/austin.smith10/...
Artifact: swipesavvy-mobile-app-dev.app

To install on simulator:
  npx expo install:ios
```

### 3. Running the App

```
Metro waiting on exp://192.168.1.x:8081
› Press i │ open iOS simulator
› Press r │ reload app
› Press m │ toggle menu
```

---

## Build Profiles Explained

### Development (Current)
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "simulator": true
  }
}
```

**Purpose**: Testing with hot reload
**Output**: Simulator-compatible .app
**Features**: Debug mode, dev menu, connects to Metro

### Preview
```json
{
  "distribution": "internal",
  "ios": {
    "simulator": false
  }
}
```

**Purpose**: Internal testing on real devices
**Output**: TestFlight-ready .ipa
**Features**: Optimized but still testable

### Production
```json
{
  "ios": {
    "simulator": false
  }
}
```

**Purpose**: App Store release
**Output**: Production .ipa
**Features**: Fully optimized, minified

---

## Build Commands Reference

```bash
# Development build (simulator)
npx eas build --profile development --platform ios

# Preview build (TestFlight)
npx eas build --profile preview --platform ios

# Production build (App Store)
npx eas build --profile production --platform ios

# Build for both platforms
npx eas build --profile development --platform all

# Check build status
npx eas build:list

# View specific build
npx eas build:view [BUILD_ID]
```

---

## After Successful Build

### Test Splash Screen Fix

1. Launch app on simulator
2. **Verify**: App opens directly to login
3. **Verify**: No 3.5-second delay
4. Test email verification flow

### Test Backend Connection

1. Sign up with new email
2. Check backend logs:
   ```bash
   curl http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com/health
   ```
3. Verify email arrives
4. Complete authentication

### Development Workflow

1. Make code changes
2. Save file
3. App auto-reloads
4. Test immediately
5. Repeat!

---

## Troubleshooting

### Error: "EAS project not configured"
**Solution**: Run `npx eas init` first

### Error: "No credentials found"
**Solution**: Let EAS generate credentials when prompted

### Error: "Build failed"
**Solution**: Check build logs on dashboard, look for specific error

### Build stuck in queue
**Solution**: Free tier has limited workers, may need to wait or upgrade

### Can't install on simulator
**Solution**:
```bash
# Try explicit simulator name
npx expo install:ios --simulator="iPhone 15 Pro"

# Or drag .app file directly to open simulator
```

---

## Cost & Credits

### Free Tier
- Limited builds per month
- Slower build queue
- All features available

### Paid Plans
- More builds
- Priority queue
- Team features
- Starting at $29/month

**Current usage**: Check at https://expo.dev/accounts/austin.smith10

---

## Alternative: Build Locally

If you prefer not to use cloud builds:

```bash
# Faster, free, unlimited
export LANG=en_US.UTF-8
npx expo run:ios

# Builds on your machine
# No cloud needed
# Instant iteration
```

**Trade-offs**:
- Requires Xcode installed
- Uses local machine resources
- Can't build from Windows/Linux

---

## Next Steps After This Guide

1. **Run `npx eas init`** (one-time setup)
2. **Run `npx eas build --profile development --platform ios`**
3. **Wait for build** (check web dashboard)
4. **Install on simulator**: `npx expo install:ios`
5. **Start dev server**: `npx expo start --dev-client`
6. **Test the app!**

---

## Summary

**What's needed from you**:
1. Run `npx eas init` in terminal (answer "yes" to prompt)
2. Run `npx eas build --profile development --platform ios`
3. Wait for cloud build to complete
4. Install and test

**What happens automatically**:
- ✅ Code uploaded to cloud
- ✅ Dependencies installed
- ✅ Native project generated
- ✅ iOS app compiled
- ✅ Downloadable build created

**Result**:
- ✅ iOS app with splash screen fix
- ✅ Connects to AWS backend
- ✅ Email verification working
- ✅ Development build with hot reload

**Time**: ~15-20 minutes total

Ready to start? Open your terminal and run the commands above! 🚀
