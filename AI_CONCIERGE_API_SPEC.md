# SwipeSavvy AI Concierge - Backend API Specification

## Overview
This document specifies the API endpoints required for the AI Concierge to access user data and provide seamless mobile app assistance.

## Base URL
```
http://localhost:8002/api/v1
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {accessToken}
```

---

## User Data Endpoints

### 1. Get User Profile
**Endpoint**: `GET /users/{userId}`

**Description**: Fetch user profile information

**Response**:
```json
{
  "id": "user_123",
  "name": "Jordan Anderson",
  "email": "jordan@example.com",
  "tier": "Silver",
  "kycStatus": "verified",
  "avatar": "https://..."
}
```

---

### 2. Get User Accounts
**Endpoint**: `GET /users/{userId}/accounts`

**Description**: Fetch all accounts (checking, savings, credit)

**Response**:
```json
[
  {
    "id": "checking-123",
    "type": "checking",
    "name": "Checking Account",
    "balance": 4250.25,
    "currency": "USD",
    "lastUpdated": "2025-12-25T10:30:00Z"
  },
  {
    "id": "savings-456",
    "type": "savings",
    "name": "Savings Account",
    "balance": 4500.25,
    "currency": "USD",
    "lastUpdated": "2025-12-25T10:30:00Z"
  }
]
```

---

### 3. Get User Cards
**Endpoint**: `GET /users/{userId}/cards`

**Description**: Fetch all user cards (debit, credit, virtual)

**Response**:
```json
[
  {
    "id": "card-1042",
    "type": "debit",
    "lastFour": "1042",
    "issuer": "Visa",
    "status": "active",
    "expiryDate": "12/26",
    "balance": null
  },
  {
    "id": "card-virtual",
    "type": "virtual",
    "lastFour": "8391",
    "issuer": "Visa",
    "status": "active",
    "expiryDate": "12/26",
    "balance": null
  }
]
```

---

### 4. Get Transactions
**Endpoint**: `GET /users/{userId}/transactions?limit=20`

**Description**: Fetch recent transactions

**Query Parameters**:
- `limit` (optional, default: 20): Number of transactions to return
- `skip` (optional, default: 0): Offset for pagination
- `startDate` (optional): Filter transactions from this date
- `endDate` (optional): Filter transactions until this date
- `category` (optional): Filter by category (shopping, food, gas, etc.)

**Response**:
```json
[
  {
    "id": "txn-1",
    "date": "2025-12-24T15:30:00Z",
    "amount": -45.99,
    "currency": "USD",
    "type": "debit",
    "merchant": "Amazon",
    "category": "shopping",
    "status": "completed",
    "description": "Amazon Purchase",
    "cardId": "card-1042"
  },
  {
    "id": "txn-2",
    "date": "2025-12-23T10:00:00Z",
    "amount": 200,
    "currency": "USD",
    "type": "credit",
    "category": "transfer",
    "status": "completed",
    "description": "Top-up"
  }
]
```

---

### 5. Get User Rewards
**Endpoint**: `GET /users/{userId}/rewards`

**Description**: Fetch user rewards and loyalty programs

**Response**:
```json
[
  {
    "id": "boost-fuel",
    "type": "boost",
    "name": "2× Points on Fuel",
    "value": 2,
    "description": "Earn 2× SwipeSavvy points on all fuel purchases",
    "startDate": "2025-12-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "isActive": true
  },
  {
    "id": "points-balance",
    "type": "points",
    "name": "Available Points",
    "value": 12450,
    "description": "Your current SwipeSavvy points balance",
    "isActive": true
  }
]
```

---

### 6. Get Linked Banks
**Endpoint**: `GET /users/{userId}/linked-banks`

**Description**: Fetch linked bank accounts

**Response**:
```json
[
  {
    "id": "bank-chase",
    "bank": "Chase Bank",
    "accountNumber": "•••• 1920",
    "accountType": "checking",
    "status": "connected",
    "linkedDate": "2025-11-15T00:00:00Z",
    "lastSync": "2025-12-25T10:30:00Z"
  },
  {
    "id": "bank-wellsfargo",
    "bank": "Wells Fargo",
    "accountNumber": "•••• 5432",
    "accountType": "savings",
    "status": "pending",
    "linkedDate": "2025-12-20T00:00:00Z",
    "lastSync": "2025-12-20T15:30:00Z"
  }
]
```

---

### 7. Get Spending Analytics
**Endpoint**: `GET /users/{userId}/analytics/spending`

**Description**: Fetch spending analytics and insights

**Query Parameters**:
- `period` (optional, default: 'month'): 'day', 'week', 'month', 'year'

**Response**:
```json
{
  "daily": 45.99,
  "weekly": 265.75,
  "monthly": 1245.50,
  "yearly": 15680.25,
  "topCategories": [
    {
      "category": "shopping",
      "amount": 450,
      "percentage": 36,
      "transactions": 5
    },
    {
      "category": "food",
      "amount": 320,
      "percentage": 26,
      "transactions": 12
    },
    {
      "category": "entertainment",
      "amount": 250,
      "percentage": 20,
      "transactions": 4
    }
  ],
  "averageTransaction": 125.45,
  "totalTransactions": 10
}
```

---

### 8. Search Transactions
**Endpoint**: `GET /users/{userId}/transactions/search?q={query}`

**Description**: Search transactions by merchant, description, or category

**Query Parameters**:
- `q` (required): Search query
- `limit` (optional, default: 10): Number of results
- `skip` (optional, default: 0): Offset for pagination

**Response**:
```json
[
  {
    "id": "txn-1",
    "date": "2025-12-24T15:30:00Z",
    "amount": -45.99,
    "currency": "USD",
    "type": "debit",
    "merchant": "Amazon",
    "category": "shopping",
    "status": "completed",
    "description": "Amazon Purchase"
  }
]
```

---

## Chat Endpoint

### Chat with AI Concierge
**Endpoint**: `POST /chat`

**Description**: Send a message to AI concierge (server-sent events with streaming response)

**Request**:
```json
{
  "message": "What's my current balance?",
  "user_id": "user_123",
  "session_id": "session-456",
  "context": {
    "screen": "ai-concierge",
    "action": "user-message"
  }
}
```

**Response** (Server-Sent Events):
```
data: {"type":"thinking","content":"Checking user balance..."}
data: {"type":"message","content":"Your checking account has $4,250.25 and your savings account has $4,500.25.","final":true}
data: {"type":"done","message_id":"msg-789"}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired access token"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch user data"
}
```

---

## Data Models

### User Profile
- `id`: string - Unique user ID
- `name`: string - User's full name
- `email`: string - Email address
- `tier`: string - Account tier (Bronze, Silver, Gold, Platinum)
- `kycStatus`: string - KYC verification status (pending, verified, rejected)
- `avatar`: string - Avatar URL (optional)

### Account
- `id`: string - Unique account ID
- `type`: enum - Account type (checking, savings, credit, investment)
- `name`: string - Account name/label
- `balance`: number - Current balance
- `currency`: string - Currency code (USD, EUR, etc.)
- `lastUpdated`: ISO 8601 timestamp

### Card
- `id`: string - Unique card ID
- `type`: enum - Card type (debit, credit, virtual)
- `lastFour`: string - Last 4 digits
- `issuer`: string - Card issuer (Visa, Mastercard, Amex)
- `status`: enum - Card status (active, frozen, inactive)
- `expiryDate`: string - Expiry date (MM/YY)
- `balance`: number - Current balance (for credit cards)

### Transaction
- `id`: string - Unique transaction ID
- `date`: ISO 8601 timestamp
- `amount`: number - Transaction amount (negative for debits, positive for credits)
- `currency`: string - Currency code
- `type`: enum - Transaction type (debit, credit, transfer, fee)
- `merchant`: string - Merchant name (optional)
- `category`: string - Transaction category (shopping, food, gas, etc.)
- `status`: enum - Status (completed, pending, failed)
- `description`: string - Transaction description
- `cardId`: string - Card used (optional)

### Reward
- `id`: string - Unique reward ID
- `type`: enum - Reward type (points, cashback, boost)
- `name`: string - Reward name
- `value`: number - Reward value
- `description`: string - Description
- `startDate`: ISO 8601 timestamp (optional)
- `endDate`: ISO 8601 timestamp (optional)
- `isActive`: boolean - Is reward active

### LinkedBank
- `id`: string - Unique linked bank ID
- `bank`: string - Bank name
- `accountNumber`: string - Account number (masked)
- `accountType`: string - Account type
- `status`: enum - Link status (connected, pending, error)
- `linkedDate`: ISO 8601 timestamp
- `lastSync`: ISO 8601 timestamp

---

## Implementation Notes

1. **Caching**: Frontend caches user context for 5 minutes
2. **Pagination**: Use `limit` and `skip` parameters for large datasets
3. **Timestamps**: All timestamps in ISO 8601 format (UTC)
4. **Streaming**: Chat endpoint uses Server-Sent Events for real-time responses
5. **Rate Limiting**: Recommend 100 requests/minute per user
6. **CORS**: Enable CORS for mobile app domain
7. **Fallback Data**: Frontend has mock data for development/offline mode

---

## Example Integration

```typescript
// Create AI client with context
const dataService = new DataService(
  'http://localhost:8002/api/v1',
  accessToken,
  userId
);

// Fetch user context
const context = await dataService.getUserContext();

// Build personalized system prompt
const systemPrompt = aiClient.buildSystemPrompt(context);

// Send message to AI
const stream = await aiClient.chat({
  message: "What's my balance?",
  session_id: sessionId
});
```

---

## Future Enhancements

- [ ] Transaction categorization ML
- [ ] Spending anomaly detection
- [ ] Automatic bill payment scheduling
- [ ] Investment recommendations
- [ ] Savings goal tracking
- [ ] Credit score monitoring
- [ ] Fraud detection alerts
- [ ] Multi-currency support
