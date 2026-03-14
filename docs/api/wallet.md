# Wallet & Transfers API

Base path: `/api/v1`

Source: `mobile_api.py`

All endpoints require **JWT Bearer** authentication.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/wallet/balance` | JWT Bearer | Get wallet balance |
| GET | `/wallet/transactions` | JWT Bearer | Get wallet transactions |
| GET | `/wallet/payment-methods` | JWT Bearer | Get payment methods |
| POST | `/wallet/add-money` | JWT Bearer | Add money to wallet |
| POST | `/wallet/withdraw` | JWT Bearer | Withdraw money from wallet |
| POST | `/transfers` | JWT Bearer | Submit a money transfer |
| GET | `/transfers/recipients` | JWT Bearer | Get recent transfer recipients |

---

## GET /api/v1/wallet/balance

Get the current wallet balance including available and pending amounts.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "available": 2847.50,
  "pending": 125.00,
  "currency": "USD"
}
```

---

## GET /api/v1/wallet/transactions

Get wallet transaction history.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 10 | Number of transactions (1-100) |

**Response `200`:**

```json
[
  {
    "id": "wtx_1",
    "type": "deposit",
    "amount": 500.00,
    "currency": "USD",
    "status": "completed",
    "description": "Bank Transfer",
    "recipientName": null,
    "createdAt": "2025-06-01T12:00:00+00:00"
  },
  {
    "id": "wtx_2",
    "type": "payment",
    "amount": 45.99,
    "currency": "USD",
    "status": "completed",
    "description": "Amazon Purchase",
    "recipientName": "Amazon",
    "createdAt": "2025-05-31T12:00:00+00:00"
  },
  {
    "id": "wtx_3",
    "type": "transfer",
    "amount": 100.00,
    "currency": "USD",
    "status": "completed",
    "description": "Sent Money",
    "recipientName": "Jordan",
    "createdAt": "2025-05-30T12:00:00+00:00"
  }
]
```

---

## GET /api/v1/wallet/payment-methods

Get the user's payment methods (cards and bank accounts).

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "pm_1",
    "type": "card",
    "lastFour": "4242",
    "brand": "Visa",
    "bankName": null,
    "isDefault": true,
    "expiryDate": "12/26"
  },
  {
    "id": "pm_2",
    "type": "bank_account",
    "lastFour": "1920",
    "brand": null,
    "bankName": "Chase Bank",
    "isDefault": false,
    "expiryDate": null
  }
]
```

---

## POST /api/v1/wallet/add-money

Add funds to the wallet from a linked payment method.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | Yes | Amount to add |
| paymentMethodId | string | Yes | Source payment method ID |

**Response `200`:**

```json
{
  "success": true,
  "transactionId": "wtx_550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- `500` - Failed to add money

---

## POST /api/v1/wallet/withdraw

Withdraw funds from the wallet to a linked bank account. Withdrawal status begins as `pending`.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | Yes | Amount to withdraw |
| paymentMethodId | string | Yes | Destination payment method ID |

**Response `200`:**

```json
{
  "success": true,
  "transactionId": "wtx_550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- `500` - Failed to withdraw money

---

## POST /api/v1/transfers

Submit a peer-to-peer money transfer.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "recipientId": "rec_1",
  "recipientName": "Jordan",
  "amount": 100.00,
  "currency": "USD",
  "fundingSourceId": "pm_1",
  "memo": "Dinner last night",
  "type": "send"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recipientId | string | Yes | Recipient identifier |
| recipientName | string | Yes | Recipient display name |
| amount | float | Yes | Transfer amount |
| currency | string | No | Currency code (default: `USD`) |
| fundingSourceId | string | Yes | Payment method to fund from |
| memo | string | No | Transfer memo/note |
| type | string | No | Transfer type (default: `send`) |

**Response `200`:**

```json
{
  "success": true,
  "transferId": "wtx_550e8400-e29b-41d4-a716-446655440000",
  "status": "completed"
}
```

**Errors:**
- `500` - Failed to submit transfer

---

## GET /api/v1/transfers/recipients

Get a list of recent transfer recipients for quick-send functionality.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "rec_1",
    "name": "Jordan",
    "handle": "@jordan",
    "avatar": "JO"
  },
  {
    "id": "rec_2",
    "name": "Emma",
    "handle": "@emma",
    "avatar": "EM"
  },
  {
    "id": "rec_3",
    "name": "Alex",
    "handle": "@alex",
    "avatar": "AL"
  },
  {
    "id": "rec_4",
    "name": "Bank",
    "handle": "ACH Transfer",
    "avatar": "BA"
  }
]
```
