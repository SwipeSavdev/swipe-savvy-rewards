# Admin Portal Setup Guide

## Quick Start

### 1. Navigate to the admin portal directory

```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The admin portal will launch at `http://localhost:3000`

### 4. Login with demo credentials

- **Email**: admin@swipesavvy.com
- **Password**: demo123

---

## Project Structure Created

```
swioe-savvy-admin-portal/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Top navigation with user menu
│   │   └── Sidebar.tsx         # Main navigation sidebar
│   ├── pages/
│   │   ├── LoginPage.tsx       # Authentication
│   │   ├── DashboardPage.tsx   # Main dashboard with KPIs
│   │   └── FeatureFlagsPage.tsx # Feature flag management
│   ├── stores/
│   │   ├── authStore.ts        # Authentication state
│   │   └── featureFlagStore.ts # Feature flags state
│   ├── App.tsx                 # Routes and layout
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── README.md                   # Documentation
```

---

## Key Features Implemented

### ✅ Authentication
- Login page with demo credentials
- Token-based authentication
- User session management in Zustand store

### ✅ Navigation
- Sidebar with 7 main sections
- Active route highlighting
- User menu with logout

### ✅ Dashboard
- KPI cards showing key metrics
- Recent activity feed
- Dark theme optimized for admin use

### ✅ Feature Flags
- List all feature flags
- Toggle enabled/disabled status
- Show rollout percentage
- Delete flags
- Create new flags (UI ready)

### ✅ Design System
- Admin-specific dark theme
- Navy, green, yellow, and danger colors
- Responsive layout
- Accessible components

---

## Available Routes

| Route | Component | Status |
|-------|-----------|--------|
| `/login` | LoginPage | ✅ Complete |
| `/dashboard` | DashboardPage | ✅ Complete |
| `/feature-flags` | FeatureFlagsPage | ✅ Complete |
| `/users` | Users & Roles | 🔄 Placeholder |
| `/merchants` | Merchant Management | 🔄 Placeholder |
| `/analytics` | Analytics | 🔄 Placeholder |
| `/marketing` | AI Marketing Tool | 🔄 Placeholder |
| `/settings` | Settings | 🔄 Placeholder |

---

## API Endpoints to Implement

### Authentication
- `POST /api/v1/admin/auth/login` - Login
- `POST /api/v1/admin/auth/logout` - Logout
- `POST /api/v1/admin/auth/refresh` - Refresh token

### Feature Flags
- `GET /api/v1/admin/feature-flags` - List all flags
- `POST /api/v1/admin/feature-flags` - Create flag
- `PUT /api/v1/admin/feature-flags/{id}` - Update flag
- `DELETE /api/v1/admin/feature-flags/{id}` - Delete flag

### Users & Roles
- `GET /api/v1/admin/users` - List users
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/{id}` - Update user
- `DELETE /api/v1/admin/users/{id}` - Delete user
- `GET /api/v1/admin/roles` - List roles

### Analytics
- `GET /api/v1/admin/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/admin/analytics/transactions` - Transaction data
- `GET /api/v1/admin/analytics/users` - User metrics
- `GET /api/v1/admin/analytics/rewards` - Rewards metrics

---

## Development Tips

### Adding a New Page

1. Create page component in `src/pages/`
2. Import in `App.tsx`
3. Add route in `<Routes>`
4. Add navigation item in `Sidebar.tsx`

### Adding API Integration

1. Create API method in context store (e.g., `src/stores/newStore.ts`)
2. Use the store in your component with `const { data, fetchData } = useNewStore()`
3. Call API method on component mount with `useEffect`

### Adding State Management

1. Create new store file: `src/stores/myStore.ts`
2. Define interface and Zustand store
3. Import and use in components

---

## Next Steps

1. ✅ Setup complete - admin portal structure created
2. 🔄 Connect to backend API endpoints
3. 🔄 Implement Users & Roles management page
4. 🔄 Implement Merchant management page
5. 🔄 Implement Analytics dashboard with charts
6. 🔄 Implement AI Marketing tool interface
7. 🔄 Add RBAC permission checks
8. 🔄 Implement audit logging
9. 🔄 Add user session timeout
10. 🔄 Setup deployment configuration

---

## Troubleshooting

### Port 3000 already in use

Edit `vite.config.ts` and change the port:
```typescript
server: {
  port: 3001, // Change to different port
}
```

### API calls not working

Make sure the backend is running on `http://localhost:8000` or update the proxy in `vite.config.ts`

### TypeScript errors

Run `npm run type-check` to see all type issues

---

## Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Preview production build
npm run preview
```

---

## Support

For issues or questions, refer to the main SwipeSavvy documentation or contact the development team.
