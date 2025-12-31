# API Documentation

## Overview

The SwipeSavvy AI Agents API provides conversational AI capabilities for banking operations. Users can interact using natural language to check balances, view transactions, transfer money, and pay bills.

## Base URLs

- **Local Development**: `http://localhost:8000`
- **Production**: `https://api.swipesavvy.com`

## Authentication

Currently using user_id and session_id for identification. Production will add:
- OAuth 2.0 / JWT tokens
- API key authentication
- Rate limiting per user

## Core Endpoints

### Chat Interface

#### POST /api/v1/chat

Send a natural language message to the AI agent.

**Request:**
```json
{
  "message": "What's my account balance?",
  "session_id": "session_12345",
  "user_id": "user_67890"
}
```

**Response:**
```json
{
  "message": "Your current account balance is $1,234.56",
  "session_id": "session_12345",
  "timestamp": 1703347200.0,
  "guardrails_passed": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `422` - Validation error
- `500` - Internal server error

**Examples:**

```bash
# Balance inquiry
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my balance?",
    "session_id": "test_session",
    "user_id": "user123"
  }'

# Money transfer
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Transfer $100 to account 54321",
    "session_id": "test_session",
    "user_id": "user123"
  }'

# Bill payment
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pay electricity bill $150",
    "session_id": "test_session",
    "user_id": "user123"
  }'
```

### Health Checks

#### GET /health

Basic service health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": 1703347200.0,
  "version": "1.0.0-alpha",
  "uptime": 3600.5
}
```

#### GET /ready

Readiness probe for Kubernetes/Docker.

**Response:**
```json
{
  "ready": true,
  "checks": {
    "database": "ready",
    "ai_service": "ready"
  },
  "timestamp": 1703347200.0
}
```

#### GET /live

Liveness probe showing resource usage.

**Response:**
```json
{
  "alive": true,
  "timestamp": 1703347200.0,
  "memory_usage_mb": 245.6,
  "cpu_percent": 12.3
}
```

#### GET /metrics

Prometheus-compatible metrics.

**Response:** (text/plain)
```
# HELP service_uptime_seconds Service uptime in seconds
# TYPE service_uptime_seconds gauge
service_uptime_seconds 3600.5

# HELP process_memory_bytes Memory usage in bytes
# TYPE process_memory_bytes gauge
process_memory_bytes 257425408
```

### Guardrails Service

#### POST /api/v1/guardrails/check

Check content for safety violations, PII, and prompt injection.

**Request:**
```json
{
  "text": "My SSN is 123-45-6789",
  "check_safety": true,
  "check_pii": true,
  "check_injection": true
}
```

**Response:**
```json
{
  "is_safe": true,
  "has_pii": true,
  "is_injection": false,
  "masked_text": "My SSN is ***-**-****",
  "safety_violations": [],
  "pii_matches": [
    {
      "pii_type": "ssn",
      "confidence": 1.0
    }
  ]
}
```

### RAG Service

#### POST /api/v1/rag/search

Semantic search in knowledge base.

**Request:**
```json
{
  "query": "How do I transfer money?",
  "limit": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "content": "To transfer money...",
      "score": 0.95
    }
  ],
  "query": "How do I transfer money?",
  "count": 5
}
```

## Supported Operations

### Banking Operations

1. **Balance Inquiry**
   - "What's my balance?"
   - "How much money do I have?"
   - "Check my account balance"

2. **Transaction History**
   - "Show my recent transactions"
   - "What are my last 10 transactions?"
   - "Show payment history"

3. **Money Transfer**
   - "Transfer $100 to account 54321"
   - "Send money to John's account"
   - "Move $50 to savings"

4. **Bill Payment**
   - "Pay electricity bill $150"
   - "Pay my water bill"
   - "Make a bill payment of $200"

## Error Handling

### Error Response Format

```json
{
  "error": "ValidationError",
  "detail": "Invalid session_id format",
  "timestamp": 1703347200.0
}
```

### Common Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | BadRequest | Invalid request format |
| 422 | ValidationError | Missing or invalid fields |
| 429 | RateLimitExceeded | Too many requests |
| 500 | InternalError | Server error |
| 503 | ServiceUnavailable | Service temporarily down |

## Rate Limiting

- **Default**: 100 requests per minute per user
- **Burst**: Up to 20 concurrent requests
- **Headers**:
  - `X-RateLimit-Limit`: Total allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Guardrails

All user inputs pass through guardrails:

1. **Content Safety**: Blocks harmful content (violence, hate speech, etc.)
2. **PII Detection**: Masks sensitive data (SSN, credit cards, emails)
3. **Prompt Injection**: Prevents AI jailbreak attempts

## Session Management

- Sessions persist conversation context
- Session expires after 30 minutes of inactivity
- Use same `session_id` for multi-turn conversations

## Best Practices

1. **Reuse Sessions**: Keep session_id for related conversations
2. **Handle Errors**: Implement retry logic with exponential backoff
3. **Validate Inputs**: Check user inputs before sending
4. **Monitor Rate Limits**: Track response headers
5. **Secure Credentials**: Never hardcode user_id or tokens

## SDKs and Tools

### Python Example

```python
import httpx

async def chat(message: str, session_id: str, user_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/api/v1/chat",
            json={
                "message": message,
                "session_id": session_id,
                "user_id": user_id
            }
        )
        return response.json()
```

### cURL Example

```bash
#!/bin/bash
SESSION_ID="session_$(date +%s)"
USER_ID="user_12345"

curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"$1\",
    \"session_id\": \"$SESSION_ID\",
    \"user_id\": \"$USER_ID\"
  }"
```

## Postman Collection

Import the OpenAPI spec into Postman:
1. Open Postman
2. Import → Upload Files
3. Select `docs/api/openapi.yaml`
4. Configure environment variables

## Support

- **Documentation**: [docs/api/](.)
- **OpenAPI Spec**: [openapi.yaml](openapi.yaml)
- **Issues**: GitHub Issues
- **Email**: engineering@swipesavvy.com

## Changelog

### v1.0.0-alpha (2025-12-23)
- Initial API release
- Chat interface
- Guardrails integration
- RAG search
- Health checks
- Prometheus metrics
