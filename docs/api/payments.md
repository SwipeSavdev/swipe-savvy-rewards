# Payments API

Base path: `/api/v1/payments`

Source: `payments.py`

All endpoints require **JWT Bearer** authentication. Integrates with Authorize.Net for secure payment processing.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/create-intent` | JWT Bearer | Create a payment intent |
| POST | `/confirm` | JWT Bearer | Confirm and process a payment |
| POST | `/{payment_id}/refund` | JWT Bearer | Refund a payment |
| GET | `/history` | JWT Bearer | Get payment history |
| GET | `/{payment_id}` | JWT Bearer | Get payment details |
| POST | `/subscriptions` | JWT Bearer | Create a subscription |
| POST | `/subscriptions/{subscription_id}/cancel` | JWT Bearer | Cancel a subscription |
| GET | `/subscriptions/user/{user_id}` | JWT Bearer | Get user's active subscription |

---

## POST /api/v1/payments/create-intent

Create a payment intent to initiate a payment flow. Returns a client secret for frontend confirmation.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "amount": 49.99,
  "currency": "USD",
  "description": "Premium subscription payment",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "order_id": "ORD-12345",
    "plan": "premium"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | Yes | Payment amount (must be > 0) |
| currency | string | No | Currency code (default: `USD`) |
| description | string | No | Payment description |
| merchant_id | UUID | No | Merchant ID if applicable |
| metadata | object | No | Additional metadata |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_secret": "pi_abc123_secret_xyz789",
    "stripe_id": "pi_abc123",
    "amount": 49.99,
    "currency": "USD",
    "status": "requires_confirmation"
  }
}
```

**Errors:**
- `400` - Invalid payment parameters

---

## POST /api/v1/payments/confirm

Confirm and process a previously created payment intent.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| payment_id | UUID | Yes | Payment ID to confirm |

**Request Body:**

```json
{
  "payment_method_id": "pm_card_visa_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| payment_method_id | string | Yes | Payment method ID |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "payment_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "amount": 49.99,
    "currency": "USD",
    "completed_at": "2025-06-01T14:30:00"
  }
}
```

**Errors:**
- `404` - Payment not found

---

## POST /api/v1/payments/{payment_id}/refund

Refund a completed payment (full or partial).

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| payment_id | UUID | Payment ID to refund |

**Request Body:**

```json
{
  "amount": 25.00,
  "reason": "Customer requested partial refund"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | No | Refund amount (null for full refund) |
| reason | string | No | Reason for refund |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "refund_id": "ref_abc123",
    "payment_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 25.00,
    "status": "refunded",
    "refunded_at": "2025-06-01T15:00:00"
  }
}
```

**Errors:**
- `404` - Payment not found

---

## GET /api/v1/payments/history

Get paginated payment history for the authenticated user.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Number of records |
| offset | int | 0 | Pagination offset |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "payments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "completed",
        "amount": 49.99,
        "currency": "USD",
        "description": "Premium subscription",
        "created_at": "2025-06-01T14:30:00",
        "completed_at": "2025-06-01T14:30:05"
      }
    ]
  }
}
```

---

## GET /api/v1/payments/{payment_id}

Get details for a specific payment.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| payment_id | UUID | Payment ID |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "amount": 49.99,
    "currency": "USD",
    "description": "Premium subscription",
    "merchant_id": "550e8400-e29b-41d4-a716-446655440001",
    "created_at": "2025-06-01T14:30:00",
    "completed_at": "2025-06-01T14:30:05",
    "metadata": {
      "order_id": "ORD-12345"
    }
  }
}
```

**Errors:**
- `404` - Payment not found

---

## POST /api/v1/payments/subscriptions

Create a new subscription plan.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "plan": "pro",
  "payment_method_id": "pm_card_visa_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| plan | string | Yes | Plan type: `starter`, `pro`, or `enterprise` |
| payment_method_id | string | Yes | Payment method ID |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "plan": "pro",
    "status": "active",
    "amount": 29.99,
    "current_period_start": "2025-06-01T00:00:00",
    "current_period_end": "2025-07-01T00:00:00"
  }
}
```

**Errors:**
- `400` - User already has an active subscription

---

## POST /api/v1/payments/subscriptions/{subscription_id}/cancel

Cancel an active subscription.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| subscription_id | UUID | Subscription ID |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | No | Cancellation reason |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "status": "cancelled",
    "cancelled_at": "2025-06-15T10:00:00",
    "effective_end_date": "2025-07-01T00:00:00"
  }
}
```

**Errors:**
- `404` - Subscription not found

---

## GET /api/v1/payments/subscriptions/user/{user_id}

Get the active subscription for the authenticated user.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "sub_abc123",
    "plan": "pro",
    "status": "active",
    "amount": 29.99,
    "current_period_start": "2025-06-01T00:00:00",
    "current_period_end": "2025-07-01T00:00:00"
  }
}
```

**Errors:**
- `404` - No active subscription
