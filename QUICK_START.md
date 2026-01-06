# SwipeSavvy - Quick Start Guide

**Status**: ✅ Zero TypeScript Errors - Ready to Run!

## 🚀 Quick Start (3 Steps)

### Option 1: Use the Startup Script (Recommended)

```bash
./start-platform.sh
```

The script will:
1. ✅ Check your Node.js and npm versions
2. ✅ Verify TypeScript (0 errors)
3. ✅ Check environment configuration
4. 🎯 Let you choose what to run

### Option 2: Manual Start

#### Start Mobile App

```bash
npm start
```

Then:
- Press `w` for web browser
- Press `i` for iOS simulator (macOS only)
- Press `a` for Android emulator
- Or scan QR code with Expo Go app on your phone

#### Start Admin Portal

```bash
cd swipesavvy-admin-portal
npm run dev
```

Open browser to: http://localhost:5173

---

## 📋 Prerequisites Checklist

Before starting, ensure:

- [ ] **Node.js**: v20.13.0 installed
  ```bash
  node --version  # Should output: v20.13.0
  ```

- [ ] **npm**: 10.8.2 installed
  ```bash
  npm --version   # Should output: 10.8.2
  ```

- [ ] **Dependencies**: Installed
  ```bash
  npm install
  ```

- [ ] **Environment**: `.env` file configured
  ```bash
  # Copy example if needed
  cp .env.example .env
  # Edit .env and add your API keys
  ```

---

## 🔍 Verify Everything is Working

### TypeScript Check (Should be 0 errors)

```bash
npx tsc --noEmit
```

Expected: Command exits silently (no output = no errors)

### Run Tests

```bash
npm test
```

---

## 🎯 What Runs Where

| Service | Port | URL | Command |
|---------|------|-----|---------|
| **Mobile App (Expo)** | 8081 | http://localhost:8081 | `npm start` |
| **Admin Portal** | 5173 | http://localhost:5173 | `cd swipesavvy-admin-portal && npm run dev` |
| **Metro Bundler** | 8081 | exp://localhost:8081 | Automatic with `npm start` |

---

## 📱 Running on Devices

### iOS Simulator (macOS only)

```bash
npm start
# Then press 'i' in the Metro bundler terminal
```

Or:

```bash
npx expo run:ios
```

### Android Emulator

```bash
npm start
# Then press 'a' in the Metro bundler terminal
```

Or:

```bash
npx expo run:android
```

### Physical Device

1. Install **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the app:
   ```bash
   npm start
   ```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

---

## 🛠 Common Commands

```bash
# Start mobile app
npm start

# Start with cache cleared
npm start -- --clear

# Start admin portal
cd swipesavvy-admin-portal && npm run dev

# Run TypeScript check
npx tsc --noEmit

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 🐛 Troubleshooting

### "Metro Bundler won't start"

```bash
# Clear cache
npx expo start --clear

# Or manually
rm -rf .expo
rm -rf node_modules/.cache
```

### "Port already in use"

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

### "TypeScript errors"

```bash
# Should output nothing (0 errors)
npx tsc --noEmit

# If errors appear, check:
node --version  # Must be v20.13.0
npm --version   # Must be 10.8.2
```

### "Wrong Node/npm version"

```bash
# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use correct version
nvm install 20.13.0
nvm use 20.13.0
nvm alias default 20.13.0

# Install correct npm
npm install -g npm@10.8.2

# Verify
node --version  # v20.13.0
npm --version   # 10.8.2
```

---

## 📚 Full Documentation

For comprehensive setup and troubleshooting:

- **[LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)** - Complete setup guide
- **[START_HERE.md](START_HERE.md)** - Project overview
- **[ENVIRONMENT_FIX_MANUAL.md](ENVIRONMENT_FIX_MANUAL.md)** - Node/npm setup

---

## ✅ Success Indicators

You're successfully running when you see:

**Mobile App:**
```
› Metro waiting on exp://192.168.1.XXX:8081
› Scan the QR code above with Expo Go
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

**Admin Portal:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.XXX:5173/
```

---

## 🎉 You're All Set!

The platform is now running with:
- ✅ Zero TypeScript errors
- ✅ All dependencies installed
- ✅ Complete theme system
- ✅ All navigators configured
- ✅ Tests ready to run

**Happy coding!** 🚀

---

**Need Help?**
- Check [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) for detailed instructions
- Run `./start-platform.sh` for guided setup
- Review [TROUBLESHOOTING](#-troubleshooting) section above
