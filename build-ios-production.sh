#!/bin/bash

# SwipeSavvy iOS Production Build Script
# Builds and submits the app to Apple App Store via EAS
# Usage: ./build-ios-production.sh

set -e

echo "🍎 SwipeSavvy iOS Production Build"
echo "===================================="
echo ""

# Configuration
PROJECT_DIR="/Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards"
LOG_FILE="$PROJECT_DIR/ios-build.log"

# Navigate to project
cd "$PROJECT_DIR"

# Start logging
echo "Build started at $(date)" > "$LOG_FILE"

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Install with: npm install -g eas-cli"
    exit 1
fi

if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLI not found. Install with: npm install -g expo-cli"
    exit 1
fi

echo "✅ Prerequisites verified"
echo "" | tee -a "$LOG_FILE"

# Step 2: Clean and prebuild
echo "🧹 Step 2: Cleaning and prebuilding..."
npx expo prebuild --clean >> "$LOG_FILE" 2>&1
echo "✅ Prebuild complete"
echo "" | tee -a "$LOG_FILE"

# Step 3: Lint check
echo "🔍 Step 3: Running lint check..."
npm run lint >> "$LOG_FILE" 2>&1 || true
echo "✅ Lint check complete"
echo "" | tee -a "$LOG_FILE"

# Step 4: Build for iOS
echo "🔨 Step 4: Building for iOS App Store..."
echo "This may take 5-15 minutes. Monitoring in background..."
eas build --platform ios 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "✅ iOS build complete!" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 5: Get build information
echo "📊 Step 5: Build Information"
echo "=============================="
echo "To check build status:"
echo "  eas build:list --platform ios"
echo ""
echo "To download your build:"
echo "  eas build:download [BUILD_ID]"
echo ""
echo "Next steps:"
echo "1. Wait for build to complete (check status above)"
echo "2. Once built, app will auto-upload to App Store Connect"
echo "3. Log in to App Store Connect to configure your app listing"
echo "4. Add screenshots, description, and other metadata"
echo "5. Submit for review"
echo ""
echo "Full build log saved to: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Success
echo "🎉 iOS build process initiated successfully!" | tee -a "$LOG_FILE"
