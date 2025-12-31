# WebSocket Chat Implementation Guide
**For:** Mobile App & Admin Portal Integration  
**Version:** 1.0  
**Last Updated:** December 29, 2025  

---

## Quick Start

### Server Running?
```bash
# Check if server is running
curl -s http://localhost:8000/openapi.json | jq '.info.title'
# Output: "SwipeSavvy Backend API"
```

### Chat Endpoints Available?
```bash
# List all chat endpoints
curl -s http://localhost:8000/openapi.json | jq '.paths | keys[]' | grep chat
```

**Expected Output (10 endpoints):**
```
/api/v1/chat/block
/api/v1/chat/sessions
/api/v1/chat/sessions/{session_id}
/api/v1/chat/sessions/{session_id}/close
/api/v1/chat/sessions/{session_id}/mark-read
/api/v1/chat/sessions/{session_id}/messages
/api/v1/chat/sessions/{session_id}/participants
/api/v1/chat/unblock
/api/v1/chat/ws
/api/v1/chat/ws-stats
```

---

## WebSocket Connection (Client Side)

### 1. JavaScript/Web Implementation

```javascript
// Initialize WebSocket
const token = localStorage.getItem('jwt_token');
const sessionId = 'your-chat-session-id';
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/${sessionId}?token=${token}`
);

// Handle connection
ws.onopen = (event) => {
  console.log('Connected to chat');
};

// Handle messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.message_type === 'message') {
    console.log('New message:', message.content);
    // Update UI with message
  } else if (message.message_type === 'typing_indicator') {
    if (message.metadata.is_typing) {
      console.log(`${message.user_id} is typing...`);
    }
  } else if (message.message_type === 'user_joined') {
    console.log(`User joined. Total: ${message.metadata.total_users}`);
  } else if (message.message_type === 'user_left') {
    console.log(`User left. Total: ${message.metadata.total_users}`);
  }
};

// Send message
function sendMessage(content) {
  const message = {
    message_type: 'text',
    content: content
  };
  ws.send(JSON.stringify(message));
}

// Send typing indicator
function setTyping(isTyping) {
  const message = {
    message_type: 'typing',
    content: isTyping ? 'true' : 'false'
  };
  ws.send(JSON.stringify(message));
}

// Handle disconnect
ws.onclose = (event) => {
  console.log('Disconnected from chat');
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

### 2. React Implementation

```jsx
import { useEffect, useState, useRef } from 'react';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(0);
  const ws = useRef(null);
  
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const sessionId = new URLSearchParams(window.location.search).get('session');
    
    // Connect to WebSocket
    ws.current = new WebSocket(
      `ws://localhost:8000/api/v1/chat/ws/${sessionId}?token=${token}`
    );
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.message_type === 'message') {
        setMessages(prev => [...prev, message]);
      } else if (message.message_type === 'user_joined') {
        setConnectedUsers(message.metadata.total_users);
      } else if (message.message_type === 'user_left') {
        setConnectedUsers(message.metadata.total_users);
      }
    };
    
    return () => ws.current?.close();
  }, []);
  
  const handleSendMessage = (text) => {
    ws.current.send(JSON.stringify({
      message_type: 'text',
      content: text
    }));
  };
  
  const handleTyping = (isTyping) => {
    ws.current.send(JSON.stringify({
      message_type: 'typing',
      content: isTyping ? 'true' : 'false'
    }));
  };
  
  return (
    <div className="chat">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.metadata.message_id} className="message">
            <strong>{msg.user_id}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="status">Connected users: {connectedUsers}</div>
      <input 
        onChange={(e) => handleTyping(e.currentTarget.value.length > 0)}
      />
      <button onClick={() => handleSendMessage(inputValue)}>Send</button>
    </div>
  );
}

export default ChatComponent;
```

### 3. React Native / Expo Implementation

```javascript
import { useEffect, useRef, useState } from 'react';

export function useChatWebSocket(sessionId) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const token = AsyncStorage.getItem('jwt_token');
    
    ws.current = new WebSocket(
      `wss://api.swipesavvy.app/api/v1/chat/ws/${sessionId}?token=${token}`
    );
    
    ws.current.onopen = () => setIsConnected(true);
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.message_type === 'message') {
        setMessages(prev => [...prev, message]);
      } else if (message.message_type === 'user_joined') {
        setUsers(prev => [...prev, { id: message.user_id }]);
      }
    };
    
    ws.current.onclose = () => setIsConnected(false);
    
    return () => ws.current?.close();
  }, [sessionId]);
  
  const sendMessage = (content) => {
    ws.current.send(JSON.stringify({
      message_type: 'text',
      content
    }));
  };
  
  const sendFile = (fileUri, fileName, fileType) => {
    // Upload file first, get URL
    const fileUrl = uploadFile(fileUri); // Your upload logic
    
    ws.current.send(JSON.stringify({
      message_type: 'file',
      content: fileName,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType
    }));
  };
  
  return {
    messages,
    isConnected,
    users,
    sendMessage,
    sendFile
  };
}

// Usage in component
export function ChatScreen() {
  const { messages, isConnected, sendMessage } = useChatWebSocket(sessionId);
  
  return (
    <SafeAreaView>
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessageItem message={item} />}
      />
      <ChatInput onSend={sendMessage} />
    </SafeAreaView>
  );
}
```

---

## REST API Usage

### Creating a Chat Session

```bash
curl -X POST http://localhost:8000/api/v1/chat/sessions \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Support Chat",
    "assigned_agent_id": null
  }'

# Response
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Support Chat",
  "status": "active",
  "initiator_id": "550e8400-e29b-41d4-a716-446655440001",
  "assigned_agent_id": null,
  "created_at": "2025-12-29T10:00:00",
  "started_at": null,
  "closed_at": null,
  "total_messages": 0,
  "unread_count": 0
}
```

### Getting Message History

```bash
curl "http://localhost:8000/api/v1/chat/sessions/{session_id}/messages?limit=50&offset=0" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "chat_session_id": "550e8400-e29b-41d4-a716-446655440000",
    "sender_id": "550e8400-e29b-41d4-a716-446655440001",
    "message_type": "text",
    "content": "Hello, I need help with my wallet",
    "status": "read",
    "created_at": "2025-12-29T10:05:00",
    "read_by_count": 1
  }
]
```

### Marking Messages as Read

```bash
curl -X POST "http://localhost:8000/api/v1/chat/sessions/{session_id}/mark-read" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "up_to_message_id": "550e8400-e29b-41d4-a716-446655440010"
  }'

# Response
{
  "success": true,
  "message": "Messages marked as read",
  "timestamp": "2025-12-29T10:06:00"
}
```

### Closing a Chat Session

```bash
curl -X POST "http://localhost:8000/api/v1/chat/sessions/{session_id}/close" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response
{
  "success": true,
  "message": "Session closed"
}
```

### Getting Session Participants

```bash
curl "http://localhost:8000/api/v1/chat/sessions/{session_id}/participants" \
  -H "Authorization: Bearer $JWT_TOKEN"

# Response
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "user_id": "550e8400-e29b-41d4-a716-446655440001",
    "role": "user",
    "joined_at": "2025-12-29T10:00:00",
    "is_active": true,
    "last_read_at": "2025-12-29T10:06:00"
  }
]
```

---

## WebSocket Message Types

### 1. Text Message
```json
{
  "message_type": "text",
  "content": "Hello, how can I help you?",
  "reply_to_id": null,
  "mentions": ["user-id-1", "user-id-2"]
}
```

**Server Response:**
```json
{
  "message_type": "message",
  "chat_session_id": "session-id",
  "user_id": "user-id",
  "content": "Hello, how can I help you?",
  "timestamp": "2025-12-29T10:05:00",
  "metadata": {
    "message_id": "message-id",
    "reply_to_id": null,
    "mentions": ["user-id-1", "user-id-2"]
  }
}
```

### 2. File/Image Message
```json
{
  "message_type": "file",
  "content": "Receipt.pdf",
  "file_url": "https://bucket.s3.amazonaws.com/files/receipt.pdf",
  "file_name": "Receipt.pdf",
  "file_size": 245000,
  "file_type": "application/pdf"
}
```

### 3. Typing Indicator
```json
{
  "message_type": "typing",
  "content": "true"
}
```

**Server Broadcasts:**
```json
{
  "message_type": "typing_indicator",
  "chat_session_id": "session-id",
  "user_id": "user-id",
  "timestamp": "2025-12-29T10:05:00",
  "metadata": {
    "is_typing": true
  }
}
```

### 4. User Joined
```json
{
  "message_type": "user_joined",
  "chat_session_id": "session-id",
  "user_id": "user-id",
  "timestamp": "2025-12-29T10:00:00",
  "metadata": {
    "total_users": 2
  }
}
```

### 5. User Left
```json
{
  "message_type": "user_left",
  "chat_session_id": "session-id",
  "user_id": "user-id",
  "timestamp": "2025-12-29T10:10:00",
  "metadata": {
    "total_users": 1
  }
}
```

---

## Error Handling

### WebSocket Errors

| Error Code | Reason | Action |
|-----------|--------|--------|
| 1008 | Policy Violation | Invalid token, user not participant, session not found |
| 1011 | Server Error | Internal server error - retry connection |

### REST API Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Bad Request | Check request format and required fields |
| 401 | Unauthorized | JWT token invalid or expired, re-authenticate |
| 403 | Forbidden | User is not a participant in this session |
| 404 | Not Found | Session or resource doesn't exist |
| 500 | Server Error | Server error occurred, retry later |

### Example Error Handling

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  
  // Attempt reconnection
  setTimeout(() => {
    connectWebSocket();
  }, 5000);
};

ws.onclose = (event) => {
  if (event.code === 1008) {
    // Policy violation - likely auth issue
    console.error('Authentication failed');
    // Redirect to login
    window.location.href = '/login';
  } else if (event.code === 1011) {
    // Server error - retry connection
    setTimeout(() => {
      connectWebSocket();
    }, 5000);
  }
};
```

---

## Authentication Flow

### Step 1: Get JWT Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Step 2: Use Token for Chat
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/chat/ws/{session_id}?token=${token}`
);
```

### Step 3: Use Token for REST Calls
```javascript
const response = await fetch(
  'http://localhost:8000/api/v1/chat/sessions',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'New Chat' })
  }
);
```

---

## Performance Tips

### 1. Message Pagination
```javascript
// Load messages in batches
async function loadMoreMessages(sessionId, offset) {
  const response = await fetch(
    `http://localhost:8000/api/v1/chat/sessions/${sessionId}/messages?limit=50&offset=${offset}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  return response.json();
}

// Load initial 50 messages
const initialMessages = await loadMoreMessages(sessionId, 0);

// Load next 50 on scroll
const nextMessages = await loadMoreMessages(sessionId, 50);
```

### 2. Typing Indicator Throttling
```javascript
let typingTimer = null;

input.addEventListener('input', () => {
  clearTimeout(typingTimer);
  
  // Send typing indicator
  ws.send(JSON.stringify({
    message_type: 'typing',
    content: 'true'
  }));
  
  // Stop typing after 3 seconds of inactivity
  typingTimer = setTimeout(() => {
    ws.send(JSON.stringify({
      message_type: 'typing',
      content: 'false'
    }));
  }, 3000);
});
```

### 3. Connection Pooling
```javascript
// Reuse WebSocket connection for multiple sessions
const connections = new Map();

function getConnection(sessionId, token) {
  if (connections.has(sessionId)) {
    return connections.get(sessionId);
  }
  
  const ws = new WebSocket(
    `ws://localhost:8000/api/v1/chat/ws/${sessionId}?token=${token}`
  );
  
  connections.set(sessionId, ws);
  return ws;
}
```

---

## Testing

### Test WebSocket Connection with websocat
```bash
# Install websocat: brew install websocat

# Connect to chat
websocat "ws://localhost:8000/api/v1/chat/ws/session-id?token=JWT_TOKEN"

# Send test message
{"message_type": "text", "content": "Hello from test"}

# Send typing
{"message_type": "typing", "content": "true"}

# Disconnect
Ctrl+C
```

### Test with curl (REST endpoints)
```bash
#!/bin/bash

TOKEN="your-jwt-token"
SESSION_ID="your-session-id"

# Create session
SESSION=$(curl -s -X POST http://localhost:8000/api/v1/chat/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat"}')

SESSION_ID=$(echo $SESSION | jq -r '.id')
echo "Created session: $SESSION_ID"

# Get messages
curl -s "http://localhost:8000/api/v1/chat/sessions/$SESSION_ID/messages" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get participants
curl -s "http://localhost:8000/api/v1/chat/sessions/$SESSION_ID/participants" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## Deployment

### Production Considerations

1. **WebSocket Proxy Configuration** (NGINX)
```nginx
upstream backend {
    server localhost:8000;
}

server {
    listen 443 ssl;
    server_name api.swipesavvy.app;
    
    location /api/v1/chat/ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    location /api/v1/chat {
        proxy_pass http://backend;
    }
}
```

2. **Load Balancing WebSocket**
- Use session affinity (sticky sessions)
- Route by session ID for proper connection management
- Consider using Redis for cross-server session state

3. **Monitoring**
```bash
# Check connection stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/chat/ws-stats

# Response
{
  "total_sessions": 5,
  "total_connections": 12,
  "average_users_per_session": 2.4,
  "sessions": {
    "session-1": { "user_count": 2, "typing_count": 1 }
  }
}
```

---

## Summary

The WebSocket chat system is production-ready with:
- ✅ Real-time messaging
- ✅ Typing indicators  
- ✅ User blocking
- ✅ Message history with pagination
- ✅ Read receipts
- ✅ File attachments
- ✅ JWT authentication
- ✅ Error handling
- ✅ Connection pooling

Refer to individual client libraries for specific language implementations.
