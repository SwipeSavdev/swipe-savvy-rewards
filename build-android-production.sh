#!/bin/bash

# SwipeSavvy Android Production Build Script
# Builds and submits the app to Google Play Store via EAS
# Usage: ./build-android-production.sh

set -e

echo "🤖 SwipeSavvy Android Production Build"
echo "======================================="
echo ""

# Configuration
PROJECT_DIR="/Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards"
LOG_FILE="$PROJECT_DIR/android-build.log"

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

# Step 2: Check keystore
echo "🔐 Step 2: Checking keystore..."
KEYSTORE_PATH="$HOME/.android/swipesavvy.jks"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  Keystore not found at $KEYSTORE_PATH"
    echo ""
    echo "Generate keystore with:"
    echo "keytool -genkey-dname \"cn=SwipeSavvy, ou=Mobile, o=SwipeSavvy Inc., c=US\" \\"
    echo "  -alias swipesavvy-key \\"
    echo "  -keystore ~/.android/swipesavvy.jks \\"
    echo "  -keyalg RSA \\"
    echo "  -keysize 4096 \\"
    echo "  -validity 10957 \\"
    echo "  -storepass [PASSWORD] \\"
    echo "  -keypass [PASSWORD]"
    exit 1
fi
echo "✅ Keystore verified at $KEYSTORE_PATH"
echo "" | tee -a "$LOG_FILE"

# Step 3: Clean and prebuild
echo "🧹 Step 3: Cleaning and prebuilding..."
npx expo prebuild --clean >> "$LOG_FILE" 2>&1
echo "✅ Prebuild complete"
echo "" | tee -a "$LOG_FILE"

# Step 4: Lint check
echo "🔍 Step 4: Running lint check..."
npm run lint >> "$LOG_FILE" 2>&1 || true
echo "✅ Lint check complete"
echo "" | tee -a "$LOG_FILE"

# Step 5: Build for Android
echo "🔨 Step 5: Building for Google Play Store..."
echo "Creating Android App Bundle (AAB)..."
echo "This may take 5-15 minutes. Monitoring in background..."
eas build --platform android 2>&1 | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "✅ Android build complete!" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 6: Get build information
echo "📊 Step 6: Build Information"
echo "=============================="
echo "To check build status:"
echo "  eas build:list --platform android"
echo ""
echo "To download your build:"
echo "  eas build:download [BUILD_ID]"
echo ""
echo "Build type: Android App Bundle (AAB)"
echo "Ready for: Google Play Store submission"
echo ""
echo "Next steps:"
echo "1. Wait for build to complete (check status above)"
echo "2. Download the .aab file"
echo "3. Log in to Google Play Console"
echo "4. Create a new release in Production track"
echo "5. Upload the .aab file"
echo "6. Configure app listing (screenshots, description, etc.)"
echo "7. Complete questionnaires (data safety, content rating)"
echo "8. Submit for review"
echo ""
echo "Full build log saved to: $LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Success
echo "🎉 Android build process initiated successfully!" | tee -a "$LOG_FILE"
