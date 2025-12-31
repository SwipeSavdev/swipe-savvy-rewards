# AI Support Concierge - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL running on localhost
- FastAPI backend (swipesavvy-wallet-web)

### Step 1: Start the Backend (5 seconds)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-wallet-web
python3 -m uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
✅ Admin auth routes included
✅ Feature flags routes included
✅ Support system routes included
✅ AI Support Concierge routes included
✅ AI Concierge routes included
Application startup complete
```

### Step 2: Start the Admin Portal (10 seconds)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-admin-portal
npm run dev
```

**Expected Output:**
```
  VITE v5.4.21  ready in 95 ms
  ➜  Local:   http://localhost:5173/
```

### Step 3: Access AI Support Concierge (15 seconds)

Open browser and navigate to:
```
http://localhost:5173/support/ai-concierge
```

### Step 4: Test the System (30 seconds)

1. **Issue Analyzer Tab** (Already Selected)
   - Paste this issue: `"The admin portal is completely down and users cannot login. Database seems to be not responding."`
   - Click "Analyze Issue"
   - Wait for analysis (5-10 seconds)

2. **Observe Results**
   - Severity: CRITICAL ⚠️
   - Tags: database, frontend, backend, auth
   - Resolution Steps: 6 detailed steps
   - Similar Issues: Historical matches
   - Recommendations: ML-powered tips

3. **Documentation Search Tab**
   - Search: `"PostgreSQL database"`
   - View relevant documentation files
   - Relevance scores show best matches

4. **Learning Patterns Tab**
   - See top patterns from system
   - Success rates for each component
   - Average resolution times

---

## 📊 What You're Seeing

### Issue Classification Engine
```
Input: "The admin portal is completely down..."
        ↓
Keywords Found: "down" (critical)
        ↓
Severity: CRITICAL (escalation required)
Tags: [database, frontend, backend, auth]
```

### ML Learning System
```
After Recording Resolution:
  - Stores in knowledge base
  - Updates pattern weights
  - Improves future recommendations
  - Learns resolution times
```

### Documentation Integration
```
482 files indexed:
  - *.md (markdown guides)
  - *.txt (notes)
  - *.log (system logs)
Ranked by relevance to issue
```

---

## 🎯 Key Features in Action

### 1. Severity Classification

| Severity | Trigger | Action |
|----------|---------|--------|
| 🔴 CRITICAL | "crash", "down", "broken", "security" | Immediate escalation, 5-min ETA |
| 🟠 MODERATE | "error", "bug", "slow", "timeout" | Standard routing, 15-min ETA |
| 🟢 LOW | General issues, suggestions | Async, 30-min ETA |

### 2. Component-Aware Resolution

**Database Issues** → Database troubleshooting steps
**Backend Issues** → API & server diagnosis
**Frontend Issues** → UI & browser checks
**Auth Issues** → Authentication flow verification

### 3. ML-Powered Recommendations

```json
{
  "tag": "database",
  "recommendation": "Based on 12 historical issues, 
                     this typically takes ~300s to resolve",
  "success_rate": "95%"
}
```

---

## 💡 Common Use Cases

### Case 1: Quick Issue Analysis
```
1. Describe your issue
2. Get instant severity + tags
3. Follow resolution steps
4. Check similar historical issues
```

### Case 2: Knowledge Base Lookup
```
1. Go to Documentation tab
2. Search for keywords
3. Browse indexed files
4. Find relevant guides
```

### Case 3: Learning & Improvement
```
1. Resolve an issue
2. Record in system (/record-resolution endpoint)
3. System learns pattern
4. Future similar issues resolved faster
```

---

## 🔧 Troubleshooting

### Portal not loading?
```bash
# Clear npm cache and restart
cd swipesavvy-admin-portal
npm cache clean --force
npm run dev
```

### API returning errors?
```bash
# Check backend health
curl http://localhost:8000/health
# Should return: {"status": "healthy", ...}

# Check support routes
curl http://localhost:8000/api/support/statistics
```

### MCP Server issues?
```bash
# Test in standalone mode
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
python3 mcp_support_server.py
# Should show test issue analysis
```

---

## 📈 Next Steps

1. **Record Historical Issues**
   - Start recording issues as they're resolved
   - System learns patterns
   - ML accuracy improves

2. **Integrate with Automation**
   - Use REST API in custom scripts
   - Batch analyze issues
   - Export patterns for analysis

3. **Customize Resolution Steps**
   - Edit RESOLUTION_TEMPLATES in mcp_support_server.py
   - Add component-specific guidance
   - Tailor to your infrastructure

4. **Monitor System Health**
   - Visit `/support/ai-concierge` regularly
   - Check success rates
   - Review top patterns
   - Adjust tags as needed

---

## 📞 API Quick Reference

### Analyze Issue
```bash
curl -X POST http://localhost:8000/api/support/analyze-issue \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Portal is down",
    "user_id": "admin"
  }'
```

### Get Statistics
```bash
curl http://localhost:8000/api/support/statistics
```

### Search Docs
```bash
curl -X POST http://localhost:8000/api/support/search-documentation \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database error",
    "limit": 5
  }'
```

### Record Resolution
```bash
curl -X POST http://localhost:8000/api/support/record-resolution \
  -H "Content-Type: application/json" \
  -d '{
    "issue_id": "abc123",
    "severity": "CRITICAL",
    "description": "Database was down",
    "solution": "Restarted PostgreSQL",
    "resolution_time": 300,
    "tags": ["database", "backend"],
    "success": true
  }'
```

---

## 🎓 Learn More

- [Full Documentation](./AI_SUPPORT_CONCIERGE_DOCUMENTATION.md)
- [API Reference](./AI_SUPPORT_CONCIERGE_DOCUMENTATION.md#-api-endpoints)
- [ML Learning System](./AI_SUPPORT_CONCIERGE_DOCUMENTATION.md#-ml-learning-system)
- [Integration Guide](./AI_SUPPORT_CONCIERGE_DOCUMENTATION.md#-integration-examples)

---

**Status:** ✅ Ready to Use  
**Last Updated:** December 30, 2025  
**Version:** 1.0.0
