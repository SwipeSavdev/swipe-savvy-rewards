# Admin Portal - Quick Implementation Checklist

## 📌 At a Glance

**Total Endpoints Needed**: 43  
**Total Pages**: 13  
**Total Interactive Buttons**: 45+  
**Estimated Implementation Time**: 3-4 weeks (backend + frontend integration)

---

## ✅ Quick Button Summary by Page

### Dashboard
- [ ] Refresh button → `GET /api/v1/admin/dashboard/overview`

### Users
- [ ] Invite User modal & send → `POST /api/v1/admin/users/invite`
- [ ] Search/filter users → `GET /api/v1/admin/users`

### Merchants
- [ ] Search/filter merchants → `GET /api/v1/admin/merchants`
- [ ] View merchant details → `GET /api/v1/admin/merchants/{id}`

### Admin Users
- [ ] Add Admin modal & send → `POST /api/v1/admin/admins/invite`
- [ ] Search/filter admins → `GET /api/v1/admin/admins`

### Analytics
- [ ] Load dashboard stats → `GET /api/v1/admin/analytics/overview`
- [ ] Load chart data (3 endpoints) → `GET /api/v1/admin/analytics/*`

### Support Dashboard
- [ ] Load support stats → `GET /api/v1/admin/support/stats`

### Support Tickets
- [ ] Search/filter tickets → `GET /api/v1/admin/support/tickets`
- [ ] View ticket details → `GET /api/v1/admin/support/tickets/{id}`
- [ ] Add note to ticket → `POST /api/v1/admin/support/tickets/{id}/notes`
- [ ] Update ticket status → `PUT /api/v1/admin/support/tickets/{id}/status`

### Feature Flags
- [ ] Search flags → `GET /api/v1/admin/feature-flags`
- [ ] Toggle flag (Enable/Disable) → `PUT /api/v1/admin/feature-flags/{key}`

### AI Marketing
- [ ] Create campaign modal → `POST /api/v1/admin/ai-campaigns`
- [ ] List campaigns → `GET /api/v1/admin/ai-campaigns`

### Audit Logs
- [ ] Search logs → `GET /api/v1/admin/audit-logs`

### Settings
- [ ] Save organization settings → `PUT /api/v1/admin/settings/organization`
- [ ] Upload logo → `POST /api/v1/admin/settings/logo/upload`
- [ ] Load API quota → `GET /api/v1/admin/settings/api-quota`

### Login
- [ ] Sign in → `POST /api/v1/admin/auth/login`

---

## 🗂️ Endpoint Categories

| Category | Count | Priority |
|----------|-------|----------|
| **Auth** | 4 | 🔴 Critical |
| **Dashboard** | 7 | 🔴 Critical |
| **Users** | 5 | 🟠 High |
| **Merchants** | 5 | 🟠 High |
| **Admin Users** | 4 | 🟠 High |
| **Support** | 6 | 🟡 Medium |
| **Feature Flags** | 4 | 🟡 Medium |
| **AI Marketing** | 6 | 🟡 Medium |
| **Audit Logs** | 1 | 🟢 Low |
| **Settings** | 4 | 🟢 Low |

---

## 🏗️ Backend Implementation Order

1. **Week 1**: Auth (login/logout/refresh) + Dashboard overview
2. **Week 2**: Users, Admins, Merchants (CRUD operations)
3. **Week 3**: Support Tickets, Feature Flags
4. **Week 4**: AI Marketing, Settings, Audit Logs

---

## 🔑 Key Files to Create/Modify

### Backend (FastAPI)
```python
# app/routes/admin/
├── auth.py          # Login, refresh, logout
├── dashboard.py     # Overview, stats
├── users.py         # Customer users CRUD
├── merchants.py     # Merchant management
├── admin_users.py   # Admin staff management
├── support.py       # Support tickets
├── feature_flags.py # Feature flag management
├── ai_campaigns.py  # AI marketing campaigns
├── audit_logs.py    # Audit log retrieval
└── settings.py      # Platform settings
```

### Frontend (React)
```typescript
// src/services/
├── apiClient.ts     # Real axios/fetch client (replace MockApi)
├── auth.ts          # Auth functions
├── dashboard.ts     # Dashboard calls
├── users.ts         # User endpoints
├── merchants.ts     # Merchant endpoints
└── ... (other services)

// src/hooks/
├── useAuth.ts       # Authentication state
├── useFetch.ts      # Data fetching with loading/error
└── useToast.ts      # Notifications (existing)
```

---

## 🔐 Authentication Flow

```
Login Page
  ↓
Enter email/password
  ↓
POST /api/v1/admin/auth/login
  ↓
Receive JWT token
  ↓
Store token in sessionStorage/localStorage
  ↓
Set Authorization header: "Bearer {token}"
  ↓
Redirect to /dashboard
  ↓
All subsequent requests include token
  ↓
Token expires? → POST /api/v1/admin/auth/refresh
  ↓
Logout → POST /api/v1/admin/auth/logout + clear token
```

---

## ⚠️ Important Considerations

1. **Pagination**: All list endpoints should support `page` and `pageSize` params
2. **Error Handling**: Real API needs proper error messages (not just success/fail)
3. **Loading States**: UI currently shows basic loading, needs proper skeleton loaders
4. **Toast Notifications**: System in place but needs real error messages from API
5. **Timestamps**: Convert Unix timestamps to human-readable format client-side
6. **Role-based Access**: Implement RBAC to hide buttons/pages from non-admin users
7. **Rate Limiting**: Frontend needs to respect API rate limits (shown in Settings)
8. **Audit Logging**: Backend should auto-log all admin actions

---

## 📊 Data Volume Estimates

| Entity | Expected Count | Load Impact |
|--------|-----------------|-------------|
| Users | 10,000+ | High (paginate) |
| Merchants | 1,000+ | Medium |
| Support Tickets | 5,000+ | High (filter/search) |
| Feature Flags | 50-100 | Low |
| AI Campaigns | 20-50 | Low |
| Audit Logs | 100,000+ | Very High (paginate heavily) |

→ Use pagination everywhere, implement lazy loading for large tables

---

## 🚀 Recommended Implementation Approach

### Step 1: Setup Real API Client
Replace `MockApi` exports in `src/services/api.ts` with real HTTP client

### Step 2: Start with Auth
Get login/logout working first, everything depends on this

### Step 3: Implement by Page Priority
1. Dashboard (most visible)
2. Users/Merchants (core business entities)
3. Support/Flags (operational tools)
4. Marketing/Settings (nice to have)

### Step 4: Add Error Handling
Implement proper error boundaries and fallback UI

### Step 5: Polish & Test
Add loading animations, optimize re-renders, test edge cases

---

## 📌 Notes

- **All mock data** in `src/services/mockData.ts` can be deleted once API is live
- **Toast notification system** is ready to use (`pushToast()`)
- **Type definitions** are already in place—just connect to real data
- **UI components** don't need changes—just swap the API layer
- **Table pagination** is built-in (see `Table` component)

---

Generated: December 29, 2025
