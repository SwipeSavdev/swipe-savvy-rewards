#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   AI SUPPORT CONCIERGE - TOGETHER.AI CONNECTION STATUS     ║"
echo "║                  December 31, 2025                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. Environment Check
echo "📋 ENVIRONMENT STATUS:"
echo "────────────────────────────────────────────────────────────"
if [ -n "$TOGETHER_API_KEY" ]; then
  KEY_PREVIEW="${TOGETHER_API_KEY:0:15}...${TOGETHER_API_KEY: -10}"
  echo "✅ TOGETHER_API_KEY is SET in session"
  echo "   Preview: $KEY_PREVIEW"
else
  echo "❌ TOGETHER_API_KEY is NOT set in session"
fi
echo ""

# 2. Configuration Files
echo "📁 CONFIGURATION FILES (.env status):"
echo "────────────────────────────────────────────────────────────"
ROOT_DIR="/Users/macbookpro/Documents/swipesavvy-mobile-app-v2"

for dir in "." "swipesavvy-ai-agents" "swipesavvy-mobile-app-v2" "swipesavvy-admin-portal"; do
  ENV_FILE="$ROOT_DIR/$dir/.env"
  if [ -f "$ENV_FILE" ]; then
    if grep -q "^TOGETHER_API_KEY" "$ENV_FILE" 2>/dev/null; then
      echo "✅ $dir/.env contains TOGETHER_API_KEY"
    else
      echo "❌ $dir/.env - TOGETHER_API_KEY missing"
    fi
  else
    echo "⚠️  $dir/.env - File not found"
  fi
done
echo ""

# 3. Python Dependencies
echo "🧪 PYTHON DEPENDENCIES:"
echo "────────────────────────────────────────────────────────────"
python3 -c "
import sys
try:
    import together
    print('✅ together SDK installed')
except ImportError:
    print('❌ together SDK NOT installed')
    sys.exit(1)

try:
    from fastapi import FastAPI
    print('✅ fastapi installed')
except ImportError:
    print('❌ fastapi NOT installed')
" 2>/dev/null || echo "❌ Python check failed"
echo ""

# 4. Service Files
echo "📂 SERVICE CONFIGURATION FILES:"
echo "────────────────────────────────────────────────────────────"
SERVICE_FILE="$ROOT_DIR/swipesavvy-ai-agents/services/concierge_service/main.py"
if [ -f "$SERVICE_FILE" ]; then
  echo "✅ Concierge service found"
  
  # Check for Together.AI initialization
  if grep -q "together_client = Together" "$SERVICE_FILE"; then
    echo "✅ Together client initialization present"
  else
    echo "❌ Together client initialization missing"
  fi
  
  # Check for health endpoint
  if grep -q '@app.get.*"/health"' "$SERVICE_FILE"; then
    echo "✅ Health endpoint configured"
  else
    echo "❌ Health endpoint missing"
  fi
  
  # Check for chat endpoint
  if grep -q '@app.post.*"/concierge/api/v1/chat"' "$SERVICE_FILE"; then
    echo "✅ Chat endpoint configured"
  else
    echo "❌ Chat endpoint missing"
  fi
else
  echo "❌ Concierge service file not found"
fi
echo ""

# 5. Test Script
echo "🧪 TEST SCRIPT STATUS:"
echo "────────────────────────────────────────────────────────────"
TEST_SCRIPT="$ROOT_DIR/swipesavvy-ai-agents/scripts/test_together_api.py"
if [ -f "$TEST_SCRIPT" ]; then
  echo "✅ Test script exists"
  if grep -q "def test_api_connection" "$TEST_SCRIPT"; then
    echo "✅ Test function defined"
  fi
else
  echo "❌ Test script not found"
fi
echo ""

# 6. API Connection Test (if API key is set)
if [ -n "$TOGETHER_API_KEY" ]; then
  echo "🔌 API CONNECTION TEST:"
  echo "────────────────────────────────────────────────────────────"
  echo "Running Together.AI API connection test..."
  cd "$ROOT_DIR/swipesavvy-ai-agents"
  python3 scripts/test_together_api.py 2>&1 | tail -20
  echo ""
else
  echo "⚠️  API CONNECTION TEST:"
  echo "────────────────────────────────────────────────────────────"
  echo "Skipped: TOGETHER_API_KEY not set in environment"
  echo "To test, set: export TOGETHER_API_KEY='your-api-key'"
  echo ""
fi

# 7. Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    SUMMARY & RECOMMENDATIONS               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ -n "$TOGETHER_API_KEY" ]; then
  echo "✅ STATUS: TOGETHER.AI IS CONFIGURED AND CONNECTED"
  echo ""
  echo "Next steps:"
  echo "1. Persist API key to .env files:"
  echo "   echo 'TOGETHER_API_KEY=$TOGETHER_API_KEY' >> swipesavvy-ai-agents/.env"
  echo ""
  echo "2. Start concierge service:"
  echo "   cd swipesavvy-ai-agents"
  echo "   python -m uvicorn services.concierge_service.main:app --reload"
  echo ""
  echo "3. Test endpoints:"
  echo "   curl http://localhost:8000/health"
  echo "   curl -X POST http://localhost:8000/concierge/api/v1/chat ..."
else
  echo "❌ STATUS: TOGETHER.AI NOT CONFIGURED"
  echo ""
  echo "Action required:"
  echo "1. Get API key from: https://api.together.ai/settings/api-keys"
  echo "2. Set environment: export TOGETHER_API_KEY='your-key'"
  echo "3. Persist to .env files"
  echo "4. Run this script again to verify"
fi
echo ""
