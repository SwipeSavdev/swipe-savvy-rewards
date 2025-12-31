# 🛠️ AI APIS IMPLEMENTATION & FIX GUIDE

**Objective:** Complete the AI Concierge integration end-to-end

---

## ISSUE #1: MISSING TOGETHER_API_KEY

### Problem
The `/concierge/api/v1/chat` endpoint returns `401 "Invalid API key provided"` because the `TOGETHER_API_KEY` environment variable is empty.

**Current Status:**
```python
# File: services/concierge_service/main.py (Line 35)
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
together_client = Together(api_key=TOGETHER_API_KEY) if TOGETHER_API_KEY else None
```

**Result:** `together_client = None`, causing all chat requests to fail.

### Solution

#### Step 1: Get API Key
1. Go to https://api.together.ai/settings/api-keys
2. Create or copy your API key
3. Save it securely

#### Step 2: Set Environment Variable

**Option A: Direct Environment Variable**
```bash
export TOGETHER_API_KEY="your-api-key-from-together.ai"

# Verify
echo $TOGETHER_API_KEY

# Restart backend
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
pkill -f uvicorn
python -m uvicorn app.main:app --reload
```

**Option B: Update .env File**
```bash
# Edit file
vim /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents/.env

# Change from:
TOGETHER_API_KEY=your_together_api_key_here

# To:
TOGETHER_API_KEY=sk_your_actual_key_here
```

#### Step 3: Verify Configuration
```bash
curl -s http://localhost:8000/concierge/health | jq .services.together_ai

# Expected output: "configured"
```

---

## ISSUE #2: MOBILE APP EXPO COMPILATION

### Problem
Mobile app won't start (exit code 137 = killed process)

**Symptoms:**
```
Exit Code: 137  # SIGKILL
Metro bundler hangs or crashes
Port 8081 conflicts
```

### Root Causes
1. Watchman (file watcher) conflict
2. Metro bundler memory issues
3. Previous Expo processes still running
4. Node dependency conflicts

### Solution

#### Complete Reset Procedure
```bash
#!/bin/bash
set -e

cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2

echo "🛑 Step 1: Kill all Expo processes"
pkill -9 -f "expo" || true
pkill -9 -f "node.*expo" || true
sleep 2

echo "🔧 Step 2: Clear Watchman"
watchman watch-del-all || true
watchman watch-project . || true

echo "🗑️  Step 3: Clear caches"
rm -rf .expo node_modules/.cache .watchmanconfig

echo "📦 Step 4: Clean install dependencies"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

echo "✅ Step 5: Start Expo"
npx expo start --clear --lan

# Expected output:
# iOS Bundled XXXms index.js (XXXX modules)
# › Metro waiting on exp://192.168.x.x:8081
```

#### If Still Failing: Nuclear Option
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2

# Remove all npm cache
npm cache clean --force

# Reinstall from scratch
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --verbose

# Check for Node version
node --version  # Should be 18+
npm --version   # Should be 9+

# Start with offline mode if network issues
npx expo start --clear --offline
```

#### Monitor Process
```bash
# In another terminal, watch the process
watch -n 1 "ps aux | grep -E 'expo|metro' | grep -v grep"

# Or check memory
watch -n 1 "free -h"
```

---

## ISSUE #3: STREAMING RESPONSE HANDLING

### Current Implementation ✅

**Backend (Concierge Service):**
```python
# File: services/concierge_service/main.py (Lines 546-627)

async def generate_response_stream(...) -> AsyncGenerator[str, None]:
    """Generate streaming response using Server-Sent Events (SSE)"""
    
    # Yields events in format:
    # data: {"type": "thinking"}
    # data: {"type": "message", "delta": "Hi", "content": "Hi"}
    # data: {"type": "done"}
    # [DONE]
```

**Mobile App (AIClient):**
```typescript
// File: src/packages/ai-sdk/src/client/AIClient.ts (Lines 90-150)

// Uses XMLHttpRequest for React Native streaming
xhr.onprogress = () => {
    // Parse Server-Sent Events
    // Yield ChatEvent objects
    // Handle different event types
};
```

### Event Types

| Event Type | Content | Usage |
|-----------|---------|-------|
| `thinking` | - | Show "AI is thinking..." indicator |
| `message` | `{delta, content}` | Stream incoming text |
| `tool_call` | `{tool, args}` | Show tool being called |
| `tool_result` | `{result}` | Show tool result |
| `done` | `{message_id}` | Mark conversation complete |
| `error` | `{content}` | Show error message |

### Testing Streaming Response

```bash
# Test endpoint
curl -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What can you help me with?",
    "user_id": "test-user",
    "session_id": "test-session"
  }' \
  -v

# Expected output (Server-Sent Events):
# HTTP/1.1 200 OK
# Content-Type: text/event-stream
# 
# data: {"type": "thinking"}
# data: {"type": "message", "delta": "I", "content": "I"}
# data: {"type": "message", "delta": " can", "content": "I can"}
# ...
# data: {"type": "done", "message_id": "..."}
# data: [DONE]
```

---

## COMPLETE TESTING FLOW

### Step 1: Verify Backend Setup
```bash
# 1. Check TOGETHER_API_KEY
echo "TOGETHER_API_KEY: ${TOGETHER_API_KEY}"

# 2. Verify concierge service
curl -s http://localhost:8000/concierge/health | jq .

# 3. Test chat endpoint
curl -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","user_id":"user1","session_id":"sess1"}' \
  -N  # -N for chunked response
```

### Step 2: Start Mobile App
```bash
# Kill previous instances
pkill -9 -f expo || true
sleep 2

# Install dependencies
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2
npm install --legacy-peer-deps

# Start Expo
npx expo start --clear --lan

# Wait for Metro bundler
# Look for output: "Metro waiting on exp://192.168.x.x:8081"
```

### Step 3: Connect Device
```
iOS:
  - Open Camera app
  - Scan QR code from Expo terminal
  - Opens in Expo Go

Android:
  - Open Expo Go app
  - Scan QR code from Expo terminal
```

### Step 4: Login & Test AI
```
1. App loads in Expo Go
2. User logs in with credentials
3. Navigate to Chat/AI Concierge screen
4. Send message: "Hello"
5. Watch for:
   - Loading spinner
   - Streaming text appearing
   - Final response completes
```

---

## DEBUGGING CHECKLIST

### If Chat Returns Error 401
- [ ] Check `TOGETHER_API_KEY` is set
- [ ] Verify API key is valid
- [ ] Check backend logs: `grep "together_ai" /logs`
- [ ] Test health endpoint: `curl http://localhost:8000/concierge/health`

### If Mobile App Won't Start
- [ ] Check port 8081 is free: `lsof -i :8081`
- [ ] Kill Expo: `pkill -9 expo`
- [ ] Clear cache: `rm -rf .expo node_modules/.cache`
- [ ] Check Node version: `node --version` (need 18+)
- [ ] Check memory: `free -m` (need >500MB)

### If Streaming Response Doesn't Work
- [ ] Check response headers: `Content-Type: text/event-stream`
- [ ] Verify SSE format in response body
- [ ] Check mobile logs for parsing errors
- [ ] Test with curl first: `curl -N http://endpoint`

### If Chat Has No Response
- [ ] Verify authentication token is valid
- [ ] Check user_id matches logged-in user
- [ ] Verify session_id is generated
- [ ] Check backend logs for errors
- [ ] Verify Together AI service is operational

---

## ENVIRONMENT CONFIGURATION SUMMARY

### Backend (.env)
```dotenv
NODE_ENV=development
PORT=8000
DEBUG=true

# REQUIRED
TOGETHER_API_KEY=sk_your_key_here

# Optional
OPENAI_API_KEY=sk_...
DATABASE_URL=postgresql://postgres@localhost:5432/swipesavvy_agents
```

### Mobile App (app.json)
```json
{
  "extra": {
    "AI_API_BASE_URL": "http://192.168.1.142:8000",
    "MOCK_API": "false",
    "ENABLE_AI_CONCIERGE": "true"
  }
}
```

---

## EXPECTED WORKFLOW

```
User App Start
    ↓
User Logs In
    ↓ (get accessToken)
User Opens Chat Screen
    ↓
User Types Message
    ↓
POST /concierge/api/v1/chat
    ├─ Include: message, user_id, session_id, context
    ├─ Include: Authorization header with accessToken
    └─ Receive: Server-Sent Events stream
        ├─ {"type": "thinking"}
        ├─ {"type": "message", "delta": "H", "content": "H"}
        ├─ {"type": "message", "delta": "i", "content": "Hi"}
        ├─ ...
        └─ {"type": "done"}
    ↓
Text Appears in Chat UI in Real-Time
    ↓
Message Complete
```

---

## QUICK COMMANDS

```bash
# Start everything fresh
pkill -9 -f expo || true
pkill -f uvicorn || true
sleep 2

# Start backend
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
export TOGETHER_API_KEY="your-key"
python -m uvicorn app.main:app --reload &

# Start mobile
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-mobile-app-v2
npx expo start --clear --lan

# In another terminal, test endpoint
curl -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","user_id":"user1"}' -N
```

---

## SUCCESS CRITERIA

✅ **You'll know it's working when:**
- [ ] `curl` test to `/concierge/api/v1/chat` returns streaming SSE events
- [ ] Mobile app Expo starts without exit code 137
- [ ] App loads QR code and connects successfully
- [ ] User can login and authenticate
- [ ] Chat screen appears and accepts input
- [ ] Typing "Hello" returns AI response streamed in real-time
- [ ] Response appears word-by-word (not all at once)
- [ ] No errors in browser console or Expo logs

---

**Status:** Ready for implementation  
**Last Updated:** December 30, 2025
