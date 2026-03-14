# Rewards, Goals, Budgets & Preferences API

Base path: `/api/v1`

Source: `mobile_api.py`

All endpoints require **JWT Bearer** authentication.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/rewards/points` | JWT Bearer | Get rewards points balance |
| GET | `/rewards/boosts` | JWT Bearer | Get available reward boosts |
| POST | `/rewards/donate` | JWT Bearer | Donate reward points |
| GET | `/rewards/leaderboard` | JWT Bearer | Get community leaderboard |
| GET | `/goals` | JWT Bearer | List savings goals |
| POST | `/goals` | JWT Bearer | Create a savings goal |
| PUT | `/goals/{goal_id}` | JWT Bearer | Update a savings goal |
| DELETE | `/goals/{goal_id}` | JWT Bearer | Delete a savings goal |
| GET | `/budgets` | JWT Bearer | List budgets |
| POST | `/budgets` | JWT Bearer | Create a budget |
| GET | `/user/preferences` | JWT Bearer | Get user preferences |
| PUT | `/user/preferences` | JWT Bearer | Update user preferences |

---

## Rewards

### GET /api/v1/rewards/points

Get the user's rewards points balance, tier, and progress.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "available": 12450,
  "donated": 3200,
  "tier": "Silver",
  "tierProgress": 68
}
```

| Field | Type | Description |
|-------|------|-------------|
| available | int | Total available points |
| donated | int | Points donated to charity |
| tier | string | Current tier: Bronze, Silver, or Gold |
| tierProgress | int | Progress toward next tier (0-100) |

---

### GET /api/v1/rewards/boosts

Get available reward boosts that can be activated for bonus points.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "boost_1",
    "title": "2x points on Fuel",
    "subtitle": "Activate - valid this week",
    "icon": "gas-cylinder",
    "percent": "+2%",
    "active": true
  },
  {
    "id": "boost_2",
    "title": "Local cafes",
    "subtitle": "+150 pts per visit",
    "icon": "coffee",
    "percent": "+150",
    "active": false
  },
  {
    "id": "boost_3",
    "title": "Grocery stores",
    "subtitle": "1.5x points",
    "icon": "shopping-cart",
    "percent": "+50%",
    "active": false
  },
  {
    "id": "boost_4",
    "title": "Online shopping",
    "subtitle": "3x points on weekends",
    "icon": "shopping-bag",
    "percent": "+3x",
    "active": true
  }
]
```

---

### POST /api/v1/rewards/donate

Donate reward points to a charitable cause.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| amount | int | Yes | Number of points to donate |

**Response `200`:**

```json
{
  "success": true,
  "newBalance": 11450,
  "cause": "Local Food Bank",
  "donationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### GET /api/v1/rewards/leaderboard

Get the community rewards leaderboard. Rankings are based on transaction volume (2 points per dollar).

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "rank": 1,
    "userId": "user_0",
    "name": "Sarah M.",
    "points": 15420,
    "avatar": "SA",
    "tier": "Gold",
    "isCurrentUser": false
  },
  {
    "rank": 2,
    "userId": "user_1",
    "name": "Michael R.",
    "points": 14850,
    "avatar": "MI",
    "tier": "Gold",
    "isCurrentUser": false
  },
  {
    "rank": 5,
    "userId": "user_4",
    "name": "Olivia S.",
    "points": 11500,
    "avatar": "OL",
    "tier": "Silver",
    "isCurrentUser": true
  }
]
```

---

## Savings Goals

### GET /api/v1/goals

List all savings goals for the authenticated user.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "goal_1",
    "name": "Vacation Fund",
    "targetAmount": 3000.00,
    "currentAmount": 1850.00,
    "deadline": "2025-08-01",
    "category": "Travel",
    "icon": "airplane",
    "color": "#FF6B6B",
    "progress": 61.7,
    "createdAt": "2025-01-15T10:00:00+00:00"
  },
  {
    "id": "goal_2",
    "name": "Emergency Fund",
    "targetAmount": 10000.00,
    "currentAmount": 7500.00,
    "deadline": null,
    "category": "Safety",
    "icon": "shield",
    "color": "#4ECDC4",
    "progress": 75.0,
    "createdAt": "2025-01-10T10:00:00+00:00"
  }
]
```

---

### POST /api/v1/goals

Create a new savings goal.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "name": "Vacation Fund",
  "targetAmount": 3000.00,
  "deadline": "2025-08-01",
  "category": "Travel",
  "icon": "airplane",
  "color": "#FF6B6B"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Goal name |
| targetAmount | float | Yes | Target amount in dollars |
| deadline | string | No | Target date (YYYY-MM-DD) |
| category | string | Yes | Goal category |
| icon | string | No | Icon name (default: `flag`) |
| color | string | No | Hex color code (default: `#6366F1`) |

**Response `200`:**

```json
{
  "id": "goal_550e8400-e29b-41d4-a716-446655440000",
  "name": "Vacation Fund",
  "targetAmount": 3000.00,
  "currentAmount": 0,
  "deadline": "2025-08-01",
  "category": "Travel",
  "icon": "airplane",
  "color": "#FF6B6B",
  "progress": 0,
  "createdAt": "2025-06-01T14:00:00+00:00"
}
```

---

### PUT /api/v1/goals/{goal_id}

Update an existing savings goal. All fields are optional.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| goal_id | string | Goal identifier |

**Request Body:**

```json
{
  "currentAmount": 2000.00,
  "targetAmount": 3500.00,
  "name": "Summer Vacation"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentAmount | float | No | Updated current amount |
| targetAmount | float | No | Updated target amount |
| name | string | No | Updated name |

**Response `200`:**

```json
{
  "success": true
}
```

---

### DELETE /api/v1/goals/{goal_id}

Delete a savings goal.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| goal_id | string | Goal identifier |

**Response `200`:**

```json
{
  "success": true
}
```

---

## Budgets

### GET /api/v1/budgets

List all budgets for the authenticated user.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "budget_1",
    "category": "Food & Dining",
    "budgetAmount": 600.00,
    "spentAmount": 450.00,
    "remaining": 150.00,
    "percentage": 75.0,
    "period": "monthly",
    "color": "#FF6B6B",
    "icon": "utensils"
  },
  {
    "id": "budget_2",
    "category": "Shopping",
    "budgetAmount": 400.00,
    "spentAmount": 315.00,
    "remaining": 85.00,
    "percentage": 78.8,
    "period": "monthly",
    "color": "#4ECDC4",
    "icon": "shopping-bag"
  }
]
```

---

### POST /api/v1/budgets

Create a new budget.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "category": "Food & Dining",
  "budgetAmount": 600.00,
  "period": "monthly",
  "color": "#FF6B6B",
  "icon": "utensils"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category | string | Yes | Budget category |
| budgetAmount | float | Yes | Budget limit |
| period | string | No | `monthly` or `weekly` (default: `monthly`) |
| color | string | No | Hex color (default: `#6366F1`) |
| icon | string | No | Icon name (default: `wallet`) |

**Response `200`:**

```json
{
  "id": "budget_550e8400-e29b-41d4-a716-446655440000",
  "category": "Food & Dining",
  "budgetAmount": 600.00,
  "spentAmount": 0,
  "remaining": 600.00,
  "percentage": 0,
  "period": "monthly",
  "color": "#FF6B6B",
  "icon": "utensils"
}
```

---

## User Preferences

### GET /api/v1/user/preferences

Get user app preferences.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "darkMode": false,
  "notificationsEnabled": true,
  "biometricsEnabled": false
}
```

---

### PUT /api/v1/user/preferences

Update user app preferences.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "darkMode": true,
  "notificationsEnabled": true,
  "biometricsEnabled": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| darkMode | boolean | Yes | Enable dark mode |
| notificationsEnabled | boolean | Yes | Enable push notifications |
| biometricsEnabled | boolean | Yes | Enable biometric login |

**Response `200`:**

```json
{
  "success": true
}
```
