# 🔧 Fix "Command PhaseScriptExecution failed" Error

**Error**: Command PhaseScriptExecution failed with a nonzero exit code

**Cause**: This is a common React Native/Expo build error, usually caused by:
1. Building for physical device instead of simulator
2. Incorrect Node.js path
3. Bundler script issues
4. Stale derived data

---

## 🎯 Solution: Quick Fix

### Step 1: Make Sure You Selected a SIMULATOR

**This is the most common cause!**

**In Xcode:**

1. Look at the **device selector** next to "SwipeSavvy" in the toolbar (top left area)
2. **Does it say "Any iOS Device" or show a physical device?**
   - ❌ **Wrong!** This causes the error
3. **Click the device selector dropdown**
4. **Select a SIMULATOR** from the list:
   - ✅ "iPhone 15 Pro"
   - ✅ "iPhone 15"
   - ✅ "iPhone 14 Pro"
   - ✅ Any device with the **💻 simulator icon** next to it

**Important**: Make sure you see the simulator icon (💻), not a phone icon (📱)

---

### Step 2: Clean Build Folder

**In Xcode:**

1. **Product → Clean Build Folder**
   - Keyboard: **⇧⌘K** (Shift-Command-K)
2. Wait for it to finish (~5 seconds)

---

### Step 3: Rebuild

**In Xcode:**

1. **Product → Run**
   - Keyboard: **⌘R** (Command-R)
2. Or click the **▶ Play button**

**Build should now succeed!** ✅

---

## 🔄 Alternative: Build from Terminal

If Xcode continues to have issues, build from the command line:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build

# Build for simulator
npx expo run:ios --configuration Debug
```

This will:
- Clean all build artifacts
- Build specifically for simulator
- Launch automatically

---

## 🧹 Nuclear Option: Complete Clean

If the error persists, do a complete clean:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean all build artifacts
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ios/build
rm -rf ios/Pods
rm -rf node_modules/.cache

# Reinstall pods
export LANG=en_US.UTF-8
cd ios && pod install && cd ..

# Reopen Xcode
open ios/SwipeSavvy.xcworkspace
```

Then in Xcode:
1. Select a **simulator** (important!)
2. Product → Clean Build Folder (⇧⌘K)
3. Product → Run (⌘R)

---

## 🔍 What Went Wrong

The error usually happens when:

**Problem**: Xcode is building for a **physical device** (iphoneos)
**Solution**: Select a **simulator** (iphonesimulator)

The build scripts expect different configurations for device vs simulator, and building for device without proper provisioning causes script failures.

---

## ✅ How to Verify You're on Simulator

**In Xcode toolbar:**

Look at the device selector. You should see:
```
✅ "iPhone 15 Pro" (with 💻 icon)
✅ "SwipeSavvy > iPhone 15 Pro"
```

**NOT**:
```
❌ "SwipeSavvy > Any iOS Device (arm64)"
❌ "SwipeSavvy > Jason's iPhone"
```

---

## 📋 Quick Checklist

Before building, verify:

- [ ] **Simulator selected** in device dropdown (💻 icon)
- [ ] **NOT "Any iOS Device"** or physical device
- [ ] **Clean build folder** done (⇧⌘K)
- [ ] **Xcode workspace** open (not .xcodeproj)
- [ ] **Team selected** in Signing & Capabilities

Then build: **⌘R**

---

## 🆘 Still Getting Errors?

### Check the Specific Script That Failed:

**In Xcode:**

1. Click the **⚠️ icon** (Issue Navigator) in left sidebar
2. Look for the error - it should say which script phase failed:
   - "Bundle React Native code and images"
   - "Start Packager"
   - "[CP-User] Generate Specs"
   - etc.

### Common Script Failures:

#### "Bundle React Native code and images" fails:

**Fix**:
```bash
# Make sure metro bundler isn't running
killall node
# Clean and rebuild
```

#### "[CP-User] Generate Specs" fails:

**Fix**:
```bash
cd ios
pod install
cd ..
```

#### "Start Packager" fails:

**Fix**:
```bash
# Reset metro cache
rm -rf node_modules/.cache
npx expo start --clear
```

---

## 💡 Pro Tip: Use Expo CLI

The most reliable way to build is via Expo CLI:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# This handles all the build scripts correctly
npx expo run:ios
```

Expo CLI:
- ✅ Automatically selects simulator
- ✅ Handles bundler correctly
- ✅ Shows better error messages
- ✅ Cleans when needed

---

## 🎯 Summary

**Most Likely Fix:**

1. **Select a SIMULATOR** (not device) in Xcode
2. **Clean Build Folder** (⇧⌘K)
3. **Rebuild** (⌘R)

**If that doesn't work:**

```bash
npx expo run:ios
```

**Result:** Build succeeds, app launches with no splash delay! 🎉

---

## 📝 Current Build Settings

Your project is configured for:
- ✅ Automatic code signing
- ✅ Development team: (needs your Apple ID)
- ✅ Node.js: v24.11.1
- ✅ CocoaPods: 98 dependencies installed

**Just make sure you're building for SIMULATOR!** 💻
