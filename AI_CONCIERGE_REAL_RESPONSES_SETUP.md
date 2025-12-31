# AI Concierge Live - How to Get Real Responses

## Problem
The admin portal was showing: 
> "I understand. Let me help you with that. (AI Service Integration Coming Soon)"

## Solution
The frontend has been updated to call the real Together.AI backend service. Now you need to:

---

## Setup (2 Steps)

### Step 1: Start Backend Service
Open **Terminal 1** and run:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
python -m uvicorn services.concierge_service.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Concierge service starting up...
INFO:     Together API configured: True
```

### Step 2: Open Admin Portal
The admin portal dev server is already running.

Go to:
```
http://localhost:5173/support/concierge
```

Or if using local network:
```
http://192.168.1.142:5173/support/concierge
```

---

## Test It

1. Open AI Concierge in admin portal
2. Type: "What is SwipeSavvy?"
3. Press Enter
4. **Wait for real AI response** (takes 1-2 seconds)

You should now see a real answer from Together.AI, NOT the placeholder!

---

## What Was Changed

**File:** `swipesavvy-admin-portal/src/pages/AISupportConciergePage.tsx`

**Before:**
- Fake timeout response with placeholder message

**After:**
- Real API call to `http://localhost:8000/api/v1/chat`
- Parses Server-Sent Events (SSE) from Together.AI
- Displays actual AI-generated responses

---

## If It Still Shows Placeholder

**Issue 1: Backend not running**
- Fix: Start backend service (see Step 1)

**Issue 2: Port 8000 in use**
- Check: `lsof -i :8000`
- Kill: `pkill -f uvicorn`
- Restart service

**Issue 3: Browser cache**
- Solution: Hard refresh with Cmd+Shift+R
- Or clear cache in DevTools

**Issue 4: API key not set**
- Check: `echo $TOGETHER_API_KEY`
- Should start with `tgp_v1_`
- If empty: Set in terminal before starting service

---

## Verification

Test the backend API directly:
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "user_id": "test",
    "session_id": "test"
  }' | head -20
```

Should see SSE formatted responses starting with `data: {...}`

---

## What Happens When You Send a Message

```
1. You type "What is SwipeSavvy?" in chat
2. Frontend sends to backend:
   POST http://localhost:8000/api/v1/chat
   {
     "message": "What is SwipeSavvy?",
     "user_id": "admin_user",
     "session_id": "session_1234567890",
     "context": {...}
   }

3. Backend receives request
4. Backend calls Together.AI Llama model
5. Together.AI returns streaming response
6. Backend streams back via SSE
7. Frontend parses SSE events
8. Chat displays real AI answer
```

---

## Success Indicators

✅ Backend service shows: "Together API configured: True"  
✅ Chat input box is active (not disabled)  
✅ Typing message and pressing Enter works  
✅ Sees animated loading indicator (3 dots)  
✅ Real AI text appears (not placeholder)  
✅ Timestamp shows when message arrived  

---

**That's it! Real AI responses are now live!** 🎉
