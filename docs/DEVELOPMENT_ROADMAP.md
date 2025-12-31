# Admin Portal Development Roadmap

## Phase 1: Foundation (✅ Complete)

### Week 1: Project Setup
- ✅ Create React + TypeScript + Vite project
- ✅ Configure Zustand stores (auth, feature flags)
- ✅ Setup React Router v6 with protected routes
- ✅ Configure Tailwind CSS with admin theme
- ✅ Create Header and Sidebar components
- ✅ Build Login page with authentication
- ✅ Create Dashboard with KPI cards
- ✅ Build Feature Flags management page

**Current Status**: All foundation components working. Ready for backend integration.

---

## Phase 2: Core Admin Features (🚀 Starting Now)

### Sprint 1: Backend Integration (Week 2-3)

#### Task 2.1: API Service Layer
```typescript
// src/services/api.ts
- Create Axios instance with:
  - Base URL: process.env.VITE_API_BASE_URL
  - Default headers with Bearer token
  - Request/response interceptors
  - Error handling middleware
  - Request retry logic
  
- Implement API endpoints:
  - GET /api/v1/admin/auth/verify
  - GET /api/v1/admin/dashboard/metrics
  - GET /api/v1/admin/feature-flags
  - GET /api/v1/admin/users
  - GET /api/v1/admin/merchants
  - GET /api/v1/admin/analytics
```

**Acceptance Criteria:**
- [ ] API client handles 401 errors by redirecting to login
- [ ] Requests include Authorization: Bearer token
- [ ] 5xx errors trigger retry with exponential backoff
- [ ] Request timeout after 30 seconds
- [ ] All endpoints properly typed with TypeScript

---

#### Task 2.2: Authentication Enhancement
```typescript
// src/stores/authStore.ts (enhanced)
- Add token refresh mechanism:
  - Silent refresh on 401 response
  - Refresh token rotation
  - Token expiration countdown
  
- Add user session management:
  - Last activity tracking
  - Idle timeout detection
  - Force logout on expiration
  
- Implement logout tracking:
  - API call to /api/v1/admin/auth/logout
  - Clear localStorage
  - Clear all cookies
```

**Acceptance Criteria:**
- [ ] Token automatically refreshes before expiration
- [ ] Session expires after 30 minutes of inactivity
- [ ] User is redirected to login when session expires
- [ ] Logout API is called on browser close
- [ ] Multiple tabs sync session state

---

#### Task 2.3: Error Handling & Notifications
```typescript
// src/stores/notificationStore.ts (new)
- Create toast notification system with Zustand
- Types: success, error, warning, info
- Auto-dismiss after 5 seconds
- Maximum 3 notifications visible

// src/components/NotificationContainer.tsx (new)
- Display queued notifications
- Dismissible by user
- Styled with Tailwind
```

**Acceptance Criteria:**
- [ ] All API errors show user-friendly messages
- [ ] Success actions show confirmation toast
- [ ] Errors include retry button when applicable
- [ ] Notifications don't block user interaction

---

### Sprint 2: Users & Roles Management (Week 4-5)

#### Task 2.4: Users Page Implementation
```typescript
// src/pages/UsersPage.tsx
Features:
- User list with pagination (20 items/page)
- Columns: Email, Name, Role, Status, Created, Actions
- Sort by email, name, created date
- Filter by role and status
- Search by email/name

// src/stores/usersStore.ts
Actions:
- fetchUsers(page, filters)
- createUser(data) → POST /api/v1/admin/users
- updateUser(id, data) → PUT /api/v1/admin/users/{id}
- deleteUser(id) → DELETE /api/v1/admin/users/{id}
- resetPassword(id) → POST /api/v1/admin/users/{id}/reset-password
- updateRole(id, role) → PUT /api/v1/admin/users/{id}/role
```

**Acceptance Criteria:**
- [ ] User list loads and displays correctly
- [ ] Can sort by any column
- [ ] Can filter by role (super_admin, admin, manager, analyst)
- [ ] Can filter by status (active, inactive, suspended)
- [ ] Pagination works correctly
- [ ] Create user modal opens and submits
- [ ] Edit user modal pre-fills data
- [ ] Delete shows confirmation dialog
- [ ] Success/error notifications appear

---

#### Task 2.5: Roles & Permissions Management
```typescript
// src/pages/RolesPage.tsx
Features:
- Role list with edit/delete
- Permission matrix for each role
- Roles: super_admin, admin, manager, analyst
- Permissions breakdown:
  - super_admin: all permissions
  - admin: all except user management
  - manager: feature flags, analytics, merchants
  - analyst: read-only analytics

// src/stores/rolesStore.ts
Actions:
- fetchRoles() → GET /api/v1/admin/roles
- updateRolePermissions(roleId, permissions) → PUT /api/v1/admin/roles/{roleId}/permissions
- fetchPermissions() → GET /api/v1/admin/permissions
```

**Acceptance Criteria:**
- [ ] All roles display with permission checkboxes
- [ ] Can update role permissions
- [ ] Changes persist to backend
- [ ] Permission changes apply immediately to users
- [ ] Audit log tracks permission changes

---

### Sprint 3: Merchant Management (Week 6-7)

#### Task 2.6: Merchant Onboarding
```typescript
// src/pages/MerchantsPage.tsx → MerchantOnboardingTab
Features:
- Form with fields:
  - Business name (required)
  - Email (required, unique)
  - Phone (required)
  - Address (required)
  - Business type dropdown
  - Tax ID (required)
  - Bank details (account, routing, holder)
  - Document uploads (business license, tax cert)
  - Terms acceptance checkbox

- Validation:
  - Email format and uniqueness
  - Phone format (international)
  - Document file types and size (max 5MB)
  - Tax ID format by country

// src/stores/merchantsStore.ts
Actions:
- createMerchant(data) → POST /api/v1/admin/merchants/onboard
- uploadDocument(merchantId, doc, file) → POST /api/v1/admin/merchants/{id}/documents
- approveMerchant(id, data) → POST /api/v1/admin/merchants/{id}/approve
- rejectMerchant(id, reason) → POST /api/v1/admin/merchants/{id}/reject
```

**Acceptance Criteria:**
- [ ] All form fields validate correctly
- [ ] File uploads handle errors gracefully
- [ ] Can submit onboarding request
- [ ] Confirmation email sent to merchant
- [ ] Admin can approve/reject with notes
- [ ] Merchant receives decision email
- [ ] Status updates in real-time

---

#### Task 2.7: Merchant Offers Management
```typescript
// src/pages/MerchantsPage.tsx → OffersTab
Features:
- Merchant list with active offers count
- Offers sub-page per merchant:
  - List active/draft/expired offers
  - Create new offer form
  - Edit existing offers
  - Preview how customer sees offer
  - Analytics: impressions, redeems, ROI

Form fields:
- Offer title (max 100 chars)
- Description (max 500 chars)
- Discount type: percentage, fixed amount, points
- Discount value
- Valid from / Valid until dates
- Category selector (Food, Gas, Retail, etc)
- Target user filters (age, income, location)
- Max redemptions
- Legal terms

// src/stores/merchantsStore.ts (extend)
Actions:
- fetchMerchantOffers(merchantId) → GET /api/v1/admin/merchants/{id}/offers
- createOffer(merchantId, data) → POST /api/v1/admin/merchants/{id}/offers
- updateOffer(merchantId, offerId, data) → PUT /api/v1/admin/merchants/{id}/offers/{offerId}
- deleteOffer(merchantId, offerId) → DELETE /api/v1/admin/merchants/{id}/offers/{offerId}
- activateOffer(merchantId, offerId) → POST /api/v1/admin/merchants/{id}/offers/{offerId}/activate
```

**Acceptance Criteria:**
- [ ] Can create offer with all fields
- [ ] Offer preview matches customer app rendering
- [ ] Can activate/deactivate offers
- [ ] Expiration dates enforced
- [ ] Analytics show redemption rates
- [ ] Offers sortable by performance
- [ ] Bulk actions (activate, deactivate, delete)

---

#### Task 2.8: Merchant Reconciliation
```typescript
// src/pages/MerchantsPage.tsx → ReconciliationTab
Features:
- Transaction history filtered by merchant and date range
- Columns: Transaction ID, Date, Amount, Type, User, Status
- Aggregate statistics:
  - Total transactions: $X
  - Total users: X
  - Total points awarded: X,XXX
  - Average transaction: $X.XX
  - Redemption rate: X%

- Settlement interface:
  - Calculate amount owed
  - Show breakdown (fees, refunds, adjustments)
  - Generate settlement report (PDF)
  - Mark as settled
  - Show payment history

// src/stores/merchantsStore.ts (extend)
Actions:
- fetchMerchantTransactions(merchantId, filters) → GET /api/v1/admin/merchants/{id}/transactions
- fetchMerchantMetrics(merchantId, dateRange) → GET /api/v1/admin/merchants/{id}/metrics
- calculateSettlement(merchantId, dateRange) → POST /api/v1/admin/merchants/{id}/settlement/calculate
- settlePayment(merchantId, amount) → POST /api/v1/admin/merchants/{id}/settlement/pay
- generateSettlementReport(merchantId, dateRange) → GET /api/v1/admin/merchants/{id}/reports/settlement
```

**Acceptance Criteria:**
- [ ] All transaction data loads correctly
- [ ] Filters work (date range, status, type)
- [ ] Metrics calculate correctly
- [ ] Settlement amount matches manual calculation
- [ ] PDF report generates with full details
- [ ] Payment marked settled and recorded
- [ ] Audit log tracks all reconciliations

---

### Sprint 4: Analytics Dashboard (Week 8-9)

#### Task 2.9: Analytics Dashboard Core
```typescript
// src/pages/AnalyticsPage.tsx
Components:
- Date range selector (today, week, month, year, custom)
- Chart container with Recharts
- Metric cards (KPIs updated in real-time)

Charts:
1. Daily Active Users (line chart)
   - X: Dates
   - Y: User count
   - Tooltip shows date and count
   
2. Transaction Volume (bar chart)
   - X: Days
   - Y: Transaction count
   - Colored by status (pending, completed, failed)
   
3. Points Redemption Rate (area chart)
   - X: Dates
   - Y: Redemption %
   - Stacked: Earned vs Redeemed
   
4. Top Merchants by Volume (horizontal bar)
   - Top 10 merchants
   - Y: Merchant name
   - X: Transaction count
   
5. User Retention (line chart)
   - X: Weeks since signup
   - Y: % still active
   - Cohort analysis

// src/stores/analyticsStore.ts
Actions:
- fetchDailyActiveUsers(dateRange) → GET /api/v1/admin/analytics/active-users
- fetchTransactionVolume(dateRange) → GET /api/v1/admin/analytics/transactions
- fetchRedemptionData(dateRange) → GET /api/v1/admin/analytics/redemptions
- fetchTopMerchants(dateRange, limit) → GET /api/v1/admin/analytics/top-merchants
- fetchRetentionCohort(dateRange) → GET /api/v1/admin/analytics/retention
```

**Acceptance Criteria:**
- [ ] All charts render correctly with mock data
- [ ] Date range selector updates all charts
- [ ] Charts responsive on mobile
- [ ] Hover tooltips show detailed values
- [ ] Export to CSV available for each chart
- [ ] Real-time updates every 60 seconds
- [ ] No loading spinners (data pre-cached)

---

#### Task 2.10: Revenue & Performance Analytics
```typescript
// src/pages/AnalyticsPage.tsx → RevenueTab
Features:
- Revenue breakdown by source:
  - Fees collected from merchants: $X
  - Points redemption costs: $X
  - Subscription revenue: $X
  - Marketing revenue: $X
  
- Monthly revenue trend (line chart)
- Revenue by merchant (pie chart)
- Margin analysis dashboard
- Revenue forecast (ML model)

Charts:
1. Monthly Revenue Trend
2. Revenue by Source (pie)
3. Revenue per User (trend)
4. Churn Impact on Revenue
5. Forecasted Revenue

// src/stores/analyticsStore.ts (extend)
Actions:
- fetchRevenueMetrics(dateRange) → GET /api/v1/admin/analytics/revenue
- fetchRevenueByMerchant(dateRange) → GET /api/v1/admin/analytics/revenue/by-merchant
- fetchRevenueForecast(months) → GET /api/v1/admin/analytics/revenue/forecast
```

**Acceptance Criteria:**
- [ ] Revenue calculations match accounting records
- [ ] Breakdown by source totals to full revenue
- [ ] Forecast accuracy checked monthly
- [ ] Can drill down by merchant
- [ ] Export reports to PDF/Excel

---

### Sprint 5: AI Marketing Tool (Week 10-11)

#### Task 2.11: AI Marketing Campaign Builder
```typescript
// src/pages/MarketingPage.tsx
Features:
- Campaign creation wizard (5 steps):
  
Step 1: Campaign Info
- Campaign name
- Objective: acquisition, engagement, retention, revenue
- Budget: daily spend
- Duration: start/end dates

Step 2: Target Audience
- Segment selector:
  - By user age
  - By income level
  - By location (zip/city)
  - By transaction history
  - By points balance
  - Custom SQL filter
  
Step 3: Offer Details
- Select from existing offers OR create new
- A/B test variants (optional)
- Personalization tokens: {user.first_name}, {user.points}, etc

Step 4: Channel Configuration
- Email (subject, preview, send time)
- Push notification (title, message, image)
- In-app message (message, CTA button)
- SMS (message template)

Step 5: AI Recommendations
- AI suggests best times to send
- AI predicts conversion rate
- AI recommends audience size
- AI suggests alternative offers that might perform better
- Display estimated ROI

// src/stores/marketingStore.ts
Actions:
- fetchCampaigns() → GET /api/v1/admin/marketing/campaigns
- createCampaign(data) → POST /api/v1/admin/marketing/campaigns
- updateCampaign(id, data) → PUT /api/v1/admin/marketing/campaigns/{id}
- launchCampaign(id) → POST /api/v1/admin/marketing/campaigns/{id}/launch
- pauseCampaign(id) → POST /api/v1/admin/marketing/campaigns/{id}/pause
- fetchAIRecommendations(campaignDraft) → POST /api/v1/admin/marketing/ai/recommendations
- getAISendTimeRecommendation(audiences) → POST /api/v1/admin/marketing/ai/send-time
```

**Acceptance Criteria:**
- [ ] All 5 wizard steps functional
- [ ] AI recommendations load in <2 seconds
- [ ] Can preview campaign across channels
- [ ] Campaign schedule created correctly
- [ ] Can launch and pause campaigns
- [ ] Performance metrics tracked
- [ ] A/B test variants tracked separately

---

#### Task 2.12: AI Campaign Analytics & Optimization
```typescript
// src/pages/MarketingPage.tsx → AnalyticsTab
Features:
- Campaign performance dashboard:
  - Sent count
  - Open rate
  - Click rate
  - Conversion rate
  - Spend
  - ROI
  - Estimated revenue

- A/B test results (if applicable)
- Cohort performance analysis
- AI optimization recommendations
- Manual pause/resume during campaign
- Budget reallocation suggestions

Real-time dashboard:
- Live send progress
- Live clicks counter
- Live conversions counter
- Estimated final metrics

Historical reporting:
- Campaign comparison table
- Export to PDF
- Email performance trends

// src/stores/marketingStore.ts (extend)
Actions:
- fetchCampaignMetrics(campaignId) → GET /api/v1/admin/marketing/campaigns/{id}/metrics
- fetchCampaignVariants(campaignId) → GET /api/v1/admin/marketing/campaigns/{id}/variants
- fetchABTestResults(campaignId) → GET /api/v1/admin/marketing/campaigns/{id}/ab-results
- fetchOptimizationSuggestions(campaignId) → POST /api/v1/admin/marketing/campaigns/{id}/optimize
- getRealTimeMetrics(campaignId) → WebSocket /ws/campaigns/{id}/metrics
```

**Acceptance Criteria:**
- [ ] All KPIs display and update in real-time
- [ ] ROI calculation matches accounting
- [ ] A/B test results statistically significant
- [ ] Optimization suggestions improve performance
- [ ] Reports exportable and shareable
- [ ] Historical data searchable by date/name

---

## Phase 3: Polish & Optimization (Week 12)

### Task 3.1: Performance Optimization
- Code splitting by route
- Image optimization
- Bundle analysis and reduction
- Implement service worker for offline capability
- CSS minification and critical path optimization

### Task 3.2: Security Hardening
- CSRF token implementation
- XSS prevention
- Input sanitization
- Rate limiting on frontend
- Secure headers configuration

### Task 3.3: Testing Infrastructure
- Unit tests for stores (Vitest)
- Component tests (React Testing Library)
- E2E tests (Cypress)
- Accessibility tests (axe-core)
- Visual regression tests

### Task 3.4: Documentation & Handoff
- API documentation updated
- Component storybook
- Developer guide
- Deployment procedures
- Monitoring setup

---

## Parallel Work Items (Can Start Anytime)

### Design System Enhancement
- Create component library
- Expand Tailwind theme
- Dark mode for admin portal
- Accessibility audit (WCAG 2.1 AA)
- Icon system refinement

### Backend Requirements
- Ensure all API endpoints ready
- Database schema optimized
- Caching strategy implemented
- Audit logging configured
- Error responses consistent

### Infrastructure
- CI/CD pipeline setup (GitHub Actions)
- Staging environment ready
- Monitoring & alerting configured
- Log aggregation (ELK stack)
- Error tracking (Sentry)

---

## Estimated Timeline

| Phase | Sprint | Duration | Status |
|-------|--------|----------|--------|
| Phase 1 | Foundation | Week 1 | ✅ Complete |
| Phase 2 | Sprint 1 | Week 2-3 | 🚀 Starting |
| Phase 2 | Sprint 2 | Week 4-5 | Queued |
| Phase 2 | Sprint 3 | Week 6-7 | Queued |
| Phase 2 | Sprint 4 | Week 8-9 | Queued |
| Phase 2 | Sprint 5 | Week 10-11 | Queued |
| Phase 3 | Polish | Week 12 | Queued |

---

## Success Metrics

- **Performance**: Page load <2 seconds, Lighthouse score >90
- **Reliability**: 99.9% uptime, <0.1% error rate
- **Usability**: Mobile responsive, <2 clicks to any feature
- **Security**: 0 security vulnerabilities, OWASP Top 10 compliant
- **Adoption**: 80% admin users trained, <1 support ticket per user

---

## Getting Started Right Now

### First Command to Run:
```bash
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm install
npm run dev
```

### Then:
1. Open http://localhost:3000 in browser
2. Login with: admin@swipesavvy.com / demo123
3. Explore Dashboard and Feature Flags pages
4. Begin Task 2.1: API Service Layer

### Files to Start with:
- `/src/services/api.ts` (create new)
- `src/stores/authStore.ts` (enhance with API integration)
- `src/stores/featureFlagStore.ts` (connect real endpoints)

---

## Questions During Development?

Check:
1. SETUP_GUIDE.md - Installation & environment
2. ARCHITECTURE.md - System design
3. API documentation from backend team
4. Zustand docs: https://github.com/pmndrs/zustand
5. React Router docs: https://reactrouter.com/
