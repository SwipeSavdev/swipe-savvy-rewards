#!/bin/bash

# API Endpoint Validation Script - SwipeSavvy Mobile App
# This script tests all API endpoints to ensure they're working properly

set -e

# Configuration
API_BASE_URL="http://localhost:8000/api/v1"
AUTH_TOKEN="${AUTH_TOKEN:-test-token-123}"
USER_ID="${USER_ID:-user-123}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper function to test endpoints
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local require_auth=$5
    
    echo -n "Testing $name... "
    
    # Build curl command
    local curl_cmd="curl -s -X $method"
    
    if [ "$require_auth" != "false" ]; then
        curl_cmd="$curl_cmd -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd -w '\n%{http_code}' '$API_BASE_URL$endpoint'"
    
    # Execute request
    local response=$(eval $curl_cmd)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    # Check response
    if [[ "$http_code" == "200" ]] || [[ "$http_code" == "201" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "  Response: $body"
        ((FAILED++))
    fi
}

# Print header
echo "======================================"
echo "SwipeSavvy API Endpoint Validation"
echo "======================================"
echo "Base URL: $API_BASE_URL"
echo "Auth Token: ${AUTH_TOKEN:0:10}..."
echo "User ID: $USER_ID"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1] HEALTH CHECK${NC}"
test_endpoint "Health Check" "GET" "/health" "" "false"
echo ""

# Test 2: Transactions
echo -e "${YELLOW}[2] TRANSACTIONS${NC}"
test_endpoint "Get Transactions" "GET" "/transactions?limit=10"
echo ""

# Test 3: Accounts
echo -e "${YELLOW}[3] ACCOUNTS${NC}"
test_endpoint "Get Accounts" "GET" "/accounts"
test_endpoint "Get Account Balance" "GET" "/accounts/account-1/balance"
echo ""

# Test 4: Banks
echo -e "${YELLOW}[4] LINKED BANKS${NC}"
test_endpoint "Get Linked Banks" "GET" "/banks/linked"
test_endpoint "Initiate Plaid Link" "POST" "/banks/plaid-link"
echo ""

# Test 5: Transfers
echo -e "${YELLOW}[5] TRANSFERS${NC}"
test_endpoint "Get Recent Recipients" "GET" "/transfers/recipients"
transfer_data='{"recipientId":"user-2","recipientName":"John","amount":50,"currency":"USD","fundingSourceId":"account-1","type":"send"}'
test_endpoint "Submit Transfer" "POST" "/transfers" "$transfer_data"
echo ""

# Test 6: Rewards
echo -e "${YELLOW}[6] REWARDS${NC}"
test_endpoint "Get Rewards Points" "GET" "/rewards/points"
test_endpoint "Get Boosts" "GET" "/rewards/boosts"
donate_data='{"amount":100}'
test_endpoint "Donate Points" "POST" "/rewards/donate" "$donate_data"
test_endpoint "Get Leaderboard" "GET" "/rewards/leaderboard"
echo ""

# Test 7: Cards
echo -e "${YELLOW}[7] PAYMENT CARDS${NC}"
test_endpoint "Get Cards" "GET" "/cards"
card_data='{"cardNumber":"4111111111111111","expiryDate":"12/25","cvv":"123","holderName":"John Doe"}'
test_endpoint "Add Card" "POST" "/cards" "$card_data"
echo ""

# Test 8: User Preferences
echo -e "${YELLOW}[8] USER PREFERENCES${NC}"
test_endpoint "Get Preferences" "GET" "/user/preferences"
prefs_data='{"darkMode":true,"notificationsEnabled":true,"biometricsEnabled":false}'
test_endpoint "Update Preferences" "PUT" "/user/preferences" "$prefs_data"
echo ""

# Summary
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All endpoints working!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some endpoints failed. See details above.${NC}"
    exit 1
fi

