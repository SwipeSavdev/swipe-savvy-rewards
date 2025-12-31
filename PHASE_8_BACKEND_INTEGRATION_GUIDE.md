# Phase 8: Backend Integration Guide

**Date:** December 28, 2025  
**Status:** 🚀 Integration Documentation Complete  
**Phase:** 8A - MockApi to Backend Mapping

---

## Overview

This document provides comprehensive guidance for integrating the SwipeSavvy frontend applications with production backend APIs. The MockApi system uses a standardized interface that maps directly to real backend endpoints.

---

## Phase 8A: MockApi to Backend Mapping

### Architecture

**MockApi System:**
```
swipesavvy-wallet-web/src/services/api.ts (MockApi class)
swipesavvy-admin-portal/src/services/api.ts (MockApi class)
swipesavvy-customer-website/src/services/APIService.js (APIService class)
```

**Current State:** All calls use mock implementations that return simulated data

**Goal:** Replace mock implementations with actual HTTP calls to backend

---

## Endpoint Mapping: 40+ Endpoints

### Authentication Endpoints (6)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| POST | `/auth/login` | `login(email, password)` | ✓ Ready |
| POST | `/auth/signup` | `signup(email, password, name)` | ✓ Ready |
| POST | `/auth/logout` | `logout()` | ✓ Ready |
| GET | `/auth/verify` | `verifyAuth()` | ✓ Ready |
| POST | `/auth/reset-password` | `requestPasswordReset(email)` | ✓ Ready |
| POST | `/auth/reset-password/confirm` | `confirmPasswordReset(token, password)` | ✓ Ready |

### User Endpoints (8)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| GET | `/users/{id}` | `getUserProfile(userId)` | ✓ Ready |
| PATCH | `/users/{id}` | `updateUserProfile(userId, data)` | ✓ Ready |
| GET | `/users/{id}/accounts` | `getAccounts()` | ✓ Ready |
| POST | `/users/{id}/preferences` | `updateNotificationPreferences(prefs)` | ✓ Ready |
| GET | `/users/{id}/transactions` | `getTransactions(filters)` | ✓ Ready |
| POST | `/users/{id}/invitations` | `inviteUser(email, role)` | ✓ Ready |
| GET | `/users` | `getUsers(filters)` | ✓ Ready |
| DELETE | `/users/{id}` | `deleteUser(userId)` | ✓ Ready |

### Account Endpoints (6)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| GET | `/accounts` | `getAccounts()` | ✓ Ready |
| GET | `/accounts/{id}` | `getAccount(accountId)` | ✓ Ready |
| GET | `/accounts/{id}/balance` | `getAccountBalance(accountId)` | ✓ Ready |
| GET | `/accounts/{id}/transactions` | `getAccountTransactions(accountId, filters)` | ✓ Ready |
| PATCH | `/accounts/{id}` | `updateAccount(accountId, data)` | ✓ Ready |
| POST | `/accounts` | `createAccount(data)` | ✓ Ready |

### Transaction Endpoints (8)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| GET | `/transactions` | `getTransactions(filters)` | ✓ Ready |
| GET | `/transactions/{id}` | `getTransaction(transactionId)` | ✓ Ready |
| POST | `/transactions/search` | `searchTransactions(query, filters)` | ✓ Ready |
| GET | `/transactions/{id}/details` | `getTransactionDetails(transactionId)` | ✓ Ready |
| PATCH | `/transactions/{id}` | `updateTransaction(transactionId, data)` | ✓ Ready |
| POST | `/transactions/{id}/dispute` | `disputeTransaction(transactionId, reason)` | ✓ Ready |
| GET | `/transactions/{id}/receipt` | `getTransactionReceipt(transactionId)` | ✓ Ready |
| GET | `/transactions/export` | `exportTransactions(format, filters)` | ✓ Ready |

### Payment Endpoints (6)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| POST | `/payments/schedule` | `schedulePayment(paymentData)` | ✓ Ready |
| GET | `/payments` | `getPayments(filters)` | ✓ Ready |
| GET | `/payments/{id}` | `getPayment(paymentId)` | ✓ Ready |
| PATCH | `/payments/{id}` | `updatePayment(paymentId, data)` | ✓ Ready |
| DELETE | `/payments/{id}` | `cancelPayment(paymentId)` | ✓ Ready |
| POST | `/payments/{id}/retry` | `retryPayment(paymentId)` | ✓ Ready |

### Merchant Endpoints (8)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| GET | `/merchants` | `getMerchants(filters)` | ✓ Ready |
| GET | `/merchants/{id}` | `getMerchant(merchantId)` | ✓ Ready |
| POST | `/merchants` | `createMerchant(data)` | ✓ Ready |
| PATCH | `/merchants/{id}` | `updateMerchant(merchantId, data)` | ✓ Ready |
| POST | `/merchants/{id}/onboard` | `onboardMerchant(merchantId)` | ✓ Ready |
| GET | `/merchants/{id}/analytics` | `getMerchantAnalytics(merchantId, period)` | ✓ Ready |
| GET | `/merchants/{id}/documents` | `getMerchantDocuments(merchantId)` | ✓ Ready |
| DELETE | `/merchants/{id}` | `deleteMerchant(merchantId)` | ✓ Ready |

### Admin/Settings Endpoints (6)

| Method | Endpoint | MockApi Function | Status |
|--------|----------|------------------|--------|
| GET | `/admin/dashboard` | `getDashboardOverview()` | ✓ Ready |
| GET | `/admin/analytics` | `getAnalytics(filters)` | ✓ Ready |
| PATCH | `/admin/settings` | `updateOrgSettings(settings)` | ✓ Ready |
| GET | `/admin/audit-log` | `getAuditLog(filters)` | ✓ Ready |
| POST | `/admin/reports` | `generateReport(type, filters)` | ✓ Ready |
| GET | `/admin/health` | `getSystemHealth()` | ✓ Ready |

**Total Endpoints:** 48  
**Status:** All mapped and ready for integration

---

## Integration Steps

### Step 1: Set Up API Client

**Current Mock Implementation:**
```typescript
// swipesavvy-wallet-web/src/services/api.ts
export class MockApi {
  static async getTransactions(filters: any) {
    // Returns mock data
    return { items: [...mock transactions...], total: 250 }
  }
}
```

**New Real Implementation:**
```typescript
// swipesavvy-wallet-web/src/services/api.ts
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.swipesavvy.com/v1'

export class MockApi {
  private static client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to requests
  static setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Implement real endpoint
  static async getTransactions(filters: any) {
    try {
      const response = await this.client.get('/transactions', { params: filters })
      return response.data
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      throw error
    }
  }
}
```

### Step 2: Configure Environment Variables

**Create `.env.local` file:**
```
REACT_APP_API_URL=https://api.swipesavvy.com/v1
REACT_APP_ENVIRONMENT=production
REACT_APP_LOG_LEVEL=info
```

**Development `.env.development`:**
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
```

### Step 3: Update Authentication

**Token Management:**
```typescript
// Store token from login response
const loginResponse = await MockApi.login(email, password)
localStorage.setItem('token', loginResponse.token)
MockApi.setAuthToken(loginResponse.token)

// Token refresh on expiry
MockApi.setTokenRefreshHandler(async () => {
  const newToken = await MockApi.refreshToken()
  localStorage.setItem('token', newToken)
  return newToken
})
```

### Step 4: Implement Error Handling

**Standardized Error Response:**
```typescript
interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: Record<string, any>
}

// Intercept and normalize errors
this.client.interceptors.response.use(
  response => response.data,
  error => {
    const apiError: ApiError = {
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.message || error.message,
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details,
    }
    throw apiError
  }
)
```

### Step 5: Test Each Endpoint

**Test Pattern:**
```typescript
// Test getting accounts
const accounts = await MockApi.getAccounts()
console.assert(Array.isArray(accounts), 'Should return array')
console.assert(accounts[0].id, 'Should have account ID')
console.assert(accounts[0].currentBalanceCents, 'Should have balance')
```

---

## Database Schema Requirements

### Account Balances
```sql
CREATE TABLE account_balances (
  account_id UUID PRIMARY KEY,
  current_balance_cents BIGINT NOT NULL,
  available_balance_cents BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
)
```

### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL,
  merchant_id UUID,
  merchant_name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  amount_cents BIGINT NOT NULL,
  status ENUM('pending', 'posted', 'reversed'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
)
```

### Payments
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  from_account_id UUID NOT NULL,
  payee VARCHAR(255) NOT NULL,
  amount_cents BIGINT NOT NULL,
  deliver_at TIMESTAMP,
  status ENUM('scheduled', 'pending', 'complete', 'failed'),
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_account_id) REFERENCES accounts(id)
)
```

---

## Performance Optimization

### Caching Strategy

**Accounts (Invalidate on update):**
```typescript
const cacheKey = 'accounts'
const cached = sessionStorage.getItem(cacheKey)
if (cached) return JSON.parse(cached)

const accounts = await this.client.get('/accounts')
sessionStorage.setItem(cacheKey, JSON.stringify(accounts))
return accounts
```

**Transactions (30-second TTL):**
```typescript
const lastFetch = localStorage.getItem('transactions_lastFetch')
if (lastFetch && Date.now() - parseInt(lastFetch) < 30000) {
  return JSON.parse(localStorage.getItem('transactions') || '[]')
}
```

### Rate Limiting

**Implement exponential backoff:**
```typescript
async function withRetry(fn: Function, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = Math.pow(2, i) * 1000
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// Usage
const accounts = await withRetry(() => MockApi.getAccounts())
```

---

## Security Considerations

### HTTPS Only
```typescript
if (process.env.NODE_ENV === 'production') {
  if (API_BASE_URL.startsWith('http://')) {
    throw new Error('Production API must use HTTPS')
  }
}
```

### CORS Configuration
```
Access-Control-Allow-Origin: https://swipesavvy.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Token Validation
```typescript
// Validate JWT before sending requests
function isTokenValid(token: string): boolean {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]))
    return decoded.exp > Date.now() / 1000
  } catch {
    return false
  }
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Mock API responses for unit tests
- [ ] Test error handling paths
- [ ] Validate response schemas
- [ ] Test retry logic

### Integration Tests
- [ ] Test auth flow end-to-end
- [ ] Test transaction submission and retrieval
- [ ] Test concurrent operations
- [ ] Test offline scenarios

### Performance Tests
- [ ] Load test with 100 concurrent users
- [ ] Measure API response times
- [ ] Monitor network usage
- [ ] Test with slow network (3G)

### Security Tests
- [ ] Verify token expiration handling
- [ ] Test invalid token rejection
- [ ] Verify CORS headers
- [ ] Test SQL injection prevention

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] API endpoints accessible from production domain
- [ ] HTTPS certificate valid
- [ ] Database migrations executed
- [ ] Rate limits configured
- [ ] Monitoring and logging active
- [ ] Error tracking (Sentry) integrated
- [ ] CDN configured for static assets

---

## Phase 8B: Database Integration Testing

**Planned Tests:**
1. CRUD operations on all entities
2. Concurrent transaction handling
3. Data consistency validation
4. Backup and recovery procedures
5. Query performance monitoring

---

## Phase 8C: Production API Validation

**Planned Validations:**
1. Schema validation against OpenAPI spec
2. Response time benchmarking
3. Error scenario testing
4. Load testing (1000+ requests/sec)
5. Chaos engineering tests

---

## Support & Troubleshooting

### Common Issues

**Issue: Token expired**
```typescript
// Automatically refresh and retry
if (error.statusCode === 401) {
  const newToken = await MockApi.refreshToken()
  MockApi.setAuthToken(newToken)
  return await originalRequest()
}
```

**Issue: Network timeout**
```typescript
// Implement timeout with longer duration for large requests
this.client.timeout = {
  request: 10000, // 10s for normal requests
  upload: 30000,  // 30s for file uploads
  download: 60000, // 60s for large downloads
}
```

**Issue: CORS error**
- Verify backend CORS headers
- Check origin header matches configured domain
- Test with preflight request

---

## API Documentation

Full API documentation available at:
- **Production:** https://api.swipesavvy.com/docs
- **Development:** http://localhost:8000/docs
- **OpenAPI Spec:** https://api.swipesavvy.com/openapi.json

---

## Next Steps

1. **Phase 8B:** Execute database integration testing
2. **Phase 8C:** Validate production APIs
3. **Phase 9:** Staging environment deployment
4. **Phase 10:** Production rollout

---

**Status:** 🚀 Ready for Backend Integration  
**Estimated Timeline:** 2-3 weeks
**Risk Level:** Low (well-documented endpoints, proven patterns)
