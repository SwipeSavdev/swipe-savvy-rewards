# 📊 AI CONCIERGE ARCHITECTURE & FLOW DIAGRAM

**Comprehensive Overview of SwipeSavvy AI Integration**

---

## ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBILE APPLICATION (Expo)                   │
│                  /Users/macbookpro/.../swipesavvy-              │
│                        mobile-app-v2                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         ChatScreen Component                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ User Types Message → Send Button Clicked       │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │         useAIChat Hook                                  │   │
│  │  - Manages message state                               │   │
│  │  - Handles streaming responses                         │   │
│  │  - Validates authentication                            │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │         AIClient.ts (SwipeSavvyAI)                      │   │
│  │  ✅ Endpoint: /concierge/api/v1/chat                    │   │
│  │  ✅ Method: POST                                         │   │
│  │  ✅ Headers: Authorization, Content-Type               │   │
│  │  ✅ Request: message, user_id, session_id, context    │   │
│  │  ✅ Response: Server-Sent Events (SSE)                │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
└───────────────────────┼───────────────────────────────────────────┘
                        │ HTTPS/HTTP
                        │ Bearer Token
                        │ message=...
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API (FastAPI)                         │
│              Port 8000 - swipesavvy-ai-agents                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Main App (app/main.py)                                 │   │
│  │  - Mounts Concierge Service at /concierge              │   │
│  │  - Routes: /health, /api/*, /concierge/*              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Concierge Service (services/concierge_service/main.py) │   │
│  │                                                          │   │
│  │  @app.post("/api/v1/chat")                            │   │
│  │    ├─ Receive ChatRequest                             │   │
│  │    ├─ Validate user_id & authentication              │   │
│  │    ├─ Check guardrails (safety filters)              │   │
│  │    ├─ Fetch RAG context (knowledge base)             │   │
│  │    └─ Return: StreamingResponse (SSE)                │   │
│  │                                                          │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  LLM Integration (Together AI)                         │   │
│  │                                                          │   │
│  │  together_client.chat.completions.create(            │   │
│  │    model="meta-llama/Meta-Llama-3.1-70B...",        │   │
│  │    messages=[system, ...conversation],               │   │
│  │    stream=True                                       │   │
│  │  )                                                     │   │
│  │                                                          │   │
│  │  REQUIREMENT: TOGETHER_API_KEY environment variable   │   │
│  │  ❌ CURRENTLY: EMPTY (causing 401 errors)              │   │
│  │                                                          │   │
│  └────────────────────┬─────────────────────────────────────┘   │
│                       │                                           │
│  ┌────────────────────▼─────────────────────────────────────┐   │
│  │  Supporting Services                                   │   │
│  │  - RAG Service (/rag) - Knowledge base retrieval      │   │
│  │  - Guardrails (/guardrails) - Safety checking        │   │
│  │  - Database - PostgreSQL for conversation history    │   │
│  │                                                          │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## REQUEST-RESPONSE FLOW

### REQUEST (Mobile → Backend)

```
POST /concierge/api/v1/chat
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "message": "What are my recent transactions?",
  "user_id": "user-123",
  "session_id": "session-abc-2025-12-30",
  "context": {
    "screen": "ChatScreen",
    "action": "send_message",
    "timestamp": "2025-12-30T07:47:34Z"
  }
}
```

### RESPONSE (Backend → Mobile)

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked

data: {"type": "thinking"}

data: {"type": "message", "delta": "I", "content": "I"}

data: {"type": "message", "delta": " can", "content": "I can"}

data: {"type": "message", "delta": " help", "content": "I can help"}

data: {"type": "message", "delta": " you", "content": "I can help you"}

data: {"type": "message", "delta": " with", "content": "I can help you with"}

data: {"type": "message", "delta": " that!", "content": "I can help you with that!"}

data: {"type": "done", "message_id": "msg-123", "session_id": "session-abc-2025-12-30"}

data: [DONE]
```

---

## MESSAGE FLOW SEQUENCE

```
PARTICIPANT Mobile as Mobile App
PARTICIPANT AI as AIClient.ts
PARTICIPANT HTTP as HTTP/1.1
PARTICIPANT Backend as Concierge Service
PARTICIPANT LLM as Together AI LLM

Mobile->>AI: chat("What can you help?")
AI->>HTTP: POST /concierge/api/v1/chat
HTTP->>Backend: Request arrives

Backend->>Backend: Validate token
Backend->>Backend: Check guardrails
Backend->>Backend: Fetch RAG context
Backend->>LLM: Generate response (stream)

LLM-->>Backend: "I can"
Backend->>HTTP: SSE: {"delta": "I can"}
HTTP-->>AI: onprogress event
AI->>Mobile: yield ChatEvent

LLM-->>Backend: " help"
Backend->>HTTP: SSE: {"delta": " help"}
HTTP-->>AI: onprogress event
AI->>Mobile: yield ChatEvent

LLM-->>Backend: " you"
Backend->>HTTP: SSE: {"delta": " you"}
HTTP-->>AI: onprogress event
AI->>Mobile: yield ChatEvent

LLM-->>Backend: [DONE]
Backend->>HTTP: SSE: {"type": "done"}
HTTP-->>AI: onprogress event
AI->>Mobile: yield ChatEvent

Mobile->>Mobile: Render message: "I can help you"
```

---

## DATA MODELS

### ChatRequest (Mobile → Backend)

```typescript
interface ChatRequest {
  message: string;              // User's message
  user_id: string;             // Logged-in user ID
  session_id?: string;         // Conversation session ID (optional)
  context?: {                  // Additional context (optional)
    screen?: string;           // Screen name (e.g., "ChatScreen")
    action?: string;           // Action (e.g., "send_message")
    timestamp?: string;        // ISO timestamp
  };
}
```

### ChatEvent (Backend → Mobile)

```typescript
interface ChatEvent {
  type: 'thinking' | 'tool_call' | 'message' | 'done' | 'error';
  content?: string;            // Full message content (for 'message')
  delta?: string;              // Incremental text (for 'message')
  tool?: string;               // Tool name (for 'tool_call')
  args?: any;                  // Tool arguments (for 'tool_call')
  result?: any;                // Tool result (for 'tool_result')
  message_id?: string;         // Message ID (for 'done')
  session_id?: string;         // Session ID (for 'done')
  error?: string;              // Error message (for 'error')
}
```

---

## ENDPOINT SUMMARY

| Endpoint | Method | Purpose | Status | Issue |
|----------|--------|---------|--------|-------|
| `/health` | GET | Backend health | ✅ Working | None |
| `/concierge/health` | GET | Concierge health | ✅ Working | None |
| `/concierge/api/v1/chat` | POST | Chat (MAIN) | ✅ Accessible | ❌ 401: Missing API key |
| `/concierge/api/v1/auth/login` | POST | User login | ✅ Working | None |
| `/concierge/api/v1/auth/signup` | POST | User signup | ✅ Working | None |
| `/concierge/api/v1/transactions/{user_id}` | GET | Get transactions | ✅ Working | None |
| `/concierge/api/v1/accounts/{user_id}` | GET | Get accounts | ✅ Working | None |
| `/concierge/api/v1/rewards/points/{user_id}` | GET | Get reward points | ✅ Working | None |
| `/api/v1/chat/sessions` | GET | List sessions | ⚠️ Requires Auth | Needs JWT |
| `/api/support` | POST | Create support ticket | ❌ 405 | Route conflict |

---

## CRITICAL ISSUES FOUND

### 🔴 ISSUE 1: Missing TOGETHER_API_KEY

**Severity:** CRITICAL  
**Location:** `/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents/.env`

**Current:**
```
TOGETHER_API_KEY=your_together_api_key_here
```

**Should be:**
```
TOGETHER_API_KEY=sk_1234567890abcdef...
```

**Impact:** All AI responses return 401 error  
**Fix Time:** 5 minutes  
**Steps:**
1. Get key from https://api.together.ai/settings/api-keys
2. Update .env file
3. Restart backend

---

### 🔴 ISSUE 2: Mobile App Won't Start (Exit Code 137)

**Severity:** CRITICAL  
**Location:** Expo dev server startup

**Current:** Process killed (SIGKILL)  
**Impact:** Cannot test mobile integration

**Fix Time:** 10-15 minutes  
**Steps:**
1. Kill all Expo processes
2. Clear watchman and caches
3. Clean reinstall dependencies
4. Start with `npx expo start --clear`

---

### 🟡 ISSUE 3: Authentication Not Tested

**Severity:** HIGH  
**Location:** End-to-end flow

**Current:** No live test of JWT token with streaming  
**Impact:** Cannot verify real user authentication

**Fix Time:** 20 minutes (after other issues fixed)  
**Steps:**
1. Get mobile app running
2. User login → receive accessToken
3. Send message with token
4. Verify response

---

## ENVIRONMENT VARIABLES CHECKLIST

### Backend Required
- [x] `PORT=8000`
- [x] `DATABASE_URL=postgresql://...`
- [ ] `TOGETHER_API_KEY=sk_...` **← MISSING**

### Mobile Required
- [x] `AI_API_BASE_URL=http://192.168.1.142:8000`
- [x] `MOCK_API=false`
- [x] `ENABLE_AI_CONCIERGE=true`

---

## SUCCESS INDICATORS

### ✅ Health Check Working
```bash
curl http://localhost:8000/concierge/health
# Returns: {"status":"healthy","version":"1.0.0",...}
```

### ✅ Endpoint Accessible
```bash
curl -X POST http://localhost:8000/concierge/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","user_id":"user1"}'
# Returns: SSE stream (or 401 if API key missing)
```

### ✅ Mobile App Running
```bash
npx expo start --clear
# Shows: "Metro waiting on exp://192.168.x.x:8081"
```

### ✅ Real Response Working
```
User sends: "Hello"
App receives: "I can help you with..."
Response appears word-by-word in real-time
```

---

## NEXT STEPS

1. **[IMMEDIATE]** Set `TOGETHER_API_KEY` in backend `.env`
2. **[IMMEDIATE]** Fix Expo mobile app startup issues
3. **[URGENT]** Test end-to-end flow: Login → Chat → Response
4. **[FOLLOW-UP]** Monitor logs for errors
5. **[FOLLOW-UP]** Test with real user scenarios

---

## REFERENCE DOCUMENTATION

- [Complete Audit Report](AI_APIS_AUDIT_REPORT.md)
- [Implementation Guide](AI_IMPLEMENTATION_FIX_GUIDE.md)
- [EXPO Quick Start](EXPO_QUICK_START.md)

---

**Audit Date:** December 30, 2025 07:47 EST  
**Status:** Issues Documented & Ready for Fix  
**Priority:** P0 - Blocking Feature
