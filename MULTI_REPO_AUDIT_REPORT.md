# Multi-Repository Architecture Audit Report

**Date**: December 25, 2024  
**Status**: ⚠️ ISSUES FOUND - ACTION REQUIRED

---

## Executive Summary

All four repositories exist with correct naming conventions, but there are **critical inconsistencies** in API endpoint configuration that will prevent seamless integration. The main issues are:

1. **Hardcoded IP Address**: Mobile wallet uses `192.168.1.142:8000` instead of `localhost:8000`
2. **Port Mismatch**: AI agents points to port `8080` instead of `8000`
3. **Environment Variable Naming**: Inconsistent var names across repos (`API_BASE_URL` vs `VITE_API_BASE_URL` vs `AI_API_BASE_URL`)

---

## Repository Status

### ✅ swipesavvy-mobile-app (React Native/Expo)
- **Port**: 8081 (Expo development server)
- **Framework**: React Native + Expo v54.0.0
- **API Config**: 
  ```
  API_BASE_URL=http://localhost:8000
  AI_API_BASE_URL=http://192.168.1.142:8000  ⚠️ HARDCODED IP
  WS_URL=ws://localhost:8000
  ```
- **Status**: ✅ Running, functional
- **Issue**: Has hardcoded IP for AI API (192.168.1.142) - should be localhost

### ✅ swipesavvy-admin-portal (React/Vite)
- **Port**: 5173 (Vite dev server)
- **Framework**: Vite + React + TypeScript
- **API Config**:
  ```
  VITE_API_BASE_URL=http://localhost:8000
  VITE_API_TIMEOUT=30000
  VITE_DEBUG_MODE=true
  ```
- **Status**: ✅ Correct, not yet started
- **Issue**: None identified

### ⚠️ swipesavvy-mobile-wallet (React Native/Expo)
- **Port**: Not specified (likely 8082 or 8083)
- **Framework**: React Native + Expo
- **API Config**:
  ```
  AI_API_BASE_URL=http://192.168.1.142:8000  ⚠️ HARDCODED IP
  MOCK_API=true
  ```
- **Status**: ⚠️ Not started, has hardcoded IP
- **Issue**: Hardcoded IP address will fail in production/different networks

### ⚠️ swipesavvy-ai-agents (Python/FastAPI)
- **Port**: Unknown (backend server)
- **Framework**: Python FastAPI
- **API Config**:
  ```
  DATABASE_URL=postgresql://postgres:password@localhost:5432/swipesavvy_agents
  REDIS_URL=redis://localhost:6379/0
  BACKEND_API_URL=http://localhost:8080/api/v1  ⚠️ WRONG PORT
  ```
- **Status**: ⚠️ Structure visible, not verified
- **Issue**: Points to port 8080 instead of 8000

---

## Issues & Fixes Required

### Issue #1: Hardcoded IP Addresses ⚠️ CRITICAL
**Repos Affected**: 
- swipesavvy-mobile-app (AI_API_BASE_URL)
- swipesavvy-mobile-wallet (AI_API_BASE_URL)

**Problem**: Uses hardcoded IP `192.168.1.142:8000` instead of `localhost:8000`

**Impact**: 
- Works only on specific network
- Breaks in production
- Breaks when developer network changes
- Can't deploy to other machines

**Fix**:
```diff
- AI_API_BASE_URL=http://192.168.1.142:8000
+ AI_API_BASE_URL=http://localhost:8000
```

### Issue #2: Port Mismatch ⚠️ CRITICAL
**Repos Affected**: 
- swipesavvy-ai-agents

**Problem**: `BACKEND_API_URL` points to `localhost:8080` instead of `localhost:8000`

**Impact**:
- AI agents won't connect to main backend
- Mobile apps can't reach AI agents

**Fix**:
```diff
- BACKEND_API_URL=http://localhost:8080/api/v1
+ BACKEND_API_URL=http://localhost:8000/api/v1
```

### Issue #3: Inconsistent Environment Variable Naming ⚠️ MEDIUM
**Repos Affected**: All four

**Problem**: Different naming conventions:
- Mobile app: `API_BASE_URL`, `AI_API_BASE_URL`, `WS_URL`
- Admin portal: `VITE_API_BASE_URL`
- Mobile wallet: `AI_API_BASE_URL`
- AI agents: `BACKEND_API_URL`

**Impact**:
- Developers need to remember different var names
- Shared services harder to implement
- Error-prone when updating endpoints

**Recommended Standard**:
```
API_BASE_URL=http://localhost:8000
AI_API_BASE_URL=http://localhost:8000
WS_URL=ws://localhost:8000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## Port Assignment Map

```
Service                          Port    Status
─────────────────────────────────────────────────
Mobile App (Expo)                8081    ✅ Running
Admin Portal (Vite)              5173    ⏳ Ready to start
Mobile Wallet (Expo)             8082?   ⏳ Unknown
Backend API (Main)               8000    ❓ Unknown
AI Agents (FastAPI)              8080    ⚠️ Wrong in config
Redis Cache                      6379    ❓ Unknown
PostgreSQL Database              5432    ✅ Configured
```

---

## Configuration Standardization

### Recommended .env.local Template (All Repos)

```env
# ============================================
# API Endpoints
# ============================================
API_BASE_URL=http://localhost:8000
AI_API_BASE_URL=http://localhost:8000
WS_URL=ws://localhost:8000

# ============================================
# Database (Backend/AI Agents)
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/swipesavvy_agents
REDIS_URL=redis://localhost:6379/0

# ============================================
# Feature Flags
# ============================================
DEBUG_MODE=true
MOCK_API=false
ENABLE_AI_CONCIERGE=true
ENABLE_VOICE_INPUT=false
ENABLE_BIOMETRIC_AUTH=false

# ============================================
# Timeouts & Performance
# ============================================
API_TIMEOUT=30000
AI_STREAM_TIMEOUT=30000
AI_CACHE_TTL=300000
```

### Repo-Specific Overrides

**Admin Portal** (`swipesavvy-admin-portal/.env.local`):
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_DEBUG_MODE=true
```

**Mobile App** (`swipesavvy-mobile-app/.env.local`):
```env
API_BASE_URL=http://localhost:8000
AI_API_BASE_URL=http://localhost:8000  # Remove hardcoded IP
WS_URL=ws://localhost:8000
EXPO_NO_DOTENV=1
```

**Mobile Wallet** (`swipesavvy-mobile-wallet/.env.local`):
```env
AI_API_BASE_URL=http://localhost:8000  # Remove hardcoded IP
MOCK_API=false  # Set to true for local testing without backend
AUTH_ENABLED=true
ENABLE_VOICE_INPUT=true
```

**AI Agents** (`swipesavvy-ai-agents/.env`):
```env
BACKEND_API_URL=http://localhost:8000/api/v1  # Change from 8080
DATABASE_URL=postgresql://postgres:password@localhost:5432/swipesavvy_agents
REDIS_URL=redis://localhost:6379/0
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  Development Setup                  │
└─────────────────────────────────────────────────────┘

Client Layer:
├─ Mobile App (Expo)          │ Port 8081
├─ Admin Portal (Vite)        │ Port 5173
└─ Mobile Wallet (Expo)       │ Port 8082?
       ↓ HTTP + WebSocket
┌─────────────────────────────────────────────────────┐
│           Backend Services (All localhost)          │
├─────────────────────────────────────────────────────┤
│ Main API Backend             │ Port 8000            │
│ AI Agents (FastAPI)          │ Port 8080? (WRONG)   │
│ PostgreSQL Database          │ Port 5432            │
│ Redis Cache                  │ Port 6379            │
└─────────────────────────────────────────────────────┘
```

---

## Integration Testing Checklist

- [ ] Fix hardcoded IP in mobile-app `.env.local`
- [ ] Fix hardcoded IP in mobile-wallet `.env.local`
- [ ] Fix port 8080 → 8000 in ai-agents `.env`
- [ ] Standardize environment variable names across all repos
- [ ] Start backend API on port 8000
- [ ] Start mobile app on port 8081 (verify it can reach 8000)
- [ ] Start admin portal on port 5173 (verify it can reach 8000)
- [ ] Start mobile wallet on port 8082 (verify it can reach 8000)
- [ ] Test AI concierge communication (mobile → AI agents → backend)
- [ ] Test admin portal endpoints
- [ ] Verify WebSocket connections working
- [ ] Verify Redis/PostgreSQL connectivity from all services

---

## Next Steps

1. **URGENT**: Fix hardcoded IPs and port mismatches (Issue #1 & #2)
2. Standardize environment variable naming (Issue #3)
3. Create shared `.env.example` files with proper documentation
4. Document the port assignment and service discovery
5. Add integration tests to verify all services can communicate
6. Consider Docker Compose setup for simplified local development

---

## Commands to Apply Fixes

```bash
# Fix mobile-app hardcoded IP
sed -i '' 's/192.168.1.142:8000/localhost:8000/g' \
  /Users/macbookpro/Documents/swipesavvy-mobile-app/.env.local

# Fix mobile-wallet hardcoded IP
sed -i '' 's/192.168.1.142:8000/localhost:8000/g' \
  /Users/macbookpro/Documents/swipesavvy-mobile-wallet/.env.local

# Fix ai-agents port
sed -i '' 's/localhost:8080/localhost:8000/g' \
  /Users/macbookpro/Documents/swipesavvy-ai-agents/.env
```

---

**Report Generated**: 2024-12-25  
**Audit Scope**: All 4 production repositories  
**Recommendation**: Apply fixes immediately before further development
