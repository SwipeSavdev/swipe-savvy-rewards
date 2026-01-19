# Expo Dev Client Setup - Testing Splash Screen Fix

**Status**: Dev server is running, ready to build custom development app

---

## Important: Why Not Expo Go?

**Expo Go cannot show the splash screen fix** because:
- Expo Go uses a pre-built binary
- It only supports JavaScript changes
- Our changes modified native code (`app.json` splash configuration)
- Native changes require a custom build

**Solution**: Expo Dev Client creates a custom development build with your native modifications.

---

## What's Running Now

I've started the Expo development server in Dev Client mode:
```bash
npx expo start --dev-client
```

**Server Status**: Running at `http://localhost:8081`

---

## Next Steps

### Option 1: Build on iOS Simulator (Recommended)

Open a **new terminal window** and run:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Build and run on iOS simulator
export LANG=en_US.UTF-8
npx expo run:ios
```

This will:
1. Build the custom development client with your splash screen fixes
2. Install it on iOS Simulator
3. Launch the app
4. Connect to the dev server for hot reload

**Expected Result**: App opens directly to login with no 3.5s splash delay!

---

### Option 2: Build on Physical iPhone

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Build for physical device
npx expo run:ios --device
```

You'll need:
- iPhone connected via USB
- Apple Developer account signed in to Xcode

---

### Option 3: Use Xcode Directly (If Terminal Build Fails)

The Expo dev server is running. In Xcode:

1. Open `ios/SwipeSavvy.xcworkspace`
2. Select your simulator or connected device
3. Product → Clean Build Folder (⇧⌘K)
4. Product → Run (⌘R)

The app will build with expo-dev-client and connect to the running server.

---

## What You'll See

### First Launch:
1. App builds and installs
2. Launches **directly to login screen** (no splash delay!)
3. Shows Expo dev client UI at bottom
4. Hot reload enabled for quick testing

### Testing the Fix:
- ✅ No 3.5-second splash screen
- ✅ App goes straight to login
- ✅ Email verification UI (not SMS)
- ✅ Can test full authentication flow

---

## Development Workflow

With expo-dev-client running:

1. **Make Code Changes** → Save file
2. **Auto Reload** → App refreshes automatically
3. **Test** → See changes instantly
4. **Debug** → Press `d` in terminal for dev menu

---

## Dev Server Commands

In the terminal where `expo start --dev-client` is running:

- `r` - Reload app
- `m` - Toggle menu
- `d` - Show developer menu
- `i` - Run on iOS simulator
- `a` - Run on Android
- `q` - Quit server

---

## Stopping the Dev Server

When you're done testing:

1. Go to the terminal running `expo start --dev-client`
2. Press `q` or `Ctrl+C`

---

## If Build Fails

### Clean Everything:
```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Clean all caches
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
rm -rf ios/build .expo

# Rebuild pods
cd ios && pod install && cd ..

# Try build again
export LANG=en_US.UTF-8
npx expo run:ios
```

### Use Xcode Instead:
If terminal build continues to fail, use Xcode directly (Option 3 above).

---

## Comparison: Expo Go vs Dev Client

| Feature | Expo Go | Expo Dev Client |
|---------|---------|-----------------|
| Native Code Changes | ❌ No | ✅ Yes |
| Splash Screen Fix | ❌ Won't show | ✅ Shows |
| Quick Setup | ✅ Just scan QR | ⚠️ Needs build |
| Custom Native Modules | ❌ No | ✅ Yes |
| Hot Reload | ✅ Yes | ✅ Yes |
| Debug Menu | ✅ Yes | ✅ Yes |

**For this project**: We MUST use Dev Client to see the splash screen fix.

---

## Current Setup Summary

✅ **Completed**:
1. expo-dev-client installed
2. Native projects regenerated with Dev Client
3. CocoaPods installed (98 dependencies)
4. Dev server running at localhost:8081
5. All splash screen code changes in place

⏳ **Next**:
1. Build custom development app (`npx expo run:ios`)
2. Test splash screen fix
3. Verify email verification works
4. Complete authentication flow testing

---

## Testing Checklist

Once the app launches:

- [ ] App opens directly to login (no splash delay)
- [ ] Sign up with new email
- [ ] Receive verification code via email
- [ ] Enter code and authenticate
- [ ] Navigate through app features
- [ ] Verify hot reload works (make a small change, save)
- [ ] Check dev menu (shake device or press `d`)

---

## After Successful Testing

### Build for Production:

```bash
# Using EAS (recommended)
npx eas build --profile production --platform ios

# Or for local build
npx expo run:ios --configuration Release
```

### Commit Changes:

```bash
git add .
git commit -m "Add expo-dev-client and fix splash screen delay"
git push origin main
```

---

## Summary

**Current Status**:
- ✅ Dev server running
- ✅ expo-dev-client installed
- ✅ Ready to build custom development app

**To See Splash Fix**:
```bash
# In a new terminal:
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
export LANG=en_US.UTF-8
npx expo run:ios
```

**Expected**: App launches directly to login with no delay! 🚀
