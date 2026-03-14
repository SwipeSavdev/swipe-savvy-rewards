# Accounts, Transactions, Linked Banks & Analytics API

Base path: `/api/v1`

Source: `mobile_api.py`

All endpoints in this section require **JWT Bearer** authentication.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/accounts` | JWT Bearer | Get user's accounts with balances |
| GET | `/accounts/{account_id}/balance` | JWT Bearer | Get specific account balance |
| GET | `/transactions` | JWT Bearer | Get user's transaction history |
| GET | `/banks/linked` | JWT Bearer | Get linked bank accounts |
| POST | `/banks/plaid-link` | JWT Bearer | Generate Plaid Link token |
| GET | `/analytics` | JWT Bearer | Get spending analytics |
| GET | `/cards` | JWT Bearer | Get user's cards (simple) |
| POST | `/cards` | JWT Bearer | Add a new card (simple) |
| GET | `/health` | None | API health check |

---

## GET /api/v1/accounts

Get all user accounts with real-time balances computed from wallet transactions.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "acc_checking_1",
    "name": "Checking",
    "type": "checking",
    "balance": 4250.25,
    "currency": "USD"
  },
  {
    "id": "acc_savings_1",
    "name": "Savings",
    "type": "savings",
    "balance": 4675.28,
    "currency": "USD"
  }
]
```

---

## GET /api/v1/accounts/{account_id}/balance

Get the balance for a specific account.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| account_id | string | Account identifier (e.g., `acc_checking_1`) |

**Response `200`:**

```json
{
  "balance": 4250.25
}
```

---

## GET /api/v1/transactions

Get the user's transaction history, ordered by most recent first.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 10 | Number of transactions (1-100) |

**Response `200`:**

```json
[
  {
    "id": "tx_1",
    "type": "payment",
    "title": "Amazon",
    "amount": 45.99,
    "currency": "USD",
    "status": "completed",
    "timestamp": "2025-06-01T12:30:00+00:00",
    "description": "Card purchase"
  },
  {
    "id": "tx_2",
    "type": "deposit",
    "title": "Bank Transfer",
    "amount": 500.00,
    "currency": "USD",
    "status": "completed",
    "timestamp": "2025-05-31T12:30:00+00:00",
    "description": "Direct deposit"
  }
]
```

---

## GET /api/v1/banks/linked

Get all linked bank accounts for the authenticated user.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "bank_1",
    "bankName": "Chase Bank",
    "accountNumber": "---- 1920",
    "status": "connected",
    "lastVerified": "2025-06-01T14:00:00+00:00"
  },
  {
    "id": "bank_2",
    "bankName": "Wells Fargo",
    "accountNumber": "---- 4481",
    "status": "connected",
    "lastVerified": "2025-05-25T14:00:00+00:00"
  }
]
```

---

## POST /api/v1/banks/plaid-link

Generate a Plaid Link token for connecting a new bank account.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "plaidLink": "plaid_link_token_abc123...",
  "expiration": "2025-06-01T15:00:00+00:00"
}
```

---

## GET /api/v1/analytics

Get spending analytics including category breakdown, monthly trends, and insights.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "totalIncome": 3450.00,
  "totalExpenses": 1500.00,
  "totalSavings": 1950.00,
  "savingsRate": 56.5,
  "spendingByCategory": [
    {
      "category": "Food & Dining",
      "amount": 450.00,
      "percentage": 30.0,
      "color": "#FF6B6B",
      "transactions": 28
    },
    {
      "category": "Shopping",
      "amount": 315.00,
      "percentage": 21.0,
      "color": "#4ECDC4",
      "transactions": 12
    },
    {
      "category": "Transportation",
      "amount": 225.00,
      "percentage": 15.0,
      "color": "#45B7D1",
      "transactions": 18
    },
    {
      "category": "Entertainment",
      "amount": 195.00,
      "percentage": 13.0,
      "color": "#96CEB4",
      "transactions": 8
    },
    {
      "category": "Bills & Utilities",
      "amount": 180.00,
      "percentage": 12.0,
      "color": "#FFEAA7",
      "transactions": 5
    },
    {
      "category": "Healthcare",
      "amount": 90.00,
      "percentage": 6.0,
      "color": "#DDA0DD",
      "transactions": 3
    },
    {
      "category": "Other",
      "amount": 45.00,
      "percentage": 3.0,
      "color": "#95A5A6",
      "transactions": 6
    }
  ],
  "monthlyTrend": [
    { "month": "Jan", "income": 3200.00, "expenses": 1400.00 },
    { "month": "Feb", "income": 3300.00, "expenses": 1500.00 }
  ],
  "insights": [
    "You're saving 57% of your income this month - great job!",
    "Food & Dining is your biggest expense at 30%",
    "Consider setting up automatic savings to reach your goals faster",
    "Your spending is 12% lower than last month"
  ]
}
```

---

## GET /api/v1/cards

Get user's cards (simple card list from the mobile API).

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "card_1",
    "lastFour": "1042",
    "type": "physical",
    "brand": "SwipeSavvy",
    "expiryDate": "12/27",
    "holderName": "USER NAME",
    "isDefault": true
  },
  {
    "id": "card_2",
    "lastFour": "7721",
    "type": "virtual",
    "brand": "SwipeSavvy",
    "expiryDate": "06/28",
    "holderName": "USER NAME",
    "isDefault": false
  }
]
```

---

## POST /api/v1/cards

Add a new card to the user's account.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "cardNumber": "4242424242421042",
  "expiryDate": "12/27",
  "holderName": "John Doe"
}
```

**Response `200`:**

```json
{
  "success": true,
  "cardId": "card_550e8400-e29b-41d4-a716-446655440000"
}
```

---

## GET /api/v1/health

API health check endpoint. No authentication required.

**Auth:** None

**Response `200`:**

```json
{
  "status": "healthy",
  "timestamp": "2025-06-01T14:00:00+00:00"
}
```
