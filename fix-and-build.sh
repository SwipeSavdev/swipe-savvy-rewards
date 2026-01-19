#!/bin/bash

echo "🔧 Fixing common Xcode build issues..."
echo ""

cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

# Step 1: Clean derived data
echo "1️⃣  Cleaning derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*
echo "   ✅ Done"
echo ""

# Step 2: Clean build folder
echo "2️⃣  Cleaning build folder..."
rm -rf ios/build
echo "   ✅ Done"
echo ""

# Step 3: Reinstall pods
echo "3️⃣  Reinstalling CocoaPods..."
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd ios
pod install --repo-update
cd ..
echo "   ✅ Done"
echo ""

echo "✅ All fixes applied!"
echo ""
echo "Now in Xcode:"
echo "  1. Product → Clean Build Folder (⇧⌘K)"
echo "  2. Product → Run (⌘R)"
echo ""
echo "If you still get a signing error:"
echo "  1. Click 'SwipeSavvy' in left sidebar"
echo "  2. Select 'SwipeSavvy' target"
echo "  3. Click 'Signing & Capabilities' tab"
echo "  4. Check 'Automatically manage signing'"
echo "  5. Select your Apple ID from Team dropdown"
echo ""
