#!/bin/bash
# Deployment Verification Script
# Validates production deployment is working correctly
# Usage: ./scripts/verify-deployment.sh

set -e

echo "========================================="
echo "Deployment Verification"
echo "========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

test_check() {
    local name=$1
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $name"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}✗${NC} $name"
        FAIL=$((FAIL + 1))
    fi
}

# 1. Check all containers running
echo ""
echo "1. Checking Docker containers..."
UNHEALTHY=$(docker ps --filter "health=unhealthy" -q | wc -l)
test_check "All containers healthy" $UNHEALTHY

# 2. Check service endpoints
echo ""
echo "2. Checking service endpoints..."
curl -sf http://localhost:8000/health > /dev/null
test_check "Concierge health endpoint" $?

curl -sf http://localhost:8001/health > /dev/null
test_check "RAG health endpoint" $?

curl -sf http://localhost:8002/health > /dev/null
test_check "Guardrails health endpoint" $?

# 3. Check monitoring
echo ""
echo "3. Checking monitoring..."
curl -sf http://localhost:9090/-/healthy > /dev/null
test_check "Prometheus" $?

curl -sf http://localhost:3000/api/health > /dev/null
test_check "Grafana" $?

# 4. Test basic functionality
echo ""
echo "4. Testing basic functionality..."
RESPONSE=$(curl -sf -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello","user_id":"test"}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "response"; then
    test_check "Chat API functional" 0
else
    test_check "Chat API functional" 1
fi

# 5. Check database connectivity
echo ""
echo "5. Checking database..."
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready > /dev/null 2>&1
test_check "PostgreSQL connectivity" $?

# 6. Check metrics endpoint
echo ""
echo "6. Checking metrics..."
curl -sf http://localhost:8000/metrics | grep -q "http_requests" 2>/dev/null
test_check "Metrics endpoint" $?

# Summary
echo ""
echo "========================================="
TOTAL=$((PASS + FAIL))
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed ($PASS/$TOTAL)${NC}"
    echo "========================================="
    exit 0
else
    echo -e "${RED}✗ Some checks failed ($FAIL/$TOTAL failed, $PASS passed)${NC}"
    echo "========================================="
    exit 1
fi
