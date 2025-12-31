# Phase 8B & 8C: Testing & Validation Framework

**Date:** December 28, 2025  
**Status:** 🧪 Testing Strategy Complete  
**Coverage:** Database Integration + Production API Validation

---

## Phase 8B: Database Integration Testing

### Test Objectives
✅ Validate all CRUD operations persist correctly  
✅ Verify data consistency across concurrent operations  
✅ Test transaction isolation and rollback  
✅ Validate foreign key constraints  
✅ Test query performance under load  

---

## Test Suite 1: Account Operations

### Test 1.1: Create Account
```typescript
test('Should create account with valid data', async () => {
  const accountData = {
    nickname: 'Checking Account',
    type: 'checking',
    mask: '****1234',
    currentBalanceCents: 50000,
    availableBalanceCents: 50000,
    status: 'open',
  }
  
  const account = await MockApi.createAccount(accountData)
  
  expect(account.id).toBeDefined()
  expect(account.nickname).toBe('Checking Account')
  expect(account.currentBalanceCents).toBe(50000)
})

test('Should reject invalid account data', async () => {
  const invalidData = { nickname: '' }
  
  await expect(MockApi.createAccount(invalidData))
    .rejects.toThrow('Account nickname required')
})
```

### Test 1.2: Update Account Balance
```typescript
test('Should update account balance', async () => {
  const account = await MockApi.getAccount('acc-123')
  const newBalance = 75000
  
  const updated = await MockApi.updateAccount('acc-123', {
    currentBalanceCents: newBalance,
  })
  
  expect(updated.currentBalanceCents).toBe(newBalance)
})

test('Should prevent negative balance', async () => {
  await expect(
    MockApi.updateAccount('acc-123', {
      currentBalanceCents: -1000,
    })
  ).rejects.toThrow('Balance cannot be negative')
})
```

### Test 1.3: Concurrent Account Updates
```typescript
test('Should handle concurrent account updates', async () => {
  const updates = Promise.all([
    MockApi.updateAccount('acc-123', { currentBalanceCents: 50000 }),
    MockApi.updateAccount('acc-123', { currentBalanceCents: 60000 }),
    MockApi.updateAccount('acc-123', { currentBalanceCents: 70000 }),
  ])
  
  const results = await updates
  // Last update should win (timestamp-based)
  const final = await MockApi.getAccount('acc-123')
  expect(final.currentBalanceCents).toBe(70000)
})
```

---

## Test Suite 2: Transaction Operations

### Test 2.1: Create Transaction
```typescript
test('Should create transaction with valid data', async () => {
  const transactionData = {
    accountId: 'acc-123',
    merchant: 'Amazon',
    category: 'Shopping',
    description: 'Amazon Purchase',
    amountCents: 5999,
    status: 'posted',
  }
  
  const transaction = await MockApi.createTransaction(transactionData)
  
  expect(transaction.id).toBeDefined()
  expect(transaction.accountId).toBe('acc-123')
  expect(transaction.amountCents).toBe(5999)
})

test('Should validate transaction amount', async () => {
  const invalidData = {
    accountId: 'acc-123',
    merchant: 'Test',
    amountCents: 0,
  }
  
  await expect(MockApi.createTransaction(invalidData))
    .rejects.toThrow('Amount must be greater than 0')
})
```

### Test 2.2: Transaction Status Transitions
```typescript
test('Should transition transaction through valid states', async () => {
  let transaction = await MockApi.getTransaction('txn-123')
  expect(transaction.status).toBe('pending')
  
  // Pending → Posted
  transaction = await MockApi.updateTransaction('txn-123', {
    status: 'posted',
  })
  expect(transaction.status).toBe('posted')
  
  // Posted → Reversed
  transaction = await MockApi.updateTransaction('txn-123', {
    status: 'reversed',
  })
  expect(transaction.status).toBe('reversed')
})

test('Should prevent invalid status transitions', async () => {
  // Create pending transaction
  const transaction = await MockApi.createTransaction({
    accountId: 'acc-123',
    merchant: 'Test',
    amountCents: 1000,
    status: 'pending',
  })
  
  // Cannot go from Pending to Reversed
  await expect(
    MockApi.updateTransaction(transaction.id, {
      status: 'reversed',
    })
  ).rejects.toThrow('Cannot reverse pending transaction')
})
```

### Test 2.3: Transaction Isolation
```typescript
test('Should isolate concurrent transaction updates', async () => {
  const txnId = 'txn-456'
  
  const updates = Promise.all([
    MockApi.updateTransaction(txnId, {
      category: 'Groceries',
    }),
    MockApi.updateTransaction(txnId, {
      description: 'Updated description',
    }),
  ])
  
  const results = await updates
  
  // Both updates should be applied
  const final = await MockApi.getTransaction(txnId)
  expect(final.category).toBe('Groceries')
  expect(final.description).toBe('Updated description')
})
```

---

## Test Suite 3: Payment Operations

### Test 3.1: Schedule Payment
```typescript
test('Should schedule payment with valid data', async () => {
  const paymentData = {
    fromAccountId: 'acc-123',
    payee: 'John Doe',
    amountCents: 10000,
    deliverAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    memo: 'Monthly rent',
  }
  
  const payment = await MockApi.schedulePayment(paymentData)
  
  expect(payment.id).toBeDefined()
  expect(payment.status).toBe('scheduled')
  expect(payment.amountCents).toBe(10000)
})

test('Should validate payment amount', async () => {
  await expect(
    MockApi.schedulePayment({
      fromAccountId: 'acc-123',
      payee: 'John',
      amountCents: 0,
    })
  ).rejects.toThrow('Payment amount required')
})
```

### Test 3.2: Cancel Payment
```typescript
test('Should cancel scheduled payment', async () => {
  const payment = await MockApi.schedulePayment({
    fromAccountId: 'acc-123',
    payee: 'John',
    amountCents: 5000,
  })
  
  const cancelled = await MockApi.cancelPayment(payment.id)
  
  expect(cancelled.status).toBe('cancelled')
})

test('Should prevent cancelling posted payment', async () => {
  const payment = await MockApi.getPayment('pmt-posted')
  expect(payment.status).toBe('posted')
  
  await expect(MockApi.cancelPayment('pmt-posted'))
    .rejects.toThrow('Cannot cancel posted payment')
})
```

---

## Test Suite 4: Data Consistency

### Test 4.1: Foreign Key Constraints
```typescript
test('Should enforce foreign key on transactions', async () => {
  await expect(
    MockApi.createTransaction({
      accountId: 'non-existent-account',
      merchant: 'Test',
      amountCents: 1000,
    })
  ).rejects.toThrow('Account not found')
})

test('Should prevent deleting account with transactions', async () => {
  // Create account with transaction
  const account = await MockApi.createAccount({
    nickname: 'Test',
    type: 'checking',
  })
  
  await MockApi.createTransaction({
    accountId: account.id,
    merchant: 'Test',
    amountCents: 1000,
  })
  
  // Try to delete account
  await expect(MockApi.deleteAccount(account.id))
    .rejects.toThrow('Cannot delete account with transactions')
})
```

### Test 4.2: Balance Consistency
```typescript
test('Should maintain balance consistency', async () => {
  const account = await MockApi.getAccount('acc-123')
  const initialBalance = account.currentBalanceCents
  
  // Create 10 transactions
  for (let i = 0; i < 10; i++) {
    await MockApi.createTransaction({
      accountId: 'acc-123',
      merchant: `Store ${i}`,
      amountCents: 1000 * (i + 1),
    })
  }
  
  // Sum should equal initial minus all transactions
  const transactions = await MockApi.getAccountTransactions('acc-123')
  const totalSpent = transactions.reduce((sum, t) => sum + t.amountCents, 0)
  
  expect(initialBalance - totalSpent)
    .toBe((await MockApi.getAccount('acc-123')).currentBalanceCents)
})
```

---

## Phase 8C: Production API Validation

### Validation Suite 1: Response Schemas

```typescript
// Define expected schemas
const AccountSchema = {
  id: expect.any(String),
  nickname: expect.any(String),
  type: expect.stringMatching(/^(checking|savings|credit)$/),
  currentBalanceCents: expect.any(Number),
  status: expect.stringMatching(/^(open|frozen|closed)$/),
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
}

test('GET /accounts returns valid schema', async () => {
  const accounts = await MockApi.getAccounts()
  
  expect(Array.isArray(accounts)).toBe(true)
  accounts.forEach(account => {
    expect(account).toMatchObject(AccountSchema)
  })
})

test('GET /transactions returns paginated response', async () => {
  const response = await MockApi.getTransactions({
    page: 1,
    pageSize: 10,
  })
  
  expect(response).toHaveProperty('items')
  expect(response).toHaveProperty('total')
  expect(response).toHaveProperty('page')
  expect(response).toHaveProperty('pageSize')
  expect(Array.isArray(response.items)).toBe(true)
})
```

### Validation Suite 2: Error Responses

```typescript
test('Should return 400 for invalid request', async () => {
  try {
    await MockApi.createTransaction({
      // Missing required fields
      accountId: 'acc-123',
    })
  } catch (error) {
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.details).toBeDefined()
  }
})

test('Should return 404 for not found', async () => {
  try {
    await MockApi.getTransaction('non-existent-id')
  } catch (error) {
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
  }
})

test('Should return 401 for unauthorized', async () => {
  MockApi.setAuthToken('invalid-token')
  
  try {
    await MockApi.getAccounts()
  } catch (error) {
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
  }
})
```

### Validation Suite 3: Performance Benchmarks

```typescript
test('GET /accounts completes within 500ms', async () => {
  const startTime = performance.now()
  await MockApi.getAccounts()
  const duration = performance.now() - startTime
  
  expect(duration).toBeLessThan(500)
})

test('GET /transactions completes within 1000ms', async () => {
  const startTime = performance.now()
  await MockApi.getTransactions({ page: 1, pageSize: 100 })
  const duration = performance.now() - startTime
  
  expect(duration).toBeLessThan(1000)
})

test('POST /payments/schedule completes within 2000ms', async () => {
  const startTime = performance.now()
  
  await MockApi.schedulePayment({
    fromAccountId: 'acc-123',
    payee: 'John',
    amountCents: 10000,
  })
  
  const duration = performance.now() - startTime
  expect(duration).toBeLessThan(2000)
})
```

### Validation Suite 4: Load Testing

```typescript
test('Should handle 100 concurrent requests', async () => {
  const requests = Array(100)
    .fill(null)
    .map(() => MockApi.getAccounts())
  
  const results = await Promise.all(requests)
  
  expect(results.length).toBe(100)
  expect(results.every(r => Array.isArray(r))).toBe(true)
})

test('Should handle rate limits gracefully', async () => {
  const requests = Array(1000)
    .fill(null)
    .map(() => MockApi.getTransactions())
  
  let successCount = 0
  let rateLimitCount = 0
  
  const results = await Promise.allSettled(requests)
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      successCount++
    } else if (result.reason?.statusCode === 429) {
      rateLimitCount++
    }
  })
  
  // Should have rate limited some requests
  expect(rateLimitCount).toBeGreaterThan(0)
  // But still successful for most
  expect(successCount).toBeGreaterThan(800)
})
```

---

## Test Execution Plan

### Week 1: Unit Tests
- Days 1-2: Setup test framework
- Days 3-4: Write unit tests (20 tests)
- Days 5: Run and fix failures

### Week 2: Integration Tests
- Days 1-2: Database integration setup
- Days 3-4: Write integration tests (30 tests)
- Days 5: Performance validation

### Week 3: Production Validation
- Days 1-2: API contract testing
- Days 3-4: Load and stress testing
- Days 5: Final validation and sign-off

---

## Success Criteria

✅ **Unit Tests:** 50+ passing tests, 0 failures  
✅ **Integration Tests:** 30+ database tests passing  
✅ **Schema Validation:** 100% endpoint schema match  
✅ **Performance:** 95% of requests under SLA  
✅ **Load Testing:** 100 concurrent users, 0% error rate  
✅ **API Validation:** All 48 endpoints validated  

---

## Tools & Frameworks

**Testing Libraries:**
- Jest (unit/integration testing)
- Supertest (HTTP API testing)
- K6 (load testing)
- Artillery (stress testing)

**Monitoring:**
- Prometheus (metrics)
- Grafana (visualization)
- Sentry (error tracking)
- Datadog (APM)

---

## Rollback Plan

If any tests fail:

1. **Identify Root Cause**
   - Check error logs
   - Review recent changes
   - Verify database state

2. **Fix Issue**
   - Patch backend API
   - Update MockApi mapping
   - Add defensive code in frontend

3. **Re-test**
   - Run full test suite
   - Verify fix doesn't break other tests
   - Load test to confirm performance

4. **Deploy Fix**
   - Tag version (e.g., v1.1.1-hotfix)
   - Deploy to staging
   - Deploy to production

---

## Next Steps

1. Set up Jest and test environment
2. Create mock database for testing
3. Write and execute test suites
4. Analyze results and fix issues
5. Ready for staging deployment

---

**Status:** 🧪 Testing Framework Ready  
**Estimated Timeline:** 3 weeks  
**Team:** 2-3 QA engineers
