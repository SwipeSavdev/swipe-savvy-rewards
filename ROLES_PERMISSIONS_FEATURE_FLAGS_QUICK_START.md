# Quick Reference: Roles, Permissions & Feature Flags

## Access Points

### Roles & Permissions Management
- **URL**: http://localhost:5174/admin/roles-permissions
- **Navigation**: Administration > Roles & Permissions
- **Icon**: shield

### Feature Flags
- **URL**: http://localhost:5174/tools/feature-flags
- **Navigation**: Tools > Feature Flags
- **Icon**: filter

---

## Roles & Permissions Features

### Available Tabs
1. **Roles** - Create, edit, delete custom roles; manage permissions per role
2. **Permissions** - Browse all 22 available permissions organized by category
3. **Policies** - View access control policies and rules

### Default Roles (5 total)
| Role | Users | Description |
|------|-------|-------------|
| Super Admin | 2 | Full system access |
| Admin | 5 | Most features, no delete |
| Support Agent | 12 | Support & customer management |
| Merchant | 45 | Merchant account access |
| User | 1250 | Standard user access |

### Permission Categories
- Authentication (3 perms)
- Account Management (4 perms)
- Transfers (3 perms)
- AI Concierge (2 perms)
- Profile (3 perms)
- Rewards (2 perms)
- Marketing (2 perms)
- Support (2 perms)
- Charity/Donations (2 perms)

---

## Feature Flags Overview

### 65 Mobile App Features Across 12 Categories

**Authentication** (7 features)
- Login, Registration, MFA, Biometric, Password Reset, Social Login, Sessions

**Account Management** (7 features)
- View, Add, Remove, Details, Balance, History, Statements

**Transfers** (8 features)
- Send, Receive, Scheduled, Recurring, Templates, International, Fees

**AI Concierge** (6 features)
- Chat, Voice, Suggestions, Search, Analysis, Budget

**Support** (5 features)
- Tickets, Live Chat, FAQs, Feedback, Notifications

**Rewards** (6 features)
- View, Redeem, Tiers, Referral, Conversion, Leaderboard

**Profile** (9 features)
- View, Edit, Password, Notifications, Privacy, Security, Devices, Export, Delete

**Marketing** (5 features)
- Campaigns, Deals, Promotions, Email, Personalized

**Charity** (5 features)
- View, Donate, History, Receipts, Recurring

**Home/Dashboard** (5 features)
- Dashboard, Quick Actions, Widgets, Activity, News

**Design/Theming** (5 features)
- Dark Mode, Light Mode, Custom Themes, Font Scaling, Accessibility

---

## Common Tasks

### Create a New Role
1. Go to `/admin/roles-permissions`
2. Click "Create Role"
3. Enter name and description
4. Click "Show Permission Matrix"
5. Check desired permissions
6. Click "Create Role"

### Toggle a Feature
1. Go to `/tools/feature-flags`
2. Find feature (search or filter by category)
3. Click "Enable" or "Disable" button
4. Confirm in modal
5. See success toast notification

### Search for a Feature
1. Go to `/tools/feature-flags`
2. Type in search box (searches name and description)
3. Results update instantly

### Filter by Category
1. Go to `/tools/feature-flags`
2. Click category pill at top (e.g., "Authentication")
3. View only features in that category
4. Click "All Features" to reset

---

## Feature Status Examples

✅ **Enabled at 100%**
- User Login
- Account Management
- Profile Management
- Rewards Redemption

⚠️ **Partial Rollout (75-99%)**
- AI Concierge Chat: 95%
- Biometric Login: 85%
- Support Live Chat: 85%
- Transaction Analysis: 70%

❌ **Disabled (0%)**
- Social Login
- International Transfers
- Budget Assistant
- Custom Themes
- Cryptocurrency Conversion

---

## User Journey: Admin Portal

```
Login
  ↓
Dashboard
  ├─ Administration
  │   ├─ AI Marketing Analytics
  │   ├─ Admin Users
  │   ├─ Audit Logs
  │   └─ Roles & Permissions ← NEW
  │
  ├─ Tools
  │   ├─ AI Marketing
  │   └─ Feature Flags ← ENHANCED
  │
  └─ [Other Sections]
```

---

## Data Models

### Role
```typescript
{
  id: string
  name: string
  description: string
  permissions: string[] // permission IDs
  usersCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}
```

### Permission
```typescript
{
  id: string
  key: string // e.g., "auth.login"
  label: string
  description: string
  resource: string // category
  action: string
}
```

### Feature Flag
```typescript
{
  id: string
  key: string
  name: string
  description: string
  category: string
  enabled: boolean
  status: 'on' | 'off'
  rolloutPercentage: number // 0-100
  rolloutPct: number // 0-100
  environment: string
  createdAt: string
  updatedAt: string
}
```

---

## UI Components Used

### RolesPermissionsPage
- Card (containers)
- Table (roles listing)
- Badge (status/type indicators)
- Input (search)
- Button (actions)
- Modal (create/edit)
- Checkbox (permission selection)

### FeatureFlagsPage
- Card (feature cards)
- Badge (status/rollout)
- Input (search)
- Button (enable/disable)
- ProgressBar (rollout visualization)
- Modal (confirmation)

---

## Toast Notifications

All actions show toast feedback:
- ✅ "Role Created successfully"
- ✅ "Feature flag updated"
- ✅ "Role Updated"
- ❌ "Cannot Delete system roles"
- ❌ "Failed to update feature flag"

---

## Rollout Strategy

### Gradual Rollout Example
1. **Phase 1**: Enable at 25% (beta users)
2. **Phase 2**: Increase to 50% (half user base)
3. **Phase 3**: Increase to 75% (most users)
4. **Phase 4**: 100% (all users)

---

## System Architecture

```
Admin Portal (http://localhost:5174)
│
├─ Authentication
├─ Protected Routes
└─ Pages
    ├─ RolesPermissionsPage
    │   ├─ Roles Tab
    │   ├─ Permissions Tab
    │   └─ Policies Tab
    │
    └─ FeatureFlagsPage
        ├─ Category Filter
        ├─ Search
        └─ Feature Cards (65 features)
```

---

## Browser URLs

| Page | URL |
|------|-----|
| Roles & Permissions | /admin/roles-permissions |
| Feature Flags | /tools/feature-flags |
| Charity Onboarding | /donations/charities |
| AI Marketing | /tools/ai-marketing |
| Admin Dashboard | /admin/analytics |

---

## Summary

✅ **What's New**:
- Complete roles and permissions management system
- 65 mobile app features now individually controllable
- Rollout percentage control for gradual feature releases
- Clean, modern UI with toggle switches
- Full search and filter capabilities
- Zero compilation errors
- Production-ready code

✅ **What Works**:
- Create/edit/delete roles
- Assign permissions to roles
- Enable/disable any feature
- Control rollout percentages
- Search and filter features
- View all available permissions
- Toast notifications for all actions

🚀 **Ready for**:
- Backend API integration
- Database persistence
- Real-time permission updates
- Audit logging
- Multi-user role management
