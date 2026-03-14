# Chat API

Base path: `/api/v1/chat`

Source: `chat.py`

Provides real-time chat via WebSocket and REST APIs for session management, messaging, and user moderation.

---

## Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| WS | `/ws/{chat_session_id}` | Token (query param) | WebSocket real-time chat |
| POST | `/sessions` | JWT Bearer | Create a chat session |
| GET | `/sessions/{session_id}` | JWT Bearer | Get session details |
| GET | `/sessions/{session_id}/messages` | JWT Bearer | Get session messages |
| POST | `/sessions/{session_id}/mark-read` | JWT Bearer | Mark messages as read |
| POST | `/sessions/{session_id}/close` | JWT Bearer | Close a chat session |
| GET | `/sessions/{session_id}/participants` | JWT Bearer | Get session participants |
| POST | `/block` | JWT Bearer | Block a user |
| POST | `/unblock` | JWT Bearer | Unblock a user |
| GET | `/ws-stats` | JWT Bearer | Get WebSocket statistics |

---

## WebSocket: /api/v1/chat/ws/{chat_session_id}

Real-time bidirectional chat connection.

**Authentication:** JWT token passed as query parameter:

```
wss://api.swipesavvy.com/api/v1/chat/ws/{chat_session_id}?token=<jwt_token>
```

**Connection Flow:**
1. Client connects with session ID and JWT token
2. Server validates token and checks session participation
3. On success, connection is accepted
4. Client sends/receives JSON messages

**Sending a Text Message:**

```json
{
  "message_type": "text",
  "content": "Hello, I need help with my account",
  "reply_to_id": null,
  "mentions": []
}
```

**Sending a Typing Indicator:**

```json
{
  "message_type": "typing",
  "content": "true"
}
```

**Received Message (broadcast):**

```json
{
  "message_type": "message",
  "chat_session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_abc123",
  "content": "Hello, I need help with my account",
  "metadata": {
    "message_id": "msg_abc123",
    "reply_to_id": null,
    "mentions": []
  },
  "timestamp": "2025-06-01T14:00:00"
}
```

**Message Types:**
- `text` -- Regular text message
- `image` -- Image attachment
- `file` -- File attachment
- `typing` -- Typing indicator
- `system` -- System message
- `notification` -- Notification message

**Error Response:**

```json
{
  "success": false,
  "message": "Content required for text messages"
}
```

**WebSocket Close Codes:**
- `1008` -- Policy violation (no auth, invalid token, not a participant)
- `1011` -- Server error during validation

---

## POST /api/v1/chat/sessions

Create a new chat session.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "title": "Account Help",
  "assigned_agent_id": "agent_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | Session title/topic |
| assigned_agent_id | UUID | No | Assign to specific support agent |

**Response `200`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Account Help",
  "status": "active",
  "initiator_id": "user_abc123",
  "assigned_agent_id": "agent_abc123",
  "created_at": "2025-06-01T14:00:00",
  "started_at": null,
  "closed_at": null,
  "total_messages": 0,
  "unread_count": 0
}
```

---

## GET /api/v1/chat/sessions/{session_id}

Get details of a specific chat session. User must be a participant.

**Auth:** JWT Bearer

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| session_id | UUID | Chat session ID |

**Response `200`:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Account Help",
  "status": "active",
  "initiator_id": "user_abc123",
  "assigned_agent_id": "agent_abc123",
  "created_at": "2025-06-01T14:00:00",
  "started_at": "2025-06-01T14:01:00",
  "closed_at": null,
  "total_messages": 15,
  "unread_count": 3
}
```

**Errors:**
- `403` - Not a participant
- `404` - Session not found

---

## GET /api/v1/chat/sessions/{session_id}/messages

Get messages from a chat session with pagination.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | int | 50 | Messages per page (1-100) |
| offset | int | 0 | Pagination offset |

**Response `200`:**

```json
[
  {
    "id": "msg_abc123",
    "chat_session_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "user_abc123",
    "message_type": "text",
    "content": "Hello, I need help with my account",
    "file_url": null,
    "file_name": null,
    "file_size": null,
    "file_type": null,
    "status": "delivered",
    "created_at": "2025-06-01T14:01:00",
    "edited_at": null,
    "deleted_at": null,
    "read_by_count": 2
  }
]
```

**Errors:**
- `403` - Not a participant

---

## POST /api/v1/chat/sessions/{session_id}/mark-read

Mark all messages up to a specific message as read.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "up_to_message_id": "msg_abc123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| up_to_message_id | UUID | Yes | Mark all messages up to and including this one |

**Response `200`:**

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2025-06-01T14:05:00"
}
```

**Errors:**
- `400` - Failed to mark as read
- `403` - Not a participant

---

## POST /api/v1/chat/sessions/{session_id}/close

Close a chat session. Only the session initiator or assigned agent can close it.

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "success": true,
  "message": "Session closed",
  "data": null,
  "timestamp": "2025-06-01T15:00:00"
}
```

**Errors:**
- `403` - Cannot close this session
- `404` - Session not found

---

## GET /api/v1/chat/sessions/{session_id}/participants

Get all participants in a chat session.

**Auth:** JWT Bearer

**Response `200`:**

```json
[
  {
    "id": "part_abc123",
    "user_id": "user_abc123",
    "role": "initiator",
    "joined_at": "2025-06-01T14:00:00",
    "is_active": true,
    "last_read_at": "2025-06-01T14:05:00"
  },
  {
    "id": "part_def456",
    "user_id": "agent_abc123",
    "role": "agent",
    "joined_at": "2025-06-01T14:01:00",
    "is_active": true,
    "last_read_at": "2025-06-01T14:04:00"
  }
]
```

**Errors:**
- `403` - Not a participant

---

## POST /api/v1/chat/block

Block a user from sending messages to you.

**Auth:** JWT Bearer

**Request Body:**

```json
{
  "blocked_user_id": "user_xyz789",
  "reason": "Spam messages"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| blocked_user_id | UUID | Yes | ID of user to block |
| reason | string | No | Reason for blocking |

**Response `200`:**

```json
{
  "success": true,
  "message": "User blocked",
  "data": null,
  "timestamp": "2025-06-01T14:00:00"
}
```

---

## POST /api/v1/chat/unblock

Unblock a previously blocked user.

**Auth:** JWT Bearer

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| blocked_user_id | UUID | Yes | ID of user to unblock |

**Response `200`:**

```json
{
  "success": true,
  "message": "User unblocked",
  "data": null,
  "timestamp": "2025-06-01T14:00:00"
}
```

**Errors:**
- `400` - User not blocked

---

## GET /api/v1/chat/ws-stats

Get WebSocket connection statistics (admin use).

**Auth:** JWT Bearer

**Response `200`:**

```json
{
  "active_connections": 15,
  "active_sessions": 8,
  "total_messages_today": 245,
  "peak_connections": 32
}
```
