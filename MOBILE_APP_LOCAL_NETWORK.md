# 📱 SWIPESAVVY MOBILE APP — LOCAL NETWORK ACCESS

**Status:** 🟢 **RUNNING ON LOCAL NETWORK**  
**Local IP:** `192.168.1.142`  
**Port:** `19000` (Metro Server)  
**Updated:** December 28, 2025

---

## 🌐 ACCESS POINTS

### Web Browser (Easiest)

**URL:** `http://192.168.1.142:19000`

Open in any browser on your local network:
```
http://192.168.1.142:19000
```

Or with the `/exponent` path for better UI:
```
http://192.168.1.142:19000/exponent
```

---

## 📱 DEVICE TESTING

### Physical Device or Tablet

**Option 1: Scan QR Code**
1. Open the terminal running the mobile app
2. Look for the QR code
3. Open **Expo Go** app on your device
4. Scan the QR code
5. App will load on your device

**Option 2: Manual Connection**
1. Make sure your device is on the **same Wi-Fi network**
2. Open Expo Go app
3. Tap the QR code icon
4. Scan from terminal output
5. Or type: `exp://192.168.1.142:19000`

---

## 💻 SIMULATOR / EMULATOR

### iOS Simulator (macOS only)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app
npm run ios
```

Then in the Metro server terminal, press:
```
i  - Open iOS Simulator
```

### Android Emulator

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app
npm run android
```

Then in the Metro server terminal, press:
```
a  - Open Android Emulator
```

---

## 🔧 METRO SERVER COMMANDS

Once the Metro server is running, you can press keys to control it:

```
i     - Open iOS Simulator
a     - Open Android Emulator
w     - Open Web view in browser
r     - Reload app
m     - Toggle menu
c     - Clear cache
q     - Quit
?     - Show all options
```

---

## 🔗 QUICK LINKS

| Device/Access | URL |
|---------------|-----|
| **Web Browser** | `http://192.168.1.142:19000` |
| **Web Exponent** | `http://192.168.1.142:19000/exponent` |
| **QR Tunnel** | Scan from Metro output |
| **Expo URL** | `exp://192.168.1.142:19000` |

---

## ✅ VERIFICATION

### Check if Mobile App is Running

```bash
# Method 1: Check port
lsof -i :19000

# Method 2: Check processes
ps aux | grep -E "npm|expo" | grep -v grep

# Method 3: Try to curl
curl -s http://192.168.1.142:19000 | head -20
```

### Expected Output

The app should be accessible and show:
- Metro Bundler info
- QR code for Expo Go
- Instructions for opening on device/simulator

---

## 🌟 FEATURES & HOT RELOAD

### Hot Reload
- Edit any file in `swipesavvy-mobile-app/src`
- Save the file
- App automatically updates on device
- No need to restart

### Debugging
- Shake device or press Cmd+D (iOS) / Cmd+M (Android)
- Select "Debug Remote JS"
- Open browser DevTools

### Network Inspector
- From Metro menu, select network debugging
- Monitor all API calls from the app

---

## 📊 NETWORK DETAILS

### System Network
```
Device IP:        192.168.1.142
Network Subnet:   192.168.1.0/24
Port (Metro):     19000
Port (Bundler):   19001 (automatic)
```

### Required for Testing

- ✅ Device must be on **same Wi-Fi network** as development machine
- ✅ Firewall must allow port 19000 & 19001
- ✅ Device must be able to reach 192.168.1.142

### Test Network Connection

```bash
# From your device's terminal (if SSH enabled)
ping 192.168.1.142

# Or from development machine
ping <your-device-ip>
```

---

## 🐛 TROUBLESHOOTING

### App won't load on physical device

**Solution 1: Check network**
```bash
# Make sure you're on same Wi-Fi
ifconfig | grep inet

# Check device can reach server
ping 192.168.1.142
```

**Solution 2: Scan QR code properly**
- Make sure QR code is visible in terminal
- Good lighting for camera
- Hold device steady while scanning

**Solution 3: Reload app**
- Press `r` in Metro server terminal
- Or shake device and select "Reload"

### Metro server won't start

**Solution 1: Clear cache**
```bash
cd swipesavvy-mobile-app
npm start -- --reset-cache
```

**Solution 2: Kill and restart**
```bash
pkill -f "expo start" || pkill -f "npm start"
npm start
```

**Solution 3: Different port**
```bash
npm start -- --port 19002
```

### Port 19000 already in use

**Solution:**
```bash
# Find process using port
lsof -i :19000

# Kill it
kill -9 <PID>

# Restart app
npm start
```

### Connection refused from device

**Check firewall:**
- Allow port 19000 and 19001 in firewall
- Or temporarily disable firewall for testing

**Check IP is correct:**
```bash
# Verify correct IP
ifconfig | grep -E "inet " | grep -v 127.0.0.1
```

---

## 📱 TESTING ON DIFFERENT DEVICES

### Test Device (iPhone)

1. Connect to same Wi-Fi
2. Install **Expo Go** from App Store
3. Open Expo Go app
4. Scan QR code from Metro terminal
5. App loads on device

### Test Device (Android Phone)

1. Connect to same Wi-Fi
2. Install **Expo Go** from Google Play
3. Open Expo Go app
4. Scan QR code from Metro terminal
5. App loads on device

### Web Browser (Any Computer on Network)

1. Open Chrome/Safari/Firefox
2. Navigate to: `http://192.168.1.142:19000`
3. Web version of app loads
4. Test responsive design
5. Check console for errors

---

## 🚀 ADVANCED USAGE

### LAN Mode vs Tunnel Mode

```bash
# Current: LAN Mode (faster, same network)
npm start

# Tunnel Mode (slower, any network)
npm start -- --tunnel

# Local Mode (same machine only)
npm start -- --localhost
```

### Debugging with DevTools

```bash
# Open React DevTools
# iOS: Shake device → "Debug Remote JS"
# Android: Cmd+M → "Debug Remote JS"

# Then in your browser:
# DevTools opens automatically
```

### Performance Profiling

```bash
# In Metro menu, select:
# → Enable Performance Monitor
# 
# Shows real-time:
# • FPS (Frames Per Second)
# • Memory Usage
# • Bundle Size
```

---

## 📊 CURRENT SYSTEM STATUS

```
Mobile App Status:    🟢 RUNNING
Metro Server:         🟢 LISTENING on 192.168.1.142:19000
Network Access:       🟢 LAN Mode Enabled
Device Testing:       ✅ Ready
Simulator Testing:    ✅ Ready (iOS & Android)
Hot Reload:           ✅ Enabled
Source Maps:          ✅ Enabled
Debugging:            ✅ Ready
```

---

## 🎯 QUICK START (Physical Device)

1. **Ensure same Wi-Fi:**
   ```bash
   # Check your IP
   ifconfig | grep inet
   ```

2. **Start Metro Server:**
   ```bash
   cd swipesavvy-mobile-app
   npm start
   ```

3. **Wait for QR code**
   - Look in terminal for QR code
   - Takes 10-20 seconds to generate

4. **Install Expo Go** (if not already)
   - App Store (iPhone)
   - Google Play (Android)

5. **Scan QR Code**
   - Open Expo Go app
   - Tap the QR code scanner
   - Point at the QR code in terminal

6. **Wait for load**
   - App bundles (~30-60 seconds first time)
   - Then loads on your device
   - Hot reload enabled from here on

---

## 📞 SUPPORT

| Issue | Solution |
|-------|----------|
| Can't scan QR | Check terminal has QR visible, good lighting |
| App won't load | Check same Wi-Fi, check IP is correct |
| Port in use | `lsof -i :19000`, then `kill -9 <PID>` |
| Metro won't start | `npm start -- --reset-cache` |
| Need different port | `npm start -- --port 19002` |

---

## 🎉 YOU'RE READY!

Your mobile app is running on:

```
http://192.168.1.142:19000
```

**Next Step:** Open in browser or scan QR code with device!

---

**System:** macOS M1/M2  
**Local IP:** 192.168.1.142  
**Metro Port:** 19000  
**Status:** 🟢 RUNNING  

Generated: December 28, 2025
