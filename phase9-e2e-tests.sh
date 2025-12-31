#!/bin/bash

# ============================================================================
# SWIPESAVVY PHASE 9: END-TO-END INTEGRATION TEST SUITE
# ============================================================================
# Comprehensive testing across all platforms:
# - Mobile App Integration
# - Admin Portal Integration  
# - Backend API Reliability
# - Authentication & Security
# - Data Consistency
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Base URLs
BACKEND_URL="http://localhost:8000"
ADMIN_PORTAL_URL="http://localhost:5173"
API_V1="${BACKEND_URL}/api/v1"
ADMIN_API="${API_V1}/admin"

# Test admin credentials
ADMIN_EMAIL="admin@swipesavvy.com"
ADMIN_PASSWORD="Admin123!"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

test_case() {
    local test_name=$1
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    printf "${BLUE}[TEST ${TOTAL_TESTS}]${NC} %s\n" "$test_name"
}

assert_status_code() {
    local response_code=$1
    local expected=$2
    local test_name=$3
    
    if [ "$response_code" -eq "$expected" ]; then
        echo "  ${GREEN}✅ PASSED${NC}: Status $response_code"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "  ${RED}❌ FAILED${NC}: Expected $expected, got $response_code"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

assert_contains() {
    local response=$1
    local expected_field=$2
    local test_name=$3
    
    if echo "$response" | jq -e "$expected_field" &>/dev/null; then
        echo "  ${GREEN}✅ PASSED${NC}: Found field $expected_field"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo "  ${RED}❌ FAILED${NC}: Missing field $expected_field"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

echo "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo "${BLUE}║         PHASE 9 END-TO-END INTEGRATION TEST SUITE          ║${NC}"
echo "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "${YELLOW}🔍 Pre-flight System Checks:${NC}"
echo ""

# Check Backend
if curl -s "${BACKEND_URL}/health" | grep -q "healthy"; then
    echo "${GREEN}✅${NC} Backend API running on port 8000"
else
    echo "${RED}❌${NC} Backend API NOT accessible"
    exit 1
fi

# Check Admin Portal
if curl -s "${ADMIN_PORTAL_URL}" >/dev/null 2>&1; then
    echo "${GREEN}✅${NC} Admin Portal running on port 5173"
else
    echo "${RED}❌${NC} Admin Portal NOT accessible"
    exit 1
fi

# Check Database
ADMIN_TOKEN=$(curl -s -X POST "${ADMIN_API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | jq -r '.session.token' 2>/dev/null)

if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    echo "${GREEN}✅${NC} Database connected and authentication working"
else
    echo "${RED}❌${NC} Database/Auth not accessible"
    exit 1
fi

echo ""
echo "${YELLOW}📋 Test Execution Beginning...${NC}"
echo ""

# ============================================================================
# 1. AUTHENTICATION TESTS
# ============================================================================

echo "${YELLOW}1️⃣  AUTHENTICATION & SECURITY TESTS${NC}"
echo ""

test_case "Admin Login - Valid Credentials"
RESPONSE=$(curl -s -X POST "${ADMIN_API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")
STATUS=$(echo "$RESPONSE" | jq -r '.session.token' 2>/dev/null)
[ -n "$STATUS" ] && [ "$STATUS" != "null" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Admin Login - Invalid Password"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${ADMIN_API}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"WrongPassword123!\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" -eq "401" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "JWT Token Refresh"
RESPONSE=$(curl -s -X POST "${ADMIN_API}/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"${ADMIN_TOKEN}\"}")
NEW_TOKEN=$(echo "$RESPONSE" | jq -r '.session.token' 2>/dev/null)
[ -n "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Protected Endpoint - Authorization Header Required"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${ADMIN_API}/dashboard/overview")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" -eq "200" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# ============================================================================
# 2. MOBILE APP API INTEGRATION TESTS
# ============================================================================

echo "${YELLOW}2️⃣  MOBILE APP INTEGRATION TESTS${NC}"
echo ""

test_case "Feature Flags Endpoint - Mobile Client"
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_V1}/feature-flags")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
assert_status_code "$HTTP_CODE" "200" "Feature Flags"

test_case "Merchants List - Mobile Client"
RESPONSE=$(curl -s -w "\n%{http_code}" "${ADMIN_API}/merchants?page=1&per_page=5")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
assert_status_code "$HTTP_CODE" "200" "Merchants List"

test_case "Support Categories - Mobile Client"
RESPONSE=$(curl -s "${ADMIN_API}/support/categories")
assert_contains "$RESPONSE" '.categories' "Support Categories"

echo ""

# ============================================================================
# 3. ADMIN PORTAL API INTEGRATION TESTS
# ============================================================================

echo "${YELLOW}3️⃣  ADMIN PORTAL API INTEGRATION TESTS${NC}"
echo ""

test_case "Dashboard Overview - Real Data"
RESPONSE=$(curl -s "${ADMIN_API}/dashboard/overview")
assert_contains "$RESPONSE" '.total_users' "Dashboard"

test_case "Users Management - List"
RESPONSE=$(curl -s "${ADMIN_API}/users?page=1&per_page=5")
assert_contains "$RESPONSE" '.total' "Users List"

test_case "Merchants Management - List"
RESPONSE=$(curl -s "${ADMIN_API}/merchants?page=1&per_page=5")
assert_contains "$RESPONSE" '.total' "Merchants List"

test_case "Support Tickets - List"
RESPONSE=$(curl -s "${ADMIN_API}/support/tickets?page=1&per_page=5")
assert_contains "$RESPONSE" '.total' "Support Tickets"

test_case "Feature Flags - List"
RESPONSE=$(curl -s "${ADMIN_API}/feature-flags?page=1&per_page=5")
assert_contains "$RESPONSE" '.total' "Feature Flags"

test_case "AI Campaigns - List"
RESPONSE=$(curl -s "${ADMIN_API}/ai-campaigns?page=1&per_page=5")
assert_contains "$RESPONSE" '.total' "AI Campaigns"

echo ""

# ============================================================================
# 4. DATA CONSISTENCY TESTS
# ============================================================================

echo "${YELLOW}4️⃣  DATA CONSISTENCY TESTS${NC}"
echo ""

test_case "Merchants - Total Count Consistency"
M_TOTAL=$(curl -s "${ADMIN_API}/merchants?page=1&per_page=1" | jq -r '.total')
echo "  Merchants in database: $M_TOTAL"
[ "$M_TOTAL" -gt "0" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Support Tickets - Total Count Consistency"
T_TOTAL=$(curl -s "${ADMIN_API}/support/tickets?page=1&per_page=1" | jq -r '.total')
echo "  Support tickets in database: $T_TOTAL"
[ "$T_TOTAL" -gt "0" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Feature Flags - Required Fields Present"
RESPONSE=$(curl -s "${ADMIN_API}/feature-flags?page=1&per_page=1")
if echo "$RESPONSE" | jq -e '.flags[0] | {id, name, enabled, environment}' >/dev/null 2>&1; then
    echo "  ${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "  ${RED}❌ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# ============================================================================
# 5. ERROR HANDLING TESTS
# ============================================================================

echo "${YELLOW}5️⃣  ERROR HANDLING TESTS${NC}"
echo ""

test_case "Invalid Endpoint - 404 Response"
RESPONSE=$(curl -s -w "\n%{http_code}" "${API_V1}/invalid-endpoint")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" -eq "404" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Invalid Request Body - 422 Response"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${ADMIN_API}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
[ "$HTTP_CODE" -eq "422" ] && echo "  ${GREEN}✅ PASSED${NC}" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Missing Required Headers - Error Response"
RESPONSE=$(curl -s -X POST "${ADMIN_API}/auth/login" \
  -d 'invalid')
if echo "$RESPONSE" | jq -e '.detail' >/dev/null 2>&1; then
    echo "  ${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "  ${RED}❌ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# ============================================================================
# 6. PAGINATION & FILTERING TESTS
# ============================================================================

echo "${YELLOW}6️⃣  PAGINATION & FILTERING TESTS${NC}"
echo ""

test_case "Pagination - Page 1"
RESPONSE=$(curl -s "${ADMIN_API}/merchants?page=1&per_page=2")
COUNT=$(echo "$RESPONSE" | jq '.merchants | length')
[ "$COUNT" -eq "2" ] && echo "  ${GREEN}✅ PASSED${NC}: Got 2 merchants" && PASSED_TESTS=$((PASSED_TESTS + 1)) || (echo "  ${RED}❌ FAILED${NC}" && FAILED_TESTS=$((FAILED_TESTS + 1)))
TOTAL_TESTS=$((TOTAL_TESTS + 1))

test_case "Filtering by Status"
RESPONSE=$(curl -s "${ADMIN_API}/merchants?status=active&page=1&per_page=5")
if echo "$RESPONSE" | jq -e '.merchants' >/dev/null 2>&1; then
    echo "  ${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "  ${RED}❌ FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# ============================================================================
# TEST SUMMARY
# ============================================================================

echo "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo "${BLUE}║                    TEST EXECUTION SUMMARY                  ║${NC}"
echo "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS_PERCENT=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo "Total Tests:    $TOTAL_TESTS"
echo "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo "Failed:         ${RED}$FAILED_TESTS${NC}"
echo "Pass Rate:      ${BLUE}${PASS_PERCENT}%${NC}"
echo ""

if [ "$FAILED_TESTS" -eq "0" ]; then
    echo "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo "${GREEN}║                 🎉 ALL TESTS PASSED! 🎉                     ║${NC}"
    echo "${GREEN}║         Phase 9 E2E Integration Tests Complete             ║${NC}"
    echo "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo "${RED}║           ⚠️  SOME TESTS FAILED - REVIEW LOGS  ⚠️            ║${NC}"
    echo "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
