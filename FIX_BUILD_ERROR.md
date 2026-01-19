# Fix: iOS Build Failed - Install Dependencies Error

**Error**: Unknown error during "Install dependencies" phase

**Root Cause**: CocoaPods UTF-8 encoding issue in EAS Build environment

---

## ✅ Solution Applied

I've fixed the configuration to handle this error:

### 1. Updated EAS Configuration

[eas.json](eas.json:10-16) now includes:
```json
{
  "env": {
    "LANG": "en_US.UTF-8",
    "LC_ALL": "en_US.UTF-8"
  },
  "ios": {
    "simulator": true,
    "cocoapods": "1.15.2"
  }
}
```

This sets the correct encoding and uses a stable CocoaPods version.

### 2. Created Build Hook

`.eas/build/pre-install.sh` - Sets environment before build starts

### 3. Created .easignore

Excludes unnecessary files from upload to speed up builds

---

## 🚀 Retry the Build

Now retry the build with the fixes applied:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Build with fixes
npx eas build --profile development --platform ios
```

---

## 🔍 What Changed

### Before:
- CocoaPods ran without UTF-8 encoding set
- Used default (latest) CocoaPods version
- Caused encoding errors during pod install

### After:
- ✅ UTF-8 encoding explicitly set
- ✅ Stable CocoaPods version (1.15.2)
- ✅ Pre-install hook ensures environment
- ✅ Unnecessary files excluded

---

## 📊 Expected Build Process

```
1. Upload code to EAS
   ↓
2. Pre-install hook runs
   ↓
3. Install npm dependencies
   ↓
4. Run expo prebuild --clean
   ↓
5. Install CocoaPods (with UTF-8 encoding) ← FIXED
   ↓
6. Build iOS app
   ↓
7. Generate .app file
   ↓
8. Success!
```

---

## ⏱️ Build Timeline

- Upload: ~1-2 min
- Install dependencies: ~3-5 min
- Prebuild: ~2-3 min
- **CocoaPods install: ~5-8 min** ← This should now work
- Xcode build: ~5-10 min
- **Total: ~15-20 min**

---

## 🆘 If Build Still Fails

### Check Build Logs

1. Click the build URL in your terminal
2. Look for the "Install dependencies" phase
3. Check for specific error messages

### Common Issues & Solutions

#### Issue: "Unicode Normalization not appropriate for ASCII-8BIT"
**Status**: Should be fixed by UTF-8 encoding
**If persists**: The env variables might not be applied correctly

#### Issue: "Pod install failed"
**Solution**: Check if specific pod is causing issues in logs

#### Issue: "No such file or directory"
**Solution**: Make sure all asset files exist (we already fixed this)

---

## 🔄 Alternative: Local Build

If EAS build continues to fail, use local build instead:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build

# Install pods with correct encoding
export LANG=en_US.UTF-8
cd ios && pod install && cd ..

# Build with Xcode
open ios/SwipeSavvy.xcworkspace

# Or build from terminal
export LANG=en_US.UTF-8
npx expo run:ios
```

**Benefits**:
- Faster iteration
- More control over environment
- Immediate error feedback
- Free (no build credits used)

**Downside**:
- Requires Xcode installed
- Uses local machine resources

---

## 📋 Build Command with All Options

For maximum compatibility:

```bash
npx eas build \
  --profile development \
  --platform ios \
  --clear-cache \
  --no-wait
```

Flags:
- `--clear-cache`: Starts fresh, no cached data
- `--no-wait`: Returns immediately, check status on web

---

## ✅ Verification Steps

After successful build:

```bash
# 1. Check build completed
npx eas build:list

# 2. Install on simulator
npx expo install:ios

# 3. Start dev server
npx expo start --dev-client

# 4. Launch app
# Should open directly to login (no splash delay!)
```

---

## 📚 Additional Resources

### EAS Build Documentation
- Troubleshooting: https://docs.expo.dev/build/troubleshooting/
- iOS builds: https://docs.expo.dev/build-reference/ios-builds/
- Environment variables: https://docs.expo.dev/build-reference/variables/

### Files Modified
- [eas.json](eas.json) - Build configuration with encoding fix
- [.easignore](.easignore) - Exclude unnecessary files
- [.eas/build/pre-install.sh](.eas/build/pre-install.sh) - Pre-install hook

---

## 🎯 Summary

**What was wrong**: CocoaPods couldn't handle non-UTF-8 encoding in build environment

**What I fixed**:
- ✅ Added UTF-8 encoding to build environment
- ✅ Pinned CocoaPods to stable version (1.15.2)
- ✅ Created pre-install hook
- ✅ Added .easignore for faster uploads

**What to do now**:
```bash
npx eas build --profile development --platform ios
```

The build should now complete successfully! 🚀

---

## 💡 Pro Tip

While waiting for the build, you can work on other things. EAS will send you an email when the build completes, and you can check status anytime with:

```bash
npx eas build:list
```

Or view it on the web dashboard at the URL shown when you started the build.
