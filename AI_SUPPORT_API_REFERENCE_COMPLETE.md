# AI Support Concierge - Complete API Reference

## 📖 API Documentation

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Base URL:** `http://localhost:8000/api`  
**Authentication:** Optional (configurable)

---

## 🔐 Authentication

The API currently supports optional Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/support/analyze
```

To enable authentication in production, uncomment the security middleware in `app/routes/ai_support.py`.

---

## 📝 Endpoints

### 1. Analyze Issue

**Endpoint:** `POST /support/analyze`

Analyzes an issue and returns classification, severity, and resolution steps.

**Request:**
```json
{
  "issue_description": "Database connection timeout when fetching user data",
  "context": "Occurs during peak hours (5-6 PM UTC)"
}
```

**Request Schema:**
```python
class IssueRequest(BaseModel):
    issue_description: str  # Required, 10-5000 characters
    context: Optional[str]  # Optional context, up to 1000 characters
```

**Response (200 OK):**
```json
{
  "status": "success",
  "severity": "CRITICAL",
  "confidence": 0.92,
  "components": [
    {
      "name": "database",
      "probability": 0.95
    },
    {
      "name": "backend",
      "probability": 0.87
    }
  ],
  "resolution_steps": [
    {
      "step": 1,
      "title": "Check Database Connectivity",
      "description": "Verify PostgreSQL is running...",
      "estimated_time": "5 minutes"
    },
    {
      "step": 2,
      "title": "Check Connection Pool",
      "description": "Verify connection pool settings...",
      "estimated_time": "10 minutes"
    }
  ],
  "related_documentation": [
    {
      "title": "Database Configuration Guide",
      "preview": "This guide covers database setup and configuration...",
      "relevance": 0.89
    }
  ],
  "escalation_required": false,
  "estimated_resolution_time": "15 minutes"
}
```

**Response Schema:**
```python
class SeverityLevel(str):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"

class ComponentScore(BaseModel):
    name: str
    probability: float

class ResolutionStep(BaseModel):
    step: int
    title: str
    description: str
    estimated_time: str

class DocumentReference(BaseModel):
    title: str
    preview: str
    relevance: float

class AnalysisResponse(BaseModel):
    status: str
    severity: SeverityLevel
    confidence: float
    components: List[ComponentScore]
    resolution_steps: List[ResolutionStep]
    related_documentation: List[DocumentReference]
    escalation_required: bool
    estimated_resolution_time: str
```

**HTTP Status Codes:**
- `200 OK` - Analysis successful
- `400 Bad Request` - Invalid request format
- `422 Unprocessable Entity` - Validation error

**Examples:**

```bash
# Example 1: Simple issue
curl -X POST http://localhost:8000/api/support/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue_description": "Frontend button not responding to clicks"
  }'

# Example 2: Complex issue with context
curl -X POST http://localhost:8000/api/support/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue_description": "API returns 500 error on user registration",
    "context": "User registration was working yesterday, started failing after deployment"
  }'

# Python example
import requests

response = requests.post(
    'http://localhost:8000/api/support/analyze',
    json={
        'issue_description': 'Database connection timeout',
        'context': 'Peak hours'
    }
)
result = response.json()
print(f"Severity: {result['severity']}")
print(f"Confidence: {result['confidence']}")
```

---

### 2. Search Documentation

**Endpoint:** `POST /support/search`

Searches the documentation index for relevant files and content.

**Request:**
```json
{
  "query": "authentication fails",
  "limit": 10
}
```

**Request Schema:**
```python
class DocumentSearchRequest(BaseModel):
    query: str  # Search term (required)
    limit: Optional[int] = 10  # Max results (default 10)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "query": "authentication fails",
  "results_count": 3,
  "results": [
    {
      "file_path": "docs/authentication_guide.md",
      "title": "Authentication Configuration Guide",
      "preview": "This guide explains how to set up and configure authentication...",
      "relevance_score": 0.95,
      "file_size": 15234,
      "last_modified": "2025-12-20T10:30:00Z"
    },
    {
      "file_path": "docs/troubleshooting.md",
      "title": "Troubleshooting Common Issues",
      "preview": "Section: Authentication troubleshooting covers failed login attempts...",
      "relevance_score": 0.87,
      "file_size": 32456,
      "last_modified": "2025-12-15T14:22:00Z"
    }
  ],
  "search_time_ms": 125
}
```

**Response Schema:**
```python
class DocumentResult(BaseModel):
    file_path: str
    title: str
    preview: str
    relevance_score: float
    file_size: int
    last_modified: str

class SearchResponse(BaseModel):
    status: str
    query: str
    results_count: int
    results: List[DocumentResult]
    search_time_ms: int
```

**HTTP Status Codes:**
- `200 OK` - Search successful
- `400 Bad Request` - Invalid query format
- `422 Unprocessable Entity` - Validation error

**Examples:**

```bash
# Search for authentication issues
curl -X POST http://localhost:8000/api/support/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "JWT token authentication",
    "limit": 5
  }'

# Search for database topics
curl -X POST http://localhost:8000/api/support/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "PostgreSQL configuration"
  }'

# Python example
import requests

response = requests.post(
    'http://localhost:8000/api/support/search',
    json={
        'query': 'redis cache',
        'limit': 5
    }
)
results = response.json()['results']
for doc in results:
    print(f"{doc['title']} ({doc['relevance_score']:.2%})")
```

---

### 3. Get Statistics

**Endpoint:** `GET /support/statistics`

Returns aggregated statistics about issues analyzed and patterns discovered.

**Response (200 OK):**
```json
{
  "status": "success",
  "total_issues_analyzed": 1247,
  "severity_distribution": {
    "CRITICAL": 156,
    "HIGH": 342,
    "MODERATE": 587,
    "LOW": 162
  },
  "component_distribution": {
    "backend": 486,
    "database": 423,
    "frontend": 245,
    "authentication": 178,
    "mobile": 134
  },
  "average_confidence": 0.87,
  "most_common_components": [
    {
      "component": "backend",
      "count": 486,
      "percentage": 38.98
    },
    {
      "component": "database",
      "count": 423,
      "percentage": 33.92
    }
  ],
  "average_resolution_time": "18 minutes",
  "last_analysis": "2025-12-30T14:35:22Z"
}
```

**Response Schema:**
```python
class SeverityStats(BaseModel):
    CRITICAL: int
    HIGH: int
    MODERATE: int
    LOW: int

class ComponentStat(BaseModel):
    component: str
    count: int
    percentage: float

class StatisticsResponse(BaseModel):
    status: str
    total_issues_analyzed: int
    severity_distribution: SeverityStats
    component_distribution: Dict[str, int]
    average_confidence: float
    most_common_components: List[ComponentStat]
    average_resolution_time: str
    last_analysis: str
```

**HTTP Status Codes:**
- `200 OK` - Statistics retrieved successfully

**Examples:**

```bash
# Get statistics
curl http://localhost:8000/api/support/statistics

# Python example
import requests

response = requests.get('http://localhost:8000/api/support/statistics')
stats = response.json()
print(f"Total issues: {stats['total_issues_analyzed']}")
print(f"Critical issues: {stats['severity_distribution']['CRITICAL']}")
print(f"Average confidence: {stats['average_confidence']:.2%}")
```

---

### 4. Get Patterns

**Endpoint:** `GET /support/patterns`

Returns learned patterns and their success metrics.

**Response (200 OK):**
```json
{
  "status": "success",
  "total_patterns": 48,
  "patterns": [
    {
      "pattern_id": "pat_001",
      "description": "Database connection timeout during peak hours",
      "frequency": 23,
      "success_rate": 0.87,
      "average_resolution_time": 18,
      "related_components": ["database", "backend"],
      "typical_steps": [
        "Check database connectivity",
        "Review connection pool settings",
        "Monitor system resources"
      ],
      "last_seen": "2025-12-30T13:45:00Z"
    },
    {
      "pattern_id": "pat_002",
      "description": "Authentication token expiration issues",
      "frequency": 15,
      "success_rate": 0.92,
      "average_resolution_time": 8,
      "related_components": ["authentication", "backend"],
      "typical_steps": [
        "Clear token cache",
        "Refresh authentication",
        "Verify token expiration settings"
      ],
      "last_seen": "2025-12-30T12:30:00Z"
    }
  ],
  "top_patterns": [
    {
      "pattern_id": "pat_001",
      "frequency": 23
    },
    {
      "pattern_id": "pat_003",
      "frequency": 19
    }
  ]
}
```

**Response Schema:**
```python
class Pattern(BaseModel):
    pattern_id: str
    description: str
    frequency: int
    success_rate: float
    average_resolution_time: int
    related_components: List[str]
    typical_steps: List[str]
    last_seen: str

class PatternsResponse(BaseModel):
    status: str
    total_patterns: int
    patterns: List[Pattern]
    top_patterns: List[Dict]
```

**HTTP Status Codes:**
- `200 OK` - Patterns retrieved successfully

**Examples:**

```bash
# Get all patterns
curl http://localhost:8000/api/support/patterns

# Python example
import requests

response = requests.get('http://localhost:8000/api/support/patterns')
patterns = response.json()['patterns']
for pattern in patterns[:3]:  # Top 3
    print(f"{pattern['description']}")
    print(f"  Success rate: {pattern['success_rate']:.2%}")
    print(f"  Frequency: {pattern['frequency']} times")
```

---

### 5. Get Learning Log

**Endpoint:** `GET /support/learning-log?limit=100`

Returns recent learning events from the ML system.

**Query Parameters:**
- `limit` (optional, default 100): Maximum number of entries to return

**Response (200 OK):**
```json
{
  "status": "success",
  "total_entries": 1247,
  "entries": [
    {
      "event_id": "evt_001",
      "timestamp": "2025-12-30T14:35:22Z",
      "issue_description": "Backend API returns 500 error",
      "component": "backend",
      "severity": "CRITICAL",
      "resolution": "Restarted API server",
      "learning_points": [
        "API server crashes correlate with high memory usage",
        "Memory leak in request handler identified"
      ]
    },
    {
      "event_id": "evt_002",
      "timestamp": "2025-12-30T13:22:15Z",
      "issue_description": "Database connection timeout",
      "component": "database",
      "severity": "HIGH",
      "resolution": "Increased connection pool size",
      "learning_points": [
        "Pool size needs adjustment for peak load",
        "Monitor connections under 80% capacity"
      ]
    }
  ],
  "page": 1,
  "total_pages": 13
}
```

**Response Schema:**
```python
class LearningEvent(BaseModel):
    event_id: str
    timestamp: str
    issue_description: str
    component: str
    severity: str
    resolution: str
    learning_points: List[str]

class LearningLogResponse(BaseModel):
    status: str
    total_entries: int
    entries: List[LearningEvent]
    page: int
    total_pages: int
```

**HTTP Status Codes:**
- `200 OK` - Learning log retrieved successfully

**Examples:**

```bash
# Get recent learning events
curl http://localhost:8000/api/support/learning-log?limit=50

# Python example
import requests

response = requests.get(
    'http://localhost:8000/api/support/learning-log',
    params={'limit': 10}
)
events = response.json()['entries']
for event in events:
    print(f"[{event['severity']}] {event['issue_description']}")
    print(f"  Resolved: {event['resolution']}")
```

---

### 6. Batch Analyze Issues

**Endpoint:** `POST /support/batch-analyze`

Analyzes multiple issues in a single request.

**Request:**
```json
{
  "issues": [
    {
      "issue_description": "Frontend button not responding",
      "context": "Mobile only"
    },
    {
      "issue_description": "API timeout errors",
      "context": "Peak hours"
    },
    {
      "issue_description": "Database slow queries"
    }
  ]
}
```

**Request Schema:**
```python
class BatchAnalyzeRequest(BaseModel):
    issues: List[IssueRequest]
```

**Response (200 OK):**
```json
{
  "status": "success",
  "batch_id": "batch_abc123xyz",
  "total_issues": 3,
  "successful": 3,
  "failed": 0,
  "results": [
    {
      "issue_index": 0,
      "issue_description": "Frontend button not responding",
      "severity": "MODERATE",
      "confidence": 0.84,
      "components": ["frontend", "mobile"]
    },
    {
      "issue_index": 1,
      "issue_description": "API timeout errors",
      "severity": "HIGH",
      "confidence": 0.91,
      "components": ["backend", "api"]
    },
    {
      "issue_index": 2,
      "issue_description": "Database slow queries",
      "severity": "CRITICAL",
      "confidence": 0.88,
      "components": ["database", "backend"]
    }
  ],
  "processing_time_ms": 342
}
```

**HTTP Status Codes:**
- `200 OK` - Batch analysis successful
- `400 Bad Request` - Invalid request format
- `413 Payload Too Large` - Batch exceeds size limit (max 100 issues)

**Examples:**

```bash
# Batch analyze multiple issues
curl -X POST http://localhost:8000/api/support/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issues": [
      {"issue_description": "Frontend button not responding"},
      {"issue_description": "API timeout errors"},
      {"issue_description": "Database slow queries"}
    ]
  }'

# Python example
import requests

response = requests.post(
    'http://localhost:8000/api/support/batch-analyze',
    json={
        'issues': [
            {'issue_description': 'Issue 1'},
            {'issue_description': 'Issue 2'},
            {'issue_description': 'Issue 3'}
        ]
    }
)
results = response.json()
print(f"Processed {results['total_issues']} issues")
print(f"Successful: {results['successful']}")
```

---

### 7. Health Check

**Endpoint:** `GET /support/health`

Health check endpoint to verify API availability.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "knowledge_base_loaded": true,
  "documentation_indexed": true,
  "total_docs": 482,
  "timestamp": "2025-12-30T14:35:22Z"
}
```

**HTTP Status Codes:**
- `200 OK` - API is healthy
- `503 Service Unavailable` - API is unhealthy

**Examples:**

```bash
# Check API health
curl http://localhost:8000/api/support/health

# Python example
import requests

response = requests.get('http://localhost:8000/api/support/health')
health = response.json()
print(f"Status: {health['status']}")
print(f"Docs indexed: {health['total_docs']}")
```

---

## 🔄 Request/Response Patterns

### Pagination

For endpoints that support pagination:

```bash
# Get page 2 with 50 items per page
curl http://localhost:8000/api/support/learning-log?page=2&limit=50
```

### Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Issue description must be at least 10 characters",
    "details": {
      "field": "issue_description",
      "reason": "too_short"
    }
  },
  "timestamp": "2025-12-30T14:35:22Z"
}
```

### Rate Limiting

Rate limits are applied per IP address (configurable):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1735506600
```

When rate limited:
```
HTTP/1.1 429 Too Many Requests
```

---

## 📊 Data Types

### Severity Levels

- `CRITICAL` - Requires immediate attention
- `HIGH` - Should be addressed soon
- `MODERATE` - Can be scheduled
- `LOW` - Nice to have

### Common Components

- `backend` - Backend services/API
- `database` - Database related
- `frontend` - Frontend/UI
- `authentication` - Auth/security
- `mobile` - Mobile app specific
- `cache` - Caching layer
- `api` - API gateway
- `storage` - File storage
- `notification` - Notifications
- `deployment` - Deployment/CI-CD

---

## 🔗 Integration Examples

### JavaScript/TypeScript

```typescript
interface IssueRequest {
  issue_description: string;
  context?: string;
}

async function analyzeIssue(issue: IssueRequest) {
  const response = await fetch('/api/support/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issue),
  });
  
  const result = await response.json();
  return result;
}

// Usage
const analysis = await analyzeIssue({
  issue_description: 'Database connection timeout',
  context: 'During peak hours'
});
```

### Python

```python
import requests
import json

def analyze_issue(description: str, context: str = None):
    payload = {
        'issue_description': description
    }
    if context:
        payload['context'] = context
    
    response = requests.post(
        'http://localhost:8000/api/support/analyze',
        json=payload,
        headers={'Content-Type': 'application/json'}
    )
    
    return response.json()

# Usage
result = analyze_issue(
    'Database connection timeout',
    'During peak hours'
)
print(f"Severity: {result['severity']}")
```

### cURL

```bash
# Analyze issue
curl -X POST http://localhost:8000/api/support/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue_description": "Database connection timeout",
    "context": "During peak hours"
  }'

# Search documentation
curl -X POST http://localhost:8000/api/support/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication", "limit": 5}'

# Get statistics
curl http://localhost:8000/api/support/statistics

# Batch analyze
curl -X POST http://localhost:8000/api/support/batch-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issues": [
      {"issue_description": "Issue 1"},
      {"issue_description": "Issue 2"}
    ]
  }'
```

---

## ⚡ Performance Guidelines

### Request Timeouts
- Default timeout: 30 seconds
- Batch requests: 60 seconds
- Search requests: 15 seconds

### Payload Limits
- Max issue description: 5,000 characters
- Max context: 1,000 characters
- Max batch issues: 100 per request
- Max query length: 500 characters

### Response Times (Target)
- Analyze issue: < 500ms (p95)
- Search documentation: < 1s (p95)
- Get statistics: < 200ms (p95)
- Batch analyze (10 issues): < 2s (p95)

### Caching

Some responses are cached:
- Statistics: 5 minutes
- Patterns: 10 minutes
- Documentation index: 1 hour

---

## 🔐 Security Notes

1. **Input Validation**
   - All inputs are validated
   - SQL injection attempts are filtered
   - XSS payloads are escaped

2. **Rate Limiting**
   - 100 requests per minute per IP
   - Batch requests count as 1 request
   - Burst limit: 10 requests in 10 seconds

3. **Data Privacy**
   - Issue descriptions are not persisted
   - Only anonymized patterns are stored
   - No personal data is logged

---

**API Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Next Review:** January 30, 2026
