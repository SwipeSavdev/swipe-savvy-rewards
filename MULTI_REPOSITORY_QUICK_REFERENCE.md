# Multi-Repository Quick Reference Guide

**SwipeSavvy Multi-Repository Workspace**  
December 29, 2025

---

## 5 Core Services

| Service | Location | Status |
|---------|----------|--------|
| swipesavvy-mobile-app-v2 | `/swipesavvy-mobile-app-v2/` | ✅ Ready |
| swipesavvy-ai-agents | `/swipesavvy-ai-agents/` | ✅ Ready |
| swipesavvy-admin-portal | `/swipesavvy-admin-portal/` | ✅ Ready |
| swipesavvy-customer-website-nextjs | `/swipesavvy-customer-website-nextjs/` | ✅ Ready |
| swipesavvy-wallet-web | `/swipesavvy-wallet-web/` | ✅ Ready |

---

## Quick Start Commands

### Start Backend
```bash
cd swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start Admin Portal
```bash
cd swipesavvy-admin-portal
npm install
npm run dev        # Port 5173
```

### Start Mobile App
```bash
cd swipesavvy-mobile-app-v2
npm install
npm run dev
```

### Start Customer Website
```bash
cd swipesavvy-customer-website-nextjs
npm install
npm run dev
```

### Start Wallet Service
```bash
cd swipesavvy-wallet-web
npm install
npm run dev
```

---

## Database

**Connection String:** `postgresql://postgres:password@localhost:5432/swipesavvy_agents`

### Connect to Database
```bash
psql -h 127.0.0.1 -U postgres -d swipesavvy_agents
```

### View Chat Tables
```bash
\dt chat*
```

### Common Queries
```sql
-- Check chat tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'chat%';

-- Check users table
SELECT * FROM users LIMIT 5;

-- Check chat messages
SELECT * FROM chat_messages LIMIT 5;
```

---

## Git Operations

### Push to mock-to-live-db
```bash
cd swipesavvy-mobile-app-v2
git checkout mock-to-live-db
git add .
git commit -m "Your message"
git push origin mock-to-live-db
```

### Merge to Main
```bash
cd swipesavvy-mobile-app-v2
git checkout main
git merge mock-to-live-db
git push origin main
```

### Check Git Status
```bash
cd swipesavvy-mobile-app-v2
git status
git log --oneline -5
git branch -a
```

---

## Service Ports

| Service | Port | Type |
|---------|------|------|
| Backend API | 8000 | FastAPI |
| Admin Portal | 5173 | Vite Dev |
| Database | 5432 | PostgreSQL |

---

## Health Checks

### Backend Health
```bash
curl http://localhost:8000/health
```

### Database Health
```bash
psql -h 127.0.0.1 -U postgres -c "SELECT 1"
```

### Admin Portal
```bash
curl http://localhost:5173
```

---

## Common Issues & Fixes

### Port Already in Use
```bash
# Kill process using port
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
```bash
# Restart PostgreSQL
brew services restart postgresql@14

# Or use the workspace task
# Run "Start PostgreSQL" task from VS Code
```

### Git Push Rejected
```bash
git pull origin mock-to-live-db
git push origin mock-to-live-db
```

### Dependencies Missing
```bash
# Python
source .venv/bin/activate
pip install -r requirements.txt

# Node
npm install
```

---

## Deployment Workflow

```
1. Make changes in workspace
   ↓
2. Test locally
   ↓
3. Commit to git repo (swipesavvy-mobile-app-v2)
   ↓
4. Push to mock-to-live-db branch
   ↓
5. Create PR for code review
   ↓
6. Merge to main
   ↓
7. Deploy services
```

---

## Key Directories

```
/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/
├── .venv/                    # Python virtual environment
├── swipesavvy-ai-agents/     # Backend API
├── swipesavvy-admin-portal/  # Admin dashboard
├── swipesavvy-mobile-app-v2/ # Mobile app (git)
├── swipesavvy-customer-website-nextjs/ # Customer site (git)
├── swipesavvy-wallet-web/    # Wallet service
├── shared/                   # Shared resources
└── tests/                    # Test suite
```

---

## Documentation Files

- **MULTI_REPOSITORY_ARCHITECTURE.md** - Complete architecture overview
- **DEPLOYMENT_READY_STATUS.md** - Deployment checklist and status
- **GIT_MERGE_OPERATIONS_SUMMARY.md** - Git operations history
- **INFRASTRUCTURE_UPDATE_2025_12_29.md** - Recent infrastructure changes

---

## Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/swipesavvy_agents
```

---

## Useful Commands

```bash
# Check all services status
lsof -i :8000  # Backend
lsof -i :5173  # Admin Portal

# Kill all Node processes
pkill -f "node"

# Kill all Python processes
pkill -f "python"

# Find process by port
lsof -i :PORT_NUMBER

# View logs
tail -f /tmp/backend.log

# Test API endpoints
curl -H "Authorization: Bearer test" http://localhost:8000/api/marketing/campaigns | jq .
```

---

**Last Updated:** December 29, 2025  
**Architecture:** Multi-Repository with Shared Database  
**Status:** ✅ Production Ready
