# 🚀 Local Build - Fastest Solution

**Problem**: EAS cloud builds failing on dependency installation
**Solution**: Build locally on your machine (faster and more reliable)

---

## ⚡ Quick Local Build (5-10 minutes)

Copy and paste these commands:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Step 1: Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build android/build .expo

# Step 2: Install pods with correct encoding
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios && pod install && cd ..

# Step 3: Start dev server (in background)
npx expo start --dev-client &

# Step 4: Build and run on iOS simulator
export LANG=en_US.UTF-8
npx expo run:ios
```

---

## 🎯 Why Local Build is Better Right Now

### Cloud Build Issues:
- ❌ Failing on dependency installation
- ❌ Takes 15-20 minutes per attempt
- ❌ Uses build credits
- ❌ Hard to debug remotely

### Local Build Benefits:
- ✅ **5-10 minutes** total time
- ✅ **Free** (no credits used)
- ✅ **Immediate error feedback**
- ✅ **Full control** over environment
- ✅ **Better debugging**

---

## 📋 Step-by-Step Explanation

### Step 1: Clean Previous Builds
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build android/build .expo
```
Removes all cached build artifacts to start fresh.

### Step 2: Install CocoaPods
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios && pod install && cd ..
```
This is where EAS was failing. Running it locally with proper encoding should work.

**Expected output**:
```
Installing ExpoModulesCore...
Installing React-Core...
...
Pod installation complete! There are 98 dependencies from the Podfile and 97 total pods installed.
```

### Step 3: Start Dev Server
```bash
npx expo start --dev-client &
```
Starts Metro bundler in background. The `&` keeps it running while you continue.

### Step 4: Build iOS App
```bash
export LANG=en_US.UTF-8
npx expo run:ios
```
Compiles the iOS app and launches on simulator.

**Expected output**:
```
› Building SwipeSavvy
› Compiling...
› Build complete
› Opening app on simulator
```

---

## ✅ Expected Result

After successful build:

1. **iOS Simulator launches**
2. **SwipeSavvy app opens**
3. **Goes directly to login screen** (no splash delay!)
4. **Connected to dev server** (hot reload enabled)

---

## 🆘 If Step 2 (pod install) Fails

### Error: "Unicode Normalization not appropriate"

**Solution**: Run this first, then retry:
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Add to shell profile for persistence
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
echo 'export LC_ALL=en_US.UTF-8' >> ~/.zshrc
source ~/.zshrc

# Retry pod install
cd ios && pod install && cd ..
```

### Error: "Command 'pod' not found"

**Solution**: Install CocoaPods:
```bash
sudo gem install cocoapods
```

### Error: Specific pod fails to install

**Solution**: Try updating pod repo:
```bash
cd ios
pod repo update
pod install
cd ..
```

---

## 🔧 If Build Fails at Step 4

### Use Xcode Directly

```bash
# Open Xcode workspace
open ios/SwipeSavvy.xcworkspace

# In Xcode:
# 1. Wait for indexing to complete
# 2. Select iPhone simulator from device dropdown
# 3. Product → Clean Build Folder (⇧⌘K)
# 4. Product → Build (⌘B)
# 5. Product → Run (⌘R)
```

This gives you detailed error messages if something fails.

---

## 📊 Timeline Comparison

| Method | Time | Success Rate | Cost |
|--------|------|--------------|------|
| EAS Cloud | 15-20 min | Currently failing | Uses credits |
| Local Build | 5-10 min | High (you can debug) | Free |
| Xcode Direct | 3-5 min | Highest | Free |

**Recommendation**: Use local build or Xcode direct.

---

## 🎯 After Successful Build

### Test Splash Screen Fix
1. App should open **immediately** to login
2. No 3.5-second delay
3. Smooth, instant experience

### Test Backend Connection
```bash
# Backend is live
curl http://swipe-savvy-nlb-1377101934.us-east-1.elb.amazonaws.com/health

# Should return:
# {"status":"healthy","service":"swipesavvy-backend","version":"1.0.0"}
```

### Test Email Verification
1. Sign up with new email
2. Check inbox for verification code (via AWS SES)
3. Enter code
4. Complete authentication

### Development Workflow
1. Edit code in VSCode
2. Save file
3. App auto-reloads (~1 second)
4. See changes immediately

---

## 🔄 Return to EAS Later (Optional)

Once local build works, you can troubleshoot EAS build:

1. Know the app works locally
2. Compare local vs EAS environment
3. Identify specific EAS configuration issue
4. Fix and retry EAS build

But for now, **local build is the fastest path to success**.

---

## 💡 Pro Tips

### Keep Dev Server Running
```bash
# Start in separate terminal
npx expo start --dev-client

# Or start in background
npx expo start --dev-client &

# Stop background process when done
killall expo
```

### Quick Rebuild
After first successful build:
```bash
export LANG=en_US.UTF-8
npx expo run:ios
```
Much faster - only rebuilds changed files.

### Clear Everything If Issues
```bash
# Nuclear option
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ios android node_modules .expo
npm install --legacy-peer-deps
npx expo prebuild --clean
export LANG=en_US.UTF-8
cd ios && pod install && cd ..
npx expo run:ios
```

---

## Summary

**Current situation**: EAS cloud builds failing consistently
**Best solution**: Build locally with commands above
**Time**: 5-10 minutes to working app
**Result**: App with splash screen fix, connected to AWS backend

**Ready to build?** Run the commands at the top! 🚀
