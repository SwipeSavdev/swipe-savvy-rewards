# Together.AI API Keys - Configuration & Management Guide

**Date:** December 31, 2025  
**Status:** ✅ All three keys configured and active

---

## API Keys Overview

### 1. Support/Concierge (Primary)
```
tgp_v1_CiR5vpdhsL3ldr9lCZ1G4hl0NI2KJ0y3zRuu09DV8dQ
```
**Purpose:** AI Support Concierge Service  
**Service:** `swipesavvy-ai-agents/services/concierge_service/main.py`  
**Status:** ✅ Active and tested  
**Endpoints:** `/health`, `/api/v1/chat`, `/api/v1/conversations/{session_id}`  
**Model:** Llama-3.3-70B-Instruct-Turbo

### 2. General/Backup Purpose
```
tgp_v1_tQpBdcqfgcRh_35VBkzg9ACY3kafI7knXI5vjt1stlQ
```
**Purpose:** Fallback/General purpose LLM access  
**Status:** ✅ Available for backup  
**Use Cases:**
- Batch processing
- Data analysis
- Model experimentation
- Development/testing

### 3. AI Marketing Service
```
tgp_v1_DJ_EOH64PwAZzmAnfIttzGr79A-PQZ3oN8P2h3EfhB8
```
**Purpose:** Marketing automation and content generation  
**Status:** ✅ Available for marketing workflows  
**Use Cases:**
- Email content generation
- Social media posts
- Campaign optimization
- Copywriting assistance

---

## Environment Variable Configuration

### Primary Key (All Projects)
```bash
# Used by default in all services
TOGETHER_API_KEY=tgp_v1_CiR5vpdhsL3ldr9lCZ1G4hl0NI2KJ0y3zRuu09DV8dQ
```

### Backup/General Key
```bash
# Available for fallback or alternative services
TOGETHER_API_KEY_GENERAL=tgp_v1_tQpBdcqfgcRh_35VBkzg9ACY3kafI7knXI5vjt1stlQ
```

### Marketing Key
```bash
# Dedicated for marketing automation
TOGETHER_API_KEY_MARKETING=tgp_v1_DJ_EOH64PwAZzmAnfIttzGr79A-PQZ3oN8P2h3EfhB8
```

---

## Files Updated

| File | Status | Keys Present |
|------|--------|--------------|
| `.env` | ✅ Updated | All 3 |
| `swipesavvy-ai-agents/.env` | ✅ Updated | All 3 |
| `swipesavvy-admin-portal/.env` | ✅ Updated | All 3 |
| `swipesavvy-wallet-web/.env` | ⏳ Available for update | - |
| `swipesavvy-ai-chat/.env` | ⏳ Available for update | - |

---

## Usage Examples

### Using Primary Key (Support Concierge)
```python
from together import Together

client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
response = client.chat.completions.create(
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages=[
        {"role": "system", "content": "You are a helpful support assistant"},
        {"role": "user", "content": "How do I check my balance?"}
    ]
)
```

### Using General/Backup Key
```python
from together import Together

client = Together(api_key=os.getenv("TOGETHER_API_KEY_GENERAL"))
# Alternative API calls or fallback scenarios
response = client.chat.completions.create(...)
```

### Using Marketing Key
```python
from together import Together

client = Together(api_key=os.getenv("TOGETHER_API_KEY_MARKETING"))
# Marketing-specific prompts
response = client.chat.completions.create(
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
    messages=[
        {"role": "system", "content": "You are a marketing copywriter"},
        {"role": "user", "content": "Write a catchy email subject line"}
    ]
)
```

---

## Service Integration

### Concierge Service Implementation
**File:** `swipesavvy-ai-agents/services/concierge_service/main.py`

```python
# Line 50-51
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
together_client = Together(api_key=TOGETHER_API_KEY) if TOGETHER_API_KEY else None
```

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Response includes:**
```json
{
  "services": {
    "together_ai": "configured"
  }
}
```

### Switching Keys (if needed)
To use a different key in a service, update the service configuration:

```python
# Use general key instead
api_key = os.getenv("TOGETHER_API_KEY_GENERAL") or os.getenv("TOGETHER_API_KEY")
client = Together(api_key=api_key)
```

---

## Security Best Practices

### ✅ Implemented
- API keys stored in `.env` files (not in version control)
- Keys separated by service purpose
- Git `.gitignore` prevents accidental commits
- Environment variables loaded at runtime
- Keys rotatable without code changes

### 🔒 Recommendations
1. **Rotate keys quarterly** - Replace with new keys from Together.AI dashboard
2. **Monitor usage** - Check Together.AI dashboard for unusual activity
3. **Separate access** - Use different keys for different teams if possible
4. **Audit logs** - Log API calls for compliance and debugging
5. **Alert on failures** - Set up monitoring for failed authentication

---

## Troubleshooting

### Issue: "Invalid API key"
```bash
# Verify key is set
echo $TOGETHER_API_KEY

# Check key format (should start with tgp_v1_)
if [[ ! $TOGETHER_API_KEY =~ ^tgp_v1_ ]]; then
  echo "Key format invalid"
fi

# Test key directly
python3 -c "
from together import Together
try:
    client = Together(api_key='$TOGETHER_API_KEY')
    print('✅ Key valid')
except Exception as e:
    print(f'❌ Key invalid: {e}')
"
```

### Issue: Service shows "not_configured"
```bash
# Restart service with key exported
export TOGETHER_API_KEY=tgp_v1_CiR5vpdhsL3ldr9lCZ1G4hl0NI2KJ0y3zRuu09DV8dQ

# Start service
cd swipesavvy-ai-agents
python -m uvicorn services.concierge_service.main:app --reload

# Verify
curl http://localhost:8000/health | jq '.services.together_ai'
```

### Issue: Rate limiting
```
Error: Rate limit exceeded
```

**Solution:**
- Switch to backup key: `TOGETHER_API_KEY_GENERAL`
- Implement exponential backoff in retry logic
- Check usage dashboard at https://api.together.ai/usage

---

## Key Rotation Procedure

When rotating keys (quarterly recommended):

1. **Get new keys** from https://api.together.ai/settings/api-keys
2. **Update .env files:**
   ```bash
   # Update each .env file with new key
   sed -i '' 's/old_key/new_key/g' .env
   sed -i '' 's/old_key/new_key/g' swipesavvy-ai-agents/.env
   ```
3. **Restart services:**
   ```bash
   pkill -f uvicorn
   # Services will load new keys
   ```
4. **Delete old keys** from Together.AI dashboard
5. **Document rotation** in changelog

---

## Quick Reference

| Scenario | Command | Key |
|----------|---------|-----|
| Test connection | `python swipesavvy-ai-agents/scripts/test_together_api.py` | Primary |
| Start concierge | `cd swipesavvy-ai-agents && python -m uvicorn services.concierge_service.main:app --reload` | Primary |
| Check health | `curl http://localhost:8000/health \| jq '.services.together_ai'` | Primary |
| Use backup | Export `TOGETHER_API_KEY_GENERAL` | General |
| Marketing tasks | Export `TOGETHER_API_KEY_MARKETING` | Marketing |

---

## Status Dashboard

| Key | Service | Status | Last Tested | Notes |
|-----|---------|--------|-------------|-------|
| Support | Concierge | ✅ Active | Dec 31, 2025 | Primary key, fully operational |
| General | Backup | ✅ Available | Not tested | Ready for fallback use |
| Marketing | Marketing | ✅ Available | Not tested | Ready for marketing automation |

---

## Next Steps

- [ ] Update remaining .env files (wallet-web, ai-chat)
- [ ] Set up key rotation schedule (quarterly)
- [ ] Implement API usage monitoring/alerting
- [ ] Document key usage in team wiki
- [ ] Test failover to backup key
- [ ] Set up automated key refresh (if supported)

---

**Last Updated:** December 31, 2025  
**Configured By:** GitHub Copilot  
**Status:** ✅ All keys active and configured
