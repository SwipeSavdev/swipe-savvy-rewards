# Admin Portal Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm install
npm run dev
# Open http://localhost:3000
# Login: admin@swipesavvy.com / demo123
```

---

## 📁 File Locations

### Core Files
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root routing component |
| `src/main.tsx` | Application entry point |
| `src/index.css` | Global styles & CSS variables |
| `tailwind.config.js` | Tailwind theme configuration |
| `.env` | Environment variables (create this) |

### Store Layer (State Management)
| File | Purpose |
|------|---------|
| `src/stores/authStore.ts` | Authentication state with login/logout |
| `src/stores/featureFlagStore.ts` | Feature flags CRUD operations |
| `src/stores/notificationStore.ts` | (Coming) Toast notifications |
| `src/stores/usersStore.ts` | (Coming) Users & roles management |
| `src/stores/merchantsStore.ts` | (Coming) Merchant operations |
| `src/stores/analyticsStore.ts` | (Coming) Analytics data |
| `src/stores/marketingStore.ts` | (Coming) Marketing campaigns |

### Component Layer
| File | Purpose |
|------|---------|
| `src/components/Header.tsx` | Top navigation with user menu |
| `src/components/Sidebar.tsx` | Left sidebar navigation (7 items) |
| `src/components/Layout.tsx` | (Coming) Common layout wrapper |
| `src/components/Modal.tsx` | (Coming) Reusable modal dialog |
| `src/components/Table.tsx` | (Coming) Data table component |
| `src/components/Form.tsx` | (Coming) Form components |
| `src/components/Charts.tsx` | (Coming) Chart components |

### Page Layer
| File | Purpose |
|------|---------|
| `src/pages/LoginPage.tsx` | Authentication form |
| `src/pages/DashboardPage.tsx` | Main dashboard with KPIs |
| `src/pages/FeatureFlagsPage.tsx` | Feature flag management |
| `src/pages/UsersPage.tsx` | (Coming) Users & roles |
| `src/pages/MerchantsPage.tsx` | (Coming) Merchant management |
| `src/pages/AnalyticsPage.tsx` | (Coming) Analytics dashboard |
| `src/pages/MarketingPage.tsx` | (Coming) AI marketing tool |
| `src/pages/SettingsPage.tsx` | (Coming) Admin settings |

### Service Layer (API)
| File | Purpose |
|------|---------|
| `src/services/api.ts` | (Coming) Axios API client |
| `src/services/auth.ts` | (Coming) Auth service |
| `src/services/admin.ts` | (Coming) Admin API service |

### Hooks & Utils
| File | Purpose |
|------|---------|
| `src/hooks/useAuth.ts` | (Coming) Auth hook |
| `src/hooks/useApi.ts` | (Coming) API call hook |
| `src/utils/api.ts` | (Coming) API utilities |
| `src/utils/formatting.ts` | (Coming) Format utilities |
| `src/utils/validation.ts` | (Coming) Form validation |

### Types
| File | Purpose |
|------|---------|
| `src/types/auth.ts` | (Coming) Auth types |
| `src/types/admin.ts` | (Coming) Admin entity types |
| `src/types/api.ts` | (Coming) API response types |

---

## 🎨 Styling System

### CSS Variables (in `src/index.css`)
```css
/* Colors */
--color-primary: #235393    (Navy)
--color-secondary: #60BA46  (Green)
--color-accent: #FAB915     (Yellow)
--color-danger: #D64545     (Red)
--color-dark: #132136       (Deep)
--color-gray-50: #F9FAFB
--color-gray-900: #111827

/* Spacing (in rem) */
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem  (8px)
--spacing-md: 1rem    (16px)
--spacing-lg: 1.5rem  (24px)
--spacing-xl: 2rem    (32px)

/* Border Radius */
--radius-sm: 0.25rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
--radius-full: 9999px
```

### Tailwind Classes Used
```css
/* Typography */
text-sm, text-base, text-lg, text-xl, text-2xl
font-normal, font-medium, font-semibold, font-bold

/* Colors */
bg-primary (navy), bg-secondary (green), bg-danger (red)
text-primary, text-secondary, text-gray-600

/* Spacing */
p-4, m-2, px-6, py-3, gap-4, etc

/* Layout */
flex, flex-col, grid, grid-cols-2, grid-cols-3
justify-between, items-center, gap-4

/* States */
hover:bg-primary-600, disabled:opacity-50, focus:ring-2
```

### Theme Variables (Tailwind)
```javascript
// In tailwind.config.js
colors: {
  primary: '#235393',
  secondary: '#60BA46',
  accent: '#FAB915',
  danger: '#D64545',
  dark: '#132136',
}

spacing: {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
}

borderRadius: {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
}
```

---

## 🔐 Authentication Flow

### Login Process
```typescript
// User fills form
email: "admin@swipesavvy.com"
password: "demo123"

// Click "Sign In"
→ authStore.login(email, password)
→ POST /api/v1/admin/auth/login
← Response: { user, token }
→ Save token to localStorage
→ Set isAuthenticated = true
→ Redirect to /dashboard
```

### Token Usage
```typescript
// Every API request includes:
Authorization: Bearer {token}

// Token stored in:
localStorage.getItem('admin_token')

// On logout:
localStorage.removeItem('admin_token')
authStore.logout()
→ Redirect to /login
```

### Protected Routes
```typescript
// In App.tsx:
{isAuthenticated && (
  <Route path="/dashboard" element={<PrivateLayout><DashboardPage /></PrivateLayout>} />
)}

// Not authenticated:
→ User redirected to /login
```

---

## 📊 Store Usage Examples

### Using Auth Store
```typescript
import { useAuthStore } from '@/stores/authStore';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    await login('admin@example.com', 'password123');
    // Automatically redirected to dashboard
  };

  const handleLogout = () => {
    logout();
    // Automatically redirected to login page
  };

  return (
    <div>
      {isAuthenticated && <span>Welcome {user?.name}</span>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### Using Feature Flag Store
```typescript
import { useFeatureFlagStore } from '@/stores/featureFlagStore';
import { useEffect } from 'react';

export function FeaturesList() {
  const { flags, loading, fetchFlags, updateFlag, deleteFlag } = useFeatureFlagStore();

  useEffect(() => {
    fetchFlags(); // Load all flags on mount
  }, [fetchFlags]);

  const handleToggle = async (flagId: string, enabled: boolean) => {
    await updateFlag(flagId, { enabled });
    // Store updates automatically
  };

  const handleDelete = async (flagId: string) => {
    await deleteFlag(flagId);
    // Flag removed from list
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {flags.map(flag => (
        <div key={flag.id}>
          <span>{flag.name}</span>
          <button onClick={() => handleToggle(flag.id, !flag.enabled)}>
            {flag.enabled ? 'Disable' : 'Enable'}
          </button>
          <button onClick={() => handleDelete(flag.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛣️ Navigation Structure

### Route Hierarchy
```
/login
  ↓ (if not authenticated)

/dashboard
  ├─ /dashboard (home)
  ├─ /feature-flags
  ├─ /users
  ├─ /merchants
  ├─ /analytics
  ├─ /marketing
  └─ /settings
```

### Navigate Between Pages
```typescript
import { useNavigate } from 'react-router-dom';

export function MyComponent() {
  const navigate = useNavigate();

  const goToDashboard = () => navigate('/dashboard');
  const goToUsers = () => navigate('/users');
  const goToFlags = () => navigate('/feature-flags');

  return <button onClick={goToDashboard}>Go Home</button>;
}
```

### Navigation in Sidebar
The Sidebar component automatically highlights active routes:
```typescript
// In src/components/Sidebar.tsx:
const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Feature Flags', path: '/feature-flags', icon: Flag },
  { label: 'Users & Roles', path: '/users', icon: Users },
  // ... more items
];
```

---

## 🔄 API Endpoints (To Be Integrated)

### Authentication
```
POST   /api/v1/admin/auth/login              # Login
POST   /api/v1/admin/auth/logout             # Logout
POST   /api/v1/admin/auth/refresh            # Refresh token
GET    /api/v1/admin/auth/verify             # Verify session
```

### Dashboard
```
GET    /api/v1/admin/dashboard/metrics       # KPI cards data
GET    /api/v1/admin/dashboard/activity      # Recent activity
```

### Feature Flags
```
GET    /api/v1/admin/feature-flags           # List all flags
POST   /api/v1/admin/feature-flags           # Create flag
PUT    /api/v1/admin/feature-flags/{id}      # Update flag
DELETE /api/v1/admin/feature-flags/{id}      # Delete flag
```

### Users
```
GET    /api/v1/admin/users                   # List users
POST   /api/v1/admin/users                   # Create user
PUT    /api/v1/admin/users/{id}              # Update user
DELETE /api/v1/admin/users/{id}              # Delete user
POST   /api/v1/admin/users/{id}/reset-password
PUT    /api/v1/admin/users/{id}/role         # Update role
```

### Merchants
```
GET    /api/v1/admin/merchants               # List merchants
POST   /api/v1/admin/merchants/onboard       # New merchant
PUT    /api/v1/admin/merchants/{id}          # Update merchant
POST   /api/v1/admin/merchants/{id}/approve
POST   /api/v1/admin/merchants/{id}/reject
GET    /api/v1/admin/merchants/{id}/offers
POST   /api/v1/admin/merchants/{id}/offers
PUT    /api/v1/admin/merchants/{id}/offers/{offerId}
GET    /api/v1/admin/merchants/{id}/transactions
GET    /api/v1/admin/merchants/{id}/metrics
```

### Analytics
```
GET    /api/v1/admin/analytics/active-users
GET    /api/v1/admin/analytics/transactions
GET    /api/v1/admin/analytics/redemptions
GET    /api/v1/admin/analytics/top-merchants
GET    /api/v1/admin/analytics/retention
GET    /api/v1/admin/analytics/revenue
GET    /api/v1/admin/analytics/revenue/forecast
```

### Marketing
```
GET    /api/v1/admin/marketing/campaigns
POST   /api/v1/admin/marketing/campaigns
PUT    /api/v1/admin/marketing/campaigns/{id}
POST   /api/v1/admin/marketing/campaigns/{id}/launch
POST   /api/v1/admin/marketing/campaigns/{id}/pause
GET    /api/v1/admin/marketing/campaigns/{id}/metrics
POST   /api/v1/admin/marketing/ai/recommendations
POST   /api/v1/admin/marketing/ai/send-time
```

---

## 🐛 Common Tasks

### Add a New Page
1. Create `src/pages/MyPage.tsx`
2. Create `src/stores/myStore.ts` (if needed)
3. Add route in `src/App.tsx`
4. Add navigation item in `src/components/Sidebar.tsx`

```typescript
// src/pages/MyPage.tsx
export function MyPage() {
  return <div>My Page Content</div>;
}
```

### Connect to an API
1. Create endpoint call in store:
```typescript
// src/stores/myStore.ts
const fetchData = async () => {
  const response = await fetch('/api/v1/admin/my-endpoint', {
    headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
  });
  return response.json();
};
```

2. Use in component:
```typescript
const { data } = useMyStore();
useEffect(() => { useMyStore().fetchData(); }, []);
```

### Add Form Validation
```typescript
const [errors, setErrors] = useState({});

const validateForm = (data) => {
  const newErrors = {};
  if (!data.email) newErrors.email = 'Email required';
  if (!data.password) newErrors.password = 'Password required';
  return newErrors;
};

const handleSubmit = async (data) => {
  const errs = validateForm(data);
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }
  // Submit form
};
```

### Show Toast Notification
```typescript
// Will be available in next phase via useNotificationStore()
// For now:
alert('Success!');
```

### Add Loading State
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await someAsyncTask();
    // Success
  } catch (error) {
    // Error
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Loading...' : 'Submit'}
  </button>
);
```

---

## 🔍 Debugging

### Check if User is Logged In
```typescript
const { user, isAuthenticated } = useAuthStore();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
console.log('Token:', localStorage.getItem('admin_token'));
```

### View Store State
```typescript
// In browser console:
const store = useAuthStore.getState();
console.log(store);
```

### Network Requests
```typescript
// In browser DevTools:
// 1. Open Network tab
// 2. Look for requests to /api/v1/admin/*
// 3. Check request headers for Authorization: Bearer token
// 4. Check response status (200 = ok, 401 = unauthorized, 500 = server error)
```

### React Component Issues
```typescript
// Add useEffect logging:
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);

// Add render logging:
console.log('Rendering with:', { data, loading, error });
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP_GUIDE.md` | Installation & setup |
| `DEVELOPMENT_ROADMAP.md` | Sprint planning & tasks |
| `ARCHITECTURE.md` | System design & diagrams |
| `QUICK_REFERENCE.md` | This file |

---

## 🔗 Useful Links

- **React Docs**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **React Router**: https://reactrouter.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Recharts**: https://recharts.org
- **Vite**: https://vitejs.dev

---

## 🎯 Next Steps

1. **Run the dev server**:
   ```bash
   npm run dev
   ```

2. **Explore the app**:
   - Login with admin@swipesavvy.com / demo123
   - Look at Dashboard page
   - Look at Feature Flags page
   - Check the Sidebar navigation

3. **Start Task 2.1** (API Service Layer):
   - Create `src/services/api.ts`
   - Setup Axios client
   - Integrate with backend

4. **Review DEVELOPMENT_ROADMAP.md**:
   - Detailed sprint breakdowns
   - Task acceptance criteria
   - Estimated timeline

---

## ❓ Quick Help

**Q: How do I add a new API endpoint?**
A: Add it to the store file, create a function that calls fetch/axios to the endpoint, update TypeScript types, and use it in components.

**Q: How do I style a component?**
A: Use Tailwind classes (`className="flex gap-4 p-4"`), or CSS modules, or the CSS variables in `src/index.css`.

**Q: How do I handle errors?**
A: Wrap API calls in try/catch, set error state, display to user, or use a toast notification.

**Q: Where should I put API logic?**
A: In the store files (`src/stores/*.ts`). Keep components focused on rendering.

**Q: How do I make a component reusable?**
A: Move it to `src/components/`, accept props for dynamic content, document the props.

**Q: How do I test my changes?**
A: Use the dev server (`npm run dev`), test in browser, check console for errors, check Network tab for API calls.

---

Last Updated: 2025-12-20
Next Review: Start of Sprint 2
