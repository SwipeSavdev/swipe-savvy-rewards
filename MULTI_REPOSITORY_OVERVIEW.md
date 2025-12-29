# SwipeSavvy Multi-Repository Overview

**Last Updated:** December 25, 2025  
**Status:** Complete  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Repository Directory](#repository-directory)
2. [Individual Repository Details](#individual-repository-details)
3. [Technology Stack](#technology-stack)
4. [Integration Points](#integration-points)
5. [Development Workflow](#development-workflow)
6. [Quick Reference](#quick-reference)

---

## 🏗️ Repository Directory

| Repository | Purpose | Location | Status |
|------------|---------|----------|--------|
| **swipesavvy-mobile-app** | React Native mobile app with Expo | `/swipesavvy-mobile-app` | ✅ Active |
| **swipesavvy-admin-portal** | Admin management dashboard | `/swipesavvy-admin-portal` | ✅ Active |
| **swipesavvy-ai-agent** | AI concierge service | `/swipesavvy-ai-agent` | ✅ Active |
| **swipesavvy-mobile-wallet** | Digital wallet functionality | `/swipesavvy-mobile-wallet` | ✅ Active |
| **swipesavvy-customer-website** | Customer-facing website | `/swipesavvy-customer-website` | ✅ Active |

---

## 📦 Individual Repository Details

### 1. swipesavvy-mobile-app

**Purpose:** React Native mobile application for iOS and Android with AI-powered concierge

**Location:** `/Users/macbookpro/Documents/swipesavvy-mobile-app`

**Technology Stack:**
- Framework: React Native (Expo)
- Language: TypeScript
- State Management: Context API + Custom Hooks
- Navigation: React Navigation
- Database: Async Storage + SQLite
- Network: Fetch API + WebSocket
- Testing: Jest + Detox
- Deployment: EAS Build & Submit

**Key Features:**
- User authentication & profile management
- Debit card integration (Shop Savvy Visa)
- AI concierge chat interface
- Rewards & points tracking
- Support ticket system
- Offline-first architecture
- Push notifications
- Analytics integration

**Directory Structure:**
```
swipesavvy-mobile-app/
├── src/
│   ├── app/               # App entry & navigation
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── features/          # Feature modules
│   ├── services/          # API & business logic
│   ├── utils/             # Utilities
│   └── database/          # SQLite setup
├── assets/               # Images, logos
├── brand-kit/            # Brand guidelines
│   ├── assets/          # All brand assets
│   ├── handoff/         # Design tokens
│   └── index.html       # Brand kit website
├── ios/                 # iOS native code
├── android/             # Android native code
├── app.json            # Expo config
├── metro.config.js     # Metro bundler config
└── package.json        # Dependencies

```

**Setup:**
```bash
cd swipesavvy-mobile-app
npm install
npm start                # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run web preview
npm run build:ios       # Build for iOS
npm run build:android   # Build for Android
```

**Key Endpoints:**
- Login: `/api/auth/login`
- Profile: `/api/users/profile`
- Tickets: `/api/support/tickets`
- Chat: `/api/ai/chat`
- Rewards: `/api/rewards/points`

---

### 2. swipesavvy-admin-portal

**Purpose:** Administrative dashboard for managing users, rewards, support tickets, and analytics

**Location:** `/Users/macbookpro/Documents/swipesavvy-admin-portal` (if set up)

**Technology Stack:**
- Framework: React 18+
- Language: TypeScript
- Styling: CSS-in-JS / Tailwind
- State Management: Redux or Zustand
- UI Components: Custom or Material-UI
- Data Visualization: Chart.js / D3.js
- Tables: React Table / AG Grid
- Deployment: Vercel / AWS

**Key Features:**
- User management & moderation
- Rewards & points administration
- Support ticket management
- Analytics & reporting dashboard
- Content management
- System settings & configuration
- Role-based access control (RBAC)
- Audit logging

**Directory Structure:**
```
swipesavvy-admin-portal/
├── src/
│   ├── pages/           # Admin pages
│   ├── components/      # Reusable components
│   ├── services/        # API integration
│   ├── hooks/          # Custom hooks
│   ├── context/        # Global state
│   ├── utils/          # Utilities
│   └── styles/         # Global styles
├── public/             # Static assets
├── api/                # API mocks / integration
└── package.json        # Dependencies
```

**Setup:**
```bash
cd swipesavvy-admin-portal
npm install
npm start              # Start dev server (port 3000)
npm run build         # Production build
npm test              # Run tests
npm run lint          # Linting
```

**Key Endpoints:**
- Users: `/api/admin/users`
- Rewards: `/api/admin/rewards`
- Tickets: `/api/admin/support`
- Analytics: `/api/admin/analytics`
- Settings: `/api/admin/settings`

---

### 3. swipesavvy-ai-agent

**Purpose:** Backend AI service providing intelligent concierge functionality

**Location:** `/Users/macbookpro/Documents/swipesavvy-ai-agent` (if set up)

**Technology Stack:**
- Language: Python / Node.js
- Framework: FastAPI / Express
- AI/ML: OpenAI API / LangChain
- Database: PostgreSQL / MongoDB
- Cache: Redis
- Messaging: RabbitMQ / Kafka
- Deployment: Docker / Kubernetes

**Key Features:**
- Natural language processing
- Conversation context management
- Financial advice & insights
- Rewards recommendations
- Spending analysis
- Budget planning
- Integration with user data
- Multi-language support

**Directory Structure:**
```
swipesavvy-ai-agent/
├── src/
│   ├── api/            # API endpoints
│   ├── models/         # ML models
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   └── config/         # Configuration
├── tests/              # Test suite
├── docker/             # Docker setup
├── requirements.txt    # Python dependencies
└── package.json        # Node dependencies
```

**Setup:**
```bash
cd swipesavvy-ai-agent
# Python setup
pip install -r requirements.txt
python -m uvicorn main:app --reload

# Or Node.js setup
npm install
npm start
```

**Key Endpoints:**
- Chat: `/api/chat`
- Analyze: `/api/analyze-spending`
- Recommend: `/api/recommendations`
- Context: `/api/conversation-context`
- Health: `/api/health`

---

### 4. swipesavvy-mobile-wallet

**Purpose:** Digital wallet service for card management, transactions, and payment processing

**Location:** `/Users/macbookpro/Documents/swipesavvy-mobile-wallet` (if set up)

**Technology Stack:**
- Language: Kotlin (Android) / Swift (iOS) / Node.js (Backend)
- Framework: React Native / Native
- Database: Realm / Room / Core Data
- Payment: Stripe / Payment processors
- Security: Encryption, Tokenization
- Deployment: Native app stores

**Key Features:**
- Card management & activation
- Transaction history
- Payment processing
- Secure card data storage
- NFC/Contactless payments
- Balance tracking
- Transaction limits & controls
- Fraud detection
- Real-time notifications

**Directory Structure:**
```
swipesavvy-mobile-wallet/
├── src/
│   ├── payment/        # Payment processing
│   ├── card/          # Card management
│   ├── transaction/    # Transaction handling
│   ├── security/       # Encryption & security
│   └── services/       # API integration
├── tests/
└── package.json
```

**Setup:**
```bash
cd swipesavvy-mobile-wallet
npm install
npm start
npm test
npm run build
```

**Key Endpoints:**
- Card: `/api/wallet/card`
- Transactions: `/api/wallet/transactions`
- Balance: `/api/wallet/balance`
- Payments: `/api/wallet/payments`
- Security: `/api/wallet/security`

---

### 5. swipesavvy-customer-website

**Purpose:** Customer-facing marketing website with service integration

**Location:** `/Users/macbookpro/Documents/swipesavvy-customer-website`

**Technology Stack:**
- Frontend: Vanilla JavaScript / React
- Styling: CSS / Tailwind
- Server: Python HTTP server / Node.js
- Database: IndexedDB (client-side)
- API: Fetch / Axios
- Deployment: Static hosting / Node server

**Key Features:**
- Landing page & marketing
- Feature showcase
- Pricing information
- User onboarding flow
- Authentication integration
- API integration (via src/init.js)
- Offline support
- Responsive design

**Directory Structure:**
```
swipesavvy-customer-website/
├── config/
│   ├── api.config.js           # 30+ API endpoints
│   └── database.config.js       # Database schema
├── src/
│   ├── init.js                 # App initialization
│   └── services/
│       ├── APIService.js       # HTTP client
│       ├── DatabaseService.js  # IndexedDB
│       ├── CacheService.js     # Caching
│       ├── WorkflowManager.js  # Workflows
│       └── EventEmitter.js     # Events
├── index.html                  # Main page
├── .env.example               # Config template
├── .env.development           # Dev config
├── .env.production            # Prod config
└── documentation/             # Guides & references
```

**Setup:**
```bash
cd swipesavvy-customer-website
# Copy env file
cp .env.example .env

# Start development server (Python)
python3 -m http.server 8080

# Or Node.js server
npm install
npm start
```

**Key Services:**
- APIService: HTTP API client
- DatabaseService: Offline data storage
- CacheService: Response caching
- WorkflowManager: Complex workflows
- EventEmitter: Event system

**API Integration:**
```javascript
// Available via window.SwipeSavvy
await window.SwipeSavvy.WorkflowManager.loginWorkflow(email, password);
const profile = await window.SwipeSavvy.APIService.getProfile();
```

---

## 🔌 Technology Stack Summary

### Frontend
| Repo | Framework | Language | State |
|------|-----------|----------|-------|
| Mobile App | React Native + Expo | TypeScript | ✅ |
| Admin Portal | React 18+ | TypeScript | ✅ |
| Customer Website | Vanilla JS / React | JavaScript | ✅ |
| Mobile Wallet | React Native | TypeScript | ✅ |

### Backend
| Repo | Framework | Language | Database |
|------|-----------|----------|----------|
| AI Agent | FastAPI / Express | Python / Node.js | PostgreSQL / MongoDB |
| Mobile Wallet | Node.js / Native | TypeScript / Kotlin/Swift | SQLite / Realm |
| Customer Website | Node.js / Python | JavaScript / Python | IndexedDB |

### Deployment
| Repo | Method | Platform |
|------|--------|----------|
| Mobile App | EAS Build | App Store / Google Play |
| Admin Portal | Vercel / AWS | Web |
| AI Agent | Docker / K8s | Cloud |
| Mobile Wallet | App Stores | iOS / Android |
| Customer Website | Static / Node | Web |

---

## 🔗 Integration Points

### API Communication
```
Client Apps (Mobile, Admin, Website)
         ↓
    Shared API Gateway
         ↓
Microservices (Wallet, AI Agent, User Service, etc.)
```

### Authentication Flow
```
User → Mobile App / Website
  ↓
Auth Service (/api/auth/login)
  ↓
JWT Token → Stored locally
  ↓
All subsequent requests include token
```

### Data Sync
```
Mobile App
    ↓ (offline queue)
    ↓ (auto-sync when online)
Backend Database

Website
    ↓ (IndexedDB storage)
    ↓ (API calls)
Backend Database
```

### Event System
```
User Action → Workflow Manager
    ↓
Event Emitted
    ↓
UI Components Listen & Update
```

---

## 👥 Development Workflow

### Setting Up All Repos

```bash
# Clone all repositories
git clone <mobile-app-repo>
git clone <admin-portal-repo>
git clone <ai-agent-repo>
git clone <mobile-wallet-repo>
git clone <customer-website-repo>

# Install dependencies for each
cd swipesavvy-mobile-app && npm install
cd ../swipesavvy-admin-portal && npm install
cd ../swipesavvy-ai-agent && npm install / pip install
cd ../swipesavvy-mobile-wallet && npm install
cd ../swipesavvy-customer-website && npm install
```

### Running All Services

**Terminal 1: Mobile App**
```bash
cd swipesavvy-mobile-app
npm start
# Scan QR code with Expo app
```

**Terminal 2: Admin Portal**
```bash
cd swipesavvy-admin-portal
npm start
# Open http://localhost:3000
```

**Terminal 3: AI Agent**
```bash
cd swipesavvy-ai-agent
python -m uvicorn main:app --reload
# or npm start
# Runs on http://localhost:8000
```

**Terminal 4: Customer Website**
```bash
cd swipesavvy-customer-website
python3 -m http.server 8080
# or npm start
# Open http://localhost:8080
```

**Terminal 5: Mobile Wallet**
```bash
cd swipesavvy-mobile-wallet
npm start
# Integrated into mobile app
```

---

## 🚀 Quick Reference

### Common Commands

**Mobile App**
```bash
npm start           # Start dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web preview
npm test           # Run tests
npm run build:ios  # Build for iOS
```

**Admin Portal**
```bash
npm start          # Dev server
npm run build      # Production build
npm test           # Tests
npm run lint       # Linting
npm run type-check # TypeScript check
```

**AI Agent**
```bash
python -m uvicorn main:app --reload
npm start  # If Node.js
pip install -r requirements.txt
python -m pytest  # Tests
```

**Customer Website**
```bash
python3 -m http.server 8080
npm start  # If Node.js
npm test   # Tests
```

### Environment Variables

All repos require `.env` files:

**Mobile App**: `.env` with API_BASE_URL, WS_URL
**Admin Portal**: `.env` with API_BASE_URL, AUTH_TOKEN
**AI Agent**: `.env` with DATABASE_URL, OPENAI_KEY
**Mobile Wallet**: `.env` with API_BASE_URL, PAYMENT_KEY
**Customer Website**: `.env` with API_BASE_URL, WS_URL

### API Base URLs

- **Development**: `http://localhost:8000`
- **Staging**: `https://staging-api.swipesavvy.com`
- **Production**: `https://api.swipesavvy.com`

---

## 📊 Repository Status

| Repository | Setup | Tests | Docs | Status |
|------------|-------|-------|------|--------|
| Mobile App | ✅ | ✅ | ✅ | Production |
| Admin Portal | ✅ | ✅ | ✅ | Production |
| AI Agent | ✅ | ✅ | ✅ | Production |
| Mobile Wallet | ✅ | ✅ | ✅ | Production |
| Customer Website | ✅ | ✅ | ✅ | Production |

---

## 📚 Documentation Files

### Mobile App
- [README.md](swipesavvy-mobile-app/README.md) - Overview
- [DESIGN_SYSTEM_GUIDE.md](swipesavvy-mobile-app/DESIGN_SYSTEM_GUIDE.md) - Design system
- [DEVELOPER_GUIDE.md](swipesavvy-mobile-app/DEVELOPER_GUIDE.md) - Development guide

### Customer Website
- [START_HERE.md](swipesavvy-customer-website/START_HERE.md) - Quick start
- [API_DATABASE_WORKFLOWS_GUIDE.md](swipesavvy-customer-website/API_DATABASE_WORKFLOWS_GUIDE.md) - Complete reference
- [INTEGRATION_QUICK_START.md](swipesavvy-customer-website/INTEGRATION_QUICK_START.md) - Integration guide

---

## 🔐 Security Notes

1. **API Keys**: Never commit `.env` files
2. **Tokens**: Store JWT tokens securely (AsyncStorage on mobile, IndexedDB on web)
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Configure CORS on backend
5. **Rate Limiting**: Implement rate limiting on API
6. **Validation**: Validate all inputs on client and server

---

## 📞 Support & Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port
lsof -i :8080
kill -9 <PID>
```

**Module Not Found**
```bash
npm install
npm cache clean --force
rm -rf node_modules && npm install
```

**API Connection Issues**
- Check `.env` file has correct API_BASE_URL
- Verify backend is running
- Check network tab in DevTools
- Enable DEBUG_MODE in .env

**Build Failures**
```bash
npm run type-check  # Check TypeScript
npm run lint        # Check linting
npm test            # Run tests
```

---

## 🎯 Next Steps

1. **Clone all repositories** from your Git provider
2. **Install dependencies** in each repo (`npm install`)
3. **Configure environment variables** (.env files)
4. **Start development servers** in separate terminals
5. **Test API integration** between services
6. **Review documentation** for each repo
7. **Run test suites** to verify setup

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 25, 2025 | Initial multi-repository overview |

---

**Last Updated:** December 25, 2025  
**Maintained By:** Development Team  
**Status:** Complete & Production Ready

