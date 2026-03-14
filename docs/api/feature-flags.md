# Feature Flags API

Base path: `/api/feature-flags`

Source: `feature_flags.py`

Manage feature flags for gradual rollout and A/B testing. No authentication is currently enforced on these endpoints.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | None | Create a feature flag |
| GET | `/` | None | List all feature flags |
| GET | `/{flag_id}` | None | Get flag by ID |
| GET | `/name/{flag_name}` | None | Get flag by name |
| PUT | `/{flag_id}` | None | Update a feature flag |
| PATCH | `/{flag_id}/toggle` | None | Toggle flag on/off |
| DELETE | `/{flag_id}` | None | Delete a feature flag |
| GET | `/mobile/active` | None | Get active flags for mobile app |

---

## POST /api/feature-flags/

Create a new feature flag.

**Auth:** None

**Request Body:**

```json
{
  "name": "dark_mode_v2",
  "description": "New dark mode implementation with system theme support",
  "enabled": false,
  "rollout_percentage": 0,
  "environment": "development"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Unique flag name (snake_case) |
| description | string | No | Human-readable description |
| enabled | boolean | No | Whether the flag is active (default: false) |
| rollout_percentage | int | No | Rollout percentage 0-100 (default: 0) |
| environment | string | No | Target environment (default: `development`) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "ff_abc123",
    "name": "dark_mode_v2",
    "description": "New dark mode implementation with system theme support",
    "enabled": false,
    "rollout_percentage": 0,
    "environment": "development",
    "created_at": "2025-06-01T14:00:00"
  }
}
```

**Errors:**
- `400` - Feature flag with that name already exists

---

## GET /api/feature-flags/

List all feature flags with pagination.

**Auth:** None

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| page_size | int | 50 | Items per page (1-100) |
| enabled_only | boolean | false | Only return enabled flags |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "page_size": 50,
    "flags": [
      {
        "id": "ff_abc123",
        "name": "dark_mode_v2",
        "description": "New dark mode implementation",
        "enabled": true,
        "rollout_percentage": 50,
        "environment": "production",
        "created_at": "2025-06-01T14:00:00"
      },
      {
        "id": "ff_def456",
        "name": "rewards_boost_feature",
        "description": "Rewards boost functionality",
        "enabled": false,
        "rollout_percentage": 0,
        "environment": "development",
        "created_at": "2025-05-15T10:00:00"
      }
    ]
  }
}
```

---

## GET /api/feature-flags/{flag_id}

Get a feature flag by its ID.

**Auth:** None

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| flag_id | string | Feature flag ID |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "ff_abc123",
    "name": "dark_mode_v2",
    "description": "New dark mode implementation",
    "enabled": true,
    "rollout_percentage": 50,
    "environment": "production",
    "created_at": "2025-06-01T14:00:00"
  }
}
```

**Errors:**
- `404` - Feature flag not found

---

## GET /api/feature-flags/name/{flag_name}

Get a feature flag by its unique name.

**Auth:** None

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| flag_name | string | Feature flag name (e.g., `dark_mode_v2`) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "ff_abc123",
    "name": "dark_mode_v2",
    "description": "New dark mode implementation",
    "enabled": true,
    "rollout_percentage": 50,
    "environment": "production",
    "created_at": "2025-06-01T14:00:00"
  }
}
```

**Errors:**
- `404` - Feature flag not found

---

## PUT /api/feature-flags/{flag_id}

Update a feature flag. All fields are optional.

**Auth:** None

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| flag_id | string | Feature flag ID |

**Request Body:**

```json
{
  "description": "Updated description",
  "enabled": true,
  "rollout_percentage": 75
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | No | Updated description |
| enabled | boolean | No | Enable/disable flag |
| rollout_percentage | int | No | Updated rollout percentage (0-100) |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "ff_abc123",
    "name": "dark_mode_v2",
    "description": "Updated description",
    "enabled": true,
    "rollout_percentage": 75,
    "environment": "production",
    "created_at": "2025-06-01T14:00:00"
  }
}
```

**Errors:**
- `404` - Feature flag not found

---

## PATCH /api/feature-flags/{flag_id}/toggle

Toggle a feature flag on or off.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | New enabled state |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "ff_abc123",
    "name": "dark_mode_v2",
    "description": "New dark mode implementation",
    "enabled": true,
    "rollout_percentage": 50,
    "environment": "production",
    "created_at": "2025-06-01T14:00:00"
  },
  "message": "Feature flag toggled on"
}
```

**Errors:**
- `404` - Feature flag not found

---

## DELETE /api/feature-flags/{flag_id}

Permanently delete a feature flag.

**Auth:** None

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| flag_id | string | Feature flag ID |

**Response `200`:**

```json
{
  "success": true,
  "message": "Feature flag deleted successfully"
}
```

**Errors:**
- `404` - Feature flag not found

---

## GET /api/feature-flags/mobile/active

Get all active feature flags formatted for mobile app consumption. Returns only enabled flags with rollout configuration.

**Auth:** None

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | string | No | User ID for rollout targeting |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "flags": {
      "dark_mode_v2": {
        "enabled": true,
        "rollout_percentage": 100,
        "environment": "production"
      },
      "rewards_boost_feature": {
        "enabled": true,
        "rollout_percentage": 50,
        "environment": "production"
      },
      "new_onboarding_flow": {
        "enabled": true,
        "rollout_percentage": 25,
        "environment": "production"
      }
    },
    "timestamp": "2025-06-01T14:00:00+00:00",
    "version": "1.0"
  }
}
```
