# 🚀 Expo Mobile App - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- `npm` available in PATH
- Device with Expo Go app installed (iOS Camera app or Android Expo Go)
- Network connection (LAN mode)

## ✅ Proper Way to Start Expo

### Step 1: Navigate to Mobile App Directory
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2
```

### Step 2: Kill Any Existing Expo Processes (Important!)
```bash
pkill -9 -f "expo start"
```
**Why?** Prevents port conflicts and stale processes

### Step 3: Wait 2-3 Seconds
```bash
sleep 2
```

### Step 4: Install Dependencies (if needed)
```bash
npm install --legacy-peer-deps
```

### Step 5: Start Expo with Clear Cache and LAN Mode
```bash
npx expo start --clear --lan
```

**Parameters Explained:**
- `--clear` - Clears Metro bundler cache (prevents stale code)
- `--lan` - Uses Local Area Network (allows device on same WiFi to connect)

### Step 6: Wait for Metro Bundler
Metro should complete bundling. You'll see:
```
iOS Bundled 424ms index.js (1257 modules)
```

### Step 7: Scan QR Code
Once you see the QR code and "Metro waiting on exp://...", scan with:
- **iOS**: Native Camera app
- **Android**: Expo Go app

---

## 🔧 One-Line Complete Command

```bash
pkill -9 -f "expo start" && sleep 2 && cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2 && npx expo start --clear --lan
```

---

## ❌ Common Mistakes (DON'T DO THIS)

### ❌ Running from wrong directory
```bash
# WRONG - Don't run from parent directory
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npx expo start
```

### ❌ Not killing previous instances
```bash
# This will fail with "Port 8081 is already in use"
npx expo start  # (if another instance is running)
```

### ❌ Forgetting --clear flag
```bash
# This may use stale cached code
npx expo start --lan
```

### ❌ Not using --lan flag for device testing
```bash
# This defaults to localhost (won't work on device)
npx expo start --clear
```

---

## 🧪 Verify Compilation Success

### ✅ Good Signs:
- QR code displays in terminal
- "Metro waiting on exp://192.168.1.xxx:8081"
- Metro Bundler shows "XXX modules" bundled
- No ERROR messages in logs (WARN is OK)

### ❌ Bad Signs:
- "Port 8081 is already in use" → Kill processes and retry
- "Cannot determine project's Expo SDK version" → Run `npm install`
- Red ERROR messages → Check syntax of modified files

---

## 🔌 Backend API Integration

### Endpoints Used:
- **Health Check**: `http://192.168.1.142:8000/health`
- **AI Chat**: `http://192.168.1.142:8000/concierge/api/v1/chat`

### Environment Variables (app.json):
```json
{
  "extra": {
    "AI_API_BASE_URL": "http://192.168.1.142:8000",
    "MOCK_API": "false",
    "ENABLE_AI_CONCIERGE": "true"
  }
}
```

### Authentication Required:
- User must be logged in to use AI Concierge
- Bearer token automatically passed from `accessToken` store

---

## 📱 Test on Physical Device

### Requirements:
- Device on same WiFi network as development machine
- Expo Go installed (Android) or Camera app (iOS)
- Network connectivity confirmed

### Steps:
1. See QR code in Expo terminal
2. Device scans QR code with Camera (iOS) or Expo Go (Android)
3. App opens in Expo Go environment

---

## 🛑 Troubleshooting

### Port Already in Use
```bash
# See what's using port 8081
lsof -i :8081

# Kill all Expo processes
pkill -9 -f "expo start"
```

### Stale Cache Issues
```bash
# Full cache cleanup
rm -rf .expo node_modules/.cache
npm install --legacy-peer-deps
npx expo start --clear
```

### Module Not Found Errors
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo start --clear
```

### Watchman Issues
```bash
# Clear watchman watches
watchman watch-del '/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2'
watchman watch-project '/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2'
```

---

## 📋 Checklist Before Starting Expo

- [ ] Correct directory: `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2`
- [ ] No other Expo processes running: `pkill -9 -f "expo start"`
- [ ] Dependencies installed: `npm install --legacy-peer-deps`
- [ ] Backend API running: `curl http://192.168.1.142:8000/health`
- [ ] Using `--clear` flag for clean build
- [ ] Using `--lan` flag for device connectivity

---

## 🎯 Expected Output

```
env: load .env.local .env
env: export ENV API_BASE_URL AI_API_BASE_URL WS_URL...
Starting project at /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2
Starting Metro Bundler

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ... QR Code ... █
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

› Metro waiting on exp://192.168.1.216:8081
› Scan the QR code above with Expo Go or Camera

Logs for your project will appear below.
iOS Bundled 424ms index.js (1257 modules)
✅ Ready for testing!
```

---

**Last Updated:** December 30, 2025
**Status:** ✅ Production Ready
