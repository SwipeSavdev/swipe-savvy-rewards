# Push Notifications API

Base path: `/api/v1/notifications`

Source: `notifications.py`

All endpoints require **JWT Bearer** authentication. Supports both legacy Firebase-based and AWS SNS-based push notification delivery.

---

## Endpoints Overview

### Legacy Device Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register-device` | JWT Bearer | Register device for push notifications |
| POST | `/unregister-device/{device_id}` | JWT Bearer | Unregister a device |

### Preferences

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/preferences` | JWT Bearer | Update notification preferences |
| GET | `/preferences` | JWT Bearer | Get notification preferences |

### History & Interaction

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/history` | JWT Bearer | Get notification history |
| POST | `/mark-as-read/{notification_id}` | JWT Bearer | Mark notification as read |

### Event Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/send-event` | JWT Bearer | Send event-based notification |
| POST | `/test` | JWT Bearer | Send test notification |

### AWS SNS Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/sns/register-device` | JWT Bearer | Register device with SNS |
| POST | `/sns/send` | JWT Bearer | Send notification via SNS |
| DELETE | `/sns/unregister/{endpoint_arn}` | JWT Bearer | Unregister SNS endpoint |
| GET | `/sns/status/{endpoint_arn}` | JWT Bearer | Get SNS endpoint status |

---

## POST /api/v1/notifications/register-device

Register a device for push notifications. Supports multiple devices per user.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "device_token": "fcm_token_abc123...",
  "device_type": "ios",
  "device_name": "iPhone 15 Pro"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| device_token | string | Yes | FCM/APNs device token |
| device_type | string | No | `ios`, `android`, or `web` (default: `ios`) |
| device_name | string | No | Friendly device name |

**Response `200`:**

```json
{
  "success": true,
  "message": "Device registered successfully",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "device_id": "dev_abc123",
    "device_type": "ios",
    "device_name": "iPhone 15 Pro",
    "registered_at": "2025-06-01T14:00:00"
  }
}
```

---

## POST /api/v1/notifications/unregister-device/{device_id}

Unregister a device from push notifications.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| device_id | string | Device ID from registration response |

**Response `200`:**

```json
{
  "success": true,
  "message": "Device unregistered successfully",
  "timestamp": "2025-06-01T14:00:00",
  "data": null
}
```

---

## POST /api/v1/notifications/preferences

Update which types of notifications the user receives.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "payment_notifications": true,
  "campaign_notifications": true,
  "support_notifications": true,
  "security_notifications": true,
  "feature_notifications": false
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| payment_notifications | boolean | true | Payment and transaction alerts |
| campaign_notifications | boolean | true | Marketing campaign notifications |
| support_notifications | boolean | true | Support ticket updates |
| security_notifications | boolean | true | Security alerts |
| feature_notifications | boolean | true | New feature announcements |

**Response `200`:**

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "payment_notifications": true,
    "campaign_notifications": true,
    "support_notifications": true,
    "security_notifications": true,
    "feature_notifications": false
  }
}
```

---

## GET /api/v1/notifications/preferences

Get current notification preference settings.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "Preferences retrieved successfully",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "preferences": {
      "payment_notifications": true,
      "campaign_notifications": true,
      "support_notifications": true,
      "security_notifications": true,
      "feature_notifications": true
    }
  }
}
```

---

## GET /api/v1/notifications/history

Get paginated notification history.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Results per page (1-100) |
| offset | int | 0 | Pagination offset |
| notification_type | string | null | Filter: `payment`, `campaign`, `support`, `security`, `feature` |

**Response `200`:**

```json
{
  "success": true,
  "message": "Notification history retrieved successfully",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "total": 25,
    "limit": 50,
    "offset": 0,
    "notifications": [
      {
        "id": "notif_abc123",
        "type": "payment",
        "title": "Payment Received",
        "body": "You received $50.00 from Jordan",
        "is_read": false,
        "created_at": "2025-06-01T14:00:00"
      }
    ]
  }
}
```

---

## POST /api/v1/notifications/mark-as-read/{notification_id}

Mark a specific notification as read.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| notification_id | string | Notification ID |

**Response `200`:**

```json
{
  "success": true,
  "message": "Notification marked as read",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "notification_id": "notif_abc123",
    "read_at": "2025-06-01T14:05:00"
  }
}
```

---

## POST /api/v1/notifications/send-event

Send an event-based notification to the authenticated user.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "event_type": "payment",
  "event_data": {
    "amount": 50.00,
    "sender": "Jordan",
    "transaction_id": "txn_abc123"
  }
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| event_type | string | Yes | `payment`, `campaign`, `support`, `security`, `feature` |
| event_data | object | No | Event-specific data payload |

**Response `200`:**

```json
{
  "success": true,
  "message": "Event notification sent: payment",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "message_count": 2,
    "failed_count": 0
  }
}
```

---

## POST /api/v1/notifications/test

Send a test notification to all registered devices for the authenticated user.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "title": "Test Notification",
  "body": "This is a test push notification",
  "data": {
    "screen": "home",
    "action": "open"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Notification title |
| body | string | Yes | Notification body text |
| data | object | No | Custom key-value data |

**Response `200`:**

```json
{
  "success": true,
  "message": "Test notification sent to 2 device(s)",
  "timestamp": "2025-06-01T14:00:00",
  "data": {
    "success": true,
    "message_count": 2,
    "failed_count": 0
  }
}
```

---

## AWS SNS Endpoints

### POST /api/v1/notifications/sns/register-device

Register a device endpoint with AWS SNS Platform Application.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "device_token": "apns_token_abc123...",
  "device_type": "ios",
  "device_name": "iPhone 15 Pro"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| device_token | string | Yes | APNs (iOS) or FCM (Android) token |
| device_type | string | Yes | `ios` or `android` |
| device_name | string | No | Friendly device name |

**Response `201`:**

```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:123456789:endpoint/APNS/SwipeSavvy/abc123",
  "device_type": "ios",
  "status": "active"
}
```

**Errors:**
- `400` - Invalid device token
- `503` - SNS service not configured

---

### POST /api/v1/notifications/sns/send

Send a push notification to a specific SNS endpoint.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:123456789:endpoint/APNS/SwipeSavvy/abc123",
  "title": "Payment Received",
  "body": "You received $50.00",
  "data": { "screen": "wallet" },
  "badge": 3,
  "sound": "default"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| endpoint_arn | string | Yes | SNS endpoint ARN |
| title | string | Yes | Notification title |
| body | string | Yes | Notification body |
| data | object | No | Custom data payload |
| badge | int | No | Badge number (iOS only) |
| sound | string | No | Sound file (default: `default`) |

**Response `200`:**

```json
{
  "success": true,
  "message_id": "msg_abc123"
}
```

---

### DELETE /api/v1/notifications/sns/unregister/{endpoint_arn}

Unregister a device endpoint from SNS. The `endpoint_arn` should be URL-encoded.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| endpoint_arn | string | URL-encoded SNS endpoint ARN |

**Response `200`:**

```json
{
  "success": true,
  "message": "Endpoint deleted"
}
```

---

### GET /api/v1/notifications/sns/status/{endpoint_arn}

Get the attributes and status of an SNS endpoint. The `endpoint_arn` should be URL-encoded.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| endpoint_arn | string | URL-encoded SNS endpoint ARN |

**Response `200`:**

```json
{
  "endpoint_arn": "arn:aws:sns:us-east-1:123456789:endpoint/APNS/SwipeSavvy/abc123",
  "attributes": {
    "Enabled": "true",
    "Token": "apns_token_abc123...",
    "CustomUserData": "{\"user_id\": \"abc123\"}"
  }
}
```
