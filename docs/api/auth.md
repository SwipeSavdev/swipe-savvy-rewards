# User Authentication API

Base path: `/api/v1/auth`

Source: `user_auth.py`

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/signup` | None | Register a new user |
| POST | `/login` | None | Authenticate and send OTP |
| POST | `/verify-login-otp` | None | Verify login OTP and get tokens |
| POST | `/verify-email` | None | Verify email with token |
| POST | `/verify-phone` | JWT Bearer | Verify phone with OTP |
| POST | `/resend-login-otp` | None | Resend login OTP |
| POST | `/resend-verification` | JWT Bearer | Resend email/phone verification |
| POST | `/forgot-password` | None | Request password reset |
| POST | `/reset-password` | None | Reset password with token |
| POST | `/refresh` | None | Refresh access token |
| GET | `/me` | JWT Bearer | Get current user profile |
| POST | `/check-email` | None | Check email availability |
| POST | `/check-phone` | None | Check phone availability |

---

## POST /api/v1/auth/signup

Register a new user account. Triggers OFAC screening and sends verification email with OTP.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "2025551234",
  "date_of_birth": "1990-05-15",
  "street_address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "ssn_last4": "1234",
  "terms_accepted": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string (email) | Yes | Valid email format |
| password | string | Yes | 8-128 chars, uppercase, lowercase, digit, special char |
| first_name | string | Yes | 1-100 chars |
| last_name | string | Yes | 1-100 chars |
| phone | string | Yes | 10-20 chars, digits extracted |
| date_of_birth | string | Yes | YYYY-MM-DD, must be 18+ |
| street_address | string | Yes | 1-255 chars |
| city | string | Yes | 1-100 chars |
| state | string | Yes | 2-50 chars |
| zip_code | string | Yes | 5-20 chars |
| ssn_last4 | string | Yes | Exactly 4 digits |
| terms_accepted | boolean | Yes | Must be `true` |

**Response `200`:**

```json
{
  "success": true,
  "message": "Account created successfully. Please verify your email.",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "next_steps": [
    "Check your email for the 6-digit verification code"
  ],
  "verification_required": {
    "email": true,
    "phone": false
  }
}
```

**Errors:**
- `400` - Email already registered
- `400` - Phone number already registered
- `422` - Validation error

---

## POST /api/v1/auth/login

Authenticate user with email/password. On success, sends a 6-digit OTP to the user's email for two-factor verification. Does NOT return tokens -- tokens are issued after OTP verification.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response `200`:**

```json
{
  "otp_required": true,
  "verification_required": true,
  "message": "Verification code sent to your email",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "2025551234",
    "status": "active",
    "role": "user",
    "kyc_tier": "tier1",
    "kyc_status": "approved",
    "email_verified": true,
    "phone_verified": true
  }
}
```

> In development mode, an additional `dev_otp_code` field is included for testing.

**Errors:**
- `401` - Invalid email or password
- `403` - Account is suspended / deleted
- `423` - Account locked (too many failed attempts, 30 min lockout after 5 failures)

---

## POST /api/v1/auth/verify-login-otp

Verify the OTP code sent during login. Returns JWT tokens on success.

**Auth:** None

**Request Body:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| user_id | string | Yes | UUID of user |
| code | string | Yes | Exactly 6 chars |

**Response `200`:**

```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "2025551234",
    "status": "active",
    "role": "user",
    "kyc_tier": "tier1",
    "kyc_status": "approved",
    "email_verified": true,
    "phone_verified": true
  }
}
```

**Errors:**
- `400` - Invalid verification code
- `400` - Verification code has expired
- `404` - User not found

---

## POST /api/v1/auth/verify-email

Verify user email address using the token sent via email.

**Auth:** None

**Request Body:**

```json
{
  "token": "abc123def456..."
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "status": "active",
  "phone_verified": true
}
```

**Errors:**
- `400` - Invalid verification token
- `400` - Verification token has expired

---

## POST /api/v1/auth/verify-phone

Verify phone number with OTP code (for initial signup verification flow).

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "code": "123456"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Phone verified successfully",
  "status": "active",
  "email_verified": true
}
```

**Errors:**
- `400` - Invalid verification code
- `400` - Verification code has expired
- `401` - Authentication required

---

## POST /api/v1/auth/resend-login-otp

Resend OTP for the login verification flow. Generates a new 6-digit code.

**Auth:** None

**Request Body:**

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Errors:**
- `404` - User not found

---

## POST /api/v1/auth/resend-verification

Resend email or phone verification for authenticated users.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "type": "email"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| type | string | Yes | `"email"` or `"phone"` |

**Response `200`:**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

## POST /api/v1/auth/forgot-password

Request a password reset link. Always returns success to prevent email enumeration.

**Auth:** None

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "If an account exists, a password reset email has been sent"
}
```

---

## POST /api/v1/auth/reset-password

Reset password using the token received via email.

**Auth:** None

**Request Body:**

```json
{
  "token": "reset-token-string...",
  "new_password": "NewSecureP@ss1"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| token | string | Yes | Reset token from email |
| new_password | string | Yes | 8-128 chars, uppercase, lowercase, digit, special char |

**Response `200`:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid reset token
- `400` - Reset token has expired

---

## POST /api/v1/auth/refresh

Exchange a valid refresh token for a new access + refresh token pair.

**Auth:** None

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "active",
    "kyc_tier": "tier1",
    "kyc_status": "approved"
  }
}
```

**Errors:**
- `401` - Refresh token has expired
- `401` - Invalid refresh token
- `403` - Account is not active

---

## GET /api/v1/auth/me

Get the current authenticated user's profile.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "2025551234",
  "status": "active",
  "role": "user",
  "kyc_tier": "tier1",
  "kyc_status": "approved",
  "email_verified": true,
  "phone_verified": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "US"
  },
  "created_at": "2025-01-15T10:30:00",
  "last_login": "2025-06-01T14:22:00"
}
```

**Errors:**
- `401` - Authentication required

---

## POST /api/v1/auth/check-email

Check if an email address is available for registration.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| email | string (email) | Yes | Email to check |

**Response `200`:**

```json
{
  "available": true
}
```

---

## POST /api/v1/auth/check-phone

Check if a phone number is available for registration.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | Yes | Phone number to check |

**Response `200`:**

```json
{
  "available": true
}
```
