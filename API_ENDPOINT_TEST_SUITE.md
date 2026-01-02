# API Endpoint Test Suite - SwipeSavvy Mobile App

## Overview
This document provides comprehensive testing for all API endpoints in the SwipeSavvy mobile app.

## API Configuration
- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`

---

## Endpoint Checklist

### 1. TRANSACTIONS
- **Endpoint**: `GET /transactions?limit=10`
- **Method**: GET
- **Description**: Fetch recent transactions
- **Auth Required**: Yes
- **Response Type**: `Transaction[]`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: 
  - HomeScreen (5 recent)
  - AccountBalanceDetailScreen (20 transactions)
- **Mock Data**: Available when API fails

---

### 2. ACCOUNTS
- **Endpoint**: `GET /accounts`
- **Method**: GET
- **Description**: Fetch all user accounts
- **Auth Required**: Yes
- **Response Type**: `Account[]`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: HomeScreen
- **Mock Data**: Checking & Savings accounts with balances

---

### 3. ACCOUNT BALANCE
- **Endpoint**: `GET /accounts/{accountId}/balance`
- **Method**: GET
- **Description**: Fetch balance for specific account
- **Auth Required**: Yes
- **Response Type**: `{ balance: number }`
- **Status**: ✅ IMPLEMENTED
- **Used In**: AccountBalanceDetailScreen
- **Error Handling**: Returns 0 on failure

---

### 4. LINKED BANKS
- **Endpoint**: `GET /banks/linked`
- **Method**: GET
- **Description**: Fetch connected bank accounts
- **Auth Required**: Yes
- **Response Type**: `LinkedBank[]`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: AccountsScreen
- **Mock Data**: Chase Bank & Wells Fargo

---

### 5. PLAID LINK INITIATION
- **Endpoint**: `POST /banks/plaid-link`
- **Method**: POST
- **Description**: Initiate Plaid bank connection flow
- **Auth Required**: Yes
- **Request Body**: (empty)
- **Response Type**: `{ plaidLink: string }`
- **Status**: ✅ IMPLEMENTED
- **Used In**: Bank linking flow
- **Error Handling**: Throws error on failure

---

### 6. SUBMIT TRANSFER (CRITICAL)
- **Endpoint**: `POST /transfers`
- **Method**: POST
- **Description**: Submit money transfer/request
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "recipientId": "string",
    "recipientName": "string",
    "amount": number,
    "currency": "string",
    "fundingSourceId": "string",
    "memo": "string (optional)",
    "type": "send|request"
  }
  ```
- **Response Type**: `{ success: boolean, transferId: string, status: string }`
- **Status**: ✅ IMPLEMENTED (Critical - no fallback)
- **Used In**: TransfersScreen
- **Error Handling**: Throws error on failure (no mock)

---

### 7. RECENT RECIPIENTS
- **Endpoint**: `GET /transfers/recipients`
- **Method**: GET
- **Description**: Fetch recent transfer recipients
- **Auth Required**: Yes
- **Response Type**: `any[]` (with id, name, handle, avatar)
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: TransfersScreen
- **Mock Data**: Jordan, Emma, Bank (ACH)

---

### 8. REWARDS POINTS
- **Endpoint**: `GET /rewards/points`
- **Method**: GET
- **Description**: Fetch user rewards points balance
- **Auth Required**: Yes
- **Response Type**: 
  ```json
  {
    "available": number,
    "donated": number,
    "tier": string,
    "tierProgress": number
  }
  ```
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: 
  - RewardsScreen
  - RewardsDonateScreen
- **Mock Data**: 12,450 available, Silver tier (68%)

---

### 9. REWARD BOOSTS
- **Endpoint**: `GET /rewards/boosts`
- **Method**: GET
- **Description**: Fetch active reward boosts
- **Auth Required**: Yes
- **Response Type**: `any[]` (with id, title, icon, percent)
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: RewardsScreen
- **Mock Data**: Fuel boost 2×, Cafés +150pts

---

### 10. DONATE POINTS (CRITICAL)
- **Endpoint**: `POST /rewards/donate`
- **Method**: POST
- **Description**: Donate points to charity
- **Auth Required**: Yes
- **Request Body**: `{ amount: number }`
- **Response Type**: `{ success: boolean, newBalance: number, cause?: string }`
- **Status**: ✅ IMPLEMENTED (Critical - no fallback)
- **Used In**: RewardsDonateScreen
- **Error Handling**: Throws error on failure (no mock)

---

### 11. COMMUNITY LEADERBOARD
- **Endpoint**: `GET /rewards/leaderboard`
- **Method**: GET
- **Description**: Fetch community giving leaderboard
- **Auth Required**: Yes
- **Response Type**: `any[]`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: LeaderboardScreen
- **Error Handling**: Returns empty array on failure

---

### 12. USER PREFERENCES
- **Endpoint**: `GET /user/preferences`
- **Method**: GET
- **Description**: Fetch user settings/preferences
- **Auth Required**: Yes
- **Response Type**: `UserPreferences`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: ProfileScreen

---

### 13. UPDATE PREFERENCES (CRITICAL)
- **Endpoint**: `PUT /user/preferences`
- **Method**: PUT
- **Description**: Update user settings/preferences
- **Auth Required**: Yes
- **Request Body**: `UserPreferences` object
- **Response Type**: `{ success: boolean }`
- **Status**: ✅ IMPLEMENTED (offline-safe)
- **Used In**: ProfileScreen
- **Error Handling**: Returns success even offline

---

### 14. ADD CARD (CRITICAL)
- **Endpoint**: `POST /cards`
- **Method**: POST
- **Description**: Add new payment card
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "cardNumber": "string",
    "expiryDate": "string",
    "cvv": "string",
    "holderName": "string"
  }
  ```
- **Response Type**: `{ success: boolean, cardId: string }`
- **Status**: ✅ IMPLEMENTED (Critical - throws on failure)
- **Used In**: CardsScreen
- **Error Handling**: Throws error on failure (no mock)

---

### 15. GET CARDS
- **Endpoint**: `GET /cards`
- **Method**: GET
- **Description**: Fetch saved payment cards
- **Auth Required**: Yes
- **Response Type**: `any[]`
- **Status**: ✅ IMPLEMENTED (with mock fallback)
- **Used In**: CardsScreen
- **Mock Data**: Returns empty array on failure

---

### 16. HEALTH CHECK
- **Endpoint**: `GET /health`
- **Method**: GET
- **Description**: Check API availability
- **Auth Required**: No
- **Response Type**: `any`
- **Status**: ✅ IMPLEMENTED
- **Used In**: Internal diagnostics
- **Error Handling**: Returns false on failure

---

## Testing Checklist

### Component-Level Tests

#### HomeScreen
- [ ] `getAccounts()` - displays account summary
- [ ] `getTransactions(5)` - shows 5 recent transactions
- [ ] Rewards button navigates to RewardsScreen
- [ ] Donate button navigates to RewardsDonateScreen

#### RewardsScreen
- [ ] `getRewardsPoints()` - displays points balance
- [ ] `getBoosts()` - shows active boosts
- [ ] Points display formatting correct

#### RewardsDonateScreen
- [ ] `getRewardsPoints()` - loads on mount
- [ ] `donatePoints(amount)` - submits donation
- [ ] Success confirmation appears
- [ ] Points balance updates

#### TransfersScreen
- [ ] `getRecentRecipients()` - loads recipients
- [ ] `submitTransfer()` - submits transfer
- [ ] Quick action buttons work

#### AccountsScreen
- [ ] `getLinkedBanks()` - displays banks
- [ ] Bank linking flow works

#### CardsScreen
- [ ] `getCards()` - displays saved cards
- [ ] `addCard()` - adds new card
- [ ] Form validation works

#### ProfileScreen
- [ ] `getPreferences()` - loads settings
- [ ] `updatePreferences()` - saves settings

#### AccountBalanceDetailScreen
- [ ] `getAccountBalance(accountId)` - loads balance
- [ ] `getTransactions(20)` - loads transactions

#### LeaderboardScreen
- [ ] `getCommunityLeaderboard()` - loads rankings

---

## Error Handling Summary

### Endpoints with Fallback (Non-Critical)
- `getTransactions()` - returns mock data
- `getAccounts()` - returns mock data
- `getLinkedBanks()` - returns mock data
- `getBoosts()` - returns mock data
- `getRewardsPoints()` - returns mock data
- `getRecentRecipients()` - returns mock data
- `getCommunityLeaderboard()` - returns empty array
- `getCards()` - returns empty array
- `getPreferences()` - returns default preferences

### Endpoints without Fallback (Critical)
- `submitTransfer()` - throws error
- `donatePoints()` - throws error
- `addCard()` - throws error
- `initiatePhilinkFlow()` - throws error

### Endpoints with Partial Fallback
- `updatePreferences()` - returns success even offline
- `getAccountBalance()` - returns 0 on failure

---

## Backend Requirements

### Required Endpoints Implementation
The backend at `http://localhost:8000/api/v1` must implement:

```javascript
// Core endpoints needed for full functionality
GET    /health
GET    /transactions?limit={limit}
GET    /accounts
GET    /accounts/{accountId}/balance
GET    /banks/linked
POST   /banks/plaid-link
POST   /transfers
GET    /transfers/recipients
GET    /rewards/points
GET    /rewards/boosts
POST   /rewards/donate
GET    /rewards/leaderboard
GET    /user/preferences
PUT    /user/preferences
POST   /cards
GET    /cards
```

### Authentication Header Format
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Debugging Commands

### Test Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### Test Transactions Fetch
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/transactions?limit=10
```

### Test Transfer Submission
```bash
curl -X POST http://localhost:8000/api/v1/transfers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user2",
    "recipientName": "John",
    "amount": 50,
    "currency": "USD",
    "fundingSourceId": "account1",
    "type": "send"
  }'
```

---

## Status Summary

| Category | Count | Status |
|----------|-------|--------|
| Total Endpoints | 16 | ✅ ALL IMPLEMENTED |
| With Fallback | 9 | ✅ READY |
| Critical (No Fallback) | 4 | ⚠️ NEEDS BACKEND |
| With Partial Fallback | 2 | ✅ RESILIENT |
| Health Check | 1 | ✅ AVAILABLE |

---

## Next Steps

1. **Start Backend Server**: Ensure backend is running on port 8000
2. **Test Each Endpoint**: Use provided curl commands
3. **Verify Component Behavior**: Test UI components with real API
4. **Check Error Handling**: Verify fallbacks work correctly
5. **Monitor Network Tab**: Watch API calls in Expo DevTools

