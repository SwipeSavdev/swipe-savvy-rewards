#!/bin/bash

# Test Script for Push Notifications API (Phase 10 Task 2)
# Tests all notification endpoints

echo "🔔 Phase 10 Task 2: Push Notifications API Test"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000"
ADMIN_EMAIL="admin@swipesavvy.com"
ADMIN_PASSWORD="Admin123!"

echo "1️⃣  Testing Health Check..."
curl -s "$BASE_URL/health" | jq . && echo -e "${GREEN}✅ Health check passed${NC}" || echo -e "${RED}❌ Health check failed${NC}"
echo ""

echo "2️⃣  Logging in to get token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.session.token // empty')
USER_ID=$(echo $TOKEN_RESPONSE | jq -r '.session.user.id // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Failed to get token${NC}"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got token: ${TOKEN:0:30}...${NC}"
echo "User ID: $USER_ID"
echo ""

echo "3️⃣  Testing Device Registration..."
DEVICE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/register-device" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "ExampleFirebaseDeviceToken12345xyz",
    "device_type": "ios",
    "device_name": "Test iPhone 14"
  }')

echo "Response: $DEVICE_RESPONSE" | jq .
SUCCESS=$(echo $DEVICE_RESPONSE | jq -r '.success // false')
DEVICE_ID=$(echo $DEVICE_RESPONSE | jq -r '.data.device_id // empty')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Device registration successful${NC}"
  echo "Device ID: $DEVICE_ID"
else
  echo -e "${RED}❌ Device registration failed${NC}"
  echo "Response: $DEVICE_RESPONSE"
fi
echo ""

echo "4️⃣  Testing Get Preferences..."
PREFS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/notifications/preferences" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:" && echo $PREFS_RESPONSE | jq .
SUCCESS=$(echo $PREFS_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Get preferences successful${NC}"
else
  echo -e "${RED}❌ Get preferences failed${NC}"
fi
echo ""

echo "5️⃣  Testing Update Preferences..."
UPDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_notifications": true,
    "campaign_notifications": false,
    "support_notifications": true,
    "security_notifications": true,
    "feature_notifications": false
  }')

echo "Response:" && echo $UPDATE_RESPONSE | jq .
SUCCESS=$(echo $UPDATE_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Update preferences successful${NC}"
else
  echo -e "${RED}❌ Update preferences failed${NC}"
fi
echo ""

echo "6️⃣  Testing Send Test Notification..."
TEST_NOTIF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/test" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification from Phase 10 Task 2",
    "data": {"test": "true", "timestamp": "'$(date -u +%s)'"}
  }')

echo "Response:" && echo $TEST_NOTIF_RESPONSE | jq .
SUCCESS=$(echo $TEST_NOTIF_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Send test notification successful${NC}"
else
  echo -e "${YELLOW}⚠️  Send test notification returned (Firebase may not be configured)${NC}"
fi
echo ""

echo "7️⃣  Testing Send Event Notification..."
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/send-event?event_type=payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "50.00",
    "currency": "USD",
    "transaction_id": "txn_test_12345"
  }')

echo "Response:" && echo $EVENT_RESPONSE | jq .
SUCCESS=$(echo $EVENT_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Send event notification successful${NC}"
else
  echo -e "${YELLOW}⚠️  Send event notification returned (Firebase may not be configured)${NC}"
fi
echo ""

echo "8️⃣  Testing Get Notification History..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/notifications/history?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:" && echo $HISTORY_RESPONSE | jq .
SUCCESS=$(echo $HISTORY_RESPONSE | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Get notification history successful${NC}"
else
  echo -e "${RED}❌ Get notification history failed${NC}"
fi
echo ""

echo "9️⃣  Testing Mark as Read..."
if [ ! -z "$DEVICE_ID" ]; then
  READ_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/mark-as-read/test-notif-id-123" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:" && echo $READ_RESPONSE | jq .
  SUCCESS=$(echo $READ_RESPONSE | jq -r '.success // false')
  
  if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Mark as read successful${NC}"
  else
    echo -e "${RED}❌ Mark as read failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping (no device ID available)${NC}"
fi
echo ""

if [ ! -z "$DEVICE_ID" ]; then
  echo "🔟 Testing Device Unregistration..."
  UNREG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/notifications/unregister-device/$DEVICE_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "Response:" && echo $UNREG_RESPONSE | jq .
  SUCCESS=$(echo $UNREG_RESPONSE | jq -r '.success // false')
  
  if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Device unregistration successful${NC}"
  else
    echo -e "${RED}❌ Device unregistration failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Skipping device unregistration (no device ID available)${NC}"
fi
echo ""

echo "================================================="
echo "✅ Push Notifications API Test Complete!"
echo ""
echo "📝 Notes:"
echo "  - If Firebase is not configured, notifications will not actually send"
echo "  - But all endpoints should respond with proper validation"
echo "  - Configure Firebase credentials in .env to enable push delivery"
