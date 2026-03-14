# Admin API

Sources: `admin_auth.py`, `admin_dashboard.py`, `admin_users.py`

This document covers all administrative endpoints including authentication, dashboard analytics, and user management.

---

## Admin Authentication

Base path: `/api/v1/admin/auth`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | None | Admin login (rate limited) |
| POST | `/refresh` | None | Refresh admin token |
| POST | `/logout` | None | Logout (client-side) |
| GET | `/me` | Admin JWT | Get current admin user |
| POST | `/setup-admin` | None (setup key) | Create initial admin user |
| POST | `/reset-password` | None (setup key) | Reset admin password |
| GET | `/demo-credentials` | None | Get demo credentials (dev only) |

---

### POST /api/v1/admin/auth/login

Authenticate an admin user. Rate limited to 5 attempts per minute per IP.

**Auth:** None

**Request Body:**

```json
{
  "email": "admin@swipesavvy.com",
  "password": "Admin123!"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string (email) | Yes | Valid email format |
| password | string | Yes | 6+ chars, max 72 bytes |

**Response `200`:**

```json
{
  "session": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "demo-admin-1",
      "name": "Admin User",
      "email": "admin@swipesavvy.com",
      "role": "admin"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2025-06-01T14:30:00+00:00"
}
```

**Errors:**
- `401` - Invalid email or password
- `403` - User account is not active
- `429` - Rate limit exceeded

---

### POST /api/v1/admin/auth/refresh

Refresh an admin access token.

**Auth:** None

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_at": "2025-06-01T15:00:00+00:00"
}
```

**Errors:**
- `401` - Token expired or invalid

---

### POST /api/v1/admin/auth/logout

Logout endpoint. Frontend should delete the stored token.

**Auth:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/v1/admin/auth/me

Get the current authenticated admin user's profile.

**Auth:** Admin JWT (Bearer token in Authorization header)

**Response `200`:**

```json
{
  "id": "demo-admin-1",
  "name": "Admin User",
  "email": "admin@swipesavvy.com",
  "role": "admin"
}
```

**Errors:**
- `401` - No token provided / Invalid token
- `404` - User not found

---

### POST /api/v1/admin/auth/setup-admin

One-time setup endpoint to create the initial admin user. Can only be used when no admin users exist in the database.

**Auth:** None (requires setup key)

**Request Body:**

```json
{
  "setup_key": "first16charsOfJWTSecret",
  "email": "admin@swipesavvy.com",
  "password": "SecureAdmin123!",
  "full_name": "Admin User"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| setup_key | string | Yes | First 16 chars of JWT_SECRET_KEY |
| email | string (email) | Yes | Admin email |
| password | string | Yes | Password (min 8 chars) |
| full_name | string | Yes | Admin full name |

**Response `200`:**

```json
{
  "success": true,
  "message": "Admin user created successfully",
  "email": "admin@swipesavvy.com"
}
```

**Errors:**
- `403` - Invalid setup key
- `409` - Admin users already exist

---

### POST /api/v1/admin/auth/reset-password

Reset an admin user's password. Requires the setup key for security.

**Auth:** None (requires setup key)

**Request Body:**

```json
{
  "setup_key": "first16charsOfJWTSecret",
  "email": "admin@swipesavvy.com",
  "new_password": "NewSecurePass123!"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `403` - Invalid setup key
- `404` - User not found

---

### GET /api/v1/admin/auth/demo-credentials

Get demo login credentials. Only available in development/testing environments.

**Auth:** None

**Response `200`:**

```json
{
  "note": "Use the credentials created in the database to login",
  "demo_users": [
    {
      "id": "abc123",
      "email": "admin@swipesavvy.com",
      "name": "Admin User",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

**Errors:**
- `403` - Not available in production

---

## Admin Dashboard

Base path: `/api/v1/admin`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dashboard/overview` | Optional Bearer | Dashboard overview metrics |
| GET | `/analytics/overview` | None | Analytics overview |
| GET | `/analytics/transactions` | None | Transaction volume chart data |
| GET | `/analytics/revenue` | None | Revenue chart data |
| GET | `/analytics/funnel/onboarding` | None | Onboarding funnel metrics |
| GET | `/analytics/cohort/retention` | None | Cohort retention data |
| GET | `/support/stats` | None | Support dashboard stats |
| POST | `/seed-sample-data` | None | Seed database with sample data |

---

### GET /api/v1/admin/dashboard/overview

Get dashboard overview with key metrics and recent activity.

**Auth:** Optional Bearer

**Response `200`:**

```json
{
  "stats": {
    "users": { "value": 1250, "trendPct": 2.5, "trendDirection": "up" },
    "transactions": { "value": 8500, "trendPct": 1.2, "trendDirection": "up" },
    "revenue": { "value": 425000, "trendPct": 0.8, "trendDirection": "up" },
    "growth": { "value": 1.5, "trendPct": 0.5, "trendDirection": "up" }
  },
  "recentActivity": [
    {
      "id": "activity_1",
      "description": "Platform has 1250 active users",
      "status": "success",
      "timestamp": "2025-06-01T14:00:00+00:00"
    }
  ],
  "total_users": 1250,
  "total_merchants": 45,
  "total_revenue": 425000,
  "recent_activity": []
}
```

---

### GET /api/v1/admin/analytics/overview

Get high-level analytics overview with trends.

**Auth:** None

**Response `200`:**

```json
{
  "activeUsers": 1250,
  "transactions": 8500,
  "revenue": 425000,
  "conversion": 6.8,
  "trends": {
    "users": { "pct": 2.5, "direction": "up" },
    "transactions": { "pct": 1.2, "direction": "up" },
    "revenue": { "pct": 0.8, "direction": "up" },
    "conversion": { "pct": 0.5, "direction": "up" }
  }
}
```

---

### GET /api/v1/admin/analytics/transactions

Get transaction volume data for charting.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| days | int | 30 | Number of days (1-90) |

**Response `200`:**

```json
{
  "title": "Transactions Volume",
  "subtitle": "Last 30 days",
  "data": [
    { "date": "2025-05-02", "transactions": 45, "volume": 225000 },
    { "date": "2025-05-03", "transactions": 52, "volume": 260000 }
  ]
}
```

---

### GET /api/v1/admin/analytics/revenue

Get revenue data for charting.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| days | int | 30 | Number of days (1-90) |

**Response `200`:**

```json
{
  "title": "Revenue",
  "subtitle": "Last 30 days",
  "data": [
    { "date": "2025-05-02", "revenue": 15000 },
    { "date": "2025-05-03", "revenue": 18000 }
  ]
}
```

---

### GET /api/v1/admin/analytics/funnel/onboarding

Get onboarding funnel metrics showing drop-off at each stage.

**Auth:** None

**Response `200`:**

```json
{
  "funnel": [
    { "stage": "signup", "label": "Started", "count": 1250, "percentage": 100 },
    { "stage": "email_verified", "label": "Email Verified", "count": 1087, "percentage": 87 },
    { "stage": "kyc_started", "label": "KYC Started", "count": 900, "percentage": 72 },
    { "stage": "kyc_completed", "label": "KYC Completed", "count": 850, "percentage": 68 },
    { "stage": "payment_method", "label": "Added Payment Method", "count": 675, "percentage": 54 },
    { "stage": "first_transaction", "label": "First Transaction", "count": 500, "percentage": 40 }
  ]
}
```

---

### GET /api/v1/admin/analytics/cohort/retention

Get weekly cohort retention data.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| cohort_week | string | null | ISO week format (e.g., `2025-W01`) |

**Response `200`:**

```json
{
  "cohort": "2025-W01",
  "retention": [
    { "week": 0, "percentage": 100 },
    { "week": 1, "percentage": 73 },
    { "week": 2, "percentage": 58 },
    { "week": 3, "percentage": 47 },
    { "week": 4, "percentage": 39 },
    { "week": 5, "percentage": 34 },
    { "week": 6, "percentage": 31 },
    { "week": 7, "percentage": 29 }
  ]
}
```

---

### GET /api/v1/admin/support/stats

Get support dashboard statistics.

**Auth:** None

**Response `200`:**

```json
{
  "openTickets": 12,
  "open_tickets": 12,
  "inProgressTickets": 5,
  "in_progress_tickets": 5,
  "resolvedToday": 8,
  "resolved_today": 8,
  "firstResponseTimeHours": 1.2,
  "first_response_time_hours": 1.2,
  "avgResponseTime": 2.1,
  "avg_response_time": 2.1,
  "slaMetrics": {
    "firstResponseSLA": 87.5,
    "resolutionSLA": 75.2,
    "csat": 4.6
  }
}
```

---

### POST /api/v1/admin/seed-sample-data

Seed the database with sample users, merchants, transactions, and support tickets for demo purposes.

**Auth:** None

**Response `200`:**

```json
{
  "message": "Sample data seeded successfully!",
  "seeded": true,
  "users_created": 25,
  "merchants_created": 15,
  "transactions_created": 200,
  "support_tickets_created": 10
}
```

---

## Admin User Management

Base path: `/api/v1/admin/users`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional Bearer | List customer users (paginated) |
| POST | `/` | None | Create/invite customer user |
| GET | `/stats/overview` | None | Admin user statistics |
| GET | `/customer/{user_id}/otp` | Optional Bearer | Get customer OTP (dev) |
| DELETE | `/by-phone/{phone}` | Admin JWT | Delete user by phone |
| DELETE | `/by-email/{email}` | Admin JWT | Delete user by email |
| POST | `/delete-by-emails` | Admin JWT | Bulk delete by emails |
| GET | `/{user_id}` | None | Get admin user details |
| PUT | `/{user_id}` | None | Update admin user |
| DELETE | `/{user_id}` | None | Delete admin user |

---

### GET /api/v1/admin/users

List all customer users with pagination and filtering.

**Auth:** Optional Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page (max: 100) |
| status | string | null | Filter by status (`active`, `invited`, `suspended`) |
| search | string | null | Search by email or name |

**Response `200`:**

```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "customer",
      "department": null,
      "status": "active",
      "created_at": "2025-01-15T10:00:00",
      "last_login": "2025-06-01T14:00:00"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 25,
  "total_pages": 6
}
```

---

### POST /api/v1/admin/users

Create or invite a new customer user.

**Auth:** None

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "phone": "+12025551234",
  "invite": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string (email) | Yes | User email (must be unique) |
| name | string | Yes | Full name |
| phone | string | No | Phone number |
| invite | boolean | No | Send invitation email (default: true) |

**Response `201`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "customer",
  "department": null,
  "status": "invited",
  "created_at": "2025-06-01T14:00:00",
  "last_login": null
}
```

**Errors:**
- `409` - User with this email already exists

---

### GET /api/v1/admin/users/stats/overview

Get admin user statistics overview (counts by role and status).

**Auth:** None

**Response `200`:**

```json
{
  "total_users": 10,
  "active_users": 8,
  "inactive_users": 1,
  "suspended_users": 1,
  "by_role": {
    "super_admin": 2,
    "admin": 3,
    "support": 3,
    "analyst": 2
  }
}
```

---

### GET /api/v1/admin/users/customer/{user_id}/otp

Get a customer user's current OTP code. Development and admin testing only.

**Auth:** Optional Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| user_id | string | Customer user ID |

**Response `200`:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone_verification_code": "123456",
  "phone_verification_expires": "2025-06-01T14:10:00",
  "note": "This endpoint is for development/testing only"
}
```

**Errors:**
- `404` - User not found

---

### DELETE /api/v1/admin/users/by-phone/{phone}

Hard delete customer user(s) by phone number.

**Auth:** Admin JWT (required)

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| phone | string | Phone number (partial match supported) |

**Response `200`:**

```json
{
  "success": true,
  "deleted_count": 1,
  "deleted_users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "phone": "2025551234",
      "name": "John Doe"
    }
  ]
}
```

**Errors:**
- `401` - Admin authentication required
- `404` - No users found with that phone number

---

### DELETE /api/v1/admin/users/by-email/{email}

Hard delete a customer user by email address.

**Auth:** Admin JWT (required)

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| email | string | Email address (path-style encoding) |

**Response `200`:**

```json
{
  "success": true,
  "deleted_user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "phone": "2025551234",
    "name": "John Doe"
  }
}
```

**Errors:**
- `401` - Admin authentication required
- `404` - No user found with that email

---

### POST /api/v1/admin/users/delete-by-emails

Bulk delete customer users by a list of email addresses.

**Auth:** Admin JWT (required)

**Request Body:**

```json
{
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response `200`:**

```json
{
  "success": true,
  "deleted_count": 2,
  "deleted_users": [
    { "id": "abc", "email": "user1@example.com", "phone": "1234", "name": "User 1" },
    { "id": "def", "email": "user2@example.com", "phone": "5678", "name": "User 2" }
  ],
  "not_found": ["user3@example.com"]
}
```

**Errors:**
- `401` - Admin authentication required
- `404` - No users found with provided emails

---

### GET /api/v1/admin/users/{user_id}

Get detailed information about a specific admin user.

**Auth:** None

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| user_id | string | Admin user ID |

**Response `200`:**

```json
{
  "id": "abc123",
  "email": "admin@swipesavvy.com",
  "name": "Admin User",
  "role": "super_admin",
  "department": "Engineering",
  "status": "active",
  "created_at": "2025-01-01T00:00:00",
  "last_login": "2025-06-01T14:00:00"
}
```

**Errors:**
- `404` - Admin user not found

---

### PUT /api/v1/admin/users/{user_id}

Update an admin user's profile.

**Auth:** None

**Request Body:**

```json
{
  "full_name": "Updated Name",
  "role": "admin",
  "department": "Operations",
  "status": "active"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| full_name | string | No | New name |
| role | string | No | New role |
| department | string | No | New department |
| status | string | No | `active`, `inactive`, or `suspended` |

**Response `200`:**

```json
{
  "id": "abc123",
  "email": "admin@swipesavvy.com",
  "name": "Updated Name",
  "role": "admin",
  "department": "Operations",
  "status": "active",
  "created_at": "2025-01-01T00:00:00",
  "last_login": "2025-06-01T14:00:00"
}
```

**Errors:**
- `400` - Invalid status
- `404` - Admin user not found

---

### DELETE /api/v1/admin/users/{user_id}

Hard delete an admin user.

**Auth:** None

**Response `204`:** No content

**Errors:**
- `404` - Admin user not found

---

## Admin Merchants

Base path: `/api/v1/admin`

Sources: `admin_merchants.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/merchants` | None | List merchants (paginated) |
| POST | `/merchants` | None | Create merchant |
| GET | `/merchants/{merchant_id}` | None | Get merchant details |
| PUT | `/merchants/{merchant_id}` | None | Update merchant |
| DELETE | `/merchants/{merchant_id}` | None | Delete merchant |
| PUT | `/merchants/{merchant_id}/status` | None | Update merchant status |
| GET | `/merchants/stats/overview` | None | Merchant statistics |

---

### GET /api/v1/admin/merchants

List merchants with pagination and filtering.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page (max: 100) |
| status | string | null | Filter by status |
| search | string | null | Search by name or ID |

**Response `200`:**

```json
{
  "merchants": [
    {
      "id": "merch_abc123",
      "name": "Coffee Corner",
      "category": "Food & Beverage",
      "status": "active",
      "subscription_tier": "gold",
      "created_at": "2025-01-15T10:00:00"
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 25,
  "total_pages": 2
}
```

---

### POST /api/v1/admin/merchants

Create a new merchant.

**Auth:** None

**Request Body:**

```json
{
  "name": "Coffee Corner",
  "category": "Food & Beverage",
  "description": "Local coffee shop",
  "address": "456 Oak Ave, New York, NY 10002",
  "phone": "+12125551234",
  "email": "info@coffeecorner.com",
  "website": "https://coffeecorner.com",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response `201`:**

```json
{
  "id": "merch_abc123",
  "name": "Coffee Corner",
  "status": "active",
  "created_at": "2025-06-01T14:00:00"
}
```

---

### GET /api/v1/admin/merchants/{merchant_id}

Get detailed information about a merchant.

**Auth:** None

**Response `200`:**

```json
{
  "id": "merch_abc123",
  "name": "Coffee Corner",
  "category": "Food & Beverage",
  "description": "Local coffee shop",
  "status": "active",
  "subscription_tier": "gold",
  "address": "456 Oak Ave, New York, NY 10002",
  "phone": "+12125551234",
  "email": "info@coffeecorner.com",
  "created_at": "2025-01-15T10:00:00"
}
```

**Errors:**
- `404` - Merchant not found

---

### PUT /api/v1/admin/merchants/{merchant_id}

Update merchant details.

**Auth:** None

**Request Body:**

```json
{
  "name": "Coffee Corner Cafe",
  "description": "Updated description",
  "category": "Food & Beverage"
}
```

**Response `200`:** Updated merchant object

---

### DELETE /api/v1/admin/merchants/{merchant_id}

Delete a merchant.

**Auth:** None

**Response `204`:** No content

---

### PUT /api/v1/admin/merchants/{merchant_id}/status

Update a merchant's status.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status (`active`, `inactive`, `suspended`) |

**Response `200`:**

```json
{
  "id": "merch_abc123",
  "status": "suspended"
}
```

---

### GET /api/v1/admin/merchants/stats/overview

Get merchant statistics overview.

**Auth:** None

**Response `200`:**

```json
{
  "total_merchants": 45,
  "active_merchants": 38,
  "inactive_merchants": 5,
  "suspended_merchants": 2,
  "by_tier": {
    "platinum": 3,
    "gold": 10,
    "silver": 15,
    "bronze": 12,
    "free": 5
  }
}
```

---

## Admin Support Tickets

Base path: `/api/v1/admin`

Source: `admin_support.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/support/tickets` | None | Create support ticket |
| GET | `/support/tickets` | None | List support tickets |
| GET | `/support/tickets/{ticket_id}` | None | Get ticket details |
| PUT | `/support/tickets/{ticket_id}/status` | None | Update ticket status |
| POST | `/support/tickets/{ticket_id}/assign` | None | Assign ticket to agent |
| GET | `/support/stats` | None | Support statistics |

---

### POST /api/v1/admin/support/tickets

Create a new support ticket.

**Auth:** None

**Request Body:**

```json
{
  "subject": "Cannot access account",
  "description": "User reports being locked out after failed login attempts",
  "priority": "high",
  "customer_id": "user_abc123",
  "category": "account_access"
}
```

**Response `201`:**

```json
{
  "id": "ticket_abc123",
  "subject": "Cannot access account",
  "status": "open",
  "priority": "high",
  "created_at": "2025-06-01T14:00:00"
}
```

---

### GET /api/v1/admin/support/tickets

List support tickets with filtering.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page |
| status | string | null | Filter: `open`, `in_progress`, `resolved`, `closed` |
| priority | string | null | Filter: `low`, `medium`, `high`, `critical` |
| search | string | null | Search subject/description |

**Response `200`:**

```json
{
  "tickets": [
    {
      "id": "ticket_abc123",
      "subject": "Cannot access account",
      "status": "open",
      "priority": "high",
      "customer_id": "user_abc123",
      "assigned_to": null,
      "created_at": "2025-06-01T14:00:00"
    }
  ],
  "total": 12,
  "page": 1,
  "per_page": 25
}
```

---

### GET /api/v1/admin/support/tickets/{ticket_id}

Get ticket details with full history.

**Auth:** None

**Response `200`:**

```json
{
  "id": "ticket_abc123",
  "subject": "Cannot access account",
  "description": "User reports being locked out",
  "status": "in_progress",
  "priority": "high",
  "customer_id": "user_abc123",
  "assigned_to": "agent_abc123",
  "created_at": "2025-06-01T14:00:00",
  "updated_at": "2025-06-01T14:30:00"
}
```

---

### PUT /api/v1/admin/support/tickets/{ticket_id}/status

Update ticket status.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status |

**Response `200`:**

```json
{
  "id": "ticket_abc123",
  "status": "resolved"
}
```

---

### POST /api/v1/admin/support/tickets/{ticket_id}/assign

Assign a ticket to a support agent.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| agent_id | string | Yes | Agent user ID |

**Response `200`:**

```json
{
  "id": "ticket_abc123",
  "assigned_to": "agent_abc123"
}
```

---

## Admin Feature Flags

Base path: `/api/v1/admin`

Source: `admin_feature_flags.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/feature-flags` | None | Create feature flag |
| GET | `/feature-flags` | None | List feature flags |
| GET | `/feature-flags/{flag_id}` | None | Get flag details |
| PUT | `/feature-flags/{flag_id}` | None | Update flag |
| PUT | `/feature-flags/{flag_id}/toggle` | None | Toggle flag |
| PUT | `/feature-flags/{flag_id}/rollout` | None | Update rollout % |
| DELETE | `/feature-flags/{flag_id}` | None | Delete flag |
| GET | `/feature-flags/stats/overview` | None | Statistics |

---

### POST /api/v1/admin/feature-flags

Create a new feature flag (admin interface).

**Auth:** None

**Request Body:**

```json
{
  "name": "new_onboarding_flow",
  "description": "Redesigned onboarding experience",
  "enabled": false,
  "rollout_percentage": 0,
  "category": "onboarding"
}
```

**Response `200`:**

```json
{
  "id": "ff_abc123",
  "name": "new_onboarding_flow",
  "enabled": false,
  "rollout_percentage": 0,
  "created_at": "2025-06-01T14:00:00"
}
```

---

### GET /api/v1/admin/feature-flags

List feature flags with filtering.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page |
| enabled | boolean | null | Filter by enabled state |
| category | string | null | Filter by category |
| search | string | null | Search by name/description |

**Response `200`:**

```json
{
  "flags": [...],
  "total": 12,
  "page": 1,
  "per_page": 25
}
```

---

### PUT /api/v1/admin/feature-flags/{flag_id}/toggle

Toggle a feature flag on/off.

**Auth:** None

**Request Body:**

```json
{
  "enabled": true
}
```

**Response `200`:**

```json
{
  "id": "ff_abc123",
  "enabled": true,
  "message": "Feature flag toggled on"
}
```

---

### PUT /api/v1/admin/feature-flags/{flag_id}/rollout

Update the rollout percentage for gradual rollout.

**Auth:** None

**Request Body:**

```json
{
  "rollout_percentage": 50
}
```

**Response `200`:**

```json
{
  "id": "ff_abc123",
  "rollout_percentage": 50,
  "message": "Rollout percentage updated"
}
```

---

### GET /api/v1/admin/feature-flags/stats/overview

Get feature flags statistics.

**Auth:** None

**Response `200`:**

```json
{
  "total_flags": 12,
  "enabled_flags": 8,
  "disabled_flags": 4,
  "average_rollout": 62.5,
  "by_category": {
    "onboarding": 3,
    "payments": 2,
    "rewards": 4,
    "ui": 3
  }
}
```

---

## Admin AI Campaigns

Base path: `/api/v1/admin`

Source: `admin_ai_campaigns.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ai-campaigns` | None | List AI campaigns |
| GET | `/ai-campaigns/{campaign_id}` | None | Get campaign details |
| PUT | `/ai-campaigns/{campaign_id}/status` | None | Update campaign status |
| GET | `/ai-campaigns/stats/overview` | None | Campaign statistics |

---

### GET /api/v1/admin/ai-campaigns

List AI-generated marketing campaigns.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page |
| status | string | null | Filter by status |
| campaign_type | string | null | Filter by type |
| search | string | null | Search campaigns |

**Response `200`:**

```json
{
  "campaigns": [
    {
      "id": "camp_abc123",
      "name": "Summer Rewards Boost",
      "type": "push_notification",
      "status": "active",
      "target_segment": "high_spenders",
      "created_at": "2025-06-01T10:00:00"
    }
  ],
  "total": 15,
  "page": 1,
  "per_page": 25
}
```

---

### PUT /api/v1/admin/ai-campaigns/{campaign_id}/status

Update campaign status (activate, pause, cancel).

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status (`active`, `paused`, `cancelled`, `completed`) |

**Response `200`:**

```json
{
  "id": "camp_abc123",
  "status": "paused"
}
```

---

### GET /api/v1/admin/ai-campaigns/stats/overview

Get campaign statistics overview.

**Auth:** None

**Response `200`:**

```json
{
  "total_campaigns": 15,
  "active_campaigns": 5,
  "paused_campaigns": 3,
  "completed_campaigns": 7,
  "total_reach": 12500,
  "average_conversion": 4.2
}
```

---

## Admin Audit Logs

Base path: `/api/v1/admin`

Source: `admin_audit_logs.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/audit-logs` | None | List audit logs |
| GET | `/audit-logs/{log_id}` | None | Get log details |
| GET | `/audit-logs/stats/overview` | None | Audit statistics |

---

### GET /api/v1/admin/audit-logs

List audit logs with filtering.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| per_page | int | 25 | Items per page |
| action | string | null | Filter by action type |
| status | string | null | Filter by status |
| user_id | string | null | Filter by user |
| search | string | null | Search logs |

**Response `200`:**

```json
{
  "logs": [
    {
      "id": "log_abc123",
      "action": "user.login",
      "user_id": "admin_abc123",
      "status": "success",
      "ip_address": "192.168.1.1",
      "details": "Admin login from Chrome/Windows",
      "created_at": "2025-06-01T14:00:00"
    }
  ],
  "total": 500,
  "page": 1,
  "per_page": 25
}
```

---

### GET /api/v1/admin/audit-logs/{log_id}

Get detailed audit log entry.

**Auth:** None

**Response `200`:**

```json
{
  "id": "log_abc123",
  "action": "user.login",
  "user_id": "admin_abc123",
  "status": "success",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": "Admin login from Chrome/Windows",
  "metadata": {},
  "created_at": "2025-06-01T14:00:00"
}
```

---

### GET /api/v1/admin/audit-logs/stats/overview

Get audit log statistics.

**Auth:** None

**Response `200`:**

```json
{
  "total_logs": 500,
  "today_count": 45,
  "by_action": {
    "user.login": 120,
    "user.update": 80,
    "settings.change": 25,
    "merchant.create": 15
  },
  "by_status": {
    "success": 450,
    "failure": 50
  }
}
```

---

## Admin Settings

Base path: `/api/v1/admin`

Source: `admin_settings.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/settings` | None | Get all settings |
| PUT | `/settings` | None | Update all settings |
| GET | `/settings/categories/list` | None | List categories |
| GET | `/settings/{category}` | None | Get category settings |
| PUT | `/settings/{category}` | None | Bulk update category |
| POST | `/settings/reset/{category}` | None | Reset category |
| GET | `/settings/{category}/{key}` | None | Get specific setting |
| PUT | `/settings/{category}/{key}` | None | Update specific setting |
| GET | `/settings/branding/images` | None | Get branding images |
| GET | `/settings/branding/images/file/{filename}` | None | Serve image file |
| POST | `/settings/branding/upload` | None | Upload branding image |
| DELETE | `/settings/branding/images/{image_id}` | None | Delete branding image |
| POST | `/settings/seed` | None | Seed default settings |

---

### GET /api/v1/admin/settings

Get all platform settings organized by category.

**Auth:** None

**Response `200`:**

```json
{
  "general": {
    "app_name": "SwipeSavvy",
    "support_email": "support@swipesavvy.com",
    "maintenance_mode": false
  },
  "security": {
    "max_login_attempts": 5,
    "lockout_duration_minutes": 30,
    "session_timeout_hours": 24
  },
  "notifications": {
    "email_enabled": true,
    "push_enabled": true,
    "sms_enabled": false
  }
}
```

---

### GET /api/v1/admin/settings/categories/list

List all available setting categories.

**Auth:** None

**Response `200`:**

```json
{
  "categories": ["general", "security", "notifications", "payments", "kyc", "branding"]
}
```

---

### PUT /api/v1/admin/settings/{category}/{key}

Update a specific setting value.

**Auth:** None

**Request Body:**

```json
{
  "value": 10
}
```

**Response `200`:**

```json
{
  "category": "security",
  "key": "max_login_attempts",
  "value": 10
}
```

---

### POST /api/v1/admin/settings/branding/upload

Upload a branding image (logo, favicon, etc.).

**Auth:** None

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Image file (PNG, JPG, SVG) |
| type | string | Yes | Image type (`logo`, `favicon`, `banner`) |

**Response `200`:**

```json
{
  "id": "img_abc123",
  "type": "logo",
  "filename": "logo.png",
  "url": "/api/v1/admin/settings/branding/images/file/logo.png"
}
```

---

### POST /api/v1/admin/settings/reset/{category}

Reset all settings in a category to their default values.

**Auth:** None

**Response `200`:**

```json
{
  "success": true,
  "message": "Category 'security' reset to defaults"
}
```

---

## Admin RBAC (Role-Based Access Control)

Base path: `/api/v1/admin`

Source: `admin_rbac.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/roles` | None | List roles |
| GET | `/roles/{role_id}` | None | Get role details |
| POST | `/roles` | None | Create role |
| PUT | `/roles/{role_id}` | None | Update role |
| DELETE | `/roles/{role_id}` | None | Delete role |
| GET | `/policies` | None | List policies |
| GET | `/policies/{policy_id}` | None | Get policy details |
| POST | `/policies` | None | Create policy |
| PUT | `/policies/{policy_id}` | None | Update policy |
| DELETE | `/policies/{policy_id}` | None | Delete policy |
| GET | `/permissions` | None | List permissions |
| GET | `/permissions/{permission_id}` | None | Get permission details |
| POST | `/permissions` | None | Create permission |
| DELETE | `/permissions/{permission_id}` | None | Delete permission |
| GET | `/rbac/stats` | None | RBAC statistics |
| POST | `/rbac/migrate` | None | Create RBAC tables |
| POST | `/rbac/seed` | None | Seed RBAC data |
| POST | `/users/create` | None | Create admin user |
| POST | `/users/seed-admin` | None | Seed default admin |
| POST | `/users/reset-admin-password` | None | Reset admin password |

---

### POST /api/v1/admin/roles

Create a new role.

**Auth:** None

**Request Body:**

```json
{
  "name": "support_lead",
  "description": "Support team lead with escalation privileges",
  "permissions": ["tickets.read", "tickets.write", "tickets.escalate", "users.read"]
}
```

**Response `201`:**

```json
{
  "id": "role_abc123",
  "name": "support_lead",
  "description": "Support team lead with escalation privileges",
  "permissions": ["tickets.read", "tickets.write", "tickets.escalate", "users.read"],
  "created_at": "2025-06-01T14:00:00"
}
```

---

### POST /api/v1/admin/policies

Create a new access policy.

**Auth:** None

**Request Body:**

```json
{
  "name": "merchant_management",
  "description": "Full merchant management access",
  "resource": "merchants",
  "actions": ["create", "read", "update", "delete"],
  "conditions": {}
}
```

**Response `201`:**

```json
{
  "id": "policy_abc123",
  "name": "merchant_management",
  "resource": "merchants",
  "actions": ["create", "read", "update", "delete"],
  "created_at": "2025-06-01T14:00:00"
}
```

---

### GET /api/v1/admin/rbac/stats

Get RBAC system statistics.

**Auth:** None

**Response `200`:**

```json
{
  "total_roles": 5,
  "total_policies": 12,
  "total_permissions": 35,
  "total_admin_users": 10,
  "by_role": {
    "super_admin": 2,
    "admin": 3,
    "support": 3,
    "analyst": 2
  }
}
```

---

## Admin Charities

Base path: `/charities`

Source: `admin_charities.py`

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/charities` | None | List charities |
| GET | `/charities/{charity_id}` | None | Get charity details |
| POST | `/charities` | None | Create charity |
| PUT | `/charities/{charity_id}` | None | Update charity |
| DELETE | `/charities/{charity_id}` | None | Delete charity |
| POST | `/charities/{charity_id}/approve` | None | Approve charity |
| POST | `/charities/{charity_id}/reject` | None | Reject charity |

---

### GET /charities

List charities with filtering.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | null | Search query |
| status | string | null | Filter: `active`, `pending`, `rejected` |
| category | string | null | Filter by category |
| limit | int | 50 | Items per page |
| offset | int | 0 | Pagination offset |

**Response `200`:**

```json
{
  "charities": [
    {
      "id": "charity_abc123",
      "name": "Local Food Bank",
      "description": "Providing meals to families in need",
      "category": "hunger",
      "status": "active",
      "total_donations": 45000,
      "created_at": "2025-01-15T10:00:00"
    }
  ],
  "total": 25
}
```

---

### POST /charities

Create a new charity.

**Auth:** None

**Request Body:**

```json
{
  "name": "Local Food Bank",
  "description": "Providing meals to families in need",
  "category": "hunger",
  "website": "https://localfoodbank.org",
  "ein": "12-3456789",
  "logo_url": "https://example.com/logo.png"
}
```

**Response `201`:**

```json
{
  "id": "charity_abc123",
  "name": "Local Food Bank",
  "status": "pending",
  "created_at": "2025-06-01T14:00:00"
}
```

---

### POST /charities/{charity_id}/approve

Approve a pending charity for the rewards donation program.

**Auth:** None

**Response `200`:**

```json
{
  "id": "charity_abc123",
  "status": "active",
  "message": "Charity approved"
}
```

---

### POST /charities/{charity_id}/reject

Reject a pending charity.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| notes | string | No | Rejection reason |

**Response `200`:**

```json
{
  "id": "charity_abc123",
  "status": "rejected",
  "message": "Charity rejected"
}
```

---

## Admin Chat Dashboard

Base path: `/api/v1/admin/chat-dashboard`

Source: `chat_dashboard.py`

All endpoints require **Admin JWT** authentication unless noted.

### Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/overview` | Admin JWT | Dashboard overview |
| GET | `/agent-performance` | Admin JWT | Agent performance metrics |
| GET | `/active-sessions` | Admin JWT | Get active sessions |
| GET | `/waiting-sessions` | Admin JWT | Get waiting sessions |
| GET | `/satisfaction` | Admin JWT | Satisfaction metrics |
| GET | `/message-analytics` | Admin JWT | Message analytics |
| POST | `/sessions/{session_id}/assign` | Admin JWT | Assign session |
| POST | `/sessions/{session_id}/transfer` | Admin JWT | Transfer session |
| GET | `/sessions/{session_id}/transcript` | Admin JWT | Get transcript |
| WS | `/ws` | Admin JWT (in msg) | Real-time updates |
| GET | `/health` | None | Health check |

---

### GET /api/v1/admin/chat-dashboard/overview

Get chat dashboard overview metrics.

**Auth:** Admin JWT

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| time_range_hours | int | 24 | Time range in hours |

**Response `200`:**

```json
{
  "active_sessions": 8,
  "waiting_sessions": 3,
  "total_messages_today": 245,
  "average_response_time_seconds": 45,
  "average_resolution_time_minutes": 12,
  "agents_online": 5,
  "satisfaction_score": 4.6
}
```

---

### GET /api/v1/admin/chat-dashboard/agent-performance

Get agent performance metrics.

**Auth:** Admin JWT

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| agent_id | string | null | Specific agent (null for all) |
| time_range_hours | int | 24 | Time range |

**Response `200`:**

```json
{
  "agents": [
    {
      "agent_id": "agent_abc123",
      "name": "Sarah Agent",
      "sessions_handled": 15,
      "average_response_time_seconds": 30,
      "satisfaction_score": 4.8,
      "messages_sent": 120,
      "is_online": true
    }
  ]
}
```

---

### POST /api/v1/admin/chat-dashboard/sessions/{session_id}/assign

Assign a chat session to a support agent.

**Auth:** Admin JWT

**Request Body:**

```json
{
  "agent_id": "agent_abc123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "session_id": "sess_abc123",
  "assigned_to": "agent_abc123"
}
```

---

### POST /api/v1/admin/chat-dashboard/sessions/{session_id}/transfer

Transfer a chat session to another agent.

**Auth:** Admin JWT

**Request Body:**

```json
{
  "target_agent_id": "agent_def456",
  "reason": "Specialized support needed"
}
```

**Response `200`:**

```json
{
  "success": true,
  "session_id": "sess_abc123",
  "transferred_to": "agent_def456"
}
```

---

### GET /api/v1/admin/chat-dashboard/sessions/{session_id}/transcript

Get the full transcript of a chat session.

**Auth:** Admin JWT

**Response `200`:**

```json
{
  "session_id": "sess_abc123",
  "messages": [
    {
      "id": "msg_1",
      "sender_id": "user_abc123",
      "sender_role": "customer",
      "content": "I need help with my card",
      "timestamp": "2025-06-01T14:00:00"
    },
    {
      "id": "msg_2",
      "sender_id": "agent_abc123",
      "sender_role": "agent",
      "content": "I'd be happy to help! What issue are you experiencing?",
      "timestamp": "2025-06-01T14:00:30"
    }
  ],
  "total_messages": 2
}
```
