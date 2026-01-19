#!/bin/bash
set -e

echo "🧹 Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*/Build/Intermediates.noindex/Pods.build/Debug-iphoneos
rm -rf ios/build

echo "📱 Building for iOS Simulator..."
echo ""
echo "This will:"
echo "  1. Clean old builds"
echo "  2. Build for simulator (NOT device)"
echo "  3. Launch the app automatically"
echo ""

npx expo run:ios --configuration Debug

echo ""
echo "✅ Build complete!"
echo "🎉 App should be running in simulator with NO splash delay!"
