#!/bin/bash

# SwipeSavvy Mobile App Rebuild Script
# Fixes the 3.5-second splash screen issue

set -e

echo "🧹 Cleaning build artifacts..."
rm -rf ios/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf android/app/build 2>/dev/null || true
rm -rf .expo 2>/dev/null || true

echo "📦 Installing dependencies..."
npm install

echo "🔨 Rebuilding native projects..."
npx expo prebuild --clean

echo ""
echo "✅ Rebuild complete!"
echo ""
echo "Next steps:"
echo "  1. Run on iOS:     npx expo run:ios"
echo "  2. Run on Android: npx expo run:android"
echo ""
echo "The app will now start directly on the login screen with no splash delay."
