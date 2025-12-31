# Swioe Savvy Admin Portal

A modern web-based administration dashboard for the Swioe Savvy mobile wallet platform.

## 🎯 Overview

The Admin Portal is a **standalone React + Vite web application** that provides comprehensive management tools for the Swioe Savvy platform. It's now a separate workspace that communicates with the same backend API as the mobile application.

## ✨ Features

- ✅ **Dashboard** - Real-time overview of platform metrics and activity
- ✅ **User Management** - Manage users, roles, and permissions
- ✅ **Feature Flags** - Control feature availability across the platform
- ✅ **Authentication** - Secure login with token-based authentication
- ✅ **Responsive Design** - Tailwind CSS for modern, mobile-friendly UI

## 🛠 Tech Stack

- **Frontend**: React 18.3 + TypeScript
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **State Management**: Zustand 4.4
- **Routing**: React Router 6.20
- **HTTP Client**: Fetch API (with custom utilities)
- **Charts**: Recharts 2.10
- **Icons**: Lucide React 0.294

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to workspace
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

The portal will be available at **`http://localhost:5173`**

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── lib/
│   └── api.ts              # Centralized API configuration
├── components/             # Reusable UI components
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/                  # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── FeatureFlagsPage.tsx
│   └── ...
├── stores/                 # Zustand state management
│   ├── authStore.ts
│   └── featureFlagStore.ts
├── App.tsx                 # Root component with routing
├── main.tsx                # Application entry point
└── index.css               # Global styles

docs/                        # Documentation
├── QUICK_START.md           # Quick 5-step guide
├── WORKSPACE_CONNECTION_GUIDE.md  # Complete setup reference
├── SETUP_COMPLETE.md        # Setup summary
├── DOCUMENTATION_INDEX.md   # Navigation hub
└── ...
```

## 🔌 API Integration

The admin portal connects to the same backend as the mobile wallet:

- **Base URL**: `http://localhost:3000` (configurable)
- **Authentication**: `/api/admin/auth/*`
- **Dashboard**: `/api/admin/dashboard`
- **Users**: `/api/admin/users/*`
- **Feature Flags**: `/api/admin/feature-flags/*`

## Available Routes

- `/login` - Admin login
- `/dashboard` - Main dashboard with KPIs
- `/feature-flags` - Feature flag management
- `/users` - User and role management
- `/merchants` - Merchant partner management
- `/analytics` - Analytics and reporting
- `/marketing` - AI marketing tool
- `/settings` - Admin settings

## Development Workflow

1. Create a new branch for your feature
2. Make changes to components, pages, or stores
3. Test locally with `npm run dev`
4. Run type checks with `npm run type-check`
5. Run linting with `npm run lint`
6. Push and create a pull request

## Security

- All API calls include authorization tokens
- RBAC enforced on the backend
- SSO integration for secure authentication
- MFA support for admin accounts

## Contributing

See the main SwipeSavvy documentation for contribution guidelines.

## License

Proprietary - SwipeSavvy Platform
