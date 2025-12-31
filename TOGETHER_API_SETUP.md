# Together AI API Key Setup Guide

## Step 1: Get Your Together API Key

### Option A: Use Existing Key (If You Have One)
If you already have a Together.AI API key, skip to **Step 2**.

### Option B: Create New API Key
1. Visit [Together AI Dashboard](https://www.together.ai)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create New API Key"**
5. Copy the generated key (format: similar to `faa06b29...`)
6. Keep this key safe - you won't see it again

---

## Step 2: Configure Backend Environment

### Add TOGETHER_API_KEY to .env

Replace the placeholder in `/swipesavvy-ai-agents/.env`:

```bash
# Find this line:
TOGETHER_API_KEY=your_together_api_key_here

# Replace with your actual key:
TOGETHER_API_KEY=faa06b29xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3: Verify Configuration

### Restart the Backend
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents

# Kill existing process
pkill -f uvicorn

# Restart with new .env
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```

### Test Health Endpoint
```bash
curl -s http://localhost:8000/concierge/health | jq .
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "api": "up",
    "auth": "enabled",
    "together_ai": "configured",
    "rag": "available",
    "guardrails": "available"
  }
}
```

✅ If `"together_ai": "configured"` → API key is valid!

---

## Step 4: Test Chat Endpoint

```bash
curl -s -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! What financial products do you offer?",
    "user_id": "test-user-001",
    "session_id": "session-001",
    "context": {
      "account_type": "mobile_wallet",
      "user_name": "Test User"
    }
  }' | jq .
```

**Expected:** AI response from Together.AI LLM

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `together_ai: "not_configured"` | API key not set or invalid format |
| Connection timeout | Check Together.AI service status |
| Invalid API key error | Verify key from Together AI dashboard |
| .env not loading | Ensure file is in `swipesavvy-ai-agents/` directory |

---

## Security Notes

- ⚠️ **Never commit** `.env` file to Git
- ⚠️ **Rotate keys regularly** in production
- ✅ Keep API key in `.env` only (use environment variables)
- ✅ Monitor API usage in Together AI dashboard

---

## Model Configuration

Current model: `meta-llama/Llama-3.3-70B-Instruct-Turbo`

To change, edit `swipesavvy-ai-agents/.env`:
```bash
# Available models at https://www.together.ai/products/models
AGENT_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
```

---

## Support

- Together AI Docs: https://www.together.ai/docs
- API Status: https://status.together.ai
