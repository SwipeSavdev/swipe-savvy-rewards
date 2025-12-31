# Quick Start Guide - SwipeSavvy Admin Portal

## ✅ Everything is Running

**Status**: ✅ All services operational

**Required Order to Start:**
1. PostgreSQL: `brew services start postgresql@14`
2. Backend API: `http://127.0.0.1:8000`
3. Admin Portal: `http://127.0.0.1:5173`

**Do NOT start Admin Portal before Backend API is running!**

---

## 🗄️ PostgreSQL Setup

### Databases Created
Three PostgreSQL 14.20 databases are configured and ready:
```
swipesavvy_ai     - AI campaigns and marketing data
swipesavvy_dev    - Admin portal data (users, merchants, tickets, audit logs, settings)
swipesavvy_wallet - Wallet/payment related data
```

### Start PostgreSQL
```bash
# PostgreSQL is configured to auto-start
# If needed to restart manually:
bash /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/start_postgres.sh
```

### PostgreSQL Connection Strings
```
postgresql://localhost:5432/swipesavvy_ai
postgresql://localhost:5432/swipesavvy_dev
postgresql://localhost:5432/swipesavvy_wallet
```

### Verify PostgreSQL is Running
```bash
psql -l | grep swipesavvy
# Should show all 3 databases
```

---

## 🚀 Startup Order (IMPORTANT)

### Step 1: Start PostgreSQL Database
```bash
# Start PostgreSQL service
brew services start postgresql@14

# Verify databases are accessible
psql -l | grep swipesavvy
# Should show all 3 databases: swipesavvy_ai, swipesavvy_dev, swipesavvy_wallet
```

### Step 2: Start Backend API (Port 8000)
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Or in background:
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &
```

**Verify Backend is Running:**
```bash
curl http://127.0.0.1:8000/health
# Should return: {"status":"healthy","service":"swipesavvy-backend","version":"1.0.0"}
```

### Step 3: Start Admin Portal (Port 5173)
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-admin-portal
npm run dev
```

**Access Admin Portal:**
- http://127.0.0.1:5173
- http://localhost:5173

---

## 🔑 Demo Credentials

```
Email: admin@swipesavvy.com
Password: Admin123!
```

Alternative accounts:
- support@swipesavvy.com / Support123! (support role)
- ops@swipesavvy.com / Ops123! (admin role)

---

## 📚 API Endpoints (13 Implemented)

### Authentication (4)
```
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/refresh
POST   /api/v1/admin/auth/logout
GET    /api/v1/admin/auth/me
```

### Dashboard (7)
```
GET    /api/v1/admin/dashboard/overview
GET    /api/v1/admin/analytics/overview
GET    /api/v1/admin/analytics/transactions
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/funnel/onboarding
GET    /api/v1/admin/analytics/cohort/retention
GET    /api/v1/admin/support/stats
```

### Users (6)
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users
GET    /api/v1/admin/users/{userId}
PUT    /api/v1/admin/users/{userId}/status
DELETE /api/v1/admin/users/{userId}
GET    /api/v1/admin/users/stats/overview
```

---

## 🧪 Test API Endpoints

### Login
```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swipesavvy.com","password":"Admin123!"}'
```

### List Users
```bash
curl http://localhost:8000/api/v1/admin/users
```

### Create User
```bash
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@test.com","name":"New User","invite":true}'
```

### Get Dashboard Overview
```bash
curl http://localhost:8000/api/v1/admin/dashboard/overview \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Demo Data Available

### Users (5)
- Alice Johnson (active)
- Bob Smith (active)
- Carol White (active)
- David Brown (suspended)
- Emma Davis (active)

### Stats
- Dashboard: Real-time metrics with trends
- Analytics: 30-day transaction/revenue data
- Support: Ticket counts and response times

---

## 📄 Key Files

### Backend
- `/swipesavvy-ai-agents/app/main.py` - Entry point
- `/swipesavvy-ai-agents/app/routes/admin_auth.py` - Authentication
- `/swipesavvy-ai-agents/app/routes/admin_dashboard.py` - Dashboard/Analytics
- `/swipesavvy-ai-agents/app/routes/admin_users.py` - User Management

### PostgreSQL
- `/start_postgres.sh` - Start PostgreSQL service and verify databases
- `/setup_postgres.py` - Setup script (already run)

### Frontend
- `/swipesavvy-admin-portal/src/services/apiClient.ts` - Real API client
- `/swipesavvy-admin-portal/src/pages/DashboardPage.tsx` - Dashboard
- `/swipesavvy-admin-portal/src/pages/UsersPage.tsx` - Users
- `/swipesavvy-admin-portal/src/pages/LoginPage.tsx` - Login

---

## 🎯 What's Implemented

✅ User Authentication with JWT  
✅ Dashboard Overview & Analytics  
✅ User Management (CRUD)  
✅ Token Refresh Logic  
✅ Real API Integration  
✅ Error Handling  
✅ Demo Data Generation  
✅ PostgreSQL 14.20 with 3 databases (swipesavvy_ai, swipesavvy_dev, swipesavvy_wallet)

---

## ❓ Common Issues

### PostgreSQL Not Starting
```bash
# Check if already running
psql -l | grep swipesavvy

# If not running, start it
bash /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/start_postgres.sh

# Or start manually
/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql@14 -k /tmp &
```

### Backend Port 8000 Already in Use
```bash
# Kill existing process
lsof -i :8000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9

# Then restart
python -c "from app.main import app; import uvicorn; uvicorn.run(app, host='0.0.0.0', port=8000)"
```

### PostgreSQL Role "postgres" Not Found
PostgreSQL is configured to use the current user (macbookpro). Connection commands should work with:
```bash
psql  # Automatically uses current user
createdb  # Also uses current user
```

---

## 📊 Verification Checklist

**Before accessing Admin Portal, verify in order:**

1. **PostgreSQL Running**
   ```bash
   psql -l | grep swipesavvy
   # Should show all 3 databases
   ```

2. **Backend API Running**
   ```bash
   curl http://127.0.0.1:8000/health
   # Should return: {"status":"healthy",...}
   ```

3. **Admin Portal Running**
   ```bash
   curl http://127.0.0.1:5173
   # Should return HTML
   ```

4. **Login Works**
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@swipesavvy.com","password":"Admin123!"}'
   # Should return a token
   ```

### Admin Portal Not Loading
```bash
# MUST HAVE BACKEND RUNNING FIRST!
# Verify backend is running:
curl http://127.0.0.1:8000/health

# If backend not responding, start it:
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &

# Then start admin portal:
cd swipesavvy-admin-portal
npm run dev

# Clear browser cache:
# Safari: Cmd+Shift+Delete
# Chrome: Cmd+Shift+Delete
# Then hard refresh: Cmd+Shift+R
```

### Authentication Not Working
```bash
# Verify demo credentials
curl http://localhost:8000/api/v1/admin/auth/demo-credentials

# Check backend logs for errors
# Make sure email-validator is installed: pip install email-validator
```

---

## 📞 Support

For issues or questions:
1. Check backend logs: Look for ❌ errors in console
2. Check frontend console: Browser DevTools → Console tab
3. Test endpoints directly with curl
4. Verify services are running on correct ports

---

**Last Updated**: December 30, 2025  
**Status**: Production Ready for Testing  

## ⚠️ IMPORTANT STARTUP ORDER

```
1. PostgreSQL Database (required for backend)
   ↓
2. Backend API on Port 8000 (required for admin portal)
   ↓
3. Admin Portal on Port 5173 (frontend)
```

**If Admin Portal shows blank page or "Load failed" error:**
- Check if Backend API is running: `curl http://127.0.0.1:8000/health`
- If backend not running, start it first before admin portal
- Hard refresh browser: Cmd+Shift+R
