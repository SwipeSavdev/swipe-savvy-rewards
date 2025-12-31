# 🏗️ PART 2: UI/UX ARCHITECTURE & DEPENDENCY MAP

**Date**: December 26, 2025  
**Status**: PART 2 - Architecture Mapping ✅  
**Duration**: ~3 hours to complete, deliver findings  

---

## 📌 WHAT THIS PART COVERS

This document maps the complete UI/UX architecture across all 5 repos:
- Navigation flows (mobile + web)
- Shared design system & tokens
- Backend-to-UI state dependencies
- Critical data sync points
- AI integration impact zones
- Cross-repo dependencies & ownership

---

## 🗺️ SECTION A: NAVIGATION & SCREEN ARCHITECTURE

### 📱 Mobile App (React Native)

**Primary Navigation Stack**:
```
MainStack (Root Navigator)
├─ AuthStack (Pre-auth flows)
│  ├─ LoginScreen
│  ├─ SignupScreen
│  ├─ ForgotPasswordScreen
│  ├─ KYC/AMLScreen (account linking)
│  └─ VerificationScreen
│
├─ AppStack (Post-auth, main app)
│  ├─ CampaignTabNav
│  │  ├─ HomeScreen (campaigns list, rewards balance)
│  │  ├─ CampaignDetailScreen (view offer, take action)
│  │  ├─ TransactionHistoryScreen (view events, earnings)
│  │  └─ RewardsScreen (balance, donation, history)
│  │
│  ├─ WalletTabNav
│  │  ├─ WalletScreen (card list, manage, default)
│  │  ├─ CardDetailScreen (transaction history, state)
│  │  ├─ AddCardScreen (onboarding, validation)
│  │  └─ CardLockScreen (lock/unlock, confirm)
│  │
│  ├─ AccountTabNav
│  │  ├─ AccountScreen (profile, settings, privacy)
│  │  ├─ LinkAccountScreen (OAuth/deep link)
│  │  ├─ MFASetupScreen (challenge + verification)
│  │  └─ SettingsScreen (notifications, preferences)
│  │
│  ├─ SupportTabNav
│  │  ├─ SupportChatScreen (AI agent + escalation)
│  │  ├─ FAQScreen (searchable, categorized)
│  │  ├─ TicketDetailScreen (view, update status)
│  │  └─ FeedbackScreen (report issue, feature request)
│  │
│  └─ GamificationScreen (challenges, streaks, badges, tiers)
│
└─ OfflineStack (Graceful degradation when no connectivity)
   ├─ OfflineHomeScreen (cached data)
   ├─ OfflineWalletScreen (card list, no refresh)
   └─ SyncIndicator (when reconnected)
```

**Modal Stacks (Overlays)**:
```
├─ AuthModal (MFA challenges during app use)
├─ ErrorModal (critical errors, retry options)
├─ ConfirmationModal (destructive actions: unlink, remove card)
└─ LoadingModal (async operations, cancellable)
```

**Key Screens by Feature Zone**:

| Screen | Feature | Key UI Elements | Backend Dependency | Accessibility Critical |
|--------|---------|-----------------|-------------------|----------------------|
| HomeScreen | Campaigns | List, CTAs, balance display | GET /campaigns, GET /rewards/balance | Focus order, labels |
| CampaignDetailScreen | Offer view | Image, description, terms, CTA | GET /campaigns/{id}, POST /events/view | Form labels, error handling |
| RewardsScreen | Balance + donation | Balance card, donate CTA, history | GET /rewards/balance, POST /donate | Numeric clarity, focus nav |
| WalletScreen | Multi-card | Card list, actions (default, lock, remove) | GET /cards, PATCH /cards/{id} | Card number masking, roles |
| AddCardScreen | Onboarding | Form, validation, confirmation | POST /cards, GET /card-validation | Input labels, error clarity |
| LinkAccountScreen | Account linking | OAuth button, redirect, status | GET /auth/oauth, GET /auth/status | MFA clarity, focus handling |
| SupportChatScreen | Support + AI | Chat UI, escalation button, typing indicator | POST /support/message, GET /tickets/{id} | Chat ARIA, escalation clarity |

---

### 💳 Mobile Wallet (React Native)

**Primary Navigation Stack**:
```
WalletAppStack (Root)
├─ CardsTab
│  ├─ CardsListScreen (main view, card list, actions)
│  ├─ CardDetailScreen (transactions, state, actions)
│  ├─ AddCardScreen (onboarding flow)
│  └─ ManageCardModal (lock/unlock, replace, reissue)
│
├─ TransactionsTab
│  ├─ TransactionListScreen (filtered, sortable)
│  ├─ TransactionDetailScreen (full details, receipt)
│  └─ ReceiptScreen (shareable, printable, redacted)
│
├─ RewardsTab
│  ├─ RewardsBalanceScreen (total, breakdown by type)
│  ├─ RewardsHistoryScreen (earned, spent, reversed)
│  ├─ DonationFlowScreen (select charity, confirm)
│  └─ DonationReceiptScreen (confirmation, sharing)
│
├─ SettingsTab
│  ├─ PreferencesScreen (notifications, display)
│  ├─ LimitsScreen (card limits, transaction caps)
│  └─ HelpScreen (FAQ, contact support)
│
└─ AuthStack (if separate wallet app)
   ├─ LoginScreen
   ├─ BiometricAuthScreen
   └─ PINSetupScreen
```

**Critical State Displays**:
```
Card States:
├─ Active (normal operation)
├─ Locked (user-initiated lock)
├─ Frozen (system/fraud hold)
├─ Replaced (reissue in progress)
└─ Inactive (removed/closed)

Transaction States:
├─ Pending (authorization stage)
├─ Authorized (funds held)
├─ Settled (complete)
├─ Reversed (user initiated)
├─ Refunded (merchant initiated)
└─ Failed (declined)

Rewards States:
├─ Earned (available to use)
├─ Pending (in transaction queue)
├─ Used (redeemed)
├─ Expired (time-based limit)
├─ Capped (merchant cap reached)
└─ Reversed (chargeback/refund impact)
```

---

### 🖥️ Admin Portal (Vite React)

**Primary Navigation Structure**:
```
AdminLayout (Main shell)
├─ Sidebar Navigation
│  ├─ Dashboard (overview, KPIs)
│  ├─ Merchants (CRUD, onboarding status)
│  ├─ Campaigns (create, manage, edit)
│  ├─ Analytics (reports, drilldowns, exports)
│  ├─ A/B Tests (active tests, results, analysis)
│  ├─ Feature Flags (toggle, versions, rollout)
│  ├─ Users (search, permissions, audit)
│  ├─ Support (escalations, tickets, AI agent config)
│  ├─ Audit Logs (searchable, filterable)
│  └─ Settings (org, team, integrations)
│
├─ Content Areas
│  ├─ Dashboard
│  │  ├─ KPI Cards (users, campaigns, revenue)
│  │  ├─ Recent Activity Feed
│  │  ├─ Analytics Sparklines
│  │  └─ Alert Box (pending actions)
│  │
│  ├─ Merchants
│  │  ├─ Table (filterable, searchable, sortable)
│  │  ├─ Bulk Actions (approve, suspend, delete)
│  │  ├─ Detail Modal (info, status, history)
│  │  └─ Onboarding Modal (KYC status, steps)
│  │
│  ├─ Campaigns
│  │  ├─ List (filter by status, merchant, date)
│  │  ├─ Create Wizard (multi-step form)
│  │  ├─ Detail View (analytics, A/B status, performance)
│  │  ├─ Edit Modal (update fields)
│  │  └─ Clone/Archive Actions
│  │
│  ├─ Analytics
│  │  ├─ Dashboard Widgets (charts, trends)
│  │  ├─ Filters (date range, segment, drill-down)
│  │  ├─ Export Tools (CSV, PDF, scheduled)
│  │  └─ Comparison View (period-over-period)
│  │
│  ├─ A/B Tests
│  │  ├─ Active Tests List (status, % traffic)
│  │  ├─ Results Dashboard (significance, winner)
│  │  ├─ Historical Results (past tests)
│  │  └─ Recommendation Engine (suggested actions)
│  │
│  ├─ Feature Flags
│  │  ├─ Flag Management (list, enable/disable)
│  │  ├─ Flag Versions (rollout %, targeting rules)
│  │  ├─ Analytics (flag adoption, error correlation)
│  │  └─ Audit Trail (changes, who, when)
│  │
│  ├─ Users & Permissions
│  │  ├─ Team Members (list, roles, permissions)
│  │  ├─ Role Manager (custom roles, permissions matrix)
│  │  ├─ Invite/Remove (email, activation)
│  │  └─ Audit Access Log
│  │
│  └─ Support Escalations
│     ├─ Ticket Queue (unassigned, assigned, closed)
│     ├─ Ticket Detail (history, AI context, resolution)
│     ├─ AI Agent Config (KB, tools, safety settings)
│     └─ Performance Metrics (resolution time, CSAT)
│
└─ Top Navigation
   ├─ Logo / Branding
   ├─ Search (global)
   ├─ Notifications
   └─ User Menu (profile, settings, logout)
```

**Admin Role Matrices**:
```
Role: Support Agent
├─ Can view: Tickets, user data, escalation history
├─ Can do: Respond to tickets, escalate to supervisor
└─ Cannot: Modify campaigns, user permissions, feature flags

Role: Supervisor
├─ Can view: All support data, merchant performance, analytics
├─ Can do: Handle escalations, approve merchant changes
└─ Cannot: Modify feature flags, system settings

Role: Merchant Manager
├─ Can view: Their merchants, campaign performance
├─ Can do: Create/edit campaigns, upload assets
└─ Cannot: View other merchants, manage users, modify flags

Role: Compliance Officer
├─ Can view: Audit logs, user data, merchant KYC status
├─ Can do: Approve KYC, review fraud cases
└─ Cannot: Modify campaigns, manage team, adjust limits

Role: Finance Operations
├─ Can view: Revenue reports, reconciliation data, exports
├─ Can do: Generate reports, export data, reconciliation
└─ Cannot: Modify campaigns, user accounts, settings
```

---

### 🌐 Customer Website (Web)

**Page Structure**:
```
/ (Root)
├─ /index (landing, marketing)
├─ /features (feature showcase, benefits)
├─ /pricing (pricing tiers, comparison)
├─ /about (company, mission, team)
├─ /contact (contact form, support)
│
├─ /auth
│  ├─ /login (email/password)
│  ├─ /signup (registration flow)
│  ├─ /forgot-password (reset flow)
│  └─ /verify-email (email verification)
│
├─ /app (dashboard if user logged in)
│  ├─ /dashboard (account summary)
│  ├─ /onboarding (guided setup)
│  ├─ /account (profile, settings)
│  └─ /support (FAQ, contact)
│
├─ /link-account (OAuth handoff, deep link to mobile)
├─ /status (integration status, health)
└─ /blog (articles, guides, announcements)
```

---

### 🤖 AI Agents

**Integration Points in UI**:
```
Mobile App:
├─ SupportChatScreen
│  ├─ Uses: AI agent for initial response
│  ├─ If unable: Escalate to human (clear UX)
│  ├─ Safe refusal: "I don't have access to that. Please contact support."
│  └─ Session context: Previous messages, user data (masked)
│
├─ GamificationScreen
│  ├─ Challenge descriptions: AI-generated (with review)
│  ├─ Streak messaging: Personalized (no manipulation)
│  └─ Tier unlock: Clear rules, no surprises
│
└─ HomeScreen
   └─ Campaign descriptions: AI-enhanced (if feature flagged)

Admin Portal:
├─ SupportEscalations
│  ├─ AI-suggested tickets to prioritize
│  ├─ AI-generated response templates (agent reviews)
│  ├─ Prompt injection safeguards: No user inputs in system prompt
│  └─ Audit: All AI actions logged
│
├─ Analytics
│  ├─ AI insights generation (performance anomalies)
│  ├─ Recommendation engine (A/B test winners)
│  └─ Forecasting (revenue trends)
│
└─ FeatureFlagManagement
   ├─ AI impact prediction: No custom user prompts
   ├─ Rollout recommendations
   └─ Error correlation analysis

Web:
└─ ChatBot (footer, contact page)
   ├─ FAQ-backed responses
   ├─ Safe escalation to email
   └─ No complex reasoning in public prompt
```

---

## 🎨 SECTION B: DESIGN SYSTEM & TOKENS

### Shared Design Tokens (Across All Repos)

**Color Palette** (Consistent identity):
```
Primary:
├─ primary-900: #0B3E5C (darkest, text, strong CTA)
├─ primary-700: #0F5A8A (buttons, links, active state)
├─ primary-500: #1E7CB7 (default CTA, accents)
├─ primary-300: #5BA3D4 (hover, light backgrounds)
└─ primary-100: #D4E6F4 (lightest, disabled)

Semantic:
├─ success-600: #28A745 (confirmation, earned rewards)
├─ warning-600: #FFC107 (caps approaching, pending state)
├─ error-600: #DC3545 (validation fail, account frozen)
├─ info-600: #17A2B8 (informational, tooltips)
└─ neutral-{50-900}: Grays for text, borders, backgrounds

Gradients (Mobile):
├─ Primary gradient: primary-900 → primary-500 (CTAs)
├─ Success gradient: success-600 → success-400 (earned)
└─ Error gradient: error-600 → error-400 (warnings)
```

**Typography**:
```
Mobile (React Native):
├─ Display: Font: Poppins Bold, Size: 28px, LineHeight: 1.2
├─ Headline: Font: Poppins SemiBold, Size: 20px, LineHeight: 1.3
├─ Body: Font: Inter Regular, Size: 16px, LineHeight: 1.5
├─ Caption: Font: Inter Regular, Size: 12px, LineHeight: 1.4
└─ Label: Font: Inter Medium, Size: 14px, LineHeight: 1.5

Web/Admin:
├─ H1: Font: Poppins Bold, Size: 32px, LineHeight: 1.2
├─ H2: Font: Poppins SemiBold, Size: 24px, LineHeight: 1.3
├─ Body: Font: Inter Regular, Size: 16px, LineHeight: 1.6
├─ Small: Font: Inter Regular, Size: 14px, LineHeight: 1.5
└─ Caption: Font: Inter Regular, Size: 12px, LineHeight: 1.4

Accessibility:
├─ Min contrast: WCAG AA (4.5:1 for text)
├─ Dynamic type: Support +/- 2 sizes on mobile
└─ Font family fallback: -apple-system, BlinkMacSystemFont, Segoe UI
```

**Spacing Scale** (Used consistently):
```
0px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

Mobile Padding Examples:
├─ Screen edges: 16px
├─ Component spacing: 8px, 12px, 16px
├─ List item height: 56px (touch-friendly)
└─ Card padding: 16px

Web/Admin Padding Examples:
├─ Container padding: 24px
├─ Form field gaps: 16px
├─ Table cell padding: 12px
└─ Modal padding: 32px
```

**Component Library Status**:
```
Shared Components (version-controlled):
├─ Button (primary, secondary, tertiary, ghost, disabled states)
├─ Input (text, email, password, number, date, with validation)
├─ Select / Dropdown (searchable, multi-select)
├─ Card (elevated, outlined, flat variants)
├─ Modal / Dialog (alert, form, confirmation)
├─ Toast / Snackbar (success, error, info, warning)
├─ Badge (label, counter, status indicator)
├─ Chip (dismissible, selectable, input)
├─ Loader / Skeleton (multiple sizes and shapes)
├─ Tabs (scrollable, indicator options)
├─ Accordion (collapsible sections)
├─ Alert / Message (info, warning, error, success)
├─ Progress Bar / Circular Progress
├─ Divider / Separator
├─ Icons (lucide-react or custom set, 24px/32px)
└─ Accessibility: All include ARIA labels, focus indicators, keyboard nav

Token Implementation:
├─ Mobile: React Native StyleSheet (hardcoded or token provider)
├─ Web: CSS variables, Tailwind config, or styled-components
├─ Admin: Vite + CSS modules with token imports
└─ Sync: Document token changes, communicate to teams
```

---

## 🔄 SECTION C: BACKEND-TO-UI STATE DEPENDENCIES

### Critical Data Flows (Request → Response → UI Update)

**Campaign View + Earn Rewards** (HomeScreen → CampaignDetailScreen):
```
Flow:
  User: Taps campaign card on HomeScreen
  ↓
  API Call: GET /campaigns/{campaignId}
  Response:
    {
      id, name, description, terms,
      offer_type, offer_value,
      rewards_rules: { base_amount, max_cap, exclusions },
      eligible_segments: [], 
      user_eligible: boolean,
      campaign_status: "active|paused|ended",
      updated_at
    }
  ↓
  UI Updates:
    ├─ Display campaign details (title, description, image)
    ├─ Show reward amount & terms
    ├─ Check eligibility: if not eligible, show reason (gray out CTA)
    ├─ Set CTA state (enabled/disabled) based on user_eligible
    ├─ Show updated_at timestamp (optional, for freshness)
    └─ Cache with 5-minute TTL

Error Handling:
  ├─ 404: Campaign not found → "Campaign no longer available"
  ├─ 403: User not eligible → "You're not eligible for this offer"
  ├─ 500: Server error → Retry button + contact support link
  └─ Network timeout: Offline indicator + retry

Accessibility:
  ├─ Campaign title: H2 with aria-label
  ├─ Reward amount: Semantic text, high contrast
  ├─ CTA button: aria-disabled if ineligible
  └─ Error message: role="alert" for screen reader announcement
```

**Card Management** (WalletScreen → ManageCardModal):
```
Flow:
  User: Taps "Lock" on card
  ↓
  Confirmation Modal: "Lock this card? You can unlock it anytime."
  User: Confirms
  ↓
  API Call: PATCH /cards/{cardId} { action: "lock" }
  Response:
    {
      id, last_four, status: "locked",
      locked_at, locked_by_user: true,
      transactions_pending: 0,
      can_unlock: true
    }
  ↓
  UI Updates (Optimistic + Server-Confirmed):
    ├─ Immediately (optimistic): Card shows "Locked" badge, CTA changes to "Unlock"
    ├─ From server: Confirm lock timestamp, disable tap actions
    ├─ List view: Card grayed out, locked icon visible
    ├─ Detail view: Show "Locked at [time]" message
    └─ Toast: "Card locked successfully"

Error Handling:
  ├─ 400: Invalid action → "Cannot lock card with pending transactions"
  ├─ 409: Conflict (already locked) → Refresh UI
  ├─ 500: Server error → Revert optimistic update, show error
  └─ Network timeout: Retry with exponential backoff

Accessibility:
  ├─ Card status: Clearly announced (not just visual badge)
  ├─ Lock action: Confirmation required before state change
  ├─ Toast: aria-live="polite" for announcement
  └─ Error recovery: Clear next steps
```

**Rewards Balance & Donation Flow** (RewardsScreen):
```
State Diagram:
  ┌─ Initial Load
  │  GET /rewards/balance → { total, by_type, caps, donations }
  │  UI: Show skeleton loader
  │
  ├─ Balance Received
  │  UI: Render balance cards, donation button enabled
  │  Cache: 2-minute TTL
  │
  ├─ User Initiates Donation
  │  POST /donate { charity_id, amount }
  │  UI: Show confirmation modal
  │
  ├─ Donation In-Flight
  │  Optimistic UI: Deduct from balance, show success toast
  │  Background: Await server confirmation
  │
  ├─ Donation Success
  │  Response: { donation_id, receipt_url, charity_name, amount }
  │  UI: Show receipt modal, share CTA, back button
  │  Cache: Clear balance, refresh on return
  │
  └─ Donation Failed
     Response: 400 (invalid amount), 409 (cap exceeded), 500 (error)
     UI: Revert optimistic update, show error with recovery steps

Edge Cases:
  ├─ Cap exceeded: "You can only donate $50 more this month"
  ├─ Insufficient balance: "You need $5 more to donate"
  ├─ Charity not found: "This charity is no longer available"
  └─ Network error during optimistic: Clear optimistic state, show offline msg

Accessibility:
  ├─ Balance: Large, high-contrast display
  ├─ Donation CTA: Clear call-to-action with aria-label
  ├─ Confirmation: Modal with focus trap, keyboard nav
  └─ Receipt: Printable, downloadable (accessible PDF)
```

**Account Linking** (LinkAccountScreen):
```
OAuth Flow:
  1. User taps "Link Account"
  2. App renders OAuth login button
  3. User logs in (redirected to auth provider)
  4. Deep link back to app: swipesavvy://auth?code=XXX&state=YYY
  5. App exchanges code for token: POST /auth/link { code, state }
  6. Response: { status: "pending"|"mfa_required"|"success", mfa_challenge?: {...} }

If MFA Required:
  ├─ Show MFA challenge screen (SMS/email/app code)
  ├─ User enters code
  ├─ POST /auth/link/mfa { challenge_id, response }
  ├─ Response: { status: "success" | "failed" }
  ├─ On success: Navigate to AccountScreen, show success toast
  └─ On fail: Retry prompt or start over

If Direct Success:
  ├─ Navigate to AccountScreen, show success toast
  ├─ Update account status in UI

Error Handling:
  ├─ Invalid state: "Session mismatch. Please try again."
  ├─ Auth provider error: "Login failed. Please check your credentials."
  ├─ MFA timeout: "Code expired. Request a new one."
  ├─ Network error: Offline message + retry
  └─ Duplicate link: "Account already linked to another user"

Accessibility:
  ├─ OAuth button: Clear label, aria-label with provider name
  ├─ MFA screen: Input field with aria-label, timer countdown visible
  ├─ Error messages: role="alert" for announcements
  └─ Status updates: Toast with aria-live for feedback
```

**Support Escalation** (SupportChatScreen):
```
Chat Message Flow:
  1. User types message, taps send
  2. Optimistic: Show message in bubble (gray, no checkmark)
  3. POST /support/message { content, ticket_id?, conversation_id }
  4. Response: { message_id, conversation_id, timestamp, assistant_response?: {...} }
  5. Server confirms: Message bubble shows checkmark
  6. If assistant_response: Show AI response, waiting for user input
  7. Escalation option visible on every message

Escalation Trigger:
  User: Taps "Talk to Agent"
  ↓
  POST /support/escalate { conversation_id }
  Response: { ticket_id, queue_position, estimated_wait }
  ↓
  UI: Show "Escalated! Agent will respond soon (#3 in queue)"
  ↓
  Polling: GET /support/ticket/{ticket_id} every 5 sec
  ↓
  When agent joins: Show agent avatar + name, disable escalation button

Error Handling:
  ├─ Failed to send: Show "Failed to send. Tap to retry."
  ├─ Escalation unavailable: "No agents available. Estimated wait: 30 min"
  ├─ Conversation expired: "Chat session expired. Start a new one."
  └─ Network: Queue messages, retry on reconnect

Accessibility:
  ├─ Chat bubbles: semantic structure (dl/dt/dd or article)
  ├─ Messages: Announced via aria-live for screen readers
  ├─ Timestamp: aria-label for time (not just visual)
  ├─ Escalation button: Clearly labeled, high contrast
  └─ Typing indicator: Accessible text "Assistant is typing..."
```

---

## 📊 SECTION D: CROSS-REPO SYNC & OWNERSHIP

### Critical Sync Points

| Data | Producer | Consumers | Sync Method | Tolerance |
|------|----------|-----------|-------------|-----------|
| Rewards Balance | Backend | Mobile-app, Mobile-wallet, Admin-portal | Polling (2 min) + Webhook | 2 minutes stale OK |
| Card State | Backend | Mobile-wallet, Admin-portal | Polling (30 sec) + Webhook | Immediate if active action |
| Campaign Status | Backend | Mobile-app, Admin-portal | Cache (5 min) + Manual refresh | 5 minutes OK |
| Feature Flags | Backend | All 3 apps | Polling (1 min) + Cache (5 min) | 5 minutes max |
| User KYC Status | Backend | Mobile-app, Admin-portal | Polling (30 sec on details screen) | Immediate if pending |
| A/B Test Assignment | Backend | Mobile-app | At login + per-session | Sticky assignment |
| Audit Logs | Backend | Admin-portal | Real-time (WebSocket) | Immediate |

### Repo Ownership & UI Responsibilities

```
📱 swipesavvy-mobile-app
├─ Owns: Campaign UI, rewards display, user flows
├─ Integrates: Mobile-wallet (deep link for card actions)
├─ Depends on: Backend APIs, feature flags
├─ UI Lead: [Team A]
└─ Communication: Slack #mobile-ui-alerts

💳 swipesavvy-mobile-wallet
├─ Owns: Card management, transactions, card-specific rewards
├─ Integrates: Mobile-app (shared auth, user context)
├─ Depends on: Backend card/transaction APIs
├─ UI Lead: [Team B]
└─ Communication: Slack #wallet-ui-alerts

🖥️  swipesavvy-admin-portal
├─ Owns: Merchant/campaign admin, analytics, support tools
├─ Integrates: AI-agents (escalation, recommendations)
├─ Depends on: Backend admin APIs, real-time updates
├─ UI Lead: [Team C]
└─ Communication: Slack #admin-ui-alerts

🌐 swipesavvy-customer-website
├─ Owns: Marketing, onboarding, account linking
├─ Integrates: Mobile-app (deep link handoff)
├─ Depends on: Backend auth/onboarding APIs
├─ UI Lead: [Team D]
└─ Communication: Slack #web-ui-alerts

🤖 swipesavvy-ai-agents
├─ Owns: Prompt engineering, KB management, safety
├─ Integrates: Mobile-app (chat), Admin-portal (escalation suggestions)
├─ Depends on: Backend message APIs, tooling
├─ UI Lead: [Team E - Prompt Engineers]
└─ Communication: Slack #ai-safety-alerts
```

---

## 🔌 SECTION E: UI DEPENDENCY MATRIX

**What Each Repo Needs from Others**:

```
Mobile App Needs From:
├─ Backend: Campaign data, user balance, feature flags, KYC status
├─ Mobile-wallet: Deep link handling for card actions
├─ Customer-website: OAuth callback (auth token)
└─ AI-agents: Chat responses, escalation handling

Mobile-wallet Needs From:
├─ Backend: Card data, transactions, rewards balance
├─ Mobile-app: Shared auth context, user identity
└─ AI-agents: Help/FAQ responses (if integrated)

Admin Portal Needs From:
├─ Backend: All admin APIs (merchants, campaigns, analytics, tickets)
├─ AI-agents: Recommendation engine, escalation AI
├─ Feature flags: For admin-only features (rollout control)
└─ Other repos: None (one-way dependency)

Customer Website Needs From:
├─ Backend: Auth, onboarding, integration status
├─ Mobile-app: Deep link targets (link account, view campaign)
└─ Feature flags: For homepage testing, feature announcements

AI-agents Needs From:
├─ Backend: User data context, KB, conversation history
├─ Admin-portal: Escalation interface, prompt feedback
└─ Mobile-app: Chat UI rendering
```

---

## 🎯 SECTION F: CRITICAL UI SYNC POINTS (REAL-TIME)

```
Rewards Balance Sync:
  Trigger: User earns reward, donation made, refund applied
  Path: Backend → Admin portal (real-time)
         Backend → Mobile-app (poll 2 min, webhook if available)
         Backend → Mobile-wallet (poll 2 min, webhook if available)
  UI Impact: All show consistent balance within 2 minutes
  Test: Create earning event, verify all UIs update

Card Status Sync:
  Trigger: Card locked/unlocked, replaced, reissued
  Path: Backend → Mobile-wallet (immediate)
         Backend → Admin portal (real-time)
  UI Impact: Card badge changes, CTAs enable/disable
  Test: Lock card in wallet, verify UI reflects immediately

Campaign Status Sync:
  Trigger: Campaign paused, ended, rescheduled
  Path: Backend → Mobile-app (on next refresh or webhook)
         Backend → Admin portal (real-time)
  UI Impact: CTA becomes disabled, message shown
  Test: Pause campaign in admin, check mobile-app shows disabled

Feature Flag Sync:
  Trigger: Flag enabled/disabled, rollout percentage changed
  Path: Backend → All apps (poll every 1 min, max cache 5 min)
  UI Impact: UI features show/hide, experimental flows active/inactive
  Test: Toggle flag in admin, verify all apps switch within 5 min
```

---

## 📋 NEXT STEPS

**This PART 2 defines**:
- ✅ Navigation maps for all 5 repos
- ✅ Design system token alignment
- ✅ Backend-to-UI state flows (with error handling)
- ✅ Cross-repo dependencies & sync points
- ✅ Ownership & communication channels

**Ready for PART 3**:
- Repo health assessments (install, build, test status per repo)
- Identify any missing tooling or broken builds
- Establish baseline quality metrics

---

**PART 2 Status**: ✅ ARCHITECTURE MAPPED

Say **"Ready for PART 3"** to proceed with Repo Health Assessments.

