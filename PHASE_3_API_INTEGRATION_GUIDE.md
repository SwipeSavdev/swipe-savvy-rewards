# 🔗 PHASE 3: API INTEGRATION GUIDE
**Status: READY TO START**
**Estimated Time: 2-3 hours**
**Objective: Register 17 new endpoints with FastAPI application**

---

## 📋 PHASE 3 TASKS

### Task 1: Locate Main FastAPI Application (10 minutes)

First, find the main FastAPI application file:

```bash
# Search for main.py
find /Users/macbookpro/Documents/swipesavvy-mobile-app-v2 -name "main.py" -type f 2>/dev/null

# Alternative: Search for FastAPI app creation
grep -r "FastAPI()" --include="*.py" /Users/macbookpro/Documents/swipesavvy-mobile-app-v2 2>/dev/null | head -5

# Alternative: Search for uvicorn entry point
grep -r "uvicorn" --include="*.py" /Users/macbookpro/Documents/swipesavvy-mobile-app-v2 2>/dev/null | head -5
```

**Expected Output:**
```
/path/to/main.py
# OR
/path/to/app.py
# OR
/swipesavvy-mobile-app/backend/main.py
```

### Task 2: Add Service Imports (5 minutes)

Once you've located main.py, add these imports at the top of the file (after existing imports):

```python
# Add these lines after existing imports
from tools.backend.services import (
    setup_campaign_routes,
    setup_user_routes,
    setup_admin_routes
)
```

**Example - Before:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="SwipeSavvy API", version="1.2.0")
```

**Example - After:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from tools.backend.services import (
    setup_campaign_routes,
    setup_user_routes,
    setup_admin_routes
)

app = FastAPI(title="SwipeSavvy API", version="1.2.0")
```

### Task 3: Register Routes (10 minutes)

Add route registrations after the FastAPI app is created:

```python
# Register all service routes
setup_campaign_routes(app)
setup_user_routes(app)
setup_admin_routes(app)
```

**Example - Complete:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from tools.backend.services import (
    setup_campaign_routes,
    setup_user_routes,
    setup_admin_routes
)

app = FastAPI(title="SwipeSavvy API", version="1.2.0")

# Add CORS middleware if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register service routes
setup_campaign_routes(app)
setup_user_routes(app)
setup_admin_routes(app)

# Existing routes
@app.get("/")
async def root():
    return {"message": "SwipeSavvy API v1.2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Task 4: Verify Syntax (5 minutes)

After updating main.py, verify the syntax is correct:

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
source .venv/bin/activate
python -m py_compile main.py
```

**Expected Output:**
```
# No output = Success!
```

**If Error:**
```
SyntaxError: ...
# Fix the error in main.py and retry
```

### Task 5: Start Development Server (5 minutes)

Start the FastAPI development server:

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
source .venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Task 6: Verify API Endpoints (15 minutes)

Keep the server running and test the endpoints in another terminal:

```bash
# In a new terminal:
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
source .venv/bin/activate

# Test campaign endpoints
echo "=== Testing Campaign Endpoints ==="
curl -X GET http://localhost:8000/api/campaigns

# Test user endpoints
echo "=== Testing User Endpoints ==="
curl -X GET http://localhost:8000/api/users/user-001

# Test admin endpoints
echo "=== Testing Admin Endpoints ==="
curl -X GET http://localhost:8000/api/admin/health

# Test health check
echo "=== Testing Health ==="
curl -X GET http://localhost:8000/api/health 2>/dev/null || echo "Health endpoint not implemented (normal)"
```

### Task 7: View API Documentation (5 minutes)

Open your browser and navigate to the Swagger UI:

```
http://localhost:8000/docs
```

**What to Verify:**
- ✅ Page loads successfully
- ✅ 50+ endpoints listed (existing + new)
- ✅ Campaign service endpoints visible (7):
  - GET /api/campaigns
  - POST /api/campaigns
  - GET /api/campaigns/{campaign_id}
  - PUT /api/campaigns/{campaign_id}
  - DELETE /api/campaigns/{campaign_id}
  - POST /api/campaigns/{campaign_id}/launch
  - POST /api/campaigns/{campaign_id}/pause
- ✅ User service endpoints visible (5):
  - GET /api/users/{user_id}
  - GET /api/users/{user_id}/accounts
  - GET /api/users/{user_id}/transactions
  - GET /api/users/{user_id}/rewards
  - GET /api/users/{user_id}/analytics/spending
- ✅ Admin service endpoints visible (5):
  - GET /api/admin/users
  - GET /api/admin/audit-logs
  - POST /api/admin/settings
  - POST /api/admin/users/{user_id}/reset-password
  - GET /api/admin/health

### Task 8: Test Endpoint Details (30 minutes)

In the Swagger UI, test each endpoint:

**Campaign Service Testing:**
1. Click "GET /api/campaigns" → Try it out → Execute
   - Expected: Returns campaign list (empty or with data)
   - Status code: 200

2. Click "GET /api/campaigns/{campaign_id}" → Try it out
   - Enter campaign_id: "CAMP-001"
   - Expected: Returns campaign data or 404
   - Status code: 200 or 404

**User Service Testing:**
1. Click "GET /api/users/{user_id}" → Try it out
   - Enter user_id: "user-001"
   - Expected: Returns user profile
   - Status code: 200

2. Click "GET /api/users/{user_id}/transactions" → Try it out
   - Enter user_id: "user-001"
   - Expected: Returns transaction list
   - Status code: 200

**Admin Service Testing:**
1. Click "GET /api/admin/health" → Try it out → Execute
   - Expected: Returns health status
   - Status code: 200

2. Click "GET /api/admin/users" → Try it out → Execute
   - Expected: Returns user list (note: no auth implemented yet)
   - Status code: 200

---

## ✅ SUCCESS CRITERIA

All of these must be true to consider Phase 3 complete:

- [ ] main.py located
- [ ] Service imports added
- [ ] Route registrations added
- [ ] Syntax check passes (no errors)
- [ ] Server starts without errors
- [ ] Swagger UI loads at http://localhost:8000/docs
- [ ] All 17 new endpoints visible in Swagger
- [ ] Campaign endpoints respond (GET /api/campaigns)
- [ ] User endpoints respond (GET /api/users/{user_id})
- [ ] Admin endpoints respond (GET /api/admin/health)
- [ ] No import errors in console

---

## 🔧 TROUBLESHOOTING

### Problem: "ModuleNotFoundError: No module named 'tools'"

**Solution:**
1. Verify you're in the correct directory:
   ```bash
   cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
   pwd  # Should show the correct path
   ```
2. Verify virtual environment is activated:
   ```bash
   source .venv/bin/activate
   which python  # Should show .venv/bin/python
   ```

### Problem: "Address already in use :8000"

**Solution:**
1. Kill the existing process:
   ```bash
   lsof -ti:8000 | xargs kill -9
   ```
2. Or use a different port:
   ```bash
   python -m uvicorn main:app --port 8001
   ```

### Problem: "No module named 'fastapi'"

**Solution:**
1. Reinstall dependencies:
   ```bash
   source .venv/bin/activate
   pip install fastapi uvicorn
   ```

### Problem: Endpoints return empty response

**This is normal!** The services are using mock responses and TODO markers for database integration. The endpoints are working correctly - they just need to be connected to the database in Phase 4.

---

## 📊 EXPECTED OUTPUT

### Server Startup
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
✅ Campaign service routes initialized (7 endpoints)
✅ User service routes initialized (5 endpoints)
✅ Admin service routes initialized (5 endpoints)
```

### Curl Test
```bash
$ curl http://localhost:8000/api/campaigns
{"campaigns": [], "total": 0, "limit": 20, "offset": 0}

$ curl http://localhost:8000/api/users/user-001
{"user_id": "user-001", "email": "user001@example.com", "name": "User user-001", ...}

$ curl http://localhost:8000/api/admin/health
{"status": "healthy", "timestamp": "2025-12-28T...", "services": {...}}
```

---

## 🎯 NEXT STEPS AFTER PHASE 3

Once Phase 3 is complete:

1. **Phase 4: Database Integration** (3-4 hours)
   - Replace TODO markers with actual database queries
   - Test endpoints with real data
   - Verify response times < 500ms

2. **Phase 5: Unit Testing** (2-3 hours)
   - Write unit tests for all 17 endpoints
   - Test error scenarios
   - Verify 100% pass rate

3. **Phase 6: Integration Testing** (3-4 hours)
   - Test complete workflows
   - Verify data consistency
   - Test error handling

4. **Phase 7: Load Testing** (2-3 hours)
   - Load test with 1000+ concurrent users
   - Verify performance targets met
   - Check for connection pooling issues

5. **Phase 8: Production Deployment** (2-4 hours)
   - Blue-green deployment
   - Production health checks
   - Monitoring activation

---

## 📝 NOTES

- Keep the development server running while testing
- The Swagger UI is a great tool for manually testing endpoints
- All endpoints have TODO markers for database operations (will be implemented in Phase 4)
- Mock responses are provided for contract testing
- No authentication is implemented yet (optional for Phase 8)

---

**Status: READY FOR PHASE 3 EXECUTION** ✅

Follow the 8 tasks above to complete Phase 3 in 2-3 hours.
