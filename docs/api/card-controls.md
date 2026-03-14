# Card Controls API

Base path: `/api/v1/fis/cards`

Source: `fis_cards.py`

All endpoints require **JWT Bearer** authentication. These endpoints manage card security controls, spending limits, channel restrictions, geographic controls, transaction alerts, and PIN management.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/{card_id}/lock` | JWT Bearer | Lock card (temporary) |
| POST | `/{card_id}/unlock` | JWT Bearer | Unlock card |
| POST | `/{card_id}/freeze` | JWT Bearer | Freeze card (fraud) |
| POST | `/{card_id}/unfreeze` | JWT Bearer | Unfreeze card |
| GET | `/{card_id}/controls` | JWT Bearer | Get all card controls |
| GET | `/{card_id}/limits` | JWT Bearer | Get spending limits |
| PUT | `/{card_id}/limits` | JWT Bearer | Set spending limits |
| DELETE | `/{card_id}/limits` | JWT Bearer | Remove spending limits |
| PUT | `/{card_id}/controls/channels` | JWT Bearer | Set channel controls |
| POST | `/{card_id}/controls/international/enable` | JWT Bearer | Enable international |
| POST | `/{card_id}/controls/international/disable` | JWT Bearer | Disable international |
| PUT | `/{card_id}/controls/merchants` | JWT Bearer | Set merchant controls |
| POST | `/{card_id}/controls/merchants/block` | JWT Bearer | Block merchant category |
| POST | `/{card_id}/controls/merchants/unblock` | JWT Bearer | Unblock merchant category |
| PUT | `/{card_id}/controls/geo` | JWT Bearer | Set geographic controls |
| POST | `/{card_id}/controls/geo/block` | JWT Bearer | Block a country |
| POST | `/{card_id}/controls/geo/unblock` | JWT Bearer | Unblock a country |
| PUT | `/{card_id}/alerts` | JWT Bearer | Set alert preferences |
| POST | `/{card_id}/pin/set` | JWT Bearer | Set initial PIN |
| PUT | `/{card_id}/pin/change` | JWT Bearer | Change PIN |
| POST | `/{card_id}/pin/reset` | JWT Bearer | Reset forgotten PIN |
| POST | `/{card_id}/pin/validate` | JWT Bearer | Validate PIN |
| GET | `/{card_id}/pin/status` | JWT Bearer | Get PIN status |
| POST | `/{card_id}/pin/unlock` | JWT Bearer | Unlock locked PIN |
| POST | `/{card_id}/pin/reset/otp` | JWT Bearer | Request PIN reset OTP |

---

## Lock / Unlock / Freeze / Unfreeze

### POST /api/v1/fis/cards/{card_id}/lock

Temporarily lock a card. The card can be unlocked later.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "reason": "Suspicious activity"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | No | Reason for locking |

**Response `200`:**

```json
{
  "success": true,
  "message": "Card locked successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/unlock

Unlock a previously locked card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "Card unlocked successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/freeze

Freeze a card due to suspected fraud. More restrictive than lock.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "reason": "fraud_suspected"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Card frozen successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/unfreeze

Unfreeze a previously frozen card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "Card unfrozen successfully"
}
```

---

## Card Controls Summary

### GET /api/v1/fis/cards/{card_id}/controls

Get all card controls in a single response.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "card_id": "card_abc123",
    "is_locked": false,
    "is_frozen": false,
    "spending_limits": {
      "daily_limit": 1000.00,
      "weekly_limit": 5000.00,
      "monthly_limit": 20000.00,
      "per_transaction_limit": 500.00
    },
    "channel_controls": {
      "atm_enabled": true,
      "pos_enabled": true,
      "ecommerce_enabled": true,
      "contactless_enabled": true,
      "international_enabled": false
    },
    "merchant_controls": {
      "blocked_mcc_codes": ["7995"],
      "allowed_mcc_codes": null
    },
    "geo_controls": {
      "allowed_countries": ["US"],
      "blocked_countries": []
    },
    "alert_preferences": {
      "alert_on_transaction": true,
      "alert_on_decline": true,
      "alert_on_international": true,
      "alert_threshold": 100.00
    }
  }
}
```

---

## Spending Limits

### GET /api/v1/fis/cards/{card_id}/limits

Get current spending limits for a card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "daily_limit": 1000.00,
    "weekly_limit": 5000.00,
    "monthly_limit": 20000.00,
    "per_transaction_limit": 500.00,
    "daily_spent": 250.00,
    "weekly_spent": 1200.00,
    "monthly_spent": 3500.00
  }
}
```

---

### PUT /api/v1/fis/cards/{card_id}/limits

Set or update spending limits. All fields are optional; only provided fields are updated.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "daily_limit": 1000.00,
  "weekly_limit": 5000.00,
  "monthly_limit": 20000.00,
  "per_transaction_limit": 500.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| daily_limit | float | No | Maximum daily spend |
| weekly_limit | float | No | Maximum weekly spend |
| monthly_limit | float | No | Maximum monthly spend |
| per_transaction_limit | float | No | Maximum per-transaction |

**Response `200`:**

```json
{
  "success": true,
  "message": "Spending limits updated"
}
```

---

### DELETE /api/v1/fis/cards/{card_id}/limits

Remove all spending limits from a card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "Spending limits removed"
}
```

---

## Channel Controls

### PUT /api/v1/fis/cards/{card_id}/controls/channels

Set channel controls (which transaction channels are enabled/disabled).

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "atm_enabled": true,
  "pos_enabled": true,
  "ecommerce_enabled": true,
  "contactless_enabled": true,
  "international_enabled": false
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| atm_enabled | boolean | true | Allow ATM withdrawals |
| pos_enabled | boolean | true | Allow point-of-sale purchases |
| ecommerce_enabled | boolean | true | Allow online purchases |
| contactless_enabled | boolean | true | Allow contactless/NFC payments |
| international_enabled | boolean | false | Allow international transactions |

**Response `200`:**

```json
{
  "success": true,
  "message": "Channel controls updated"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/international/enable

Enable international transactions for a card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "International transactions enabled"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/international/disable

Disable international transactions for a card.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "International transactions disabled"
}
```

---

## Merchant Controls

### PUT /api/v1/fis/cards/{card_id}/controls/merchants

Set merchant category controls using MCC codes.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "blocked_mcc_codes": ["7995", "7994"],
  "allowed_mcc_codes": null
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| blocked_mcc_codes | string[] | `[]` | MCC codes to block |
| allowed_mcc_codes | string[] | null | If set, only these MCCs allowed |

**Response `200`:**

```json
{
  "success": true,
  "message": "Merchant controls updated"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/merchants/block

Block a merchant category by human-readable name.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "category": "gambling"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Category 'gambling' blocked"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/merchants/unblock

Unblock a previously blocked merchant category.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "category": "gambling"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Category 'gambling' unblocked"
}
```

---

## Geographic Controls

### PUT /api/v1/fis/cards/{card_id}/controls/geo

Set geographic controls for allowed/blocked countries.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "allowed_countries": ["US", "CA", "GB"],
  "blocked_countries": ["RU", "CN"]
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| allowed_countries | string[] | `["US"]` | ISO country codes allowed |
| blocked_countries | string[] | `[]` | ISO country codes blocked |

**Response `200`:**

```json
{
  "success": true,
  "message": "Geographic controls updated"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/geo/block

Block transactions from a specific country.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "country_code": "RU"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Country 'RU' blocked"
}
```

---

### POST /api/v1/fis/cards/{card_id}/controls/geo/unblock

Unblock transactions from a specific country.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "country_code": "RU"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Country 'RU' unblocked"
}
```

---

## Alert Preferences

### PUT /api/v1/fis/cards/{card_id}/alerts

Set transaction alert preferences for a card.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "alert_on_transaction": true,
  "alert_on_decline": true,
  "alert_on_international": true,
  "alert_threshold": 100.00
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| alert_on_transaction | boolean | true | Alert on every transaction |
| alert_on_decline | boolean | true | Alert on declined transactions |
| alert_on_international | boolean | true | Alert on international transactions |
| alert_threshold | float | null | Alert when amount exceeds this value |

**Response `200`:**

```json
{
  "success": true,
  "message": "Alert preferences updated"
}
```

---

## PIN Management

### POST /api/v1/fis/cards/{card_id}/pin/set

Set the initial PIN for a card.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "pin": "1234"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| pin | string | Yes | Exactly 4 digits |

**Response `200`:**

```json
{
  "success": true,
  "message": "PIN set successfully"
}
```

---

### PUT /api/v1/fis/cards/{card_id}/pin/change

Change the existing PIN.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "current_pin": "1234",
  "new_pin": "5678"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| current_pin | string | Yes | Exactly 4 digits |
| new_pin | string | Yes | Exactly 4 digits |

**Response `200`:**

```json
{
  "success": true,
  "message": "PIN changed successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/pin/reset

Reset a forgotten PIN with identity verification.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "verification_method": "otp",
  "verification_data": {
    "otp_code": "123456"
  },
  "new_pin": "5678"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| verification_method | string | Yes | Verification method (e.g., `otp`, `security_questions`) |
| verification_data | object | Yes | Method-specific verification data |
| new_pin | string | Yes | New 4-digit PIN |

**Response `200`:**

```json
{
  "success": true,
  "message": "PIN reset successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/pin/validate

Validate a PIN for sensitive operations (e.g., before viewing full card number).

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "pin": "1234",
  "operation": "view_card_details"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| pin | string | Yes | 4-digit PIN |
| operation | string | No | Operation requiring PIN validation |

**Response `200`:**

```json
{
  "success": true,
  "message": "PIN validated"
}
```

---

### GET /api/v1/fis/cards/{card_id}/pin/status

Get the current PIN status (set, not set, locked, etc.).

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "is_set": true,
    "is_locked": false,
    "failed_attempts": 0,
    "last_changed": "2025-01-15T10:00:00"
  }
}
```

---

### POST /api/v1/fis/cards/{card_id}/pin/unlock

Unlock a PIN that was locked due to too many failed attempts.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "PIN unlocked successfully"
}
```

---

### POST /api/v1/fis/cards/{card_id}/pin/reset/otp

Request an OTP to be sent for PIN reset verification.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```
