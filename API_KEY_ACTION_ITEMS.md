# IMMEDIATE ACTIONS - API KEY SETUP

## Current Status ✅
- Backend: **RUNNING** (port 8000)
- Health endpoint: **UP** 
- Chat endpoint: **EXISTS** but **NEEDS API KEY**

## Error Found
```
401 Invalid API key provided
You can find your API key at https://api.together.ai/settings/api-keys
```

---

## REQUIRED: Set TOGETHER_API_KEY in Backend

### Location
File: `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents/.env`

### Current Content (Placeholder)
```dotenv
TOGETHER_API_KEY=your_together_api_key_here
```

### What You Need To Do

#### Step 1: Get API Key
1. Go to https://api.together.ai/settings/api-keys
2. Sign in (create account if needed)
3. Create new API key (or copy existing one)
4. Key format: `faa06b29...` (alphanumeric string)

#### Step 2: Update .env File
Replace `your_together_api_key_here` with your actual key:
```dotenv
TOGETHER_API_KEY=<YOUR_ACTUAL_KEY_HERE>
```

#### Step 3: Restart Backend
```bash
# Kill current process
pkill -f "uvicorn app.main"

# Navigate to backend
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents

# Restart with new environment
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```

#### Step 4: Verify Configuration
```bash
# Check health endpoint
curl -s http://localhost:8000/concierge/health | jq .

# Should show: "together_ai": "configured"
```

#### Step 5: Test Chat Endpoint
```bash
curl -s -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services do you offer?",
    "user_id": "test-001"
  }' | jq .

# Should return AI response (not 401 error)
```

---

## Timeline
- ⏱️ **5 min:** Get Together.AI API key
- ⏱️ **2 min:** Update .env file
- ⏱️ **1 min:** Restart backend
- ⏱️ **1 min:** Run health check
- ⏱️ **1 min:** Test chat endpoint

**Total: ~10 minutes**

---

## Next After This
Once API key is confirmed working:
1. ✅ Run full SonarQube analysis on Python services
2. ✅ Test security hotspots
3. ✅ Generate audit report

---

## Reference Files
- Setup guide: [TOGETHER_API_SETUP.md](TOGETHER_API_SETUP.md)
- Backend code: [services/concierge_service/main.py](swipesavvy-ai-agents/services/concierge_service/main.py)
