# FIS Card Issuance API

Base path: `/api/v1/fis/cards`

Source: `fis_cards.py`

All endpoints require **JWT Bearer** authentication. Integrates with FIS Global Payment One for card management.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/issue/virtual` | JWT Bearer | Issue a new virtual card |
| POST | `/issue/physical` | JWT Bearer | Order a physical card |
| GET | `/` | JWT Bearer | List all user's cards |
| GET | `/{card_id}` | JWT Bearer | Get card details |
| GET | `/{card_id}/sensitive` | JWT Bearer | Get sensitive card data (PAN, CVV) |
| POST | `/{card_id}/activate` | JWT Bearer | Activate a card |
| POST | `/{card_id}/replace` | JWT Bearer | Replace a card |
| DELETE | `/{card_id}` | JWT Bearer | Cancel/close a card |
| GET | `/{card_id}/shipping` | JWT Bearer | Get shipping status for physical card |

---

## POST /api/v1/fis/cards/issue/virtual

Issue a new virtual card for instant digital use.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "cardholder_name": "John Doe",
  "nickname": "Online Shopping Card",
  "set_as_primary": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cardholder_name | string | Yes | Name on the card |
| nickname | string | No | User-friendly card label |
| set_as_primary | boolean | No | Set as primary card (default: false) |

**Response `200`:**

```json
{
  "success": true,
  "message": "Virtual card issued successfully",
  "data": {
    "card_id": "card_abc123",
    "card_type": "virtual",
    "last_four": "4242",
    "status": "active",
    "expiry_date": "12/28",
    "cardholder_name": "John Doe",
    "nickname": "Online Shopping Card",
    "is_primary": false
  }
}
```

**Errors:**
- `400` - Failed to issue virtual card

---

## POST /api/v1/fis/cards/issue/physical

Order a physical card to be mailed to the user.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "cardholder_name": "John Doe",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "expedited": false,
  "nickname": "Main Card",
  "set_as_primary": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cardholder_name | string | Yes | Name on the card |
| shipping_address | object | Yes | Mailing address object |
| expedited | boolean | No | Expedited shipping (default: false) |
| nickname | string | No | User-friendly card label |
| set_as_primary | boolean | No | Set as primary card (default: false) |

**Response `200`:**

```json
{
  "success": true,
  "message": "Physical card ordered successfully",
  "data": {
    "card_id": "card_def456",
    "card_type": "physical",
    "status": "ordered",
    "cardholder_name": "John Doe",
    "estimated_delivery": "2025-06-10",
    "tracking_number": null,
    "shipping_method": "standard"
  }
}
```

---

## GET /api/v1/fis/cards

Get all cards for the authenticated user.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "card_id": "card_abc123",
      "card_type": "virtual",
      "last_four": "4242",
      "status": "active",
      "expiry_date": "12/28",
      "cardholder_name": "John Doe",
      "nickname": "Online Shopping Card",
      "is_primary": false,
      "is_locked": false
    },
    {
      "card_id": "card_def456",
      "card_type": "physical",
      "last_four": "1042",
      "status": "active",
      "expiry_date": "06/29",
      "cardholder_name": "John Doe",
      "nickname": "Main Card",
      "is_primary": true,
      "is_locked": false
    }
  ]
}
```

---

## GET /api/v1/fis/cards/{card_id}

Get detailed information about a specific card.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| card_id | string | Card identifier |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "card_id": "card_abc123",
    "card_type": "virtual",
    "last_four": "4242",
    "status": "active",
    "expiry_date": "12/28",
    "cardholder_name": "John Doe",
    "nickname": "Online Shopping Card",
    "is_primary": false,
    "is_locked": false,
    "created_at": "2025-01-15T10:00:00",
    "activated_at": "2025-01-15T10:00:00"
  }
}
```

**Errors:**
- `404` - Card not found

---

## GET /api/v1/fis/cards/{card_id}/sensitive

Get sensitive card data including full PAN and CVV. Requires additional security.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| card_id | string | Card identifier |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| include_pan | boolean | false | Include full card number |
| include_cvv | boolean | false | Include CVV code |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "card_id": "card_abc123",
    "pan": "4242424242424242",
    "cvv": "123",
    "expiry_date": "12/28",
    "cardholder_name": "John Doe"
  }
}
```

---

## POST /api/v1/fis/cards/{card_id}/activate

Activate a card (typically a physical card received in the mail).

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "last_four": "1042",
  "activation_code": "ABC123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| last_four | string | Yes | Last 4 digits of card number |
| activation_code | string | No | Activation code from mailer |

**Response `200`:**

```json
{
  "success": true,
  "message": "Card activated successfully",
  "data": {
    "card_id": "card_def456",
    "status": "active",
    "activated_at": "2025-06-01T14:00:00"
  }
}
```

---

## POST /api/v1/fis/cards/{card_id}/replace

Request a replacement card (for lost, stolen, damaged, or expired cards).

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "reason": "lost",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "expedited": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | `lost`, `stolen`, `damaged`, or `expired` |
| shipping_address | object | No | New address (uses existing if omitted) |
| expedited | boolean | No | Expedited shipping (default: false) |

**Response `200`:**

```json
{
  "success": true,
  "message": "Card replacement ordered",
  "data": {
    "new_card_id": "card_ghi789",
    "old_card_id": "card_def456",
    "status": "ordered",
    "estimated_delivery": "2025-06-05"
  }
}
```

---

## DELETE /api/v1/fis/cards/{card_id}

Permanently cancel/close a card.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "reason": "No longer needed"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for cancellation |

**Response `200`:**

```json
{
  "success": true,
  "message": "Card cancelled successfully"
}
```

---

## GET /api/v1/fis/cards/{card_id}/shipping

Get shipping status and tracking information for a physical card order.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "card_id": "card_def456",
    "shipping_status": "in_transit",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "UPS",
    "estimated_delivery": "2025-06-10",
    "shipped_at": "2025-06-03T10:00:00",
    "events": [
      {
        "status": "shipped",
        "location": "Card Production Center",
        "timestamp": "2025-06-03T10:00:00"
      },
      {
        "status": "in_transit",
        "location": "Distribution Hub",
        "timestamp": "2025-06-04T08:00:00"
      }
    ]
  }
}
```
