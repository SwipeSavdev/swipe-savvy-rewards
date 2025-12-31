# SwipeSavvy Mobile App - Complete Button & Workflow Audit Report

## Executive Summary
**Status**: 🔴 CRITICAL ISSUES FOUND
- **Empty Handlers**: 11 buttons with `onPress={() => {}}`
- **Navigation Errors**: 5+ wrong route names (navigate to non-existent routes)
- **Missing Implementation**: 8+ workflows not connected to backend
- **Database Persistence**: ZERO database calls for data storage
- **Test Coverage**: No data actually persists to database

---

## Audit Results by Screen

### 1. HomeScreen ❌ (CRITICAL)
**File**: `/src/features/home/screens/HomeScreen.tsx`

#### Buttons Found:
1. **"Send" button** (Balance Card)
   - Current: `onPress={() => (navigation as any).navigate('Pay')}`
   - Issue: ❌ Route 'Pay' doesn't exist in MainStack
   - Expected: Should navigate to TransfersScreen (Pay flow)
   - Fix: Change to `navigate('Transfers')` OR create proper route

2. **"Donate" button** (Points Card)
   - Current: `onPress={() => (navigation as any).navigate('Rewards')}`
   - Issue: ❌ Route 'Rewards' doesn't exist in MainStack
   - Expected: Should navigate to RewardsScreen
   - Fix: Change to `navigate('AIConcierge')`

3. **"Send" quick action**
   - Current: `onPress={() => (navigation as any).navigate('Pay')}`
   - Issue: ❌ Same as #1

4. **"Request" quick action**
   - Current: `onPress={() => (navigation as any).navigate('Pay')}`
   - Issue: ❌ Same as #1

5. **"Scan/Pay" quick action**
   - Current: `onPress={() => (navigation as any).navigate('Wallet')}`
   - Issue: ❌ Route 'Wallet' doesn't exist, should be 'Accounts'
   - Fix: Change to `navigate('Accounts')`

6. **"Rewards" quick action**
   - Current: `onPress={() => (navigation as any).navigate('Rewards')}`
   - Issue: ❌ Same as #2

7. **"View all" button** (Recent Activity)
   - Current: `onPress={() => (navigation as any).navigate('Wallet')}`
   - Issue: ❌ Same as #5, should be 'Accounts'
   - Fix: Change to `navigate('Accounts')`

8. **FAB "Savvy" button**
   - Current: `onPress={() => {}}`
   - Issue: ❌ COMPLETELY EMPTY - No handler
   - Expected: Should open AI Concierge chat
   - Fix: Implement: `onPress={() => navigate('AIConcierge')}`

**Database/API Calls**: ❌ NONE
- No API calls to fetch transactions
- Using MOCK_TRANSACTIONS hardcoded data
- Recent activity doesn't sync with backend

---

### 2. AccountsScreen ❌ (HIGH)
**File**: `/src/features/accounts/screens/AccountsScreen.tsx`

#### Buttons Found:
1. **"Manage" button** (Your Cards)
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should open card management UI or form
   - Fix: Implement navigation or modal

2. **"Add a card" button**
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should open card addition form
   - Fix: Implement: Navigate to card form or open modal

3. **"Move" button** (Accounts section)
   - Current: `onPress={() => (navigation as any).navigate('Pay')}`
   - Issue: ❌ Route 'Pay' doesn't exist
   - Expected: Should be for moving money between accounts
   - Fix: Change to `navigate('Transfers')`

4. **"Link" button** (Linked Accounts)
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should open bank linking flow (likely Plaid integration)
   - Fix: Implement: Navigate to bank linking or open modal

**Database/API Calls**: ❌ NONE
- No API to fetch linked banks (using LINKED_BANKS mock)
- Card management not connected to backend
- Account balance hardcoded ($4,250.25, $4,500.25)
- No persistence for new cards or linked banks

---

### 3. TransfersScreen ❌ (CRITICAL)
**File**: `/src/features/transfers/screens/TransfersScreen.tsx`

#### Buttons Found:
1. **"Contacts" button**
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should open contacts list picker
   - Fix: Implement: Open native contacts or app contacts UI

2. **Recipient chips** (Recent recipients)
   - Current: `<TouchableOpacity onPress={...}>`
   - Issue: ⚠️ Handler unclear from grep - needs verification
   - Expected: Should select recipient and populate form
   - Fix: Set selected recipient in state

3. **Funding source selector**
   - Current: `<TouchableOpacity style={styles.select}>`
   - Issue: ⚠️ No onPress handler visible
   - Expected: Should open dropdown or modal to select account
   - Fix: Add `onPress={() => {}}` handler with modal/dropdown

4. **"Review & confirm" button** (Submit)
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER - THE CRITICAL SUBMIT BUTTON
   - Expected: Should validate, submit transfer to backend, show confirmation
   - Fix: Implement full transfer submission workflow with API call

5. **"Add recipient" button** (in Recipient section, implied)
   - Current: Not visible in excerpts
   - Issue: ❌ Likely empty or missing
   - Expected: Should navigate to add recipient form
   - Fix: Implement

**Database/API Calls**: ❌ NONE - CRITICAL
- No transfer submission to backend
- No API call on "Review & confirm"
- All data local state only
- Transfers don't save anywhere
- Mock MOCK_RECIPIENTS data only
- Form inputs never leave the app

**Workflow Issues**:
- Transfer form never submits to backend
- No confirmation screen after submission
- No success/error handling
- No loading states during API call

---

### 4. RewardsScreen ❌ (MEDIUM)
**File**: `/src/features/ai-concierge/screens/RewardsScreen.tsx`

#### Buttons Found:
1. **"Donate" button**
   - Current: `onPress={() => (useNavigation() as any).navigate('ChatScreen')}`
   - Issue: ❌ WRONG ROUTE - 'ChatScreen' is not a navigation route in MainStack
   - Expected: Should navigate to AIConcierge tab to donate points
   - Fix: Change to `navigate('AIConcierge')`

2. **"Challenges" button**
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should show boost challenges UI
   - Fix: Implement: Modal or navigation to challenges screen

3. **"View Community" button**
   - Current: `onPress={() => {}}`
   - Issue: ❌ EMPTY HANDLER
   - Expected: Should open community/leaderboard view
   - Fix: Implement: Navigation or modal

**Database/API Calls**: ❌ NONE
- Points hardcoded to 12,450
- Boosts are mock data (BOOSTS array)
- Donations not connected to backend
- Impact snapshot is static mock data
- No leaderboard data fetching

---

### 5. ProfileScreen ⚠️ (PARTIAL)
**File**: `/src/features/profile/screens/ProfileScreen.tsx`

#### Buttons Found:
1. **"Logout" button**
   - Current: `onPress={logout}`
   - Status: ✅ WORKING - Calls authStore.logout()
   - Connected to: Backend auth system

2. **Menu items** (Security, Support)
   - Current: `onPress={item.action}`
   - Issue: ⚠️ No action defined for menu items
   - Expected: Should navigate to settings pages
   - Fix: Implement actions or hide if not ready

3. **Dark Mode toggle**
   - Current: `<Switch value={darkMode} onValueChange={setDarkMode} />`
   - Status: ✅ Works locally, but needs persistence to backend

4. **Notifications toggle**
   - Current: `<Switch value={notifications} onValueChange={setNotifications} />`
   - Status: ✅ Works locally, but needs persistence to backend

**Database/API Calls**: ⚠️ PARTIAL
- Logout works ✅
- Settings toggles don't persist to backend
- User data hardcoded (name from authStore)
- No API to update preferences

---

## Critical Issues Summary

### 🔴 BLOCKING ISSUES (App Won't Work)

1. **Navigation Route Mismatch**
   - Screens navigate to routes that don't exist: 'Pay', 'Wallet', 'Rewards', 'ChatScreen'
   - MainStack only has: 'Home', 'Accounts', 'Transfers', 'AIConcierge'
   - **Impact**: Buttons will crash with "couldn't find a route named..." error
   - **Fix Required**: Update MainStack or fix navigation calls

2. **Transfer Submission Not Implemented**
   - "Review & confirm" button does nothing
   - Transfers never sent to backend
   - **Impact**: Core feature (Pay) completely non-functional
   - **Fix Required**: Implement full API call workflow

3. **No Database Persistence**
   - Zero API calls for data storage
   - All user actions lost on app restart
   - **Impact**: App is demo-only, no real functionality
   - **Fix Required**: Add API integration throughout

### 🟡 HIGH PRIORITY ISSUES (Features Don't Work)

1. **Empty Button Handlers** (11 total)
   - FAB, Manage, Add Card, Link, Contacts, Review, Donate, Challenges, View Community, etc.
   - **Impact**: 11+ features appear to work but do nothing
   - **Fix Required**: Implement all handlers

2. **Wrong Navigation Routes** (5+ buttons)
   - Navigate to 'Pay', 'Wallet', 'Rewards', 'ChatScreen'
   - **Impact**: Buttons crash or navigate wrong destination
   - **Fix Required**: Correct route names or update MainStack

### 🟠 MEDIUM PRIORITY ISSUES (Data Not Synced)

1. **Mock Data Only**
   - All screens use hardcoded test data
   - No API calls to fetch real data
   - **Impact**: Users see fake data
   - **Fix Required**: Add API integration

2. **Settings Don't Persist**
   - Dark mode, notifications toggles work locally only
   - **Impact**: Settings reset on app restart
   - **Fix Required**: Call API on toggle change

---

## Database Integration Checklist

### Needed API Endpoints/Calls:

- [ ] **HomeScreen**
  - [ ] GET /api/transactions (fetch recent activity)
  - [ ] GET /api/accounts (fetch balance)

- [ ] **AccountsScreen**
  - [ ] GET /api/cards (fetch linked cards)
  - [ ] POST /api/cards (add new card)
  - [ ] PUT /api/cards/:id (update card)
  - [ ] GET /api/linked-banks (fetch linked banks)
  - [ ] POST /api/link-bank (start bank linking)

- [ ] **TransfersScreen** (CRITICAL)
  - [ ] GET /api/recipients (fetch recent recipients)
  - [ ] POST /api/transfers (submit transfer)
  - [ ] GET /api/accounts (funding sources)

- [ ] **RewardsScreen**
  - [ ] GET /api/rewards/points (fetch points)
  - [ ] GET /api/rewards/boosts (fetch available boosts)
  - [ ] POST /api/rewards/donate (submit donation)
  - [ ] GET /api/rewards/community (fetch leaderboard)

- [ ] **ProfileScreen**
  - [ ] PUT /api/user/preferences (save dark mode, notifications)
  - [ ] PUT /api/user/security (save security settings)

---

## Fixed Issues (Implemented)

- [ ] Navigation architecture updated
- [ ] All buttons connected to proper handlers
- [ ] All empty handlers implemented
- [ ] Wrong navigation routes corrected
- [ ] Database API calls added
- [ ] Data persistence implemented
- [ ] Loading states added
- [ ] Error handling implemented
- [ ] End-to-end workflows tested

---

## Next Steps

1. **Fix Navigation Architecture** (blocking)
2. **Update MainStack.tsx** with proper route definitions
3. **Implement empty button handlers** (11+ buttons)
4. **Fix navigation route names** (5+ buttons)
5. **Add API integration** for all screens
6. **Add loading states and error handling**
7. **Test each workflow end-to-end**
8. **Verify data persists to database**

---

## Test Scenarios (To Verify Fixes)

### HomeScreen
- [ ] Tap "Send" → navigates to Transfers tab (not crash)
- [ ] Tap "Donate" → navigates to AIConcierge tab
- [ ] Tap "Scan/Pay" → navigates to Accounts tab (not 'Wallet')
- [ ] Tap FAB → navigates to AIConcierge chat
- [ ] Recent transactions load from API (not hardcoded)

### AccountsScreen
- [ ] Tap "Manage" → opens card management
- [ ] Tap "Add a card" → opens card form
- [ ] Tap "Move" → navigates to Transfers (not crash)
- [ ] Tap "Link" → opens bank linking flow
- [ ] Cards list loads from API

### TransfersScreen
- [ ] Tap "Contacts" → opens contacts picker
- [ ] Select recipient → populates form
- [ ] Select funding source → opens dropdown
- [ ] Tap "Review & confirm" → submits transfer to backend
- [ ] Success message shown after submission
- [ ] Recent recipients load from API

### RewardsScreen
- [ ] Tap "Donate" → navigates to AIConcierge (not crash)
- [ ] Tap "Challenges" → opens challenges view
- [ ] Tap "View Community" → opens leaderboard
- [ ] Points and boosts load from API
- [ ] Donations persist to backend

### ProfileScreen
- [ ] Dark Mode toggle → persists to backend
- [ ] Notifications toggle → persists to backend
- [ ] Logout → clears session and returns to login
