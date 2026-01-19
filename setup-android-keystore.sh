#!/bin/bash

# SwipeSavvy Android Keystore Setup Script
# Generates a new keystore for signing Android production builds
# Usage: ./setup-android-keystore.sh

echo "🔐 SwipeSavvy Android Keystore Generator"
echo "========================================="
echo ""

# Set defaults
KEYSTORE_DIR="$HOME/.android"
KEYSTORE_FILE="$KEYSTORE_DIR/swipesavvy.jks"
KEY_ALIAS="swipesavvy-key"
VALIDITY_DAYS="10957"  # ~30 years

# Ensure .android directory exists
mkdir -p "$KEYSTORE_DIR"

# Check if keystore already exists
if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  Keystore already exists at: $KEYSTORE_FILE"
    echo ""
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Keeping existing keystore."
        exit 0
    fi
fi

echo "This script will generate a new Android keystore for signing production builds."
echo ""

# Prompt for credentials
read -p "Enter keystore password (min 6 characters): " -s KEYSTORE_PASSWORD
echo ""
read -p "Re-enter keystore password: " -s KEYSTORE_PASSWORD_CHECK
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CHECK" ]; then
    echo "❌ Passwords do not match. Exiting."
    exit 1
fi

if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    echo "❌ Password must be at least 6 characters. Exiting."
    exit 1
fi

read -p "Enter key password (min 6 characters): " -s KEY_PASSWORD
echo ""
read -p "Re-enter key password: " -s KEY_PASSWORD_CHECK
echo ""

if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CHECK" ]; then
    echo "❌ Passwords do not match. Exiting."
    exit 1
fi

if [ ${#KEY_PASSWORD} -lt 6 ]; then
    echo "❌ Password must be at least 6 characters. Exiting."
    exit 1
fi

echo ""
read -p "Enter your name (for certificate): " CERT_NAME
read -p "Enter your organizational unit (e.g., Mobile): " ORG_UNIT
read -p "Enter your organization (e.g., SwipeSavvy Inc.): " ORGANIZATION
read -p "Enter your country code (e.g., US): " COUNTRY

echo ""
echo "Generating keystore..."
echo ""

# Generate the keystore
keytool -genkey-dname "cn=$CERT_NAME, ou=$ORG_UNIT, o=$ORGANIZATION, c=$COUNTRY" \
  -alias "$KEY_ALIAS" \
  -keystore "$KEYSTORE_FILE" \
  -keyalg RSA \
  -keysize 4096 \
  -validity "$VALIDITY_DAYS" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD"

if [ $? -eq 0 ]; then
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "Keystore Details:"
    echo "=================="
    echo "Location:        $KEYSTORE_FILE"
    echo "Key Alias:       $KEY_ALIAS"
    echo "Algorithm:       RSA 4096-bit"
    echo "Valid for:       $VALIDITY_DAYS days (~30 years)"
    echo ""
    
    # Verify the keystore
    echo "Verifying keystore..."
    keytool -list -v -keystore "$KEYSTORE_FILE" -storepass "$KEYSTORE_PASSWORD" | grep -A 5 "Alias name:"
    
    echo ""
    echo "⚠️  IMPORTANT - SAVE THESE PASSWORDS SECURELY:"
    echo "================================================"
    echo "Keystore Password: $KEYSTORE_PASSWORD"
    echo "Key Password:      $KEY_PASSWORD"
    echo ""
    echo "You'll need these for building Android production releases."
    echo "Consider saving them in a secure password manager."
    echo ""
    
    # Save configuration to a local file (with warnings)
    CONFIG_FILE="/Users/papajr/Documents/Projects-2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards/.android-keystore-config"
    cat > "$CONFIG_FILE" << EOF
# Android Keystore Configuration
# ⚠️ KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT

KEYSTORE_PATH="$KEYSTORE_FILE"
KEYSTORE_PASSWORD="$KEYSTORE_PASSWORD"
KEY_ALIAS="$KEY_ALIAS"
KEY_PASSWORD="$KEY_PASSWORD"
EOF
    
    chmod 600 "$CONFIG_FILE"
    echo "Configuration saved to: $CONFIG_FILE"
    echo "⚠️ This file contains passwords - keep it secure and don't commit to git!"
    echo ""
    echo "🎉 Keystore setup complete!"
else
    echo "❌ Failed to generate keystore. Please try again."
    exit 1
fi
