# SwipeSavvy API Documentation

## Base URL

```
Production:  https://api.swipesavvy.com/api/v1
Staging:     https://staging-api.swipesavvy.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a **JWT Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the [Authentication API](./auth.md) (`POST /api/v1/auth/login` followed by `POST /api/v1/auth/verify-login-otp`).

| Token Type     | Lifetime  | Purpose                        |
|----------------|-----------|--------------------------------|
| Access Token   | 24 hours  | Authorize API requests         |
| Refresh Token  | 30 days   | Obtain new access tokens       |

### Auth Levels

| Level            | Description                                           |
|------------------|-------------------------------------------------------|
| **None**         | Public endpoint, no token required                    |
| **JWT Bearer**   | Requires valid access token                           |
| **Optional Bearer** | Token accepted but not required (enhanced response when authenticated) |
| **Admin JWT**    | Requires admin-scoped JWT token                       |
| **Signature**    | Webhook signature verification (X-FIS-Signature)      |

---

## API Reference Documents

### Core Reference

| # | Document | Description | Endpoints |
|---|----------|-------------|-----------|
| 1 | [README.md](./README.md) | This index document | -- |
| 2 | [swagger-full.md](./swagger-full.md) | Complete endpoint reference table (360+ endpoints) | 360+ |

### Mobile / User-Facing APIs

| # | Document | Description | Prefix |
|---|----------|-------------|--------|
| 3 | [auth.md](./auth.md) | User authentication, signup, login, OTP, password reset | `/api/v1/auth` |
| 4 | [kyc.md](./kyc.md) | KYC verification, documents, identity, OFAC screening | `/api/v1/kyc` |
| 5 | [accounts.md](./accounts.md) | User accounts, transactions, linked banks, analytics | `/api/v1` |
| 6 | [cards.md](./cards.md) | FIS card issuance, activation, replacement, cancellation | `/api/v1/fis/cards` |
| 7 | [card-controls.md](./card-controls.md) | Card controls: lock/unlock, limits, channels, geo, alerts, PIN | `/api/v1/fis/cards` |
| 8 | [card-transactions.md](./card-transactions.md) | Card transaction history, analytics, disputes | `/api/v1/fis/cards` |
| 9 | [payments.md](./payments.md) | Payment processing, refunds, subscriptions | `/api/v1/payments` |
| 10 | [wallet.md](./wallet.md) | Wallet balance, transactions, payment methods, transfers | `/api/v1` |
| 11 | [rewards.md](./rewards.md) | Rewards points, boosts, goals, budgets, preferences | `/api/v1` |
| 12 | [notifications.md](./notifications.md) | Push notifications, device registration, SNS | `/api/v1/notifications` |
| 13 | [chat.md](./chat.md) | Real-time chat via WebSocket and REST | `/api/v1/chat` |

### Admin APIs

| # | Document | Description | Prefix |
|---|----------|-------------|--------|
| 14 | [admin.md](./admin.md) | Admin auth, dashboard, users, merchants, support, settings, RBAC, charities, chat dashboard | `/api/v1/admin` |
| 15 | [feature-flags.md](./feature-flags.md) | Feature flag CRUD, toggle, mobile flags | `/api/feature-flags` |

### Additional Domains (covered in swagger-full.md)

| Domain | Prefix | Description |
|--------|--------|-------------|
| FIS Fraud & Security | `/api/v1/fis/fraud`, `/api/v1/fis/alerts` | Fraud reports, alerts, travel notices, risk scores |
| FIS Digital Wallet | `/api/v1/fis/cards/{id}/wallet` | Apple Pay, Google Pay, Samsung Pay provisioning |
| FIS Webhooks | `/api/v1/webhooks/fis` | Inbound webhook events from FIS |
| Preferred Merchants & Deals | `/merchants`, `/api/merchants` | Merchant discovery, deals, subscriptions |
| Marketing | `/api/marketing` | Campaign management, AI copy, optimization |
| Marketing AI | `/api/v1/marketing-ai` | Behavioral analysis, personalized promotions |
| Support (Customer) | `/api/support` | Customer support ticket system |
| Location Services | `/api/v1/location` | Geocoding, routing, geofencing, device tracking |
| AI Concierge | `/api/v1/ai-concierge` | Employee AI chat assistant (streaming) |
| Website Concierge | `/api/v1/website-concierge` | Public website AI chat (streaming) |
| Website Forms | `/api/v1/contact`, `/api/v1/demo-request` | Contact, demo request, sales inquiry forms |
| Push Notifications (In-App) | `/api/v1/push-notifications` | In-app notification management |

---

## Common Response Format

Most endpoints return a standard envelope:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Responses

```json
{
  "detail": "Error description"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate resource) |
| `423` | Locked (account locked) |
| `429` | Rate Limit Exceeded |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

---

## Rate Limiting

- Admin login: **5 requests/minute** per IP
- General API: No hard limits in development; production limits TBD

---

## Versioning

The API uses URL-based versioning: `/api/v1/...`

---

## Content Type

All request and response bodies use `application/json` unless otherwise noted (e.g., file uploads use `multipart/form-data`).

---

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`
