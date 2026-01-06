# How to Run SwipeSavvy Platform

**Last Updated**: 2026-01-06  
**Status**: ✅ Zero TypeScript Errors - Ready to Run!

---

## ⚡ Quick Start (One Command)

```bash
npx expo start --go
```

That's it! This will start the mobile app with Expo Go.

---

## 📱 Complete Running Instructions

### Prerequisites

Ensure you have the correct Node.js and npm versions:

```bash
# Switch to correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.13.0

# Verify versions
node --version   # Should be: v20.13.0
npm --version    # Should be: 10.8.2
```

### Option 1: Interactive Startup Script (Recommended)

```bash
./start-platform.sh
```

Choose from menu:
1. Start Mobile App
2. Start Admin Portal
3. Start Both
4. Run TypeScript Check
5. Run Tests

### Option 2: Manual - Mobile App Only

```bash
npx expo start --go
```

Then:
- **Physical Device**: Scan QR code with Expo Go app
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web Browser**: Press `w`

### Option 3: Manual - Both Mobile + Admin

**Terminal 1** (Mobile App):
```bash
npx expo start --go
```

**Terminal 2** (Admin Portal):
```bash
cd swipesavvy-admin-portal
npm run dev
```

Admin portal will be at: http://localhost:5173

---

## 📲 Using Expo Go on Your Phone

### Step 1: Install Expo Go App

- **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 2: Connect to WiFi

Ensure your phone and computer are on the **same WiFi network**.

### Step 3: Start the App

```bash
npx expo start --go
```

### Step 4: Scan QR Code

- **iOS**: Open Camera app → Scan QR code
- **Android**: Open Expo Go app → Scan QR code

### Step 5: App Loads!

The SwipeSavvy app will load on your device.

---

## 💻 Using Simulators/Emulators

### iOS Simulator (macOS only)

```bash
npx expo start --ios
```

Or start Metro bundler and press `i`:
```bash
npx expo start --go
# Press 'i' when prompted
```

### Android Emulator

```bash
npx expo start --android
```

Or start Metro bundler and press `a`:
```bash
npx expo start --go
# Press 'a' when prompted
```

### Web Browser

```bash
npx expo start --web
```

Or start Metro bundler and press `w`:
```bash
npx expo start --go
# Press 'w' when prompted
```

---

## 🔍 Verification Commands

### Check TypeScript (Should be 0 errors)

```bash
npx tsc --noEmit
```

Expected: Silent exit (no output = no errors)

### Run Tests

```bash
npm test
```

### Check Versions

```bash
node --version   # v20.13.0
npm --version    # 10.8.2
```

---

## 🛠 Useful Commands

### Clear Cache

```bash
# Expo cache
npx expo start --clear

# Manual cache clear
rm -rf .expo
rm -rf node_modules/.cache
```

### Kill Stuck Processes

```bash
# Kill Metro bundler
lsof -ti:8081 | xargs kill -9

# Kill Vite server
lsof -ti:5173 | xargs kill -9
```

### Reload App

While Metro bundler is running:
- Press `r` to reload
- Press `m` for menu
- Press `?` for help

---

## 🎯 Expected Output

When running `npx expo start --go`, you should see:

```
› Metro waiting on exp://192.168.1.XXX:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

**QR Code** will be displayed - scan it with your phone!

---

## 🐛 Troubleshooting

### "Wrong Node/npm version"

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.13.0
nvm use 20.13.0
nvm alias default 20.13.0
npm install -g npm@10.8.2
```

### "Metro bundler won't start"

```bash
npx expo start --clear
```

### "Port 8081 already in use"

```bash
lsof -ti:8081 | xargs kill -9
npx expo start --go
```

### "Can't connect from phone"

1. Ensure phone and computer on same WiFi
2. Check firewall settings
3. Try tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Quick reference guide
- **[LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)** - Comprehensive setup
- **[START_HERE.md](START_HERE.md)** - Project overview
- **[ENVIRONMENT_FIX_MANUAL.md](ENVIRONMENT_FIX_MANUAL.md)** - Environment setup

---

## ✅ Platform Status

- **TypeScript Errors**: 0 ✅
- **Branch**: fixed-all-errors
- **Theme System**: Complete ✅
- **Navigation**: All IDs added ✅
- **Dependencies**: Installed ✅
- **Documentation**: Complete ✅

---

## 🎉 You're Ready!

The platform is configured and ready to run with **zero errors**.

**To start developing:**

1. Open terminal
2. Run: `npx expo start --go`
3. Scan QR code with phone or press `i`/`a`/`w`
4. Start coding! 🚀

---

**Need help?** Check the troubleshooting section or run `./start-platform.sh` for guided setup.
