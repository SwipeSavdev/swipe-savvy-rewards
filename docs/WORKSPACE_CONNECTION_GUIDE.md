# Admin Portal & Mobile App Workspace Connection Guide

## Overview

The Swioe Savvy project is now split into two independent workspaces:

1. **Mobile Wallet**: `/Users/macbookpro/Documents/swioe-savvy-mobile-wallet`
   - React Native Expo application
   - User-facing mobile application

2. **Admin Portal**: `/Users/macbookpro/Documents/swioe-savvy-admin-portal`
   - React + Vite web application
   - Admin dashboard for platform management

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Backend API Server               │
│         (Express/Node.js on port 3000)              │
└────────────────┬──────────────────────────┬─────────┘
                 │                          │
         /api endpoints              /api/admin endpoints
                 │                          │
    ┌────────────▼──────────┐  ┌───────────▼──────────┐
    │  Mobile Wallet App    │  │   Admin Portal       │
    │  (React Native)       │  │   (React + Vite)     │
    │  Port: 8081           │  │   Port: 5173         │
    └───────────────────────┘  └──────────────────────┘
```

## Environment Configuration

### Mobile Wallet (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Admin Portal (.env.local / .env.production)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

## Running Both Workspaces

### Terminal 1: Backend API Server
```bash
# Navigate to your backend directory
cd /path/to/backend

# Start the server (should run on port 3000)
npm run dev
```

### Terminal 2: Mobile Wallet App
```bash
cd /Users/macbookpro/Documents/swioe-savvy-mobile-wallet
npm start
# or for web
npm run web
```

### Terminal 3: Admin Portal
```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm run dev
# Access at http://localhost:5173
```

## API Endpoints

### Authentication
```
POST /api/admin/auth/login
- Request: { email: string, password: string }
- Response: { user: User, token: string }
```

### Admin Features
```
GET  /api/admin/dashboard
GET  /api/admin/users
GET  /api/admin/feature-flags
POST /api/admin/feature-flags
PUT  /api/admin/feature-flags/:id
```

## API Configuration

The admin portal uses the centralized API configuration module at:
- **File**: `src/lib/api.ts`
- **Features**:
  - Automatic base URL configuration from environment variables
  - Bearer token injection for authenticated requests
  - Request timeout handling
  - Centralized error handling

### Usage in Components/Stores

```typescript
import { apiCall } from '@/lib/api'

// Make authenticated API call
const response = await apiCall<UserData>('/api/admin/users')
```

## Key Connection Points

### 1. **Authentication Token Storage**
- Stored in: `localStorage` as `admin_token`
- Automatically injected in all API requests
- Cleared on logout

### 2. **API Base URL**
- Development: `http://localhost:3000`
- Production: `https://api.swioe-savvy.com`
- Configured via environment variables

### 3. **Shared Backend Routes**
- Admin routes prefixed with `/api/admin/*`
- User routes prefixed with `/api/*`
- Both communicate with the same backend server

## Development Workflow

1. **Setting up**:
   ```bash
   # Clone both workspaces
   # Install dependencies in each
   cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
   npm install
   ```

2. **Development**:
   - Each workspace runs independently
   - Both use the same backend API
   - Hot reload enabled in both

3. **Deployment**:
   - Mobile app: Deployed via Expo to app stores
   - Admin portal: Deployed via build to web server
   - Both point to production backend

## Troubleshooting

### Admin Portal Can't Connect to Backend
1. Verify backend is running on correct port (3000)
2. Check `VITE_API_BASE_URL` in `.env.local`
3. Verify CORS is enabled on backend for admin portal domain
4. Check browser network tab for failed requests

### CORS Errors
Backend should have CORS configured for both:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',      // Admin Portal
    'http://localhost:8081',      // Mobile Web
    'https://admin.swioe-savvy.com',
  ],
  credentials: true,
}));
```

### Token Not Being Sent
- Ensure token is stored in `localStorage.admin_token`
- Check API utility is using `apiCall` or `apiFetch` functions
- Verify authorization header is in network request

## File Structure

### Mobile Wallet
```
swioe-savvy-mobile-wallet/
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── ...
├── package.json
└── app.json
```

### Admin Portal
```
swioe-savvy-admin-portal/
├── src/
│   ├── pages/
│   ├── components/
│   ├── stores/
│   ├── lib/
│   │   └── api.ts (NEW)
│   └── ...
├── .env.example
├── .env.local
├── .env.production
├── package.json
└── vite.config.ts
```

## Next Steps

1. **Backend Setup**: Ensure your backend API is configured for both mobile and admin routes
2. **Environment Variables**: Update API URLs for your deployment
3. **CORS Configuration**: Configure CORS on backend for both workspace domains
4. **Testing**: Test login flow and API calls between workspaces
5. **Deployment**: Set up CI/CD for both workspaces independently

## Support

For issues or questions about the workspace structure, refer to:
- Mobile App: [ADMIN_PORTAL_DOCUMENTATION_INDEX.md](../swioe-savvy-mobile-wallet/ADMIN_PORTAL_DOCUMENTATION_INDEX.md)
- Both workspaces use the same backend API specifications

---

**Last Updated**: December 25, 2025
**Version**: 1.0.0
