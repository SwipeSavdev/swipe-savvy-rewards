#!/bin/bash

# SwipeSavvy Admin Portal - Comprehensive API Test Suite
# This script tests all endpoints, workflows, and error handling

set -e

API_BASE="http://localhost:8000"
ADMIN_EMAIL="admin@swipesavvy.com"
ADMIN_PASSWORD="Admin123!"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# ==============================================================================
# Helper Functions
# ==============================================================================

log_test() {
  TOTAL=$((TOTAL + 1))
  echo -e "${BLUE}[TEST $TOTAL]${NC} $1"
}

pass() {
  PASSED=$((PASSED + 1))
  echo -e "${GREEN}✅ PASS${NC}: $1"
}

fail() {
  FAILED=$((FAILED + 1))
  echo -e "${RED}❌ FAIL${NC}: $1"
}

assert_status() {
  local expected=$1
  local actual=$2
  local msg=$3
  
  if [ "$actual" -eq "$expected" ]; then
    pass "$msg (status: $actual)"
  else
    fail "$msg (expected: $expected, got: $actual)"
  fi
}

assert_field_exists() {
  local response=$1
  local field=$2
  local msg=$3
  
  if echo "$response" | jq -e "$field" > /dev/null 2>&1; then
    pass "$msg"
  else
    fail "$msg (field not found: $field)"
  fi
}

# ==============================================================================
# PHASE 1: Authentication Workflow
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}PHASE 1: AUTHENTICATION WORKFLOW${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

# Test 1.1: Login with valid credentials
log_test "Login with valid credentials"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

STATUS=$(echo "$LOGIN_RESPONSE" | jq -r '.session.token' 2>/dev/null)
if [ ! -z "$STATUS" ] && [ "$STATUS" != "null" ]; then
  ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.session.token')
  pass "Login successful, JWT token received"
  echo "Token: ${ADMIN_TOKEN:0:50}..."
else
  fail "Login failed, no token in response"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# Test 1.2: Verify user data in login response
log_test "Verify user data in login response"
assert_field_exists "$LOGIN_RESPONSE" '.session.user.id' "User ID present"
assert_field_exists "$LOGIN_RESPONSE" '.session.user.email' "User email present"
assert_field_exists "$LOGIN_RESPONSE" '.session.user.role' "User role present"

# Test 1.3: Get current user info
log_test "Get current user info with valid token"
USER_RESPONSE=$(curl -s -X GET "$API_BASE/api/v1/admin/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$USER_RESPONSE" '.id' "Current user ID"
assert_field_exists "$USER_RESPONSE" '.email' "Current user email"

# Test 1.4: Try login with invalid password
log_test "Login with invalid password"
INVALID_LOGIN=$(curl -s -X POST "$API_BASE/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"WrongPassword\"}")

STATUS_CODE=$(echo "$INVALID_LOGIN" | tail -n 1)
assert_status 401 "$STATUS_CODE" "Invalid password returns 401"

# Test 1.5: Try login with non-existent email
log_test "Login with non-existent email"
NONEXIST_LOGIN=$(curl -s -X POST "$API_BASE/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -w "\n%{http_code}" \
  -d "{\"email\":\"nonexistent@test.com\",\"password\":\"AnyPassword\"}")

STATUS_CODE=$(echo "$NONEXIST_LOGIN" | tail -n 1)
assert_status 401 "$STATUS_CODE" "Non-existent email returns 401"

# Test 1.6: Token refresh
log_test "Token refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/admin/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$ADMIN_TOKEN\"}")

NEW_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.token' 2>/dev/null)
if [ ! -z "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
  ADMIN_TOKEN=$NEW_TOKEN
  pass "Token refreshed successfully"
else
  fail "Token refresh failed"
fi

# ==============================================================================
# PHASE 2: Dashboard & Analytics Endpoints
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}PHASE 2: DASHBOARD & ANALYTICS ENDPOINTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

# Test 2.1: Dashboard Overview
log_test "Get dashboard overview"
DASHBOARD=$(curl -s -X GET "$API_BASE/api/v1/admin/dashboard/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$DASHBOARD" '.total_users' "Total users in overview"
assert_field_exists "$DASHBOARD" '.total_merchants' "Total merchants in overview"
assert_field_exists "$DASHBOARD" '.total_revenue' "Total revenue in overview"
assert_field_exists "$DASHBOARD" '.recent_activity' "Recent activity in overview"

# Test 2.2: Analytics Overview
log_test "Get analytics overview"
ANALYTICS=$(curl -s -X GET "$API_BASE/api/v1/admin/analytics/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$ANALYTICS" '.active_users' "Active users metric"
assert_field_exists "$ANALYTICS" '.daily_transactions' "Daily transactions metric"

# Test 2.3: Transactions Chart
log_test "Get transactions chart data"
TRANSACTIONS=$(curl -s -X GET "$API_BASE/api/v1/admin/analytics/transactions?days=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$TRANSACTIONS" '.data' "Transaction data array"

# Test 2.4: Revenue Chart
log_test "Get revenue chart data"
REVENUE=$(curl -s -X GET "$API_BASE/api/v1/admin/analytics/revenue?days=30" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$REVENUE" '.data' "Revenue data array"

# Test 2.5: Onboarding Funnel
log_test "Get onboarding funnel metrics"
FUNNEL=$(curl -s -X GET "$API_BASE/api/v1/admin/analytics/funnel/onboarding" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$FUNNEL" '.stages' "Funnel stages"

# Test 2.6: Cohort Retention
log_test "Get cohort retention data"
COHORT=$(curl -s -X GET "$API_BASE/api/v1/admin/analytics/cohort/retention" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$COHORT" '.cohorts' "Cohort data"

# Test 2.7: Support Stats
log_test "Get support statistics"
SUPPORT=$(curl -s -X GET "$API_BASE/api/v1/admin/support/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$SUPPORT" '.open_tickets' "Open tickets count"
assert_field_exists "$SUPPORT" '.avg_response_time' "Average response time"

# ==============================================================================
# PHASE 3: User Management Endpoints
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}PHASE 3: USER MANAGEMENT ENDPOINTS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

# Test 3.1: List users
log_test "List all users"
USERS_LIST=$(curl -s -X GET "$API_BASE/api/v1/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$USERS_LIST" '.users' "Users array"
assert_field_exists "$USERS_LIST" '.total' "Total users count"
assert_field_exists "$USERS_LIST" '.page' "Page number"
assert_field_exists "$USERS_LIST" '.per_page' "Per page value"

FIRST_USER_ID=$(echo "$USERS_LIST" | jq -r '.users[0].id' 2>/dev/null)

# Test 3.2: List users with pagination
log_test "List users with pagination (page 1, 2 per page)"
USERS_PAGINATED=$(curl -s -X GET "$API_BASE/api/v1/admin/users?page=1&per_page=2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

ITEMS_COUNT=$(echo "$USERS_PAGINATED" | jq '.users | length')
if [ "$ITEMS_COUNT" -le 2 ]; then
  pass "Pagination working (returned $ITEMS_COUNT items)"
else
  fail "Pagination not working (returned $ITEMS_COUNT items, expected <= 2)"
fi

# Test 3.3: List users with status filter
log_test "List users with status filter"
USERS_ACTIVE=$(curl -s -X GET "$API_BASE/api/v1/admin/users?status=active" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$USERS_ACTIVE" '.users' "Users array from filtered list"

# Test 3.4: Get specific user
if [ ! -z "$FIRST_USER_ID" ] && [ "$FIRST_USER_ID" != "null" ]; then
  log_test "Get specific user details"
  USER_DETAIL=$(curl -s -X GET "$API_BASE/api/v1/admin/users/$FIRST_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  
  assert_field_exists "$USER_DETAIL" '.id' "User ID in detail"
  assert_field_exists "$USER_DETAIL" '.email' "User email in detail"
  assert_field_exists "$USER_DETAIL" '.status' "User status in detail"
fi

# Test 3.5: Create new user
log_test "Create new user"
NEW_USER_EMAIL="testuser_$(date +%s)@test.com"
CREATE_USER=$(curl -s -X POST "$API_BASE/api/v1/admin/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\n%{http_code}" \
  -d "{\"email\":\"$NEW_USER_EMAIL\",\"name\":\"Test User\",\"phone\":\"+1-555-9999\",\"invite\":true}")

STATUS_CODE=$(echo "$CREATE_USER" | tail -n 1)
CREATED_USER_ID=$(echo "$CREATE_USER" | head -n -1 | jq -r '.id' 2>/dev/null)

assert_status 201 "$STATUS_CODE" "Create user returns 201"

if [ ! -z "$CREATED_USER_ID" ] && [ "$CREATED_USER_ID" != "null" ]; then
  pass "New user created with ID: $CREATED_USER_ID"
  
  # Test 3.6: Update user status
  log_test "Update user status to suspended"
  UPDATE_STATUS=$(curl -s -X PUT "$API_BASE/api/v1/admin/users/$CREATED_USER_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"status\":\"suspended\",\"reason\":\"Testing\"}")
  
  UPDATED_STATUS=$(echo "$UPDATE_STATUS" | jq -r '.status' 2>/dev/null)
  if [ "$UPDATED_STATUS" = "suspended" ]; then
    pass "User status updated to suspended"
  else
    fail "User status update failed"
  fi
  
  # Test 3.7: Update user status back to active
  log_test "Update user status to active"
  UPDATE_ACTIVE=$(curl -s -X PUT "$API_BASE/api/v1/admin/users/$CREATED_USER_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"status\":\"active\"}")
  
  ACTIVE_STATUS=$(echo "$UPDATE_ACTIVE" | jq -r '.status' 2>/dev/null)
  if [ "$ACTIVE_STATUS" = "active" ]; then
    pass "User status updated to active"
  else
    fail "User status update to active failed"
  fi
  
  # Test 3.8: Delete user
  log_test "Delete user"
  DELETE_USER=$(curl -s -X DELETE "$API_BASE/api/v1/admin/users/$CREATED_USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -w "\n%{http_code}")
  
  STATUS_CODE=$(echo "$DELETE_USER" | tail -n 1)
  assert_status 204 "$STATUS_CODE" "Delete user returns 204"
fi

# Test 3.9: User stats overview
log_test "Get user statistics overview"
USER_STATS=$(curl -s -X GET "$API_BASE/api/v1/admin/users/stats/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

assert_field_exists "$USER_STATS" '.total_users' "Total users in stats"
assert_field_exists "$USER_STATS" '.active_users' "Active users in stats"

# ==============================================================================
# PHASE 4: Error Handling & Authentication
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}PHASE 4: ERROR HANDLING & AUTHENTICATION${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

# Test 4.1: Missing authorization header
log_test "Access protected endpoint without token"
NO_TOKEN=$(curl -s -X GET "$API_BASE/api/v1/admin/users" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$NO_TOKEN" | tail -n 1)
# Most endpoints should reject without token (typically 401 or 403)
if [ "$STATUS_CODE" -ge 400 ]; then
  pass "Protected endpoint rejects unauthenticated request"
else
  fail "Protected endpoint allowed unauthenticated request"
fi

# Test 4.2: Invalid token
log_test "Access with invalid token"
INVALID_TOKEN=$(curl -s -X GET "$API_BASE/api/v1/admin/users" \
  -H "Authorization: Bearer invalid.token.here" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$INVALID_TOKEN" | tail -n 1)
if [ "$STATUS_CODE" -ge 400 ]; then
  pass "Invalid token rejected"
else
  fail "Invalid token was accepted"
fi

# Test 4.3: Get non-existent user
log_test "Get non-existent user"
NOTFOUND=$(curl -s -X GET "$API_BASE/api/v1/admin/users/u_nonexistent_999" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$NOTFOUND" | tail -n 1)
assert_status 404 "$STATUS_CODE" "Non-existent user returns 404"

# Test 4.4: Invalid request body
log_test "Create user with invalid email"
INVALID_EMAIL=$(curl -s -X POST "$API_BASE/api/v1/admin/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\n%{http_code}" \
  -d "{\"email\":\"notanemail\",\"name\":\"Test User\"}")

STATUS_CODE=$(echo "$INVALID_EMAIL" | tail -n 1)
if [ "$STATUS_CODE" -ge 400 ]; then
  pass "Invalid email format rejected"
else
  fail "Invalid email format was accepted"
fi

# Test 4.5: Missing required field
log_test "Create user with missing name"
MISSING_FIELD=$(curl -s -X POST "$API_BASE/api/v1/admin/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\n%{http_code}" \
  -d "{\"email\":\"test@test.com\"}")

STATUS_CODE=$(echo "$MISSING_FIELD" | tail -n 1)
if [ "$STATUS_CODE" -ge 400 ]; then
  pass "Missing required field rejected"
else
  fail "Missing required field was accepted"
fi

# ==============================================================================
# PHASE 5: Routing & Endpoint Coverage
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}PHASE 5: ROUTING & ENDPOINT COVERAGE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

# Test 5.1: Health endpoint
log_test "Health check endpoint"
HEALTH=$(curl -s -X GET "$API_BASE/health" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$HEALTH" | tail -n 1)
assert_status 200 "$STATUS_CODE" "Health endpoint returns 200"

# Test 5.2: Demo credentials endpoint
log_test "Demo credentials endpoint"
DEMO_CREDS=$(curl -s -X GET "$API_BASE/api/v1/admin/auth/demo-credentials" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$DEMO_CREDS" | tail -n 1)
assert_status 200 "$STATUS_CODE" "Demo credentials endpoint returns 200"

# Test 5.3: Root endpoint
log_test "API root endpoint"
ROOT=$(curl -s -X GET "$API_BASE/" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$ROOT" | tail -n 1)
assert_status 200 "$STATUS_CODE" "API root endpoint returns 200"

# Test 5.4: Logout endpoint
log_test "Logout endpoint"
LOGOUT=$(curl -s -X POST "$API_BASE/api/v1/admin/auth/logout" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -w "\n%{http_code}")

STATUS_CODE=$(echo "$LOGOUT" | tail -n 1)
assert_status 200 "$STATUS_CODE" "Logout endpoint returns 200"

# ==============================================================================
# RESULTS SUMMARY
# ==============================================================================

echo -e "\n${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}TEST RESULTS SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}\n"

echo -e "Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

PASS_RATE=$((PASSED * 100 / TOTAL))
echo -e "Pass Rate: ${BLUE}${PASS_RATE}%${NC}\n"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo -e "The API is fully functional and ready for production testing.\n"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo -e "Please review the failures above and fix any issues.\n"
  exit 1
fi
