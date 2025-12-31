# 📱 Mobile App Documentation

**Repository:** `swipesavvy-mobile-app/`  
**Status:** ✅ Production Ready  
**Tech Stack:** React Native, Expo, TypeScript  
**Port:** Expo Dev Server

---

## 🎯 Quick Start

```bash
cd swipesavvy-mobile-app
npm install --legacy-peer-deps
npm start
```

**Press 'w'** for web preview, **'i'** for iOS, **'a'** for Android, or scan QR code with Expo Go.

---

## 📚 Key Documentation (In Priority Order)

### 🔴 MUST READ
1. **[README.md](../README.md)** - Project overview & features
2. **[DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md)** - Setup, architecture, and development workflow
3. **[DESIGN_SYSTEM_GUIDE.md](../DESIGN_SYSTEM_GUIDE.md)** - Component library & theming

### 🟠 ESSENTIAL FOR FEATURES
4. **[AI_CONCIERGE_INTEGRATION_GUIDE.md](../AI_CONCIERGE_INTEGRATION_GUIDE.md)** - Chat system integration
5. **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - UI/UX audit results & fixes
6. **[ENDPOINTS_AND_SCREENS_SUMMARY.md](../ENDPOINTS_AND_SCREENS_SUMMARY.md)** - API & screen mapping

### 🟡 REFERENCE & DETAILS
7. **[AI_CONCIERGE_API_SPEC.md](../AI_CONCIERGE_API_SPEC.md)** - Chat API specification
8. **[AI_CONCIERGE_CODE_EXAMPLES.md](../AI_CONCIERGE_CODE_EXAMPLES.md)** - Implementation examples
9. **[MOBILE_CAMPAIGN_INTEGRATION_GUIDE.md](../MOBILE_CAMPAIGN_INTEGRATION_GUIDE.md)** - Marketing integration
10. **[DATABASE_SETUP_GUIDE.md](../DATABASE_SETUP_GUIDE.md)** - Database initialization

### 🟢 TESTING & DEPLOYMENT
11. **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** - Test strategy & execution
12. **[CYPRESS_E2E_IMPLEMENTATION.md](../CYPRESS_E2E_IMPLEMENTATION.md)** - E2E testing
13. **[COMPLETE_DEPLOYMENT_GUIDE.md](../COMPLETE_DEPLOYMENT_GUIDE.md)** - Production deployment

---

## 📂 Documentation Categories

### Setup & Architecture
- `README.md` - Overview
- `DEVELOPER_GUIDE.md` - Getting started & dev workflow
- `DESIGN_SYSTEM_GUIDE.md` - Component system
- `QUICK_REFERENCE.md` - All key info at a glance

### Features & Integration
- `AI_CONCIERGE_INTEGRATION_GUIDE.md` - Chat system
- `AI_CONCIERGE_API_SPEC.md` - API documentation
- `AI_CONCIERGE_CODE_EXAMPLES.md` - Code samples
- `AI_CONCIERGE_DATA_ACCESS_SUMMARY.md` - Data flows
- `MOBILE_CAMPAIGN_INTEGRATION_GUIDE.md` - Marketing campaigns

### Data & Database
- `DATABASE_SETUP_GUIDE.md` - Database setup
- `DATABASE_CONNECTION_GUIDE.md` - Connection config
- `MOCK_DATA_SETUP_SUMMARY.md` - Test data

### System & Architecture
- `MULTI_REPOSITORY_OVERVIEW.md` - System design
- `ADMIN_PORTAL_ARCHITECTURE.md` - Admin portal design
- `ENDPOINTS_AND_SCREENS_SUMMARY.md` - API & UI map

### Testing
- `TESTING_GUIDE.md` - Strategy & procedures
- `CYPRESS_E2E_IMPLEMENTATION.md` - E2E tests
- `PHASE_5_E2E_TEST_SCENARIOS.md` - Test scenarios

### Deployment
- `COMPLETE_DEPLOYMENT_GUIDE.md` - Full process
- `DEPLOYMENT_QUICK_REFERENCE.md` - Quick commands
- `DOCKER_AND_REPOSITORY_SETUP.md` - Docker setup

### Troubleshooting
- `FIXES_APPLIED_DECEMBER_2025.md` - Recent fixes
- `AUDIT_REPORT.md` - Code audit results
- `AUDIT_FIXES_SUMMARY.md` - Fixes applied

---

## 🗂️ Understanding the 160+ Docs

The mobile-app folder contains **160+ markdown files**. Most are historical or phase-specific. Here's how to categorize them:

### ✅ ACTIVE & CURRENT
- All files listed above in "Key Documentation" section
- These are maintained and updated

### ⏳ HISTORICAL (Keep for Reference)
- `PHASE_*` files - Historical phase reports
- `COMPLETION_REPORT_*.md` - Past completion summaries
- `CRITICAL_FIXES_*.md` - Archive of fixes applied
- `EXECUTIVE_BRIEFING_*.md` - Past briefings

### 📦 LEGACY (Archive When Reorganizing)
- `UIQA_PART_*.md` - Old QA procedure files
- `TASK_*` files - Historical task reports
- `MARKETING_AI_*.md` - Superseded by AI_MARKETING_IMPLEMENTATION_INDEX.md
- Phase-specific completion and summary files

### 🏗️ PROJECT STRUCTURE
```
swipesavvy-mobile-app/
├── README.md ⭐
├── DEVELOPER_GUIDE.md ⭐
├── DESIGN_SYSTEM_GUIDE.md ⭐
├── QUICK_REFERENCE.md ⭐
├── AI_CONCIERGE_INTEGRATION_GUIDE.md ⭐
├── DATABASE_SETUP_GUIDE.md ⭐
├── TESTING_GUIDE.md ⭐
├── COMPLETE_DEPLOYMENT_GUIDE.md ⭐
│
├── docs/ ← (NEW) Documentation index
│   └── README.md - Full documentation guide
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── navigation/
│   │   └── providers/
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── accounts/
│   │   ├── transfers/
│   │   └── ai-concierge/
│   ├── design-system/
│   │   ├── theme.ts
│   │   ├── tokens/
│   │   └── components/
│   ├── packages/ai-sdk/
│   └── shared/
│
├── database/ (SQLite)
├── .expo/ (Expo config)
└── [160+ historical docs]
```

---

## 🎯 Common Workflows

### I'm new to the project
1. Read: `README.md` (5 min)
2. Read: `DEVELOPER_GUIDE.md` (15 min)
3. Setup: Follow quick start section
4. Reference: `DESIGN_SYSTEM_GUIDE.md` while building

### I need to add a feature
1. Reference: `DESIGN_SYSTEM_GUIDE.md` - Find component
2. Reference: `ENDPOINTS_AND_SCREENS_SUMMARY.md` - See API
3. Review: `QUICK_REFERENCE.md` - Common patterns
4. Follow: Component architecture in `DEVELOPER_GUIDE.md`

### I need to integrate with AI Concierge
1. Read: `AI_CONCIERGE_INTEGRATION_GUIDE.md`
2. Reference: `AI_CONCIERGE_API_SPEC.md` - API docs
3. Code: `AI_CONCIERGE_CODE_EXAMPLES.md` - Copy patterns
4. Data: `AI_CONCIERGE_DATA_ACCESS_SUMMARY.md` - Understand flows

### I need to test my changes
1. Read: `TESTING_GUIDE.md`
2. Setup: `CYPRESS_E2E_IMPLEMENTATION.md`
3. Reference: `PHASE_5_E2E_TEST_SCENARIOS.md` - Test examples
4. Run: `npm test` command

### I need to deploy
1. Read: `COMPLETE_DEPLOYMENT_GUIDE.md`
2. Quick: `DEPLOYMENT_QUICK_REFERENCE.md`
3. Docker: `DOCKER_AND_REPOSITORY_SETUP.md`
4. Execute: Follow step-by-step instructions

---

## 🔗 Cross-Platform References

- **Admin Portal:** See `ADMIN_PORTAL_ARCHITECTURE.md` for dashboard
- **Backend API:** See `ENDPOINTS_AND_SCREENS_SUMMARY.md` and `AI_CONCIERGE_API_SPEC.md`
- **Database:** See `DATABASE_SETUP_GUIDE.md`
- **Mobile Wallet:** Similar structure, see `swipesavvy-mobile-wallet/README.md`

---

## ✅ Current Implementation Status

### Core Features (✅ Complete)
- ✅ Authentication & authorization
- ✅ Account management
- ✅ Money transfers
- ✅ AI Concierge chat with streaming
- ✅ Rewards system
- ✅ Offline support
- ✅ Push notifications
- ✅ Dark mode

### Integration (✅ Complete)
- ✅ FastAPI backend (port 8000)
- ✅ WebSocket for real-time updates
- ✅ SQLite local database
- ✅ Mock data generation

### Testing (✅ Complete)
- ✅ Unit tests
- ✅ Integration tests
- ✅ E2E tests (Cypress)
- ✅ UI/UX audit passed

### Deployment (✅ Ready)
- ✅ Docker support
- ✅ Environment configuration
- ✅ Build optimization
- ✅ Production ready

---

## 📞 Need Help?

- **Setup Issues:** Check `DEVELOPER_GUIDE.md` troubleshooting section
- **Component Questions:** See `DESIGN_SYSTEM_GUIDE.md`
- **API Integration:** See `ENDPOINTS_AND_SCREENS_SUMMARY.md`
- **AI Chat Issues:** See `AI_CONCIERGE_INTEGRATION_GUIDE.md`
- **Deployment:** See `COMPLETE_DEPLOYMENT_GUIDE.md`
- **Bug Fixes:** See `FIXES_APPLIED_DECEMBER_2025.md`

---

**⬆️ Back to:** [Main Startup Guide](../STARTUP.md)  
**📚 Docs Index:** [docs/README.md](./docs/README.md)
