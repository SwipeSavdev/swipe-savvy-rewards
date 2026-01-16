# Splash Screen Fix - Complete Guide

## Problem
The 3.5-second splash screen is still showing because the native app bundles need to be rebuilt after configuration changes.

---

## Root Cause

The splash screen delay is caused by:
1. **Native Build Cache**: The iOS/Android native apps were built with the old splash screen configuration
2. **React Native requires rebuild**: Changes to `app.json` splash configuration require a native rebuild
3. **Expo Prebuild**: The native directories need to be regenerated

---

## Solution: Rebuild the Native App

### Option 1: Using Expo (Recommended)

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean the build cache
rm -rf ios android node_modules

# Reinstall dependencies
npm install

# Regenerate native directories with new splash config
npx expo prebuild --clean

# Run on iOS simulator
npx expo run:ios

# OR run on Android emulator
npx expo run:android
```

### Option 2: Using EAS Build (For Production)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Create a development build with new splash config
eas build --profile development --platform ios
eas build --profile development --platform android

# Or create production build
eas build --profile production --platform all
```

### Option 3: Manual Native Rebuild

**iOS:**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## Quick Test Script

Save this as `rebuild-app.sh`:

```bash
#!/bin/bash

echo "🧹 Cleaning build artifacts..."
rm -rf ios/build
rm -rf android/build
rm -rf android/app/build

echo "📦 Installing dependencies..."
npm install

echo "🔨 Rebuilding iOS..."
cd ios && pod install && cd ..

echo "✅ Ready to run!"
echo "Run: npx expo run:ios"
echo "Or:  npx expo run:android"
```

Make it executable:
```bash
chmod +x rebuild-app.sh
./rebuild-app.sh
```

---

## Verification

After rebuilding, the app should:
1. ✅ Show only brief native splash (< 500ms)
2. ✅ Immediately display login screen
3. ✅ NO 3.5-second custom splash screen

---

## Why This Is Necessary

| Change Type | Requires Rebuild? |
|-------------|-------------------|
| JavaScript/TypeScript code | ❌ No (Fast Refresh) |
| `app.json` splash config | ✅ Yes (Native) |
| Native modules | ✅ Yes (Native) |
| Assets (icons, images) | ✅ Yes (Native) |

The changes we made to `App.tsx` and `app.json` affect the **native layer**, so a rebuild is required.

---

## Alternative: Update via OTA (Over-The-Air)

If you're using Expo's OTA updates, publish an update:

```bash
# Publish update to production
eas update --branch production --message "Remove splash screen"

# Publish to development
eas update --branch development --message "Remove splash screen"
```

**Note**: OTA updates can only update JavaScript code, not native configuration. You'll still need to create a new build for app stores.

---

## For App Store/Play Store Release

When ready to release the new version without splash:

1. **Update version in app.json**:
   ```json
   "version": "1.1.0"
   ```

2. **Build for stores**:
   ```bash
   eas build --profile production --platform all
   ```

3. **Submit to stores**:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---

## Troubleshooting

### Still seeing splash screen after rebuild?

**Check 1: Verify you're running the NEW build**
```bash
# Completely uninstall old app
# iOS Simulator: Long press app icon → Delete
# Android Emulator: Settings → Apps → Uninstall

# Reinstall fresh
npx expo run:ios
```

**Check 2: Clear Metro bundler cache**
```bash
npx expo start --clear
```

**Check 3: Verify App.tsx has no splash code**
```bash
grep -r "SplashScreen" src/app/App.tsx
# Should return nothing
```

**Check 4: Check app.json splash config**
```bash
cat app.json | grep -A 5 "splash"
# Should show minimal splash config
```

---

## Current Configuration Status

✅ **Code Changes Applied**:
- [x] Removed `expo-splash-screen` imports from `App.tsx`
- [x] Removed `preventAutoHideAsync()` call
- [x] Removed manual splash hide logic
- [x] Configured `app.json` with minimal splash

❌ **Rebuild Required**:
- [ ] iOS native app needs rebuild
- [ ] Android native app needs rebuild
- [ ] Expo prebuild needs to run

---

## Next Steps

1. **Rebuild the app** using one of the options above
2. **Test on simulator/emulator** to verify no splash delay
3. **Create production build** when ready for release
4. **Submit to app stores** with version 1.1.0

---

## Summary

The splash screen configuration has been fixed in the code, but **you must rebuild the native app** for changes to take effect. Simply restarting the development server or refreshing the JavaScript bundle is not enough.

**Quickest Solution**: Run `npx expo prebuild --clean && npx expo run:ios`
