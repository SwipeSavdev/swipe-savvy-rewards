# iOS Build Instructions

**Current Status**: Xcode is open and ready to build.

---

## Quick Build Steps

### In Xcode (Currently Open):

1. **Wait for Indexing**
   - Look at the top of the Xcode window
   - Wait for "Indexing..." to complete

2. **Clean Build Folder**
   ```
   Menu: Product → Clean Build Folder
   Keyboard: ⇧⌘K (Shift-Command-K)
   ```

3. **Select Simulator**
   - Click the device selector at the top (next to SwipeSavvy)
   - Choose: "iPhone 15 Pro" or any iPhone simulator

4. **Build and Run**
   ```
   Menu: Product → Run
   Keyboard: ⌘R (Command-R)
   ```

---

## If You See Errors

### Signing Error
**Error**: "Signing for SwipeSavvy requires a development team"

**Fix**:
1. Click the blue "SwipeSavvy" project icon (top of left sidebar)
2. Select "SwipeSavvy" target (not Pods)
3. Click "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple ID from the "Team" dropdown

### Build Failed Error
**Error**: Various compilation errors

**Fix**:
1. Close Xcode
2. Run in Terminal:
   ```bash
   cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
   rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
   cd ios
   pod deintegrate
   pod install
   cd ..
   open ios/SwipeSavvy.xcworkspace
   ```
3. Try build again in Xcode

---

## Alternative: Build from Terminal

If Xcode GUI doesn't work, try:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build

# Build with xcodebuild directly
export LANG=en_US.UTF-8
cd ios
xcodebuild -workspace SwipeSavvy.xcworkspace \
  -scheme SwipeSavvy \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 15 Pro' \
  clean build
```

---

## Expected Result

Once build succeeds:
- ✅ iOS Simulator launches
- ✅ SwipeSavvy app opens
- ✅ Goes directly to login screen
- ✅ No 3.5-second splash delay

---

## Test the Fix

1. **App launches** → Should go straight to login
2. **Sign up** → Use your email
3. **Check email** → Should receive verification code
4. **Enter code** → Complete authentication

---

## Still Having Issues?

### Option 1: Try Android Instead
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
npx expo run:android
```

### Option 2: Use Expo Go (Quick Test)
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
npx expo start
```
Then scan QR code with Expo Go app on your phone.

**Note**: Expo Go won't show the splash fix (needs native build), but you can test backend connectivity.

### Option 3: EAS Build (Cloud)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform ios
```

---

## Summary

**Everything is ready** - all code changes are complete, dependencies installed, native project generated. Just need to complete the Xcode build.

**Xcode is your best option** because it shows clear error messages and auto-fixes many common issues.

**Press ⌘R in Xcode to build and run!**
