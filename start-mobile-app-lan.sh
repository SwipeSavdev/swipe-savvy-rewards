#!/bin/bash

# SwipeSavvy Mobile App Startup with Local IP
# This allows testing on physical devices and other machines

cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app

LOCAL_IP="192.168.1.142"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🚀 SWIPESAVVY MOBILE APP - LOCAL NETWORK START 🚀          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Local IP Address: $LOCAL_IP"
echo ""
echo "Access Points:"
echo "  • Web Browser:        http://$LOCAL_IP:19000"
echo "  • Web Exponent View:  http://$LOCAL_IP:19000/exponent"
echo "  • QR Code Tunnel:     Scan from Expo Go app"
echo ""
echo "Device Testing:"
echo "  • Physical Device:    Scan QR code with Expo Go app"
echo "  • iOS Simulator:      npm run ios"
echo "  • Android Emulator:   npm run android"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""

# Start Expo with LAN mode (accessible from other devices)
EXPO_PUBLIC_URL="http://$LOCAL_IP:19000" npm start -- --localhost
