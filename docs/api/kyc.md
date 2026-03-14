# KYC Verification API

Base path: `/api/v1/kyc`

Source: `user_kyc.py`

All endpoints in this section require **JWT Bearer** authentication.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/status` | JWT Bearer | Get KYC status and verification progress |
| GET | `/limits` | JWT Bearer | Get transaction limits for current tier |
| POST | `/check-limit` | JWT Bearer | Check if transaction amount is within limits |
| POST | `/documents/upload` | JWT Bearer | Upload a KYC document |
| GET | `/documents` | JWT Bearer | List all uploaded KYC documents |
| DELETE | `/documents/{document_id}` | JWT Bearer | Delete a pending document |
| POST | `/upgrade` | JWT Bearer | Request KYC tier upgrade |
| POST | `/identity/start` | JWT Bearer | Start identity verification flow |
| POST | `/identity/complete` | JWT Bearer | Complete identity verification |
| POST | `/screening/ofac` | JWT Bearer | Run OFAC/sanctions screening |
| GET | `/requirements/{tier}` | JWT Bearer | Get requirements for a specific tier |

---

## GET /api/v1/kyc/status

Get the current user's KYC status and verification progress.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "kyc_tier": "tier1",
  "kyc_status": "approved",
  "email_verified": true,
  "phone_verified": true,
  "identity_verified": false,
  "documents_submitted": 2,
  "documents_approved": 1,
  "documents_pending": 1,
  "next_tier": "tier2",
  "upgrade_requirements": {
    "identity_verification": true,
    "additional_documents": ["utility_bill"]
  }
}
```

---

## GET /api/v1/kyc/limits

Get transaction limits based on the user's current KYC tier.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "kyc_tier": "tier1",
  "limits": {
    "daily_transaction_limit": 1000.00,
    "weekly_transaction_limit": 5000.00,
    "monthly_transaction_limit": 10000.00,
    "single_transaction_limit": 500.00
  },
  "next_tier": "tier2"
}
```

---

## POST /api/v1/kyc/check-limit

Check if a specific transaction amount is within the user's KYC limits.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "amount": 250.00
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | float | Yes | Transaction amount to check |

**Response `200`:**

```json
{
  "allowed": true,
  "remaining_daily": 750.00,
  "remaining_monthly": 9750.00,
  "kyc_tier": "tier1"
}
```

---

## POST /api/v1/kyc/documents/upload

Upload a KYC verification document. Uses `multipart/form-data`.

**Auth:** JWT Bearer

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| document_type | string | Yes | Type of document (see below) |
| document_subtype | string | No | `front` or `back` for ID documents |
| file | file | Yes | Document file (JPEG, PNG, HEIC, PDF) |

**Document Types:**
- `drivers_license`
- `passport`
- `state_id`
- `ssn_card`
- `utility_bill`
- `bank_statement`
- `selfie`

**File Constraints:**
- Minimum size: 10 KB
- Maximum size: 10 MB
- Allowed types: `image/jpeg`, `image/png`, `image/heic`, `application/pdf`

**Response `200`:**

```json
{
  "success": true,
  "document_id": "doc_550e8400-e29b-41d4-a716-446655440000",
  "document_type": "drivers_license",
  "status": "pending",
  "message": "Document uploaded successfully. It will be reviewed shortly."
}
```

**Errors:**
- `400` - Invalid document type
- `400` - Invalid file type
- `400` - File too large / File too small

---

## GET /api/v1/kyc/documents

List all KYC documents uploaded by the current user.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "documents": [
    {
      "id": "doc_550e8400-e29b-41d4-a716-446655440000",
      "document_type": "drivers_license",
      "document_subtype": "front",
      "file_name": "license_front.jpg",
      "status": "approved",
      "rejection_reason": null,
      "expires_at": "2028-05-15T00:00:00",
      "verified_at": "2025-01-16T09:00:00",
      "uploaded_at": "2025-01-15T14:30:00"
    }
  ]
}
```

---

## DELETE /api/v1/kyc/documents/{document_id}

Delete an uploaded document. Only documents with `pending` status can be deleted.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| document_id | UUID | Document ID |

**Response `200`:**

```json
{
  "success": true,
  "message": "Document deleted"
}
```

**Errors:**
- `400` - Cannot delete document that has been reviewed
- `404` - Document not found

---

## POST /api/v1/kyc/upgrade

Request an upgrade to a higher KYC tier. Returns the requirements for the upgrade.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "target_tier": "tier2"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| target_tier | string | Yes | `tier1`, `tier2`, or `tier3` |

**Response `200`:**

```json
{
  "success": true,
  "current_tier": "tier1",
  "target_tier": "tier2",
  "requirements": {
    "identity_verification": true,
    "documents_needed": ["utility_bill", "selfie"],
    "estimated_review_time": "1-2 business days"
  }
}
```

**Errors:**
- `400` - Invalid tier
- `400` - Cannot downgrade tier

---

## POST /api/v1/kyc/identity/start

Start the identity verification flow. Returns a link token for the identity verification provider (Plaid IDV).

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "link_token": "link-sandbox-abc123...",
  "session_id": "idv_session_123",
  "expires_at": "2025-01-15T15:30:00"
}
```

If already verified:

```json
{
  "success": true,
  "already_verified": true,
  "message": "Identity already verified"
}
```

---

## POST /api/v1/kyc/identity/complete

Complete the identity verification after the user finishes the Plaid IDV UI flow.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "session_id": "idv_session_123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "verification_status": "verified",
  "kyc_tier": "tier2",
  "message": "Identity verification completed successfully"
}
```

---

## POST /api/v1/kyc/screening/ofac

Run OFAC/sanctions screening for the current user. Typically runs automatically during signup but can be triggered manually.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "screening_id": "scr_550e8400-e29b-41d4-a716-446655440000",
  "status": "clear",
  "screened_at": "2025-01-15T14:30:00"
}
```

---

## GET /api/v1/kyc/requirements/{tier}

Get the requirements and limits for a specific KYC tier.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| tier | string | `tier1`, `tier2`, or `tier3` |

**Response `200`:**

```json
{
  "tier": "tier2",
  "limits": {
    "daily_transaction_limit": 5000.00,
    "weekly_transaction_limit": 25000.00,
    "monthly_transaction_limit": 50000.00,
    "single_transaction_limit": 2500.00
  },
  "requirements": {
    "identity_verification": true,
    "documents_needed": ["utility_bill", "selfie"],
    "estimated_review_time": "1-2 business days"
  }
}
```

**Errors:**
- `400` - Invalid tier
