# 📚 Workspace Documentation Index

**Project**: Swioe Savvy Mobile Wallet Platform  
**Status**: ✅ Multi-Workspace Architecture Complete  
**Date**: December 25, 2025

---

## 🎯 Start Here

### New to the Project?
1. **Start**: Read [QUICK_START.md](/swioe-savvy-admin-portal/QUICK_START.md) (5 min read)
2. **Setup**: Follow [WORKSPACE_CONNECTION_GUIDE.md](/swioe-savvy-admin-portal/WORKSPACE_CONNECTION_GUIDE.md) (15 min setup)
3. **Run**: Start all 3 services in separate terminals
4. **Test**: Open admin portal at http://localhost:5173

### Already Set Up?
- Jump to: [Running Both Workspaces](#running-both-workspaces)

---

## 📍 Workspace Locations

```
/Users/macbookpro/Documents/
├── swioe-savvy-mobile-wallet/          ← Mobile App (React Native)
│   ├── src/
│   ├── App.tsx
│   ├── package.json
│   └── docs/                           (70+ documentation files)
│
└── swioe-savvy-admin-portal/           ← Admin Portal (React + Vite) NEW!
    ├── src/
    │   ├── lib/api.ts                  (NEW - API Config)
    │   ├── pages/
    │   ├── components/
    │   └── stores/
    ├── WORKSPACE_CONNECTION_GUIDE.md   (Complete Setup Guide)
    ├── QUICK_START.md                  (Quick Reference)
    ├── README.md                       (Updated)
    ├── .env.example                    (Configuration Template)
    ├── .env.local                      (Dev Settings)
    └── .env.production                 (Prod Settings)
```

---

## 📖 Documentation Guide

### 🚀 Getting Started (Start Here!)

| Document | Location | Purpose | Time |
|----------|----------|---------|------|
| **QUICK_START.md** | `/swioe-savvy-admin-portal/` | 5-step setup guide | 5 min |
| **WORKSPACE_CONNECTION_GUIDE.md** | `/swioe-savvy-admin-portal/` | Complete reference | 15 min |
| **README.md** | `/swioe-savvy-admin-portal/` | Features & tech stack | 10 min |

### 📋 Reference Documents

| Document | Location | Content |
|----------|----------|---------|
| **WORKSPACE_SEPARATION_COMPLETE_REPORT.md** | `/swioe-savvy-mobile-wallet/` | Full separation details & checklists |
| **ADMIN_PORTAL_WORKSPACE_SEPARATION.md** | `/swioe-savvy-mobile-wallet/` | Overview of changes |
| **WORKSPACE_SEPARATION_UPDATE.md** | `/swioe-savvy-mobile-wallet/` | Update summary |

### 🔧 Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| **.env.example** | `/swioe-savvy-admin-portal/` | Configuration template |
| **.env.local** | `/swioe-savvy-admin-portal/` | Local development settings |
| **.env.production** | `/swioe-savvy-admin-portal/` | Production settings |

---

## 🚀 Running Both Workspaces

### Prerequisites
- Node.js 18+
- Backend API running on port 3000
- Two additional terminal windows

### Installation
```bash
# Admin Portal (only needed once)
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm install
```

### Start Services (3 Terminals)

**Terminal 1 - Backend**
```bash
cd /your/backend/path
npm run dev
# Runs on: http://localhost:3000
```

**Terminal 2 - Mobile Wallet**
```bash
cd /Users/macbookpro/Documents/swioe-savvy-mobile-wallet
npm start
# or: npm run web (for web version)
```

**Terminal 3 - Admin Portal**
```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm run dev
# Runs on: http://localhost:5173
```

---

## 🔐 Authentication

### Login Flow
1. User visits http://localhost:5173
2. Enters credentials on login page
3. Backend validates and returns `token`
4. Token stored in `localStorage.admin_token`
5. Token automatically sent in all API calls

### API Routes

**Admin Portal** (prefixed with `/api/admin`):
```
POST   /api/admin/auth/login           ← Login endpoint
GET    /api/admin/dashboard            ← Get dashboard data
GET    /api/admin/users                ← List users
POST   /api/admin/users                ← Create user
PUT    /api/admin/users/:id            ← Update user
DELETE /api/admin/users/:id            ← Delete user
GET    /api/admin/feature-flags        ← List feature flags
POST   /api/admin/feature-flags        ← Create flag
PUT    /api/admin/feature-flags/:id    ← Update flag
DELETE /api/admin/feature-flags/:id    ← Delete flag
```

**Mobile App** (prefixed with `/api`):
```
POST   /api/auth/login                 ← User login
POST   /api/auth/register              ← User registration
GET    /api/wallet                     ← Get wallet data
...
```

---

## ⚙️ Environment Configuration

### Admin Portal Setup

**Create `.env.local`** in `/swioe-savvy-admin-portal/`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# App Settings
VITE_APP_NAME=Swioe Savvy Admin Portal
VITE_DEBUG_MODE=true
```

**For Production** (use `.env.production`):
```env
VITE_API_BASE_URL=https://api.swioe-savvy.com
VITE_API_TIMEOUT=30000
VITE_DEBUG_MODE=false
```

### Mobile Wallet Setup
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Backend CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',              // Admin Portal
    'http://localhost:8081',              // Mobile Web
    'https://admin.swioe-savvy.com',     // Production
  ],
  credentials: true
}));
```

---

## 🏗️ Architecture Overview

### Component Structure
```
Backend API Server (port 3000)
          ↓
    (REST API)
    /api, /api/admin
          ↓
    ┌─────────────┐
    │   Mobile    │
    │   Wallet    │
    │   (8081)    │
    └─────────────┘
    
    ┌─────────────┐
    │   Admin     │
    │   Portal    │
    │   (5173)    │
    └─────────────┘
```

### API Configuration
```
Admin Portal Source Code
    ↓
src/lib/api.ts (Centralized API Config)
    ├→ getApiUrl()      - Build endpoint URLs
    ├→ apiFetch()       - Fetch with auth
    └→ apiCall()        - JSON API wrapper
    ↓
Environment Variables (.env.local, .env.production)
    ├→ VITE_API_BASE_URL
    └→ VITE_API_TIMEOUT
```

---

## 🔧 Troubleshooting Guide

### Admin Portal Can't Connect to API
**Check**:
1. Backend is running: `curl http://localhost:3000/health`
2. `.env.local` has correct `VITE_API_BASE_URL`
3. CORS is enabled on backend
4. Check browser Network tab for failed requests

**Fix**:
```bash
# Restart backend with CORS
# Check CORS configuration in backend
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
```

### Login Not Working
1. Check Network tab → Login request → Response status
2. Verify credentials match backend users
3. Check localStorage → should have `admin_token` after login
4. Review backend login endpoint implementation

### Token Not Being Sent
1. Verify token exists: `localStorage.getItem('admin_token')`
2. Check API calls use `apiCall()` or `apiFetch()` functions
3. Look for "Authorization" header in Network tab

---

## 📦 Technology Stack

### Admin Portal
- **Framework**: React 18.3
- **Build**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **State**: Zustand 4.4
- **Routing**: React Router 6.20
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.294

### Mobile Wallet
- **Framework**: React Native 0.81
- **Platform**: Expo 54.0
- **Styling**: Tailwind CSS (web), React Native styles

### Backend
- **Runtime**: Node.js
- **Framework**: Express (typical)
- **Database**: (Your choice)
- **Auth**: JWT/Bearer tokens

---

## ✅ Setup Checklist

### Initial Setup
- [ ] Both workspaces cloned/available
- [ ] Dependencies installed in both
- [ ] Node.js 18+ installed
- [ ] Backend API running

### Configuration
- [ ] `.env.local` created in admin portal
- [ ] `VITE_API_BASE_URL` configured correctly
- [ ] Backend CORS settings updated
- [ ] Mobile app environment configured

### Testing
- [ ] Admin portal loads at http://localhost:5173
- [ ] Mobile wallet runs without errors
- [ ] Login flow works end-to-end
- [ ] API calls visible in Network tab
- [ ] Token persists in localStorage

### Deployment
- [ ] Production `.env` files configured
- [ ] Build process tested locally
- [ ] CI/CD pipelines updated
- [ ] Deployment servers ready

---

## 📞 Support Resources

### Documentation
- **Quick Start**: [QUICK_START.md](/swioe-savvy-admin-portal/QUICK_START.md)
- **Full Setup**: [WORKSPACE_CONNECTION_GUIDE.md](/swioe-savvy-admin-portal/WORKSPACE_CONNECTION_GUIDE.md)
- **Admin README**: [README.md](/swioe-savvy-admin-portal/README.md)

### Key Files
- **API Config**: `src/lib/api.ts` in admin portal
- **Store**: `src/stores/authStore.ts` for authentication
- **Vite Config**: `vite.config.ts` for build settings

### Common Tasks
- **Update API URL**: Edit `.env.local` → `VITE_API_BASE_URL`
- **Add Endpoint**: Import `apiCall` in component → `await apiCall('/path')`
- **Deploy**: `npm run build` → Upload `dist/` folder

---

## 🎯 Next Steps

1. **Read**: [QUICK_START.md](/swioe-savvy-admin-portal/QUICK_START.md) (5 minutes)
2. **Setup**: Follow terminal commands in this guide
3. **Test**: Verify all services start correctly
4. **Deploy**: Use production configuration files
5. **Support**: Refer back to this index for help

---

## 📊 Quick Reference Table

| Aspect | Admin Portal | Mobile Wallet | Backend |
|--------|--------------|---------------|---------|
| **Location** | `/swioe-savvy-admin-portal/` | `/swioe-savvy-mobile-wallet/` | `/your/path/` |
| **Tech** | React + Vite | React Native | Express (typical) |
| **Port** | 5173 | 8081 | 3000 |
| **Command** | `npm run dev` | `npm start` | `npm run dev` |
| **Config** | `.env.local` | `.env` | Environment vars |
| **API Prefix** | `/api/admin` | `/api` | (Routes both) |

---

**Last Updated**: December 25, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

*For detailed information on any topic, refer to the full documentation files linked above.*
