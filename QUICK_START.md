# SwipeSavvy Quick Start Guide

Get the SwipeSavvy platform running locally in minutes.

---

## Prerequisites

```bash
# Node.js 18+
node --version  # v18.x or higher

# Python 3.11+
python3 --version  # 3.11 or higher

# Expo CLI
npm install -g expo-cli
```

---

## 1. Backend API

```bash
# Navigate to backend
cd swipesavvy-ai-agents

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:** http://localhost:8000/docs

---

## 2. Mobile App (React Native/Expo)

```bash
# From project root
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Install dependencies
npm install

# Start Expo
npx expo start
```

**Options:**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app

---

## 3. Admin Portal

```bash
# Navigate to admin portal
cd swipesavvy-admin-portal

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access:** http://localhost:5173

---

## 4. Wallet Web

```bash
# Navigate to wallet web
cd swipesavvy-wallet-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Access:** http://localhost:3001

---

## Test Credentials

### Mobile App / Wallet Web
| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `Test123!` |

### Admin Portal
| Field | Value |
|-------|-------|
| Email | `admin@swipesavvy.com` |
| Password | `Admin123!` |

---

## Running Tests

### API Tests (100 tests)
```bash
cd swipesavvy-ai-agents
python3 -m pytest tests/test_comprehensive_api.py -v
```

### E2E Tests (60 tests)
```bash
cd deliverables/03-test-scaffolding/playwright
npm install
npx playwright test
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://api.swipesavvy.com |
| Admin Portal | https://admin.swipesavvy.com |
| Wallet Web | https://wallet.swipesavvy.com |
| Website | https://www.swipesavvy.com |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SwipeSavvy Platform                       │
├─────────────────────────────────────────────────────────────┤
│  Mobile App    Wallet Web    Admin Portal    Website        │
│  (Expo/RN)     (React)       (React)         (Next.js)      │
│      │             │             │               │          │
│      └─────────────┴──────┬──────┴───────────────┘          │
│                           │                                  │
│              Application Load Balancer (ALB)                │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │      FastAPI Backend    │                    │
│              │     (Python/Uvicorn)    │                    │
│              └────────────┬────────────┘                    │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│    PostgreSQL          Redis          Together.AI          │
│    (AWS RDS)       (ElastiCache)      (AI Services)        │
└─────────────────────────────────────────────────────────────┘
```

---

## Environment Variables

Create `.env` in project root:

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/swipesavvy
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your-secret-key
TOGETHER_API_KEY=your-together-ai-key

# Frontend
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :8000

# Kill existing process
kill -9 $(lsof -t -i:8000)
```

### Mobile app can't connect
- iOS Simulator: Use `localhost:8000`
- Android Emulator: Use `10.0.2.2:8000`
- Physical device: Use your computer's local IP

### Clear Expo cache
```bash
npx expo start --clear
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [PLATFORM_DOCUMENTATION.md](./PLATFORM_DOCUMENTATION.md) | Full platform architecture |
| [AWS_DEPLOYMENT_QUICKSTART.md](./AWS_DEPLOYMENT_QUICKSTART.md) | AWS deployment guide |
| [infrastructure/GITHUB_SECRETS.md](./infrastructure/GITHUB_SECRETS.md) | CI/CD configuration |

---

## Platform Status

| Component | Tests | Status |
|-----------|-------|--------|
| API Backend | 100/100 | Production Ready |
| Frontend E2E | 60/60 | Production Ready |
| Infrastructure | Terraform | Deployed |

---

*Last Updated: January 16, 2026*
