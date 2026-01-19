#!/bin/bash
set -e

echo "🔐 Configuring Xcode Code Signing"
echo "==================================="
echo ""

cd "$(dirname "$0")"

# Check if project exists
if [ ! -f "ios/SwipeSavvy.xcodeproj/project.pbxproj" ]; then
    echo "❌ Error: Xcode project not found"
    exit 1
fi

echo "📝 Updating project.pbxproj for automatic signing..."

# Backup the original file
cp ios/SwipeSavvy.xcodeproj/project.pbxproj ios/SwipeSavvy.xcodeproj/project.pbxproj.backup

# Add automatic signing to both Debug and Release configurations
# We'll use sed to add the settings right after CODE_SIGN_ENTITLEMENTS

# For Debug configuration (around line 352)
sed -i.tmp '352 a\
				CODE_SIGN_STYLE = Automatic;\
				DEVELOPMENT_TEAM = "";
' ios/SwipeSavvy.xcodeproj/project.pbxproj

# For Release configuration (around line 388)
sed -i.tmp '390 a\
				CODE_SIGN_STYLE = Automatic;\
				DEVELOPMENT_TEAM = "";
' ios/SwipeSavvy.xcodeproj/project.pbxproj

# Clean up temp files
rm -f ios/SwipeSavvy.xcodeproj/project.pbxproj.tmp

echo "✅ Project configured for automatic signing"
echo ""
echo "⚠️  IMPORTANT: You still need to select your Apple ID in Xcode:"
echo ""
echo "   1. In Xcode, click the blue 'SwipeSavvy' icon (top of left sidebar)"
echo "   2. Make sure 'SwipeSavvy' is selected under TARGETS"
echo "   3. Click 'Signing & Capabilities' tab"
echo "   4. You should now see 'Automatically manage signing' is checked"
echo "   5. From the 'Team' dropdown, select your Apple ID"
echo "   6. Press ⌘R to build"
echo ""
echo "If you don't see your Apple ID:"
echo "   • Xcode → Settings → Accounts"
echo "   • Click '+' and add your Apple ID"
echo "   • Then return to Signing & Capabilities and select it"
echo ""
