# SwipeSavvy Rewards Platform

A comprehensive React + Vite web application ecosystem for managing the SwipeSavvy mobile wallet and rewards platform, including admin portal, AI chat integration, wallet management, and advanced marketing analytics.

## 🎯 Overview

SwipeSavvy Rewards is an **integrated ecosystem** comprising multiple applications:
- **Mobile App** - React Native mobile wallet application
- **Admin Portal** - React + Vite administration dashboard
- **AI Chat** - AI-powered concierge and customer support
- **Wallet Web** - Web-based wallet management interface
- **Analytics Dashboard** - Marketing analytics and AI-driven insights

Each component communicates with a unified backend API and provides comprehensive management tools for the SwipeSavvy platform.

## ✨ Key Features

### 📱 Mobile Application
- ✅ Digital Wallet - Secure payment and reward management
- ✅ Transaction History - Complete transaction tracking
- ✅ Reward Redemption - Points and reward management
- ✅ Merchant Integration - Seamless partner merchant connections
- ✅ Push Notifications - Real-time alerts and offers
- ✅ User Authentication - Secure biometric and PIN access

### 🖥 Admin Portal
- ✅ **Dashboard** - Real-time overview of platform metrics and activity
- ✅ **User Management** - Manage users, roles, and permissions with RBAC
- ✅ **Feature Flags** - Control feature availability across the platform
- ✅ **Merchant Management** - Partner management and performance tracking
- ✅ **Analytics & Reporting** - Comprehensive business intelligence
- ✅ **Authentication** - Secure login with token-based authentication
- ✅ **Responsive Design** - Tailwind CSS for modern, mobile-friendly UI

### 🤖 AI Concierge System
- ✅ **AI Chat Integration** - GPT-powered customer support
- ✅ **Marketing Automation** - AI-driven marketing campaign management
- ✅ **Real-time Analytics** - Dynamic performance tracking
- ✅ **User Insights** - Behavioral analysis and personalization
- ✅ **Content Management** - AI-powered content generation

### 💳 Wallet Web
- ✅ Web-based wallet access
- ✅ Balance management
- ✅ Transaction processing
- ✅ Reward tracking

## 🛠 Tech Stack

### Frontend
- **Web Framework**: React 18.3 + TypeScript
- **Mobile Framework**: React Native (Expo)
- **Build Tools**: Vite 5.0, Webpack
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand 4.4, Redux
- **Routing**: React Router 6.20
- **HTTP Client**: Fetch API (with custom utilities), Axios
- **Charts & Visualization**: Recharts 2.10
- **UI Components**: Lucide React 0.294, Custom Components
- **Forms**: React Hook Form

### Backend
- **API Server**: FastAPI / Node.js
- **Database**: PostgreSQL 14+
- **Authentication**: JWT, OAuth2
- **Real-time**: WebSocket Support
- **Caching**: Redis

### AI & Analytics
- **LLM Integration**: OpenAI GPT API
- **Analytics Engine**: Custom ML pipeline
- **Data Processing**: Python (Pandas, NumPy)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+ (for backend services)
- PostgreSQL 14+
- npm or yarn
- Expo CLI (for mobile development)

### Installation

```bash
# Clone the repository
git clone git@github.com:SwipeSavdev/swipe-savvy-rewards.git
cd swipe-savvy-rewards

# Install root dependencies
npm install

# Install mobile app dependencies
cd swipesavvy-mobile-app-v2
npm install

# Install admin portal dependencies
cd ../swipesavvy-admin-portal
npm install

# Install wallet web dependencies
cd ../swipesavvy-wallet-web
npm install
```

### Development

#### Start Admin Portal
```bash
cd swipesavvy-admin-portal
npm run dev
```
Portal available at: **`http://localhost:5173`**

#### Start Mobile App
```bash
cd swipesavvy-mobile-app-v2
npm run dev
# or for Expo
expo start
```

#### Start Backend Services
```bash
# Start PostgreSQL
brew services start postgresql@14

# Start Python backend
python -m uvicorn main:app --reload --port 3000
```

### Build for Production

```bash
# Admin Portal
cd swipesavvy-admin-portal
npm run build
npm run preview

# Mobile App
cd swipesavvy-mobile-app-v2
npm run build

# Wallet Web
cd swipesavvy-wallet-web
npm run build
```

## 📁 Project Structure

```
swipe-savvy-rewards/
├── swipesavvy-mobile-app-v2/     # React Native mobile application
│   ├── src/
│   ├── package.json
│   └── ...
├── swipesavvy-admin-portal/       # React + Vite admin dashboard
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.ts              # Centralized API configuration
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...
│   │   ├── pages/                  # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── FeatureFlagsPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── MerchantPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── MarketingPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── stores/                 # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── featureFlagStore.ts
│   │   │   └── ...
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── main.tsx                # Application entry point
│   │   └── index.css               # Global styles
│   ├── docs/                       # Documentation
│   │   ├── QUICK_START.md
│   │   ├── WORKSPACE_CONNECTION_GUIDE.md
│   │   └── ...
│   └── package.json
├── swipesavvy-ai-chat/            # AI chat service
│   ├── src/
│   └── package.json
├── swipesavvy-wallet-web/         # Web wallet interface
│   ├── src/
│   └── package.json
├── backend/                        # Backend API (FastAPI/Node.js)
│   ├── app/
│   ├── models/
│   ├── routes/
│   ├── main.py
│   └── requirements.txt
├── database/                       # Database schemas and migrations
│   ├── migrations/
│   └── init.sql
├── docs/                           # Root documentation
│   ├── ARCHITECTURE.md
│   ├── API_SPECIFICATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── ...
├── .env.example                    # Environment variables template
├── .gitignore
├── docker-compose.yml              # Docker orchestration
└── package.json
```

## 🔌 API Integration

The platform connects all services through a unified backend API:

- **Base URL**: `http://localhost:3000` (development) or production domain
- **Authentication**: `/api/auth/*` - JWT token-based authentication
- **Admin**: `/api/admin/dashboard`, `/api/admin/users/*`, `/api/admin/feature-flags/*`
- **Wallet**: `/api/wallet/balance`, `/api/wallet/transactions/*`
- **Marketing**: `/api/marketing/analytics`, `/api/marketing/campaigns/*`
- **AI**: `/api/ai/chat`, `/api/ai/concierge/*`
- **Merchants**: `/api/merchants/*`

## 🗂 Available Routes

### Admin Portal Routes
- `/login` - Admin login
- `/dashboard` - Main dashboard with KPIs
- `/feature-flags` - Feature flag management
- `/users` - User and role management
- `/merchants` - Merchant partner management
- `/analytics` - Analytics and reporting
- `/marketing` - AI marketing campaign tool
- `/settings` - Admin settings

### Mobile App Routes
- `/login` - User authentication
- `/dashboard` - Home dashboard
- `/wallet` - Wallet management
- `/transactions` - Transaction history
- `/rewards` - Rewards and points
- `/merchants` - Partner merchants
- `/profile` - User profile management
- `/support` - AI chat support

## 🔐 Security

- ✅ All API calls include authorization tokens (JWT)
- ✅ Role-Based Access Control (RBAC) enforced on backend
- ✅ SSO integration for secure authentication
- ✅ MFA support for admin accounts
- ✅ End-to-end encryption for sensitive data
- ✅ Rate limiting and DDoS protection
- ✅ Regular security audits and penetration testing

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📊 Performance Optimization

- ✅ Code splitting and lazy loading
- ✅ Image optimization and compression
- ✅ Caching strategies
- ✅ CDN integration
- ✅ Database query optimization
- ✅ API response caching

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
- Supports AWS, Google Cloud, and Azure
- CI/CD pipelines configured for automated deployment
- See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for details

## 📚 Documentation

Comprehensive documentation is available:
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [API Specification](./docs/API_SPECIFICATION.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Database Schema](./database/schema.md)

## Development Workflow

1. Create a new branch for your feature (`git checkout -b feature/your-feature`)
2. Make changes to components, pages, or services
3. Test locally with appropriate dev commands
4. Run type checks: `npm run type-check`
5. Run linting: `npm run lint`
6. Commit changes: `git commit -m "feat: description"`
7. Push to branch: `git push origin feature/your-feature`
8. Create a pull request with comprehensive description

## 🐛 Debugging

- Admin Portal: Chrome DevTools, React Developer Tools
- Mobile App: Expo DevTools, React Native Debugger
- Backend: Python debugger, API logging
- Database: PostgreSQL client (psql, DBeaver)

## 💼 Team & Support

For issues, feature requests, or support:
- GitHub Issues: Report bugs and request features
- Documentation: Check [docs](./docs) folder first
- Slack Channel: #swipesavvy-dev
- Email: dev@swipesavvy.com

## 📄 License

Proprietary - SwipeSavvy Platform © 2024-2026

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
