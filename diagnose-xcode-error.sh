#!/bin/bash

echo "🔍 SwipeSavvy Xcode Build Diagnostics"
echo "====================================="
echo ""

cd "$(dirname "$0")"

echo "📋 Project Information:"
echo "----------------------"
echo "Working directory: $(pwd)"
echo ""

echo "🔐 Code Signing Check:"
echo "----------------------"
if [ -f "ios/SwipeSavvy.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode project exists"

    # Check for signing settings
    SIGNING_STYLE=$(grep -m 1 "ProvisioningStyle" ios/SwipeSavvy.xcodeproj/project.pbxproj | sed 's/.*= \(.*\);/\1/')
    DEVELOPMENT_TEAM=$(grep -m 1 "DevelopmentTeam" ios/SwipeSavvy.xcodeproj/project.pbxproj | sed 's/.*= \(.*\);/\1/' | tr -d '";')

    echo "Provisioning Style: ${SIGNING_STYLE:-Not set}"
    echo "Development Team: ${DEVELOPMENT_TEAM:-Not set}"

    if [ -z "$DEVELOPMENT_TEAM" ] || [ "$DEVELOPMENT_TEAM" = '""' ]; then
        echo "⚠️  WARNING: No development team configured!"
        echo "   This is the most common cause of build failures."
        echo ""
        echo "   FIX: In Xcode:"
        echo "   1. Click 'SwipeSavvy' (blue icon, top of left sidebar)"
        echo "   2. Select 'SwipeSavvy' target"
        echo "   3. Click 'Signing & Capabilities' tab"
        echo "   4. Check '✓ Automatically manage signing'"
        echo "   5. Select your Apple ID from 'Team' dropdown"
        echo ""
    else
        echo "✅ Development team is configured"
    fi
else
    echo "❌ Xcode project not found at ios/SwipeSavvy.xcodeproj"
fi
echo ""

echo "📦 CocoaPods Check:"
echo "-------------------"
if [ -d "ios/Pods" ]; then
    POD_COUNT=$(find ios/Pods -maxdepth 1 -type d | wc -l | tr -d ' ')
    echo "✅ Pods directory exists ($(($POD_COUNT - 1)) pods installed)"
else
    echo "❌ Pods directory not found - run 'cd ios && pod install'"
fi
echo ""

echo "🔧 Workspace Check:"
echo "-------------------"
if [ -d "ios/SwipeSavvy.xcworkspace" ]; then
    echo "✅ Xcode workspace exists"
else
    echo "❌ Workspace not found - CocoaPods may not be installed"
fi
echo ""

echo "📱 Simulator Check:"
echo "-------------------"
xcrun simctl list devices available | grep "iPhone" | head -5
echo ""

echo "💾 Build Artifacts:"
echo "-------------------"
if [ -d "ios/build" ]; then
    echo "✅ Build directory exists"
    BUILD_SIZE=$(du -sh ios/build 2>/dev/null | cut -f1)
    echo "   Size: ${BUILD_SIZE}"
else
    echo "ℹ️  No build directory yet (normal for first build)"
fi
echo ""

echo "🔍 Recent Xcode Derived Data:"
echo "------------------------------"
DERIVED_DATA=$(ls -td ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-* 2>/dev/null | head -1)
if [ -n "$DERIVED_DATA" ]; then
    echo "✅ Found: $DERIVED_DATA"
    DERIVED_SIZE=$(du -sh "$DERIVED_DATA" 2>/dev/null | cut -f1)
    echo "   Size: ${DERIVED_SIZE}"

    # Check for recent build logs
    RECENT_LOGS=$(find "$DERIVED_DATA/Logs/Build" -name "*.xcactivitylog" -mmin -60 2>/dev/null | wc -l | tr -d ' ')
    echo "   Recent build attempts (last hour): $RECENT_LOGS"
else
    echo "ℹ️  No derived data found"
fi
echo ""

echo "🎯 Most Likely Issues & Fixes:"
echo "==============================="
echo ""

# Check for common issues
ISSUES_FOUND=0

# Issue 1: Code signing
if [ -z "$DEVELOPMENT_TEAM" ] || [ "$DEVELOPMENT_TEAM" = '""' ]; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo "❌ ISSUE #1: Code Signing Not Configured (90% of first-time failures)"
    echo "   FIX:"
    echo "   • In Xcode, click blue 'SwipeSavvy' icon (top of left sidebar)"
    echo "   • Select 'Signing & Capabilities' tab"
    echo "   • Check '✓ Automatically manage signing'"
    echo "   • Choose your Apple ID from 'Team' dropdown"
    echo "   • Press ⌘R to build again"
    echo ""
fi

# Issue 2: Missing Pods
if [ ! -d "ios/Pods" ]; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo "❌ ISSUE #2: CocoaPods Not Installed"
    echo "   FIX:"
    echo "   export LANG=en_US.UTF-8"
    echo "   cd ios && pod install && cd .."
    echo ""
fi

# Issue 3: Stale derived data
if [ -n "$DERIVED_DATA" ] && [ $RECENT_LOGS -gt 3 ]; then
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
    echo "⚠️  ISSUE #3: Multiple Build Attempts Detected"
    echo "   May have stale build cache."
    echo "   FIX:"
    echo "   • In Xcode: Product → Clean Build Folder (⇧⌘K)"
    echo "   • Or run: rm -rf ~/Library/Developer/Xcode/DerivedData/SwipeSavvy-*"
    echo ""
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ No obvious configuration issues found!"
    echo ""
    echo "To get the EXACT error:"
    echo "1. In Xcode, click the ⚠️ icon (top of left sidebar)"
    echo "2. Look for red ❌ errors in the Issue Navigator"
    echo "3. Click an error to see the full message"
    echo "4. Share the error message for specific help"
    echo ""
fi

echo "====================================="
echo "💡 Quick Commands:"
echo ""
echo "Clean and rebuild:"
echo "  ./fix-and-build.sh"
echo ""
echo "Build from command line:"
echo "  npx expo run:ios"
echo ""
echo "Open Xcode:"
echo "  open ios/SwipeSavvy.xcworkspace"
echo ""
