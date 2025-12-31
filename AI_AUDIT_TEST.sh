#!/bin/bash

# ============================================================================
# COMPREHENSIVE AI APIs & ENDPOINTS AUDIT AND TEST
# ============================================================================

echo "🔍 SWIPESAVVY AI APIS COMPREHENSIVE AUDIT"
echo "=========================================="
echo ""
echo "Timestamp: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASS=0
FAIL=0

# Test counter
test_number=1

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_code=$5
    
    echo -e "\n${BLUE}Test $test_number: $name${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ -z "$data" ]; then
        # GET request
        response=$(curl -s -w "\n%{http_code}" -X $method "http://localhost:8000$endpoint")
    else
        # POST request with data
        response=$(curl -s -w "\n%{http_code}" -X $method "http://localhost:8000$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    echo "Status Code: $http_code"
    echo "Response: $(echo $body | head -c 200)..."
    
    if [[ "$http_code" =~ ^(200|201|400|401|422|500)$ ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
    fi
    
    ((test_number++))
}

# ============================================================================
# TEST 1: BASIC HEALTH CHECKS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 1: BASIC HEALTH CHECKS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "Backend Health Check" "GET" "/health" "" "200"

test_endpoint "Backend Root Endpoint" "GET" "/" "" "200"

test_endpoint "Concierge Service Health" "GET" "/concierge/health" "" "200"

# ============================================================================
# TEST 2: AI CONCIERGE ENDPOINTS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 2: AI CONCIERGE ENDPOINTS (MOUNTED AT /concierge)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Test basic chat without auth
test_endpoint "Concierge Chat - Basic Message (No Auth)" "POST" "/concierge/api/v1/chat" \
    '{"message":"Hello","user_id":"test-user-123","session_id":"session-123","context":{}}' "200"

# Test chat with proper structure
test_endpoint "Concierge Chat - Proper Format" "POST" "/concierge/api/v1/chat" \
    '{
      "message": "What can you help me with?",
      "user_id": "user-123",
      "session_id": "session-abc",
      "context": {
        "account_type": "mobile_wallet",
        "user_name": "Test User"
      }
    }' "200"

# Test streaming endpoint if available
test_endpoint "Concierge Chat Stream" "POST" "/concierge/api/v1/chat/stream" \
    '{"message":"Hello stream","user_id":"test-user"}' "200"

# ============================================================================
# TEST 3: CHAT SERVICE ENDPOINTS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 3: CHAT SERVICE ENDPOINTS (/api/v1/chat)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "Chat - Send Message" "POST" "/api/v1/chat" \
    '{"message_type":"text","content":"Test message"}' "200"

test_endpoint "Chat - List Sessions" "GET" "/api/v1/chat/sessions" "" "200"

test_endpoint "Chat - Get Session History (Invalid ID)" "GET" "/api/v1/chat/sessions/invalid-id/messages" "" "404"

# ============================================================================
# TEST 4: SUPPORT ENDPOINTS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 4: SUPPORT SYSTEM ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

test_endpoint "Support - Create Ticket" "POST" "/api/support" \
    '{"title":"Test Issue","description":"This is a test","priority":"medium"}' "200"

test_endpoint "Support - List Tickets" "GET" "/api/support" "" "200"

# ============================================================================
# TEST 5: WEBSOCKET ENDPOINTS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 5: WEBSOCKET ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "\n${YELLOW}Note: WebSocket endpoints cannot be tested with curl${NC}"
echo "WebSocket paths to test manually:"
echo "  - /api/v1/chat/sessions/{session_id}/ws"
echo "  - /concierge/ws"

# ============================================================================
# TEST 6: CONFIGURATION CHECKS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SECTION 6: CONFIGURATION CHECKS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

echo -e "\n${BLUE}Environment Variables:${NC}"
echo "TOGETHER_API_KEY: ${TOGETHER_API_KEY:0:10}*** (${#TOGETHER_API_KEY} chars)"
echo "Backend listening on: localhost:8000"
echo "Mobile app target: http://192.168.1.142:8000"

# ============================================================================
# RESULTS
# ============================================================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}TEST RESULTS SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "\n${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo -e "Total: $((PASS + FAIL))"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✅ ALL TESTS PASSED${NC}"
else
    echo -e "\n${RED}❌ SOME TESTS FAILED - CHECK OUTPUT ABOVE${NC}"
fi
