# Multi-Repository Architecture Overview

**Last Updated:** December 29, 2025  
**Architecture Type:** Multi-Repository Workspace with Shared Database

---

## Architecture Summary

SwipeSavvy is a **5-service multi-repository platform** with independent repositories/workspaces sharing a common PostgreSQL database:

**5 Core Services:**
1. **swipesavvy-mobile-app-v2** - Mobile application
2. **swipesavvy-ai-agents** - Backend API service
3. **swipesavvy-admin-portal** - Admin dashboard
4. **swipesavvy-customer-website-nextjs** - Customer website
5. **swipesavvy-wallet-web** - Wallet service

**Architecture Benefits:**
- **Modular Development:** Each of 5 services developed independently
- **Shared Database:** Single PostgreSQL (swipesavvy_agents) for all services
- **Flexible Deployment:** Deploy any combination of services
- **Clear Separation:** Each service has its own codebase and responsibility

---

## Repository Structure

### Multi-Repository Workspace Layout
**Root Location:** `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/`

```
Root Workspace (/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/)

├── 🔧 swipesavvy-mobile-app-v2/           [Service 1: Mobile App]
│   ├── .git/ (GitHub remote)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── 🔧 swipesavvy-ai-agents/               [Service 2: Backend API]
│   ├── app/
│   │   ├── models/
│   │   ├── services/
│   │   ├── tasks/
│   │   └── main.py
│   ├── schema.sql
│   └── .env
│
├── 🔧 swipesavvy-admin-portal/            [Service 3: Admin Dashboard]
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── 🔧 swipesavvy-customer-website-nextjs/ [Service 4: Customer Website]
│   ├── .git/ (GitHub remote)
│   ├── app/
│   ├── package.json
│   └── next.config.js
│
├── 🔧 swipesavvy-wallet-web/              [Service 5: Wallet Service]
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── shared/                                [Shared Resources]
│   └── [common utilities, configs]
│
└── tests/                                 [Shared Test Suite]

Database: PostgreSQL swipesavvy_agents (shared by all 5 services)
```

---

## 5 Core Services

### Service 1: swipesavvy-mobile-app-v2
**Type:** Service Repository  
**Language:** TypeScript/React  
**Purpose:** Mobile app frontend application  
**Location:** `/swipesavvy-mobile-app-v2/`

**Details:**
- URL: `https://github.com/SwipeDevUser/swipesavvy-mobile-app.git`
- Main Branch: `main`
- Deployment Branch: `mock-to-live-db`
- Build Tool: Vite
- Status: Ready

**Content:**
- React Native mobile application
- Vite build configuration
- Package dependencies

**Deployment:**
```bash
cd swipesavvy-mobile-app-v2
git checkout mock-to-live-db
git pull origin mock-to-live-db
npm install
npm run build
```

---

### Service 2: swipesavvy-ai-agents
**Type:** Service Repository  
**Language:** Python (FastAPI)  
**Purpose:** Backend API service with chat infrastructure  
**Location:** `/swipesavvy-ai-agents/`

**Architecture:**
```
app/
├── models/
│   ├── chat.py          (Chat ORM models - FIXED)
│   ├── user.py
│   └── __init__.py
├── services/
│   ├── chat_dashboard_service.py
│   └── [...other services]
├── tasks/
│   └── dashboard_broadcast.py (FIXED)
├── main.py              (FastAPI app - FIXED)
└── database.py
```

**Recent Updates:**
- ✅ ORM models aligned with shared Base
- ✅ Chat database schema implemented (8 tables)
- ✅ Background task method signatures corrected
- ✅ Database connection configured

**API Endpoints:**
- Health: `GET /health`
- Marketing: `GET /api/marketing/campaigns`
- Admin: `POST /api/v1/admin/users`
- Chat: WebSocket endpoints for real-time chat

**Deployment:**
```bash
cd swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

### Service 3: swipesavvy-admin-portal
**Type:** Service Repository  
**Language:** TypeScript/React  
**Purpose:** Admin dashboard for system management  
**Location:** `/swipesavvy-admin-portal/`

**Technology Stack:**
- Vite (build tool)
- React (UI framework)
- TypeScript (type safety)

**Port:** 5173 (development)

**Deployment:**
```bash
cd swipesavvy-admin-portal
npm install
npm run build
# Deploy dist/ folder to hosting
```

---

### Service 4: swipesavvy-customer-website-nextjs
**Type:** Service Repository  
**Language:** TypeScript/Next.js  
**Purpose:** Customer-facing website  
**Location:** `/swipesavvy-customer-website-nextjs/`

**Details:**
- URL: `https://github.com/SwipeDevUser/swipesavvy-customer-website.git`
- Branch: `main`
- Framework: Next.js (server-side rendering)
- Status: Ready

**Content:**
- Next.js application
- Server-side rendering
- Customer portal pages

**Deployment:**
```bash
cd swipesavvy-customer-website-nextjs
npm install
npm run build
npm run start
```

---

### Service 5: swipesavvy-wallet-web
**Type:** Service Repository  
**Language:** TypeScript/React  
**Purpose:** Web-based wallet interface  
**Location:** `/swipesavvy-wallet-web/`

**Technology Stack:**
- Vite (build tool)
- React (UI framework)
- TypeScript (type safety)

**Deployment:**
```bash
cd swipesavvy-wallet-web
npm install
npm run build
# Deploy dist/ folder to hosting
```

---

## Shared Resources

### Database
**Type:** PostgreSQL  
**Host:** localhost:5432  
**Database:** swipesavvy_agents  
**User:** postgres  
**Status:** ✅ Live with 8 chat tables

**Tables Created:**
- chat_rooms
- chat_sessions
- chat_participants
- chat_messages
- chat_typing_indicators
- chat_notification_preferences
- chat_blocked_users
- chat_audit_logs

### Environment Variables
Location: `.env` files in respective service directories

**Shared (swipesavvy-ai-agents/.env):**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/swipesavvy_agents
```

### Shared Dependencies
Location: `/shared/`
- Common utilities
- Shared configuration
- Helper functions

---

## Development Workflow

### Setting Up Local Environment

```bash
# 1. Navigate to workspace root
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# 2. Activate Python virtual environment
source .venv/bin/activate

# 3. Start database (if not running)
# PostgreSQL should be running on port 5432

# 4. Start backend service
cd swipesavvy-ai-agents
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 5. In new terminal, start admin portal
cd swipesavvy-admin-portal
npm install
npm run dev

# 6. In another terminal, start mobile app
cd swipesavvy-mobile-app-v2
npm install
npm run dev
```

### Git Workflow for swipesavvy-mobile-app-v2

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit
git add .
git commit -m "Your changes"

# Push branch
git push origin feature/your-feature

# Create PR for review

# Once approved, merge to main
git checkout main
git merge feature/your-feature
git push origin main

# Create deployment branch
git checkout -b mock-to-live-db
git push origin mock-to-live-db
```

---

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All services built and tested locally
- [ ] Database schema verified
- [ ] Environment variables configured
- [ ] Git branches synced with origin

### Deployment Sequence

**1. Deploy Backend (swipesavvy-ai-agents)**
```bash
cd swipesavvy-ai-agents
# Run migrations if any
# Start service with production settings
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**2. Deploy Mobile App (swipesavvy-mobile-app-v2)**
```bash
cd swipesavvy-mobile-app-v2
git checkout mock-to-live-db
npm install
npm run build
# Deploy to app store/hosting
```

**3. Deploy Admin Portal (swipesavvy-admin-portal)**
```bash
cd swipesavvy-admin-portal
npm install
npm run build
# Deploy dist/ to CDN/hosting
```

**4. Deploy Customer Website (swipesavvy-customer-website-nextjs)**
```bash
cd swipesavvy-customer-website-nextjs
npm install
npm run build
npm run start
```

**5. Deploy Wallet Service (swipesavvy-wallet-web)**
```bash
cd swipesavvy-wallet-web
npm install
npm run build
# Deploy dist/ to hosting
```

---

## Service Communication

### API Communication
```
Mobile App ──────┐
Admin Portal ────┤
Customer Website─┼──> FastAPI Backend (port 8000)
Wallet Service ──┘
       ↓
   PostgreSQL Database
```

### WebSocket Communication
- Real-time chat: Backend WebSocket endpoints
- Typing indicators: Real-time updates
- Notifications: Push through chat service

---

## Common Operations

### Restart All Services
```bash
# Kill running processes
pkill -f "uvicorn"
pkill -f "node"
pkill -f "next"

# Restart backend
cd swipesavvy-ai-agents
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Restart frontend services as needed
```

### Database Management
```bash
# Connect to database
psql -h 127.0.0.1 -U postgres -d swipesavvy_agents

# View chat tables
\dt chat*

# Run migrations
cd swipesavvy-ai-agents
python -m alembic upgrade head
```

### Check Service Status
```bash
# Backend API health
curl http://localhost:8000/health

# Admin Portal (if running)
curl http://localhost:5173

# Database connection
psql -h 127.0.0.1 -U postgres -c "SELECT 1"
```

---

## Current Status (December 29, 2025)

### Completed
- ✅ 8 chat database tables created and verified
- ✅ ORM models aligned with shared Base
- ✅ Backend API operational on port 8000
- ✅ Database connection to swipesavvy_agents configured
- ✅ Phone field added to users table
- ✅ mock-to-live-db branch created and pushed

### In Progress
- 🔄 Background task schema alignment (pending)
- 🔄 Admin portal development

### Pending
- ⏸️ Production deployment
- ⏸️ Performance optimization
- ⏸️ Security hardening

---

## Troubleshooting

### Backend Service Won't Start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
pkill -f "uvicorn"

# Restart
cd swipesavvy-ai-agents
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
psql -h 127.0.0.1 -U postgres -c "SELECT 1"

# Check database exists
psql -h 127.0.0.1 -U postgres -l | grep swipesavvy_agents

# Check connection string in .env
cat swipesavvy-ai-agents/.env
```

### Git Push Failures
```bash
# Ensure you're on correct branch
git status

# Pull latest changes
git pull origin main

# Retry push
git push origin mock-to-live-db
```

---

## Support & Documentation

- Backend API: [/health](http://localhost:8000/health)
- Admin Portal: [http://localhost:5173](http://localhost:5173)
- Database: PostgreSQL swipesavvy_agents
- Documentation: See DEPLOYMENT_READY_STATUS.md and GIT_MERGE_OPERATIONS_SUMMARY.md
