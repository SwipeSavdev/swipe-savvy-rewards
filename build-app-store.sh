#!/bin/bash

# SwipeSavvy iOS App Store Submission Script
# This script automates the build and submission process for App Store

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEAM_ID="CL5DJUWXZY"
BUNDLE_ID="com.swipesavvy.mobileapp"
APP_NAME="SwipeSavvy"
VERSION="1.0.0"
BUILD_DIR="build"
IPA_DIR="ipa_exports"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SwipeSavvy iOS App Store Build${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print section headers
print_header() {
    echo -e "${YELLOW}>>> $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Verify prerequisites
print_header "Step 1: Verifying Prerequisites"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm found"

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    print_header "Installing EAS CLI"
    npm install -g eas-cli
fi
print_success "EAS CLI installed"

# Check if Xcode is installed
if ! xcode-select -p &> /dev/null; then
    print_error "Xcode is not installed"
    exit 1
fi
print_success "Xcode installed"

# Step 2: Verify app configuration
print_header "Step 2: Verifying App Configuration"

if [ ! -f "app.json" ]; then
    print_error "app.json not found"
    exit 1
fi
print_success "app.json found"

if [ ! -f "eas.json" ]; then
    print_error "eas.json not found. Creating one..."
    cat > eas.json << 'EOF'
{
  "build": {
    "preview": {
      "ios": {
        "buildType": "preview"
      }
    },
    "preview2": {
      "ios": {
        "buildType": "preview"
      }
    },
    "preview3": {
      "ios": {
        "buildType": "preview"
      }
    },
    "production": {
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
    print_success "Created eas.json"
fi
print_success "eas.json configured"

# Step 3: Clean environment
print_header "Step 3: Cleaning Build Environment"

# Clear Expo cache
if [ -d "$HOME/.expo" ]; then
    print_header "Clearing Expo cache"
    rm -rf "$HOME/.expo/cache/*" 2>/dev/null || true
fi

# Clear Xcode derived data
if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
    print_header "Clearing Xcode derived data"
    rm -rf "$HOME/Library/Developer/Xcode/DerivedData/*" 2>/dev/null || true
fi

# Clean node_modules cache
print_header "Clearing npm cache"
npm cache clean --force

print_success "Build environment cleaned"

# Step 4: Install dependencies
print_header "Step 4: Installing Dependencies"

if [ -f "package.json" ]; then
    print_header "Installing npm packages"
    npm install
    print_success "npm packages installed"
fi

# Step 5: Prebuild iOS
print_header "Step 5: Prebuilding iOS"

print_header "Running Expo prebuild (this may take a few minutes)"
expo prebuild --platform ios --clean

print_success "iOS prebuild complete"

# Step 6: Verify Xcode project
print_header "Step 6: Verifying Xcode Project"

if [ ! -d "ios/SwipeSavvy.xcworkspace" ]; then
    print_error "Xcode workspace not found at ios/SwipeSavvy.xcworkspace"
    exit 1
fi
print_success "Xcode workspace verified"

# Step 7: Check code signing
print_header "Step 7: Checking Code Signing Setup"

SIGNING_CERTS=$(security find-identity -v -p codesigning | grep "Apple Distribution" | wc -l)
if [ "$SIGNING_CERTS" -eq 0 ]; then
    print_error "No Apple Distribution certificates found in keychain"
    print_error "Please follow the code signing guide to create a certificate"
    exit 1
fi
print_success "Code signing certificate found ($SIGNING_CERTS certificate(s))"

# Check for provisioning profile
if [ ! -f "$HOME/Library/MobileDevice/Provisioning Profiles/SwipeSavvy-AppStore-Production.mobileprovision" ]; then
    print_error "Provisioning profile not found"
    print_error "Please download it from Apple Developer and add to Xcode"
    exit 1
fi
print_success "Provisioning profile found"

# Step 8: Option to build locally or with EAS
print_header "Step 8: Choosing Build Method"

echo -e "${YELLOW}Choose build method:${NC}"
echo "  1) EAS Build (Recommended) - Builds on Apple's cloud servers"
echo "  2) Local Xcode Build - Builds on your Mac"
echo ""
read -p "Select option (1 or 2): " BUILD_METHOD

if [ "$BUILD_METHOD" == "1" ]; then
    # EAS Build
    print_header "Building with EAS"
    
    # Check if logged into EAS
    eas whoami > /dev/null 2>&1 || eas login
    
    print_header "Starting EAS build (this will take 10-15 minutes)"
    eas build --platform ios --build-profile production
    
    print_success "EAS build complete"
    print_header "Your app is now processing in App Store Connect"
    print_header "Monitor at: https://appstoreconnect.apple.com"
    
elif [ "$BUILD_METHOD" == "2" ]; then
    # Local Xcode Build
    print_header "Building with local Xcode"
    
    cd ios
    
    print_header "Building SwipeSavvy for App Store"
    xcodebuild -workspace SwipeSavvy.xcworkspace \
        -scheme SwipeSavvy \
        -configuration Release \
        -derivedDataPath "$BUILD_DIR" \
        -archivePath "$BUILD_DIR/SwipeSavvy.xcarchive" \
        archive
    
    print_success "Archive created"
    
    # Export IPA
    print_header "Exporting IPA"
    
    mkdir -p "$IPA_DIR"
    
    xcodebuild -exportArchive \
        -archivePath "$BUILD_DIR/SwipeSavvy.xcarchive" \
        -exportPath "$IPA_DIR" \
        -exportOptionsPlist ../ExportOptions.plist
    
    print_success "IPA exported to $IPA_DIR"
    
    # Validate IPA
    print_header "Validating IPA"
    altool --validate-app \
        -f "$IPA_DIR/SwipeSavvy.ipa" \
        -t ios \
        -u "$APPLE_ID" \
        -p "$APPLE_ID_PASSWORD"
    
    print_success "IPA validation passed"
    
    # Upload to App Store Connect
    print_header "Uploading to App Store Connect"
    altool --upload-app \
        -f "$IPA_DIR/SwipeSavvy.ipa" \
        -t ios \
        -u "$APPLE_ID" \
        -p "$APPLE_ID_PASSWORD"
    
    print_success "Upload complete"
    
    cd ..
    
else
    print_error "Invalid option selected"
    exit 1
fi

# Step 9: Post-build information
print_header "Step 9: Next Steps"

echo ""
echo -e "${BLUE}Build process complete! ${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Go to https://appstoreconnect.apple.com"
echo "2. Select your app: $APP_NAME"
echo "3. Go to: iOS App > Version Release"
echo "4. Wait for build to be processed (5-10 minutes)"
echo "5. Once 'Ready to Submit', upload screenshots:"
echo "   - Need 6-8 screenshots per device size"
echo "   - iPhone 6.7\", 6.1\", 5.5\""
echo "6. Fill in metadata:"
echo "   - Description"
echo "   - Keywords"
echo "   - Support URL: https://swipesavvy.com/support"
echo "   - Privacy Policy URL: https://swipesavvy.com/privacy"
echo "7. Click 'Submit for Review'"
echo "8. Expected review time: 24-48 hours"
echo ""
echo -e "${YELLOW}Important Reminders:${NC}"
echo "- Ensure all metadata is accurate"
echo "- Screenshots must show app features clearly"
echo "- Privacy policy must be live at public URL"
echo "- Test push notifications before submitting"
echo "- Check build status in TestFlight"
echo ""
echo -e "${YELLOW}Helpful Commands:${NC}"
echo "eas builds                    # View all builds"
echo "eas logs -p ios               # View build logs"
echo "eas analytics --platform ios  # View analytics"
echo ""

# Step 10: Create submission checklist
print_header "Creating Submission Checklist"

CHECKLIST_FILE="APP_STORE_SUBMISSION_CHECKLIST.md"
cat > "$CHECKLIST_FILE" << 'EOF'
# App Store Submission Checklist for SwipeSavvy v1.0.0

## Pre-Submission

- [ ] Build is uploaded and processing in App Store Connect
- [ ] Build appears in "Builds" section (may take 5-10 minutes)
- [ ] Build status shows "Ready to Submit"
- [ ] No build processing errors
- [ ] App icons are correct (1024x1024px)
- [ ] Splash screen is configured

## Screenshots & Preview

- [ ] Screenshots created for iPhone 6.7" (1290x2796px)
- [ ] Screenshots created for iPhone 6.1" (1170x2532px)
- [ ] Screenshots created for iPhone 5.5" (1242x2208px)
- [ ] Screenshots are clear and show key features
- [ ] Screenshots have text overlay explaining features (optional)
- [ ] Preview video created (optional but recommended)
- [ ] Preview is 15-30 seconds showing app workflow

## App Metadata

- [ ] App Title: "SwipeSavvy - Smart Rewards"
- [ ] Subtitle: "Earn rewards on every purchase"
- [ ] Description is complete and compelling (under 4000 characters)
- [ ] Keywords are relevant (up to 100 characters)
- [ ] Support URL is live and accessible
- [ ] Privacy Policy URL is live and accessible
- [ ] Promotional artwork uploaded (1024x768px)
- [ ] App Category: Finance ✓

## Capabilities & Entitlements

- [ ] Push Notifications capability is enabled
- [ ] Sign in with Apple capability is enabled
- [ ] Keychain sharing is enabled
- [ ] Associated Domains configured
- [ ] Location permissions explained
- [ ] Camera permissions explained
- [ ] Face ID permissions explained
- [ ] Entitlements file includes aps-environment: production

## Privacy & Compliance

- [ ] Age Rating questionnaire completed
- [ ] Content Rights confirmed
- [ ] Privacy Policy covers all data collection
- [ ] No hardcoded API keys or passwords
- [ ] No hardcoded test credentials
- [ ] Encryption declaration (if applicable)
- [ ] COPPA compliance (if serving under 13)
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified

## Testing & Quality

- [ ] App tested on TestFlight for 24+ hours
- [ ] No crashes or hangs
- [ ] Push notifications tested and working
- [ ] Deep linking tested
- [ ] Card linking functionality tested
- [ ] Rewards earning tested
- [ ] Redemption flow tested
- [ ] All permissions tested
- [ ] Sign in with Apple tested
- [ ] Biometric auth tested

## Build Details

- [ ] Build version number is 1.0.0
- [ ] Bundle ID is correct: com.swipesavvy.mobileapp
- [ ] Team ID is correct: CL5DJUWXZY
- [ ] Code signing certificate is valid
- [ ] Provisioning profile is correct
- [ ] No warnings in build log
- [ ] No errors in build log
- [ ] Architecture includes arm64
- [ ] Minimum iOS version is 14.0

## Review Information

- [ ] Contact name provided
- [ ] Contact email provided
- [ ] Contact phone number provided
- [ ] Test account email: test@swipesavvy.com
- [ ] Test account password provided
- [ ] Explanation of app features included
- [ ] Third-party libraries disclosed
- [ ] API endpoints are HTTPS

## Legal & Business

- [ ] Terms of Service reviewed
- [ ] Privacy Policy reviewed and signed
- [ ] Copyright notice included
- [ ] License agreements reviewed
- [ ] Export compliance checked (if applicable)
- [ ] Pricing is correct: Free ✓
- [ ] Availability set to all countries
- [ ] Release date preference set

## Submission

- [ ] All metadata saved in App Store Connect
- [ ] Build selected for release
- [ ] Version notes added
- [ ] Ready to Submit button available
- [ ] Final review of all fields completed
- [ ] Submitted for App Review
- [ ] Confirmation email received

## Post-Submission

- [ ] Monitoring App Store Connect daily
- [ ] Responding to reviewer questions within 24 hours
- [ ] Crash logs checked (should be 0)
- [ ] Ready with fixes if rejection occurs
- [ ] Have backup build ready if needed

---

## Submission Status Tracking

**Submitted Date**: _______________
**Review Started**: _______________
**Status**: _______________
**Review Notes**: _________________________________________________________________

## If Rejected

- [ ] Read rejection reason carefully
- [ ] Note which guideline was violated
- [ ] Fix the issue in code
- [ ] Rebuild and resubmit
- [ ] Add note explaining the fix
- [ ] Respond to reviewer via App Store Connect

---

**Start Date**: January 2025
**Expected Review**: 24-48 hours
**Status**: Ready for Submission ✓
EOF

print_success "Submission checklist created: $CHECKLIST_FILE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_success "Ready for App Store submission"
echo ""
