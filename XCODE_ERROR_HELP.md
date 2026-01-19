# Xcode Build Failed - How to Find the Error

## 🔍 Find the Error Message

### Method 1: Issue Navigator
1. In Xcode, look at the **left sidebar**
2. Click the **⚠️ icon** (Issue Navigator) at the top
3. You'll see a list of errors
4. Click on any red error to see details

### Method 2: Build Log
1. Click **View** menu → **Navigators** → **Show Report Navigator**
2. Click the most recent build (at the top)
3. Look for red ❌ errors
4. Click to expand and see full error message

### Method 3: Bottom Panel
1. Look at the **bottom of Xcode window**
2. If there's an error bar, click it
3. Full error details will appear

---

## 🆘 Common Errors & Quick Fixes

### Error: "Signing for SwipeSavvy requires a development team"

**Fix**:
1. Click blue **"SwipeSavvy"** icon in left sidebar
2. Select **"SwipeSavvy"** target
3. Click **"Signing & Capabilities"** tab
4. ✅ Check **"Automatically manage signing"**
5. Select your **Apple ID** from Team dropdown
6. Try build again (⌘R)

---

### Error: "Command PhaseScriptExecution failed"

**Fix**:
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
export LANG=en_US.UTF-8
cd ios
pod install
cd ..
```

Then retry in Xcode.

---

### Error: "No such module 'ExpoModulesCore'" or similar

**Fix**:
1. Close Xcode
2. Run in terminal:
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
export LANG=en_US.UTF-8
cd ios && pod install && cd ..
open ios/SwipeSavvy.xcworkspace
```

3. In Xcode: Product → Clean Build Folder (⇧⌘K)
4. Try build again (⌘R)

---

### Error: "Build input file cannot be found"

**Fix**:
1. Product → Clean Build Folder (⇧⌘K)
2. Close Xcode
3. Delete derived data:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```
4. Reopen Xcode
5. Try build again

---

### Error: Compilation errors (Swift/Objective-C)

**Share the specific error** - I can help fix it!

---

## 🔄 Nuclear Option (Reset Everything)

If nothing works:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ios/build
rm -rf ios/Pods
rm -rf node_modules
rm -rf .expo

# Reinstall
npm install --legacy-peer-deps
npx expo prebuild --clean

# Install pods
export LANG=en_US.UTF-8
cd ios && pod install && cd ..

# Open Xcode
open ios/SwipeSavvy.xcworkspace

# In Xcode:
# 1. Product → Clean Build Folder
# 2. Product → Run
```

---

## 📋 What to Tell Me

To help you fix the error, please share:

1. **Error message** - The red text from Issue Navigator
2. **Which file** - What file is mentioned in the error?
3. **Build phase** - When does it fail? (Compiling? Linking? Script phase?)

Example:
```
❌ Error: Command CodeSign failed with nonzero exit code
File: SwipeSavvy.app
Phase: Code signing
```

---

## 🎯 Quick Diagnostic

Run this to check your setup:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Check if workspace exists
ls -la ios/SwipeSavvy.xcworkspace

# Check if pods are installed
ls -la ios/Pods

# Check Xcode version
xcodebuild -version

# Check available simulators
xcrun simctl list devices
```

Share the output if you need help!

---

## Summary

**To fix your build error**:

1. **Find the error**: Click ⚠️ in Xcode sidebar
2. **Read the message**: What does it say?
3. **Try the fix** from the list above
4. **If still stuck**: Share the error message with me

I'm here to help! 🚀
