#!/usr/bin/env python3
"""
Create SNS Platform Applications with proper credential handling
"""
import boto3
import json

# Read Firebase service account
with open('firebase-service-account.json', 'r') as f:
    firebase_creds = json.load(f)

# Read APNs key
with open('apns-key.pem', 'r') as f:
    apns_key = f.read().strip()

sns_client = boto3.client('sns', region_name='us-east-1')

print("="*70)
print("Creating SNS Platform Applications for Swipe Savvy")
print("="*70)

# Android with Firebase service account (full JSON)
print("\n1. Creating Android Platform Application (GCM)...")
try:
    firebase_json_str = json.dumps(firebase_creds)
    android_response = sns_client.create_platform_application(
        Name='swipesavvy-sandbox-android',
        Platform='GCM',
        Attributes={
            'PlatformCredential': firebase_json_str
        }
    )
    print(f"✅ SUCCESS: Android Platform Application Created")
    android_arn = android_response['PlatformApplicationArn']
    print(f"   ARN: {android_arn}")
except Exception as e:
    print(f"❌ FAILED: {str(e)}")
    android_arn = None

# iOS with APNs key
print("\n2. Creating iOS Platform Application (APNS_SANDBOX)...")
try:
    ios_response = sns_client.create_platform_application(
        Name='swipesavvy-sandbox-ios',
        Platform='APNS_SANDBOX',
        Attributes={
            'PlatformPrincipal': apns_key,
            'PlatformCredential': apns_key
        }
    )
    print(f"✅ SUCCESS: iOS Platform Application Created")
    ios_arn = ios_response['PlatformApplicationArn']
    print(f"   ARN: {ios_arn}")
except Exception as e:
    print(f"❌ FAILED: {str(e)}")
    ios_arn = None

# Summary
print("\n" + "="*70)
print("Platform Applications Summary:")
print("="*70)

response = sns_client.list_platform_applications()
if response['PlatformApplications']:
    print(f"\n✅ Total Applications Created: {len(response['PlatformApplications'])}")
    for app in response['PlatformApplications']:
        arn = app['PlatformApplicationArn']
        parts = arn.split('/')
        name = parts[-1]
        platform = parts[-2]
        enabled = app['Attributes'].get('Enabled', 'N/A')
        print(f"\n   Name: {name}")
        print(f"   Platform: {platform}")
        print(f"   Enabled: {enabled}")
        print(f"   ARN: {arn}")
else:
    print("\n❌ No Platform Applications were created")

# Save ARNs to config
if android_arn or ios_arn:
    config = {}
    if ios_arn:
        config['SNS_IOS_PLATFORM_APP_ARN'] = ios_arn
    if android_arn:
        config['SNS_ANDROID_PLATFORM_APP_ARN'] = android_arn
    
    with open('sns-platform-arns.json', 'w') as f:
        json.dump(config, f, indent=2)
    print("\n✅ ARNs saved to sns-platform-arns.json")
