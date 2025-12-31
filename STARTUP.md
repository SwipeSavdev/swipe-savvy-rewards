# 🚀 SwipeSavvy Multi-Repository Startup Guide

**Last Updated:** December 26, 2025  
**Status:** ✅ All Applications Running & Tested

---

## 📋 TL;DR - Get Everything Running in 5 Minutes

```bash
# Terminal 1: Mobile App (Expo)
cd swipesavvy-mobile-app && npm install --legacy-peer-deps && npm start

# Terminal 2: Admin Portal (Vite React)
cd swipesavvy-admin-portal && npm install && npm run dev
# → http://localhost:5173

# Terminal 3: Customer Website (Python)
cd swipesavvy-customer-website && python3 -m http.server 8080
# → http://localhost:8080

# Terminal 4: Mobile Wallet (Expo)
cd swipesavvy-mobile-wallet && npm install --legacy-peer-deps && npm start

# Terminal 5: AI Agents Backend (FastAPI)
cd swipesavvy-ai-agents && source venv/bin/activate && python3 app/main.py
# → http://localhost:8000
```

---

## 🗺️ Platform Overview

| Platform | Framework | Port | Tech Stack | Status |
|----------|-----------|------|-----------|--------|
| **Mobile App** | React Native + Expo | Dev | TS, Expo, WebSocket | ✅ Running |
| **Admin Portal** | React + Vite | 5173 | TS, React Router, Tailwind | ✅ Running |
| **Customer Website** | React + Vite | 8080 | TypeScript, Tailwind | ✅ Running |
| **Mobile Wallet** | React Native + Expo | Dev | TS, Expo, NestJS | ✅ Running |
| **AI Agents** | FastAPI | 8000 | Python, Pydantic, SQLAlchemy | ✅ Running |

---

## 🏃 Quick Start by Application

### 1️⃣ Mobile App
**Path:** `/swipesavvy-mobile-app`

```bash
cd swipesavvy-mobile-app
npm install --legacy-peer-deps
npm start

# Press 'w' for web preview
# Press 'i' for iOS simulator  
# Press 'a' for Android emulator
# Scan QR code with Expo Go
```

**Key Features:**
- 💬 AI Concierge chat with streaming responses
- 💳 Account management and linking
- 💸 Money transfers between accounts
- 🎁 Rewards and points system
- 👤 User profile with preferences
- 🔐 Secure authentication

**Backend:** Connects to `http://localhost:8002` (see Mobile Wallet for Merchant Network)

**Documentation:**
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Architecture & structure
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - UI/UX audit results
- [AI_CONCIERGE_INTEGRATION_GUIDE.md](./AI_CONCIERGE_INTEGRATION_GUIDE.md) - Chat integration
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) - Component library

---

### 2️⃣ Admin Portal
**Path:** `/swipesavvy-admin-portal`

```bash
cd swipesavvy-admin-portal
npm install
npm run dev
# → http://localhost:5173

# Auto-login as demo user (dev mode)
```

**Key Features:**
- 📊 Dashboard with analytics
- 🎯 AI Marketing campaign management
- 💬 Savvy Concierge management
- 👥 User management
- 🔧 Settings and configuration
- 📈 Business metrics

**Login:** Auto-logged in dev mode (token: `demo_token_dev`)

**Documentation:**
- [README.md](./README.md) - Project overview
- [ADMIN_PORTAL_ARCHITECTURE.md](./ADMIN_PORTAL_ARCHITECTURE.md) - System design
- [SAVVY_AI_DOCUMENTATION.md](./SAVVY_AI_DOCUMENTATION.md) - Concierge features

---

### 3️⃣ Customer Website
**Path:** `/swipesavvy-customer-website`

```bash
cd swipesavvy-customer-website
npm run build
python3 -m http.server 8080
# → http://localhost:8080
```

**Key Features:**
- 🏠 Landing page with features
- 🔐 User authentication
- 💼 Dashboard
- 🎨 Brand integration
- 📱 Responsive design

**Documentation:**
- [START_HERE.md](./START_HERE.md) - Quick start
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation & configuration
- [README.md](./README.md) - Project structure
- [INTEGRATION_QUICK_START.md](./INTEGRATION_QUICK_START.md) - API integration

---

### 4️⃣ Mobile Wallet
**Path:** `/swipesavvy-mobile-wallet`

```bash
cd swipesavvy-mobile-wallet
npm install --legacy-peer-deps
npm start

# Press 'w' for web preview
# Scan QR code with Expo Go
```

**Key Features:**
- 💳 Wallet management
- 🎯 Merchant integration (Merchant Network backend on port 8002)
- 📱 Transaction history
- 🔐 Secure authentication
- 🌙 Dark mode support

**Backend:** Merchant Network on port 8002, AI Concierge on port 8000

**Documentation:**
- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - Getting started
- [README.md](./README.md) - Overview
- [SAVVY_AI_INTEGRATION_GUIDE.md](./SAVVY_AI_INTEGRATION_GUIDE.md) - AI features
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current state

---

### 5️⃣ AI Agents Backend
**Path:** `/swipesavvy-ai-agents`

```bash
cd swipesavvy-ai-agents
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app/main.py
# → http://localhost:8000
```

**Key Features:**
- 🤖 AI Concierge (natural language understanding)
- 📊 Marketing AI for campaigns
- 🏪 Merchant Network backend
- 📧 Email notifications
- 📈 Analytics engine
- 🔄 WebSocket for real-time updates

**API Endpoints:**
- `/api/v1/chat` - Chat with AI Concierge
- `/api/v1/campaigns` - Marketing campaigns
- `/api/v1/merchants` - Merchant data
- `/api/v1/notifications` - Send notifications
- `/ws` - WebSocket for streaming

**Documentation:**
- [README.md](./README.md) - Project overview
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current implementation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production setup
- [MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md) - Test data setup

---

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                       │
├────────────────────┬──────────────────┬─────────────────────┤
│   Mobile App       │  Admin Portal    │ Customer Website    │
│  (React Native)    │  (React Vite)    │  (React Vite)       │
│   Port: Dev        │   Port: 5173     │   Port: 8080        │
└────────────────────┴──────────────────┴─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                     │
│  (Request routing, authentication, rate limiting)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌─────────────┐    ┌─────────────┐    ┌──────────────────┐
   │ AI Concierge│    │ Marketing AI │   │ Merchant Network │
   │  (FastAPI)  │    │  (FastAPI)   │   │  (FastAPI/Node)  │
   │ Port: 8000  │    │ Port: 8001   │   │  Port: 8002      │
   └─────────────┘    └─────────────┘    └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │      PostgreSQL Database            │
        │   (User, Account, Transaction Data) │
        └─────────────────────────────────────┘
```

---

## 🔌 Inter-Service Communication

### Mobile App ↔ Backend
- **WebSocket:** `ws://localhost:8000/ws` - AI Concierge streaming
- **REST API:** `http://localhost:8002` - Merchant Network
- **Auth:** Token-based (JWT stored in localStorage)

### Admin Portal ↔ Backend
- **REST API:** Connected to AI Concierge and Marketing AI
- **Polling:** Dashboard metrics from port 8000
- **Auth:** Dev token (`demo_token_dev`) in localStorage

### Customer Website ↔ Backend
- **REST API:** User authentication and account data
- **REST API:** Marketing data from Analytics service

### AI Services ↔ Database
- **SQLAlchemy ORM** with PostgreSQL
- **WebSocket events** for real-time updates
- **Async/await** for concurrent operations

---

## 🛠️ Environment & Setup

### Prerequisites
```
Node.js v18+
Python 3.9+
npm/yarn
PostgreSQL (for production)
```

### Repository Structure
```
/
├── swipesavvy-mobile-app/          # Main mobile app (Expo)
│   └── src/
│       ├── app/                    # App entry & navigation
│       ├── features/               # Feature modules
│       ├── design-system/          # UI components
│       └── packages/ai-sdk/        # AI integration
│
├── swipesavvy-admin-portal/        # Admin dashboard (React)
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Shared components
│   │   ├── stores/                 # Zustand state
│   │   └── routes/                 # Route config
│   └── vite.config.ts
│
├── swipesavvy-customer-website/    # Marketing website (React)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── swipesavvy-mobile-wallet/       # Wallet app (React Native)
│   └── src/
│       ├── app/
│       ├── features/
│       └── design-system/
│
└── swipesavvy-ai-agents/           # Backend services (FastAPI)
    ├── app/
    │   ├── main.py                 # FastAPI server
    │   ├── api/                    # API routes
    │   ├── models/                 # Data models
    │   ├── services/               # Business logic
    │   └── database/               # DB config
    └── requirements.txt
```

---

## 🚀 Common Tasks

### Run All Applications
```bash
# Terminal 1
cd swipesavvy-mobile-app && npm start

# Terminal 2
cd swipesavvy-admin-portal && npm run dev

# Terminal 3
cd swipesavvy-customer-website && python3 -m http.server 8080

# Terminal 4
cd swipesavvy-mobile-wallet && npm start

# Terminal 5
cd swipesavvy-ai-agents && source venv/bin/activate && python3 app/main.py
```

### Build for Production
```bash
# Mobile App
cd swipesavvy-mobile-app && npm run build

# Admin Portal
cd swipesavvy-admin-portal && npm run build

# Customer Website
cd swipesavvy-customer-website && npm run build

# Mobile Wallet
cd swipesavvy-mobile-wallet && npm run build

# AI Agents (Docker)
cd swipesavvy-ai-agents && docker build -t swipesavvy-ai-agents .
```

### Run Tests
```bash
# Mobile App
cd swipesavvy-mobile-app && npm test

# Admin Portal
cd swipesavvy-admin-portal && npm test

# Customer Website
cd swipesavvy-customer-website && npm test

# Mobile Wallet
cd swipesavvy-mobile-wallet && npm test
```

### View Logs
```bash
# Expo Metro bundler
# Check terminal where npm start is running

# FastAPI server logs
# Check terminal where python3 app/main.py is running

# Vite dev server logs
# Check terminal where npm run dev is running
```

---

## 🐛 Troubleshooting

### Mobile App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Check Expo version
expo --version

# Try clearing Expo cache
expo start --clear
```

### Admin Portal blank page
- Check browser console (F12) for errors
- Verify token is set in localStorage: `admin_token = demo_token_dev`
- Check that Vite dev server is running on 5173
- Clear browser cache and reload

### Backend connection issues
```bash
# Test AI Agents endpoint
curl http://localhost:8000/docs

# Test Merchant Network
curl http://localhost:8002/health

# Check WebSocket
wscat -c ws://localhost:8000/ws
```

### Database connection errors
```bash
# Check PostgreSQL is running
psql -U postgres

# Reset migrations
cd swipesavvy-ai-agents
alembic downgrade base
alembic upgrade head
```

### Setting up mock data
The database setup and ingestion scripts are located in `/tools/`:

```bash
# Initialize the database with schema
cd tools/database
./init_database.sh production

# Ingest mock data
./ingest_mock_data.sh
```

See [tools/database/MOCK_DATA_INGESTION_GUIDE.md](./tools/database/MOCK_DATA_INGESTION_GUIDE.md) for full instructions.

---

## 📚 Documentation Index

### By Platform

**Mobile App** (`swipesavvy-mobile-app/`)
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Dev setup & architecture
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - UI/UX audit
- [AI_CONCIERGE_INTEGRATION_GUIDE.md](./AI_CONCIERGE_INTEGRATION_GUIDE.md) - Chat integration
- [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md) - Component library

**Admin Portal** (`swipesavvy-admin-portal/`)
- [README.md](./README.md) - Project overview
- [ADMIN_PORTAL_ARCHITECTURE.md](./ADMIN_PORTAL_ARCHITECTURE.md) - System design
- [SAVVY_AI_DOCUMENTATION.md](./SAVVY_AI_DOCUMENTATION.md) - Concierge features

**Customer Website** (`swipesavvy-customer-website/`)
- [START_HERE.md](./START_HERE.md) - Quick start
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Installation & config
- [README.md](./README.md) - Project structure
- [INTEGRATION_QUICK_START.md](./INTEGRATION_QUICK_START.md) - API integration

**Mobile Wallet** (`swipesavvy-mobile-wallet/`)
- [STARTUP_GUIDE.md](./STARTUP_GUIDE.md) - Getting started
- [README.md](./README.md) - Project overview
- [SAVVY_AI_INTEGRATION_GUIDE.md](./SAVVY_AI_INTEGRATION_GUIDE.md) - AI features

**AI Agents** (`swipesavvy-ai-agents/`)
- [README.md](./README.md) - Project overview
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current state
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production setup
- [MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md) - Test data

### By Topic

**Setup & Deployment**
- [STARTUP_GUIDE.md](./swipesavvy-mobile-app/STARTUP_GUIDE.md) - Multi-repo startup
- [COMPLETE_DEPLOYMENT_GUIDE.md](./swipesavvy-mobile-app/COMPLETE_DEPLOYMENT_GUIDE.md) - Production deployment
- [DOCKER_AND_REPOSITORY_SETUP.md](./swipesavvy-mobile-app/DOCKER_AND_REPOSITORY_SETUP.md) - Docker setup

**Architecture & Design**
- [ADMIN_PORTAL_ARCHITECTURE.md](./swipesavvy-mobile-app/ADMIN_PORTAL_ARCHITECTURE.md) - Admin system
- [DESIGN_SYSTEM_GUIDE.md](./swipesavvy-mobile-app/DESIGN_SYSTEM_GUIDE.md) - UI components
- [MULTI_REPOSITORY_OVERVIEW.md](./swipesavvy-mobile-app/MULTI_REPOSITORY_OVERVIEW.md) - System overview

**Feature Integration**
- [AI_CONCIERGE_INTEGRATION_GUIDE.md](./swipesavvy-mobile-app/AI_CONCIERGE_INTEGRATION_GUIDE.md) - Chat system
- [AI_MARKETING_IMPLEMENTATION_INDEX.md](./swipesavvy-mobile-app/AI_MARKETING_IMPLEMENTATION_INDEX.md) - Marketing AI
- [DATABASE_SETUP_GUIDE.md](./swipesavvy-mobile-app/DATABASE_SETUP_GUIDE.md) - Database config

**Testing & QA**
- [TESTING_GUIDE.md](./swipesavvy-mobile-app/TESTING_GUIDE.md) - Test strategy
- [CYPRESS_E2E_IMPLEMENTATION.md](./swipesavvy-mobile-app/CYPRESS_E2E_IMPLEMENTATION.md) - E2E tests
- [PHASE_5_E2E_TEST_SCENARIOS.md](./swipesavvy-mobile-app/PHASE_5_E2E_TEST_SCENARIOS.md) - Test scenarios

---

## ✅ Current Status

### ✅ Completed
- All 5 applications built and running
- Admin Portal with AI Marketing dashboard
- Mobile App with AI Concierge chat
- Customer Website with authentication
- Mobile Wallet with transaction management
- AI Agents backend with FastAPI
- WebSocket streaming for real-time updates
- Database integration with PostgreSQL
- Authentication & authorization

### ⚠️ In Progress / Optional
- Production deployment to AWS
- Mobile app web bundling (wa-sqlite compatibility)
- Advanced analytics dashboards
- ML model integration for personalization

### 🎯 Next Steps
1. Test all 5 applications together
2. Verify data flow between services
3. Run end-to-end test scenarios
4. Deploy to staging environment
5. Performance testing and optimization

---

## 📞 Support & Resources

### Getting Help
- Check individual application READMEs
- Review error logs in terminal output
- Check browser console (F12) for client errors
- Review API server logs for backend errors

### Key Contacts
- **Frontend Issues:** Check `src/` structure and component files
- **Backend Issues:** Check `app/main.py` and `app/api/` routes
- **Database Issues:** Check `app/database/` configuration
- **Deployment Issues:** Check Docker config and environment variables

---

## 🎓 Learning Resources

### Architecture
- [MULTI_REPOSITORY_OVERVIEW.md](./swipesavvy-mobile-app/MULTI_REPOSITORY_OVERVIEW.md) - System design
- [ADMIN_PORTAL_ARCHITECTURE.md](./swipesavvy-mobile-app/ADMIN_PORTAL_ARCHITECTURE.md) - Admin portal design
- [DATABASE_SETUP_GUIDE.md](./swipesavvy-mobile-app/DATABASE_SETUP_GUIDE.md) - Database design

### Development
- [DEVELOPER_GUIDE.md](./swipesavvy-mobile-app/DEVELOPER_GUIDE.md) - Mobile app development
- [DESIGN_SYSTEM_GUIDE.md](./swipesavvy-mobile-app/DESIGN_SYSTEM_GUIDE.md) - Component library
- [FEATURE_IMPLEMENTATION_GUIDE.md](./swipesavvy-mobile-app/FEATURE_IMPLEMENTATION_GUIDE.md) - Adding features

### Integration
- [AI_CONCIERGE_INTEGRATION_GUIDE.md](./swipesavvy-mobile-app/AI_CONCIERGE_INTEGRATION_GUIDE.md) - Chat system
- [API_AND_ADMIN_INTEGRATION.md](./swipesavvy-mobile-app/API_AND_ADMIN_INTEGRATION.md) - API integration
- [MOBILE_CAMPAIGN_INTEGRATION_GUIDE.md](./swipesavvy-mobile-app/MOBILE_CAMPAIGN_INTEGRATION_GUIDE.md) - Campaigns

---

**Happy coding! 🚀**

For more detailed information, see the platform-specific documentation linked above.
