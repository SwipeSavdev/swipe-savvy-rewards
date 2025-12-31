# Admin Portal - Complete Audit
## Buttons, Functions & Endpoint Requirements

**Date**: December 29, 2025  
**Status**: Pre-Implementation Review  
**Scope**: All pages, buttons, modals, and required endpoints

---

## 📋 Executive Summary

The SwipeSavvy Admin Portal contains **13 pages** with **45+ actionable buttons/functions** and **35+ API endpoints** that need to be implemented.

| Category | Count | Status |
|----------|-------|--------|
| Pages | 13 | ✅ UI Built |
| Data Tables | 10 | ✅ UI Built |
| Modals | 8 | ✅ UI Built |
| Action Buttons | 45+ | ⚠️ Mock Only |
| Required Endpoints | 35+ | ⚠️ Not Implemented |
| User Roles | 3 | ⚠️ Placeholder |

---

## 🏗️ Pages Overview

### 1. **Dashboard** (`/dashboard`)
**Purpose**: Platform overview and key metrics

#### Buttons & Actions:
- `[Refresh]` - Reload dashboard metrics
  - **Handler**: `handleRefresh()`
  - **Current**: `MockApi.getDashboardOverview()`
  - **Required Endpoint**: `GET /api/v1/admin/dashboard/overview`
  - **Response**:
    ```typescript
    {
      stats: {
        users: { value: number, trendPct: number, trendDirection: 'up'|'down' }
        transactions: { value: number, trendPct: number, trendDirection: 'up'|'down' }
        revenue: { value: number, trendPct: number, trendDirection: 'up'|'down' }
        growth: { value: number, trendPct: number, trendDirection: 'up'|'down' }
      }
      recentActivity: Array<{
        id: string
        description: string
        status: 'success' | 'warning' | 'error'
        timestamp: string
      }>
    }
    ```

#### UI Components:
- 4 Stat Cards (Users, Transactions, Revenue, Growth)
- 2 Chart Placeholders (Transactions Volume, Revenue)
- Recent Activity Table

---

### 2. **Users** (`/users`)
**Purpose**: Manage customer users (invitation, status tracking)

#### Buttons & Actions:

1. **`[Invite User]`** - Open invite modal
   - **Handler**: `setInviteOpen(true)`
   - **Modal Form Fields**: 
     - Name (required)
     - Email (required, validated)
   - **Modal Action Button**: `[Send Invite]`
     - **Handler**: `onInvite()`
     - **Current**: `MockApi.inviteUser({ email, name })`
     - **Required Endpoint**: `POST /api/v1/admin/users/invite`
     - **Request**:
       ```typescript
       {
         email: string
         name: string
       }
       ```
     - **Response**:
       ```typescript
       {
         success: boolean
         message: string
         invitationId?: string
       }
       ```

2. **Search & Filter**
   - **Search Input**: `query` state
   - **Status Filter**: dropdown (`all` | `active` | `invited` | `suspended`)
   - **Endpoint**: `GET /api/v1/admin/users?query={query}&status={status}&page=1&pageSize=100`

#### Table Columns:
- Name & Email
- Status (badge)
- Created Date
- Row Actions: (expandable for future: resend, suspend, etc.)

#### Required Type:
```typescript
interface CustomerUser {
  id: string
  name: string
  email: string
  status: 'active' | 'invited' | 'suspended'
  createdAt: string
}
```

---

### 3. **Merchants** (`/merchants`)
**Purpose**: Monitor and manage merchant partners

#### Buttons & Actions:

1. **Search & Filter**
   - Search Input: merchant name, email, or ID
   - Status Filter: `all` | `active` | `pending` | `suspended`
   - **Endpoint**: `GET /api/v1/admin/merchants?query={query}&status={status}&page=1&pageSize=100`

2. **Row Click → View Details**
   - Opens side panel or modal with detailed merchant info
   - Shows transactions, payout history, KYC status
   - **Endpoint**: `GET /api/v1/admin/merchants/{merchantId}`

#### Table Columns:
- Merchant Name & Category
- Transaction Count & Success Rate
- Monthly Volume (USD)
- Average Transaction (USD)

#### Required Type:
```typescript
interface Merchant {
  id: string
  name: string
  category: string
  status: 'active' | 'pending' | 'suspended'
  transactionCount: number
  successRate: number  // 0-1
  monthlyVolume: number  // cents
  avgTransaction: number  // cents
  createdAt: string
}
```

#### Required Endpoints:
- `GET /api/v1/admin/merchants` - List merchants
- `GET /api/v1/admin/merchants/{merchantId}` - Get merchant details
- `PUT /api/v1/admin/merchants/{merchantId}/status` - Update merchant status
- `GET /api/v1/admin/merchants/{merchantId}/transactions` - Merchant transactions
- `GET /api/v1/admin/merchants/{merchantId}/payouts` - Payout history

---

### 4. **Admin Users** (`/admin-users`)
**Purpose**: Manage internal admin/support staff

#### Buttons & Actions:

1. **`[Add Admin]`** - Open add admin modal
   - **Modal Form Fields**:
     - Name (required)
     - Email (required, validated)
     - Role (dropdown: `super_admin` | `admin` | `support`)
   - **Modal Action Button**: `[Send Invite]`
     - **Handler**: `onAdd()`
     - **Current**: `MockApi.addAdminUser({ email, name, role })`
     - **Required Endpoint**: `POST /api/v1/admin/admins/invite`
     - **Request**:
       ```typescript
       {
         email: string
         name: string
         role: 'super_admin' | 'admin' | 'support'
       }
       ```

2. **Search by Name/Email**
   - **Endpoint**: `GET /api/v1/admin/admins?query={query}&page=1&pageSize=100`

#### Table Columns:
- Admin Name & Email
- Role (badge)
- Status (active | invited | suspended)
- Last Login Date/Time

#### Required Type:
```typescript
interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'support'
  status: 'active' | 'invited' | 'suspended'
  lastLoginAt: string | null
  createdAt: string
}
```

#### Required Endpoints:
- `GET /api/v1/admin/admins` - List admin users
- `POST /api/v1/admin/admins/invite` - Invite new admin
- `PUT /api/v1/admin/admins/{adminId}/role` - Update admin role
- `PUT /api/v1/admin/admins/{adminId}/status` - Suspend/restore admin

---

### 5. **Analytics** (`/analytics`)
**Purpose**: Performance insights across users, transactions, revenue

#### Components:
- **Stat Cards**: Active users, Transactions, Revenue, Conversion (read-only)
- **Tabs**:
  - **Overview**: Transaction volume & Revenue charts
  - **Funnels**: Onboarding funnel (Started → KYC → First Transaction)
  - **Exports**: Placeholder for scheduled exports

#### Required Endpoints:
- `GET /api/v1/admin/analytics/overview` - Dashboard stats
- `GET /api/v1/admin/analytics/transactions?days=30` - Transaction volume chart data
- `GET /api/v1/admin/analytics/revenue?days=30` - Revenue chart data
- `GET /api/v1/admin/analytics/funnel/onboarding` - Onboarding funnel metrics
- `GET /api/v1/admin/analytics/cohort/retention?cohortWeek={week}` - Cohort retention data

#### Response Type:
```typescript
interface AnalyticsOverview {
  activeUsers: number
  transactions: number
  revenue: number  // cents
  conversion: number  // percentage
  trends: {
    users: { pct: number, direction: 'up' | 'down' }
    transactions: { pct: number, direction: 'up' | 'down' }
    revenue: { pct: number, direction: 'up' | 'down' }
    conversion: { pct: number, direction: 'up' | 'down' }
  }
}
```

---

### 6. **Support Dashboard** (`/support`)
**Purpose**: Ticket workload, SLA health, team throughput

#### Buttons & Actions:
- **Read-Only Stat Cards**: Open tickets, In progress, Resolved today, First response time

#### Static Content:
- SLA Status Progress Bars (87%, 71%, 4.6/5)
- Playbooks Grid: Card declines, Chargebacks, Merchant onboarding, KYC review, Refunds, Account access

#### Required Endpoints:
- `GET /api/v1/admin/support/stats` - Support metrics
  ```typescript
  interface SupportDashboardStats {
    openTickets: number
    inProgressTickets: number
    resolvedToday: number
    firstResponseTimeHours: number
    slaMetrics: {
      firstResponseSLA: number  // percentage
      resolutionSLA: number  // percentage
      csat: number  // out of 5
    }
  }
  ```

---

### 7. **Support Tickets** (`/support/tickets`)
**Purpose**: Triaging and resolving customer issues

#### Buttons & Actions:

1. **Search & Filter**
   - Search by subject, customer name, email
   - Status Filter: `all` | `open` | `in_progress` | `resolved` | `closed`
   - **Endpoint**: `GET /api/v1/admin/support/tickets?query={query}&status={status}&page=1&pageSize=100`

2. **Row Click → `[View]` Button**
   - Opens modal with ticket details:
     - Subject, Description
     - Customer info (name, email)
     - Priority & Status
     - Message history/thread
   - **Endpoint**: `GET /api/v1/admin/support/tickets/{ticketId}`

3. **Modal Actions** (from within ticket modal):
   - `[Add Note]` - Text area for internal notes
   - `[Change Status]` - Dropdown to update status
   - **Required Endpoints**:
     - `POST /api/v1/admin/support/tickets/{ticketId}/notes` - Add note
     - `PUT /api/v1/admin/support/tickets/{ticketId}/status` - Update ticket status
     - `POST /api/v1/admin/support/tickets/{ticketId}/assign` - Assign to admin

#### Table Columns:
- Subject & Customer info
- Priority (urgent, high, medium, low)
- Status (open, in_progress, resolved, closed)
- Last Updated timestamp
- Actions: `[View]` button

#### Required Type:
```typescript
interface SupportTicket {
  id: string
  subject: string
  description: string
  customerName: string
  customerEmail: string
  customerId: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    author: string
    body: string
    isInternal: boolean
    createdAt: string
  }>
}
```

---

### 8. **Feature Flags** (`/feature-flags`)
**Purpose**: Roll out features safely with on/off switches and gradual rollout

#### Buttons & Actions:

1. **Search Input**
   - Search flags by name or key
   - **Endpoint**: `GET /api/v1/admin/feature-flags?query={query}&page=1&pageSize=200`

2. **Row Action Button: `[Enable]` / `[Disable]`**
   - Triggers confirmation modal
   - **Modal**: Shows flag name, current status, confirmation
   - **Modal Action**: `[Confirm]`
     - **Handler**: `onConfirm()`
     - **Current**: `MockApi.updateFeatureFlag(flag.key, newStatus)`
     - **Required Endpoint**: `PUT /api/v1/admin/feature-flags/{flagKey}`
     - **Request**:
       ```typescript
       {
         status: 'on' | 'off'
         rolloutPct?: number  // 0-100 for gradual rollout
       }
       ```

#### Table Columns:
- Feature Name & Key
- Status (on | off)
- Rollout % with progress bar
- Updated by (admin name)
- Updated timestamp
- Action button (Enable/Disable)

#### Required Type:
```typescript
interface FeatureFlag {
  key: string
  name: string
  status: 'on' | 'off'
  rolloutPct: number  // 0-100
  updatedBy: string  // admin name
  updatedAt: string
}
```

#### Required Endpoints:
- `GET /api/v1/admin/feature-flags` - List all flags
- `PUT /api/v1/admin/feature-flags/{flagKey}` - Update flag
- `POST /api/v1/admin/feature-flags` - Create new flag (future)

---

### 9. **AI Marketing** (`/ai-marketing`)
**Purpose**: Create and manage AI-assisted customer campaigns

#### Buttons & Actions:

1. **`[New Campaign]`** - Open create campaign modal
   - **Modal Form Fields**:
     - Campaign Name (text input)
     - Objective (select: activation | retention | upsell | winback)
     - Channel (select: email | sms | push)
   - **Modal Action Button**: `[Create]`
     - **Handler**: `onCreate()`
     - **Current**: `MockApi.createAiCampaign({ name, objective, channel })`
     - **Required Endpoint**: `POST /api/v1/admin/ai-campaigns`
     - **Request**:
       ```typescript
       {
         name: string
         objective: 'activation' | 'retention' | 'upsell' | 'winback'
         channel: 'email' | 'sms' | 'push'
         messagingPrompt?: string  // AI prompt for message generation
         audienceSegment?: string  // Audience filter
       }
       ```

2. **Search Campaigns** (future)
   - **Endpoint**: `GET /api/v1/admin/ai-campaigns?query={query}&page=1&pageSize=100`

3. **Row Click → View Campaign**
   - See campaign details, performance, message variations
   - **Endpoint**: `GET /api/v1/admin/ai-campaigns/{campaignId}`

#### Table Columns:
- Campaign Name, Objective, Channel
- Status (running | scheduled | paused | completed)
- Audience Size
- Last Updated timestamp

#### Required Type:
```typescript
interface AiCampaign {
  id: string
  name: string
  objective: 'activation' | 'retention' | 'upsell' | 'winback'
  channel: 'email' | 'sms' | 'push'
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed'
  audienceSize: number
  createdAt: string
  lastUpdatedAt: string
  createdBy: string  // admin id
}
```

#### Required Endpoints:
- `GET /api/v1/admin/ai-campaigns` - List campaigns
- `POST /api/v1/admin/ai-campaigns` - Create campaign
- `GET /api/v1/admin/ai-campaigns/{campaignId}` - Get campaign details
- `PUT /api/v1/admin/ai-campaigns/{campaignId}` - Update campaign
- `POST /api/v1/admin/ai-campaigns/{campaignId}/launch` - Launch campaign
- `PUT /api/v1/admin/ai-campaigns/{campaignId}/status` - Update campaign status

---

### 10. **Audit Logs** (`/audit-logs`)
**Purpose**: Track sensitive actions for compliance and incident response

#### Buttons & Actions:

1. **Search Input**
   - Search by action, actor, target
   - **Endpoint**: `GET /api/v1/admin/audit-logs?query={query}&page=1&pageSize=200`

#### Table Columns:
- Action (badge)
- Actor (name & email)
- Target (resource type:id)
- Timestamp

#### Required Type:
```typescript
interface AuditLogEntry {
  id: string
  action: string  // e.g., 'user_invited', 'feature_flag_toggled'
  actor: {
    id: string
    name: string
    email: string
  }
  target?: {
    type: string  // 'user', 'merchant', 'feature_flag'
    id: string
  }
  metadata?: Record<string, any>
  createdAt: string
}
```

#### Required Endpoints:
- `GET /api/v1/admin/audit-logs` - List audit logs
- Auto-logged by backend on:
  - User invitations
  - Admin role changes
  - Feature flag updates
  - Merchant status changes
  - Support ticket updates

---

### 11. **Settings** (`/settings`)
**Purpose**: Platform configuration, branding, notifications

#### Buttons & Actions:

1. **Organization Section**
   - `[Input]` Organization Name
   - `[TextArea]` Description
   - `[Combobox]` Timezone (America/Los_Angeles, America/New_York, Europe/London, Asia/Dubai)
   - `[MultiSelect]` Supported Locales (en-US, es-ES, fr-FR, ar-AE)

2. **Branding Section**
   - `[File Input]` Upload Portal Logo
   - `[RadioGroup]` Theme Mode (system | light | dark)

3. **Notifications Section**
   - `[Checkbox]` Real-time operational alerts
   - `[Checkbox]` Daily summary digest

4. **`[Save Settings]` Button**
   - **Handler**: `onSave()`
   - **Current**: `MockApi.updateOrgSettings({...})`
   - **Required Endpoint**: `PUT /api/v1/admin/settings/organization`
   - **Request**:
     ```typescript
     {
       name: string
       description: string
       timezone: string
       locales: string[]
       theme: 'system' | 'light' | 'dark'
       logoUrl?: string  // from file upload
       notificationPrefs: {
         alerts: boolean
         digest: boolean
       }
     }
     ```

#### Additional Display:
- **API Rate Limit Card**: Shows remaining/total requests, reset time
  - **Endpoint**: `GET /api/v1/admin/settings/api-quota`
  - Response:
    ```typescript
    {
      remaining: number
      total: number
      resetTime: string
      percentageUsed: number
    }
    ```

#### Required Endpoints:
- `GET /api/v1/admin/settings/organization` - Get current settings
- `PUT /api/v1/admin/settings/organization` - Update settings
- `POST /api/v1/admin/settings/logo/upload` - Upload logo file
- `GET /api/v1/admin/settings/api-quota` - Get rate limit info

---

### 12. **Login** (`/login`)
**Purpose**: Admin authentication

#### Buttons & Actions:

1. **Form Fields**:
   - Email input (required)
   - Password input (required)

2. **`[Sign In]` Button**
   - **Handler**: Login with email/password
   - **Current**: `MockApi.login({ email, password })`
   - **Demo Credentials**: 
     - Email: `admin@swipesavvy.com`
     - Password: `Admin123!`
   - **Required Endpoint**: `POST /api/v1/admin/auth/login`
   - **Request**:
     ```typescript
     {
       email: string
       password: string
     }
     ```
   - **Response**:
     ```typescript
     {
       session: {
         token: string  // JWT
         user: {
           id: string
           name: string
           email: string
           role: 'super_admin' | 'admin' | 'support'
         }
       }
     }
     ```

#### Required Endpoints:
- `POST /api/v1/admin/auth/login` - Authenticate
- `POST /api/v1/admin/auth/logout` - Logout
- `POST /api/v1/admin/auth/refresh` - Refresh token

---

### 13. **Not Found** (`/404`)
**Purpose**: Fallback for invalid routes

---

## 📊 Complete Endpoint Inventory

### Authentication
```
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/logout
POST   /api/v1/admin/auth/refresh
GET    /api/v1/admin/auth/me
```

### Dashboard
```
GET    /api/v1/admin/dashboard/overview
GET    /api/v1/admin/analytics/overview
GET    /api/v1/admin/analytics/transactions?days=30
GET    /api/v1/admin/analytics/revenue?days=30
GET    /api/v1/admin/analytics/funnel/onboarding
GET    /api/v1/admin/analytics/cohort/retention?cohortWeek={week}
```

### Users
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users/invite
GET    /api/v1/admin/users/{userId}
PUT    /api/v1/admin/users/{userId}/status
DELETE /api/v1/admin/users/{userId}
```

### Merchants
```
GET    /api/v1/admin/merchants
GET    /api/v1/admin/merchants/{merchantId}
PUT    /api/v1/admin/merchants/{merchantId}/status
GET    /api/v1/admin/merchants/{merchantId}/transactions
GET    /api/v1/admin/merchants/{merchantId}/payouts
```

### Admins
```
GET    /api/v1/admin/admins
POST   /api/v1/admin/admins/invite
PUT    /api/v1/admin/admins/{adminId}/role
PUT    /api/v1/admin/admins/{adminId}/status
DELETE /api/v1/admin/admins/{adminId}
```

### Support
```
GET    /api/v1/admin/support/stats
GET    /api/v1/admin/support/tickets
GET    /api/v1/admin/support/tickets/{ticketId}
POST   /api/v1/admin/support/tickets/{ticketId}/notes
PUT    /api/v1/admin/support/tickets/{ticketId}/status
POST   /api/v1/admin/support/tickets/{ticketId}/assign
```

### Feature Flags
```
GET    /api/v1/admin/feature-flags
PUT    /api/v1/admin/feature-flags/{flagKey}
POST   /api/v1/admin/feature-flags
DELETE /api/v1/admin/feature-flags/{flagKey}
```

### AI Marketing
```
GET    /api/v1/admin/ai-campaigns
POST   /api/v1/admin/ai-campaigns
GET    /api/v1/admin/ai-campaigns/{campaignId}
PUT    /api/v1/admin/ai-campaigns/{campaignId}
POST   /api/v1/admin/ai-campaigns/{campaignId}/launch
PUT    /api/v1/admin/ai-campaigns/{campaignId}/status
```

### Audit
```
GET    /api/v1/admin/audit-logs
```

### Settings
```
GET    /api/v1/admin/settings/organization
PUT    /api/v1/admin/settings/organization
POST   /api/v1/admin/settings/logo/upload
GET    /api/v1/admin/settings/api-quota
```

---

## 🔐 Authentication & Authorization

### Current State
- **Auth Service**: Basic login with mock credentials
- **Token Storage**: In-memory (needs session/localStorage)
- **Token Type**: Mock JWT format (`demo_token_123`)

### Implementation Checklist
- [ ] Real JWT implementation
- [ ] Token refresh mechanism
- [ ] Role-based access control (RBAC):
  - `super_admin` - Full access
  - `admin` - User/merchant management
  - `support` - Tickets only
- [ ] Protected routes (redirect to login if no token)
- [ ] Token expiration handling

---

## 🔄 Data Flow Architecture

### Current Architecture (Mock)
```
UI Component
  ↓
hooks (useState, useEffect)
  ↓
MockApi.{function}()
  ↓
mockData.ts (static data)
  ↓
UI Render
```

### Target Architecture (Real)
```
UI Component
  ↓
hooks (useState, useEffect)
  ↓
Real API calls (axios/fetch)
  ↓
Backend FastAPI endpoints
  ↓
Database (PostgreSQL)
  ↓
Return JSON response
  ↓
UI Render
```

---

## 📝 Implementation Phases

### Phase 1: Core API Layer
- [ ] Create `apiClient.ts` with axios instance
- [ ] Implement authentication endpoints
- [ ] Add token refresh logic
- [ ] Create error handling/retry logic

### Phase 2: Dashboard & Analytics
- [ ] Implement `/api/v1/admin/dashboard/overview`
- [ ] Implement `/api/v1/admin/analytics/*` endpoints
- [ ] Wire up chart data

### Phase 3: User Management
- [ ] Implement users CRUD
- [ ] Implement admin users CRUD
- [ ] Add invitation system

### Phase 4: Merchants & Support
- [ ] Implement merchants endpoints
- [ ] Implement support tickets endpoints
- [ ] Add ticket note management

### Phase 5: Feature Flags & Marketing
- [ ] Implement feature flags endpoints
- [ ] Implement AI campaigns endpoints

### Phase 6: Audit & Settings
- [ ] Implement audit logs
- [ ] Implement settings endpoints
- [ ] Add file upload for branding

---

## 🛠️ Integration Points with Backend

### Required Backend Models
```python
# users.py
class User(Base):
    id: str
    name: str
    email: str
    status: str  # active, invited, suspended
    created_at: datetime

# merchants.py
class Merchant(Base):
    id: str
    name: str
    category: str
    status: str
    transaction_count: int
    success_rate: float
    monthly_volume: int
    avg_transaction: int

# admin_users.py
class AdminUser(Base):
    id: str
    name: str
    email: str
    role: str  # super_admin, admin, support
    status: str
    last_login_at: Optional[datetime]

# support_tickets.py
class SupportTicket(Base):
    id: str
    subject: str
    description: str
    customer_id: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime

# feature_flags.py
class FeatureFlag(Base):
    key: str
    name: str
    status: str  # on, off
    rollout_pct: int
    updated_by: str
    updated_at: datetime

# ai_campaigns.py
class AiCampaign(Base):
    id: str
    name: str
    objective: str
    channel: str
    status: str
    audience_size: int
    created_by: str

# audit_logs.py
class AuditLog(Base):
    id: str
    action: str
    actor_id: str
    target_type: Optional[str]
    target_id: Optional[str]
    metadata: dict
    created_at: datetime
```

---

## 🚀 Next Steps

1. **Review this audit** with backend team
2. **Prioritize endpoints** (Phase 1 vs. future)
3. **Create backend service** with FastAPI routes
4. **Implement API client** in admin portal
5. **Connect UI to real endpoints** (replace MockApi)
6. **Add error handling** & loading states
7. **Test authentication flow**
8. **Deploy & monitor**

---

## 📎 Appendix: File References

**Admin Portal Structure:**
```
swipesavvy-admin-portal/src/
├── pages/
│   ├── DashboardPage.tsx
│   ├── UsersPage.tsx
│   ├── MerchantsPage.tsx
│   ├── AdminUsersPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── SupportDashboardPage.tsx
│   ├── SupportTicketsPage.tsx
│   ├── FeatureFlagsPage.tsx
│   ├── AiMarketingPage.tsx
│   ├── AuditLogsPage.tsx
│   ├── SettingsPage.tsx
│   └── LoginPage.tsx
├── services/
│   ├── api.ts (exports MockApi)
│   ├── mockApi.ts (all API functions)
│   └── mockData.ts (demo data)
├── types/
│   ├── users.ts
│   ├── merchants.ts
│   ├── dashboard.ts
│   ├── support.ts
│   ├── featureFlags.ts
│   ├── aiMarketing.ts
│   ├── audit.ts
│   └── common.ts
└── store/
    └── toastStore.ts (notifications)
```

---

**Audit Completed**: December 29, 2025
