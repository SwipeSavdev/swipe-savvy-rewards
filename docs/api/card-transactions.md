# Card Transactions API

Base path: `/api/v1/fis/cards`

Source: `fis_transactions.py`

All endpoints require **JWT Bearer** authentication. Provides transaction history, analytics, and dispute management for FIS-issued cards.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/{card_id}/transactions` | JWT Bearer | Get filtered transactions |
| GET | `/{card_id}/transactions/recent` | JWT Bearer | Get recent transactions |
| GET | `/{card_id}/transactions/pending` | JWT Bearer | Get pending transactions |
| GET | `/{card_id}/transactions/{transaction_id}` | JWT Bearer | Get transaction details |
| GET | `/{card_id}/transactions/summary` | JWT Bearer | Get transaction summary |
| GET | `/{card_id}/transactions/categories` | JWT Bearer | Spending by category |
| GET | `/{card_id}/transactions/merchants` | JWT Bearer | Spending by merchant |
| POST | `/{card_id}/transactions/{transaction_id}/notes` | JWT Bearer | Add transaction note |
| PUT | `/{card_id}/transactions/{transaction_id}/category` | JWT Bearer | Categorize transaction |
| POST | `/{card_id}/transactions/{transaction_id}/dispute` | JWT Bearer | Initiate dispute |
| GET | `/{card_id}/disputes` | JWT Bearer | List disputes |
| GET | `/{card_id}/disputes/{dispute_id}` | JWT Bearer | Get dispute details |
| POST | `/{card_id}/disputes/{dispute_id}/documents` | JWT Bearer | Add dispute document |

---

## GET /api/v1/fis/cards/{card_id}/transactions

Get transactions for a card with comprehensive filtering and pagination.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| card_id | string | Card identifier |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| start_date | date | null | Start date filter (YYYY-MM-DD) |
| end_date | date | null | End date filter (YYYY-MM-DD) |
| min_amount | float | null | Minimum transaction amount |
| max_amount | float | null | Maximum transaction amount |
| transaction_type | string | null | Filter by type (purchase, refund, withdrawal, etc.) |
| status | string | null | Filter by status (completed, pending, declined) |
| channel | string | null | Filter by channel (pos, ecommerce, atm, contactless) |
| merchant_name | string | null | Filter by merchant name (partial match) |
| mcc_code | string | null | Filter by MCC code |
| category | string | null | Filter by category |
| page | int | 1 | Page number (min: 1) |
| page_size | int | 25 | Items per page (1-100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_abc123",
        "card_id": "card_abc123",
        "transaction_type": "purchase",
        "amount": 45.99,
        "currency": "USD",
        "merchant_name": "Amazon.com",
        "merchant_category": "Online Shopping",
        "mcc_code": "5411",
        "status": "completed",
        "channel": "ecommerce",
        "created_at": "2025-06-01T14:30:00",
        "posted_at": "2025-06-01T16:00:00",
        "description": "AMAZON.COM*MK1234",
        "category": "Shopping",
        "is_international": false
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 25,
      "total": 150,
      "total_pages": 6
    }
  }
}
```

---

## GET /api/v1/fis/cards/{card_id}/transactions/recent

Get the most recent transactions for a card.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 10 | Number of transactions (1-50) |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "txn_abc123",
      "transaction_type": "purchase",
      "amount": 45.99,
      "merchant_name": "Amazon.com",
      "status": "completed",
      "created_at": "2025-06-01T14:30:00"
    }
  ]
}
```

---

## GET /api/v1/fis/cards/{card_id}/transactions/pending

Get pending (not yet posted) transactions -- authorizations that have not settled.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "auth_xyz789",
      "transaction_type": "purchase",
      "amount": 120.00,
      "merchant_name": "Best Buy",
      "status": "pending",
      "channel": "pos",
      "created_at": "2025-06-01T16:00:00",
      "estimated_post_date": "2025-06-03"
    }
  ]
}
```

---

## GET /api/v1/fis/cards/{card_id}/transactions/{transaction_id}

Get full details of a specific transaction.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "txn_abc123",
    "card_id": "card_abc123",
    "transaction_type": "purchase",
    "amount": 45.99,
    "currency": "USD",
    "merchant_name": "Amazon.com",
    "merchant_category": "Online Shopping",
    "mcc_code": "5411",
    "status": "completed",
    "channel": "ecommerce",
    "created_at": "2025-06-01T14:30:00",
    "posted_at": "2025-06-01T16:00:00",
    "description": "AMAZON.COM*MK1234",
    "category": "Shopping",
    "is_international": false,
    "notes": "Monthly subscription",
    "dispute_status": null
  }
}
```

**Errors:**
- `404` - Transaction not found

---

## GET /api/v1/fis/cards/{card_id}/transactions/summary

Get a transaction summary for a date range.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start_date | date | Yes | Start date (YYYY-MM-DD) |
| end_date | date | Yes | End date (YYYY-MM-DD) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2025-05-01",
      "end_date": "2025-05-31"
    },
    "total_transactions": 87,
    "total_purchases": 75,
    "total_refunds": 5,
    "total_withdrawals": 7,
    "total_amount": 3245.67,
    "average_transaction": 37.30,
    "largest_transaction": 299.99,
    "most_active_day": "2025-05-15"
  }
}
```

---

## GET /api/v1/fis/cards/{card_id}/transactions/categories

Get spending breakdown by category for a date range.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start_date | date | Yes | Start date (YYYY-MM-DD) |
| end_date | date | Yes | End date (YYYY-MM-DD) |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "category": "Shopping",
      "amount": 1200.00,
      "percentage": 37.0,
      "transaction_count": 25
    },
    {
      "category": "Food & Dining",
      "amount": 800.00,
      "percentage": 24.6,
      "transaction_count": 35
    },
    {
      "category": "Transportation",
      "amount": 450.00,
      "percentage": 13.9,
      "transaction_count": 15
    }
  ]
}
```

---

## GET /api/v1/fis/cards/{card_id}/transactions/merchants

Get spending breakdown by merchant for a date range.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| start_date | date | Yes | Start date (YYYY-MM-DD) |
| end_date | date | Yes | End date (YYYY-MM-DD) |
| limit | int | 10 | Number of merchants (1-50) |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "merchant_name": "Amazon.com",
      "amount": 450.00,
      "transaction_count": 12,
      "category": "Shopping"
    },
    {
      "merchant_name": "Starbucks",
      "amount": 120.00,
      "transaction_count": 24,
      "category": "Food & Dining"
    }
  ]
}
```

---

## POST /api/v1/fis/cards/{card_id}/transactions/{transaction_id}/notes

Add a personal note to a transaction.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "note": "Monthly AWS subscription"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note | string | Yes | Note text |

**Response `200`:**

```json
{
  "success": true,
  "message": "Note added"
}
```

---

## PUT /api/v1/fis/cards/{card_id}/transactions/{transaction_id}/category

Manually categorize or re-categorize a transaction.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "category": "Business Expense"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category | string | Yes | Category name |

**Response `200`:**

```json
{
  "success": true,
  "message": "Transaction categorized"
}
```

---

## POST /api/v1/fis/cards/{card_id}/transactions/{transaction_id}/dispute

Initiate a dispute for a transaction.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "reason": "unauthorized",
  "description": "I did not make this purchase. My card was compromised.",
  "expected_credit_amount": 45.99,
  "supporting_documents": ["https://storage.example.com/receipt.pdf"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Dispute reason (see values below) |
| description | string | Yes | Detailed description |
| expected_credit_amount | float | No | Expected refund amount |
| supporting_documents | string[] | No | URLs of supporting documents |

**Dispute Reasons:**
- `unauthorized` - Unauthorized transaction
- `duplicate` - Duplicate charge
- `not_received` - Goods/services not received
- `defective` - Defective goods/services
- `incorrect_amount` - Incorrect amount charged
- `other` - Other reason

**Response `200`:**

```json
{
  "success": true,
  "message": "Dispute initiated",
  "data": {
    "dispute_id": "disp_abc123",
    "transaction_id": "txn_abc123",
    "status": "open",
    "reason": "unauthorized",
    "created_at": "2025-06-01T14:30:00",
    "estimated_resolution": "2025-06-15"
  }
}
```

---

## GET /api/v1/fis/cards/{card_id}/disputes

List all disputes for a card.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | null | Filter by status (open, in_review, resolved, denied) |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "dispute_id": "disp_abc123",
      "transaction_id": "txn_abc123",
      "amount": 45.99,
      "reason": "unauthorized",
      "status": "in_review",
      "created_at": "2025-06-01T14:30:00"
    }
  ]
}
```

---

## GET /api/v1/fis/cards/{card_id}/disputes/{dispute_id}

Get detailed information about a specific dispute.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "dispute_id": "disp_abc123",
    "transaction_id": "txn_abc123",
    "amount": 45.99,
    "reason": "unauthorized",
    "description": "I did not make this purchase.",
    "status": "in_review",
    "created_at": "2025-06-01T14:30:00",
    "updated_at": "2025-06-02T10:00:00",
    "documents": [
      {
        "url": "https://storage.example.com/receipt.pdf",
        "type": "receipt",
        "uploaded_at": "2025-06-01T14:30:00"
      }
    ],
    "resolution": null,
    "credit_amount": null
  }
}
```

**Errors:**
- `404` - Dispute not found

---

## POST /api/v1/fis/cards/{card_id}/disputes/{dispute_id}/documents

Add a supporting document to an existing dispute.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "document_url": "https://storage.example.com/statement.pdf",
  "document_type": "bank_statement"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| document_url | string | Yes | URL of the document |
| document_type | string | Yes | Type of document |

**Response `200`:**

```json
{
  "success": true,
  "message": "Document added to dispute"
}
```
