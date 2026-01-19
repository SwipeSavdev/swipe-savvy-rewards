#!/bin/bash

# SwipeSavvy EAS Cloud Build Script

set -e

echo "🚀 SwipeSavvy EAS Cloud Build"
echo "================================"
echo ""

# Check if EAS project is initialized
if ! grep -q "projectId" app.json; then
    echo "📋 Step 1: Initialize EAS Project"
    echo ""
    echo "⚠️  This step requires interactive input."
    echo "When prompted, press 'y' and ENTER to create the project."
    echo ""
    read -p "Press ENTER to continue..."
    
    npx eas init
    
    echo ""
    echo "✅ EAS project initialized!"
    echo ""
else
    echo "✅ EAS project already initialized"
    echo ""
fi

echo "📦 Step 2: Build iOS Development App"
echo ""
echo "This will:"
echo "  - Upload code to Expo cloud"
echo "  - Build native iOS app"
echo "  - Generate downloadable .app file"
echo ""
echo "Expected time: 10-20 minutes"
echo ""
read -p "Press ENTER to start build..."

npx eas build --profile development --platform ios

echo ""
echo "🎉 Build Complete!"
echo ""
echo "Next steps:"
echo "  1. Install: npx expo install:ios"
echo "  2. Start dev server: npx expo start --dev-client"
echo "  3. Launch app on simulator"
echo ""
