#!/bin/bash

# Cypress E2E Test Execution Script
# This script sets up and runs the E2E tests

echo "=========================================="
echo "SwipeSavvy E2E Test Suite - Phase 5"
echo "=========================================="

cd /Users/macbookpro/Documents/swipesavvy-mobile-app

echo ""
echo "✓ Checking Cypress installation..."
npx cypress -v

echo ""
echo "✓ Running E2E tests in headless mode..."
echo "  Port: 3000"
echo "  Tests: 18 test cases across 5 spec files"
echo ""

# Run Cypress tests with minimal output
npx cypress run \
  --headless \
  --browser chrome \
  2>&1 | tee test-results.log

# Check exit code
if [ $? -eq 0 ]; then
  echo ""
  echo "=========================================="
  echo "✓ All tests passed!"
  echo "=========================================="
else
  echo ""
  echo "=========================================="
  echo "✗ Some tests failed"
  echo "=========================================="
  echo "Check test-results.log for details"
fi
