# AI Support Concierge - Operations & Deployment Guide

## 📋 Document Purpose

This guide covers the operational aspects of the AI Support Concierge system including:
- Deployment procedures
- Testing and validation
- Monitoring and maintenance
- Troubleshooting
- Performance optimization
- Production operations

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** December 30, 2025

---

## 🚀 Deployment Guide

### Prerequisites

Before deploying to production, ensure:

1. **Environment Setup**
   ```bash
   # Verify Python environment
   python --version  # 3.9+ required
   pip list | grep fastapi  # Should be installed
   pip list | grep pydantic  # Should be installed
   ```

2. **Database Connectivity**
   ```bash
   # Test PostgreSQL connection
   psql -U postgres -d swipesavvy_dev -c "SELECT 1;"
   ```

3. **File System Permissions**
   ```bash
   # Verify write permissions for knowledge base
   touch /path/to/project/support_kb.json
   chmod 644 /path/to/project/support_kb.json
   ```

4. **Dependencies Installed**
   ```bash
   pip install fastapi uvicorn pydantic python-multipart
   ```

### Deployment Steps

#### 1. Backend Integration

**File:** `swipesavvy-wallet-web/app/main.py`

```python
from app.routes import ai_support

# In your FastAPI app initialization:
app.include_router(ai_support.router, prefix="/api", tags=["ai-support"])

# Configure CORS if needed
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Verification:**
```bash
# Check routes registered
curl http://localhost:8000/docs
# Look for /api/support/* endpoints
```

#### 2. Frontend Integration

**File:** `swipesavvy-admin-portal/src/router/AppRoutes.tsx`

```typescript
import { AISupportConciergePage } from '../pages/AISupportConciergePage';

// Add route
{
  path: '/support/ai-concierge',
  element: <AISupportConciergePage />,
  protected: true
}
```

**Verification:**
```bash
npm run build
# Check for TypeScript errors
npm run lint
```

#### 3. MCP Server Setup

**File:** `.mcpServers.json`

```json
{
  "ai_support_server": {
    "command": "python",
    "args": ["mcp_support_server.py"],
    "env": {
      "KNOWLEDGE_BASE_PATH": "./support_kb.json"
    }
  }
}
```

**Verification:**
```bash
python mcp_support_server.py
# Should print: "MCP server initialized"
# Type: analyze_issue "My issue description"
```

#### 4. Database Initialization

**Create support tables (if needed):**

```sql
-- Optional: Create tracking table
CREATE TABLE IF NOT EXISTS ai_support_interactions (
    id SERIAL PRIMARY KEY,
    issue_description TEXT NOT NULL,
    severity VARCHAR(50),
    components TEXT[],
    resolution_status VARCHAR(50),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_severity ON ai_support_interactions(severity);
CREATE INDEX idx_support_created ON ai_support_interactions(created_at);
```

### Production Deployment Checklist

```markdown
## Pre-Deployment

- [ ] All tests passing (local)
- [ ] No console errors in development
- [ ] Knowledge base file created and populated
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Backend routes registered
- [ ] Frontend components compiled

## Deployment

- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify all endpoints accessible
- [ ] Check admin portal loads
- [ ] Test issue classification
- [ ] Test documentation search

## Post-Deployment

- [ ] Monitor error logs
- [ ] Verify knowledge base operations
- [ ] Check API response times
- [ ] Monitor database queries
- [ ] Collect initial metrics
- [ ] Set up alerts

## Rollback Plan

If issues arise:
```bash
# Restore previous version
git checkout <previous-commit>
git push origin main

# Clear cached knowledge base if needed
rm support_kb.json
```
```

---

## 🧪 Testing & Validation

### Unit Testing

**Test the MCP server directly:**

```bash
# Start in test mode
python mcp_support_server.py --test

# Or test individual functions
python -c "
from mcp_support_server import SupportConcierge
sc = SupportConcierge()

# Test issue analysis
result = sc.analyze_issue('Backend API returns 500 error')
print('Status:', result['status'])
print('Severity:', result['severity'])
print('Components:', result['components'])
"
```

### Integration Testing

**Test API endpoints:**

```bash
# 1. Test analyze endpoint
curl -X POST http://localhost:8000/api/support/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "issue_description": "Database connection timeout",
    "context": "User reported during peak hours"
  }'

# Expected response:
# {
#   "status": "success",
#   "severity": "CRITICAL",
#   "components": ["database", "backend"],
#   "confidence": 0.92,
#   ...
# }

# 2. Test search endpoint
curl -X POST http://localhost:8000/api/support/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication fails"}'

# 3. Test statistics endpoint
curl http://localhost:8000/api/support/statistics

# 4. Test pattern insights
curl http://localhost:8000/api/support/patterns
```

### UI Testing

**Manual testing steps:**

1. **Navigate to Admin Portal**
   - URL: `http://localhost:3000/admin/support/ai-concierge`
   - Verify page loads without errors

2. **Test Issue Analyzer Tab**
   - Enter issue description
   - Click "Analyze Issue"
   - Verify classification results display
   - Check severity indicator color

3. **Test Statistics Tab**
   - View pie charts
   - Check component breakdown
   - Verify numbers are reasonable

4. **Test Documentation Search Tab**
   - Enter search term
   - Click "Search"
   - Verify documentation previews load
   - Check relevance ranking

5. **Test Batch Operations**
   - Upload issues (if implemented)
   - Verify batch processing
   - Check results accuracy

### Load Testing

**Test with multiple concurrent requests:**

```bash
#!/bin/bash
# load_test.sh

ENDPOINT="http://localhost:8000/api/support/analyze"
CONCURRENT=10
TOTAL_REQUESTS=100

echo "Starting load test: $TOTAL_REQUESTS requests with $CONCURRENT concurrent"

# Generate test data
for i in $(seq 1 $TOTAL_REQUESTS); do
  (
    curl -s -X POST "$ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"issue_description\": \"Test issue $i\"}" > /dev/null
    echo "Request $i completed"
  ) &
  
  # Keep concurrent requests limited
  if [ $((i % CONCURRENT)) -eq 0 ]; then
    wait
  fi
done

wait
echo "Load test complete"
```

Run the test:
```bash
bash load_test.sh
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

1. **Performance Metrics**
   - Average response time per endpoint
   - P95/P99 latency
   - Requests per second
   - Error rate percentage

2. **Functionality Metrics**
   - Issues analyzed per day
   - Average confidence score
   - Documentation searches per day
   - Pattern learning rate

3. **System Metrics**
   - Knowledge base file size
   - Database query times
   - Memory usage
   - CPU usage

### Monitoring Implementation

**Add monitoring to FastAPI:**

```python
from time import time
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time()
    response = await call_next(request)
    process_time = time() - start_time
    
    logger.info(
        f"method={request.method} "
        f"path={request.url.path} "
        f"status={response.status_code} "
        f"time={process_time:.3f}s"
    )
    
    return response
```

### Logging Configuration

**Set up structured logging:**

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        return json.dumps(log_data)

handler = logging.FileHandler('logs/ai_support.log')
handler.setFormatter(JSONFormatter())
logger = logging.getLogger('ai_support')
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Knowledge Base Not Found

**Problem:** `FileNotFoundError: support_kb.json not found`

**Solution:**
```bash
# The file is created automatically on first run
# If missing, manually create it:
python -c "
from mcp_support_server import SupportConcierge
sc = SupportConcierge()
# This initializes the knowledge base
"

# Verify file created:
ls -la support_kb.json
```

#### 2. API Endpoint Returns 404

**Problem:** `curl: (7) Failed to connect to localhost port 8000`

**Solution:**
```bash
# 1. Verify backend is running
ps aux | grep uvicorn

# 2. Check if port is in use
lsof -i :8000

# 3. Start the backend
cd swipesavvy-wallet-web
uvicorn app.main:app --reload --port 8000

# 4. Verify routes
curl http://localhost:8000/docs
```

#### 3. Admin Portal Component Not Loading

**Problem:** `Component 'AISupportConciergePage' not found`

**Solution:**
```bash
# 1. Verify file exists
ls swipesavvy-admin-portal/src/pages/AISupportConciergePage.tsx

# 2. Check route registration
grep -n "AISupportConciergePage" swipesavvy-admin-portal/src/router/AppRoutes.tsx

# 3. Rebuild frontend
cd swipesavvy-admin-portal
npm run build

# 4. Check for TypeScript errors
npm run lint
```

#### 4. Database Connection Errors

**Problem:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
```bash
# 1. Check PostgreSQL status
pg_isready -h localhost -p 5432

# 2. Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14

# 3. Check database exists
psql -l | grep swipesavvy

# 4. Test connection
psql -U postgres -d swipesavvy_dev -c "SELECT 1;"
```

#### 5. Classification Confidence Low

**Problem:** Issues getting classified with low confidence

**Solution:**
```bash
# 1. Check knowledge base health
python -c "
from mcp_support_server import SupportConcierge
sc = SupportConcierge()
kb = sc.knowledge_base
print(f'Total issues: {len(kb[\"issues\"])}')
print(f'Total patterns: {len(kb[\"patterns\"])}')
"

# 2. Rebuild patterns
# Clear the knowledge base and let it rebuild:
rm support_kb.json
# System will create fresh KB on next run

# 3. Monitor learning
curl http://localhost:8000/api/support/learning-log
```

### Debug Mode

**Enable detailed logging:**

```python
# In mcp_support_server.py
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.debug("Detailed debug information here")
```

**Run with debug logging:**
```bash
LOGLEVEL=DEBUG python mcp_support_server.py
```

---

## 🔒 Security Considerations

### API Security

1. **Authentication**
   ```python
   from fastapi.security import HTTPBearer, HTTPAuthCredential
   
   security = HTTPBearer()
   
   @router.post("/analyze")
   async def analyze(request: IssueRequest, credentials: HTTPAuthCredential = Depends(security)):
       # Verify token
       token = credentials.credentials
       # ... authentication logic
   ```

2. **Rate Limiting**
   ```python
   from slowapi import Limiter
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   
   @router.post("/analyze")
   @limiter.limit("10/minute")
   async def analyze(request: IssueRequest):
       # ...
   ```

3. **Input Validation**
   ```python
   from pydantic import BaseModel, Field, validator
   
   class IssueRequest(BaseModel):
       issue_description: str = Field(..., min_length=10, max_length=5000)
       context: str = Field(None, max_length=1000)
       
       @validator('issue_description')
       def validate_description(cls, v):
           if 'SELECT' in v.upper():  # Basic SQL injection check
               raise ValueError('Invalid characters in description')
           return v
   ```

### Data Privacy

1. **Knowledge Base Protection**
   ```bash
   # Set appropriate file permissions
   chmod 600 support_kb.json
   
   # Encrypt if sensitive data
   # Use appropriate encryption for production
   ```

2. **Logging Sanitization**
   ```python
   def sanitize_for_logging(data: dict):
       """Remove sensitive information before logging"""
       sensitive_keys = ['password', 'token', 'api_key', 'secret']
       for key in sensitive_keys:
           if key in data:
               data[key] = '***REDACTED***'
       return data
   ```

---

## 📈 Performance Optimization

### Caching Strategy

1. **Response Caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def get_patterns_summary():
       # Expensive operation
       return summarize_patterns()
   
   # Clear cache when patterns update
   get_patterns_summary.cache_clear()
   ```

2. **Documentation Search Caching**
   ```python
   cache_ttl = 3600  # 1 hour
   doc_cache = {}
   cache_timestamp = {}
   
   def get_cached_docs(query):
       if query in doc_cache:
           if time.time() - cache_timestamp[query] < cache_ttl:
               return doc_cache[query]
       
       # Fetch fresh docs
       docs = index_documentation(query)
       doc_cache[query] = docs
       cache_timestamp[query] = time.time()
       return docs
   ```

### Database Query Optimization

1. **Index Creation**
   ```sql
   -- Already created in setup
   CREATE INDEX idx_support_severity ON ai_support_interactions(severity);
   CREATE INDEX idx_support_created ON ai_support_interactions(created_at);
   CREATE INDEX idx_support_components ON ai_support_interactions USING gin(components);
   ```

2. **Query Efficiency**
   ```python
   # Use batch operations
   def analyze_batch(issues: List[str]):
       results = []
       for issue in issues:
           results.append(self.analyze_issue(issue))
       return results
   ```

### Memory Management

1. **Knowledge Base Size**
   ```python
   def get_kb_stats():
       import os
       kb_size = os.path.getsize('support_kb.json') / 1024 / 1024
       return {
           'size_mb': kb_size,
           'issues_count': len(self.knowledge_base['issues']),
           'patterns_count': len(self.knowledge_base['patterns'])
       }
   ```

2. **Cleanup Old Data**
   ```python
   def cleanup_old_learning_logs(days_to_keep=30):
       cutoff_date = datetime.now() - timedelta(days=days_to_keep)
       kb = self.knowledge_base
       kb['learning_log'] = [
           log for log in kb.get('learning_log', [])
           if datetime.fromisoformat(log['timestamp']) > cutoff_date
       ]
       self.save_knowledge_base()
   ```

---

## 🔄 Maintenance Tasks

### Daily Tasks

1. **Monitor Error Logs**
   ```bash
   tail -f logs/ai_support.log | grep ERROR
   ```

2. **Check Knowledge Base Size**
   ```bash
   ls -lh support_kb.json
   ```

3. **Verify API Health**
   ```bash
   curl http://localhost:8000/api/support/statistics
   ```

### Weekly Tasks

1. **Review Patterns**
   ```bash
   curl http://localhost:8000/api/support/patterns | jq '.'
   ```

2. **Backup Knowledge Base**
   ```bash
   cp support_kb.json support_kb.json.backup.$(date +%Y%m%d)
   ```

3. **Analyze Performance Metrics**
   - Check average response times
   - Review error rates
   - Identify slow endpoints

### Monthly Tasks

1. **Full System Audit**
   - Review all logs
   - Check database size
   - Validate classification accuracy

2. **Knowledge Base Optimization**
   - Remove duplicate patterns
   - Archive old issues
   - Update outdated documentation links

3. **Security Review**
   - Check access logs
   - Review authentication tokens
   - Update dependencies if needed

---

## 📚 Advanced Configuration

### Custom Classification Rules

Extend the severity classification:

```python
def classify_severity(description: str) -> str:
    """Custom severity classification"""
    critical_keywords = ['database down', 'service offline', 'data loss']
    high_keywords = ['authentication fails', 'API error', 'timeout']
    
    description_lower = description.lower()
    
    if any(kw in description_lower for kw in critical_keywords):
        return "CRITICAL"
    elif any(kw in description_lower for kw in high_keywords):
        return "HIGH"
    else:
        return "MODERATE"
```

### Custom Component Tags

Extend component detection:

```python
CUSTOM_COMPONENTS = {
    'mobile': ['mobile', 'app', 'ios', 'android'],
    'payment': ['payment', 'stripe', 'transaction'],
    'notification': ['email', 'sms', 'push', 'notification'],
    'storage': ['s3', 'storage', 'upload', 'file'],
}

def extract_components(description: str) -> List[str]:
    """Extract component tags with custom mappings"""
    components = set()
    description_lower = description.lower()
    
    for component, keywords in CUSTOM_COMPONENTS.items():
        if any(kw in description_lower for kw in keywords):
            components.add(component)
    
    return list(components)
```

### Webhook Integration

Send notifications on issues:

```python
import httpx

async def send_webhook(issue_data: dict):
    """Send issue data to external webhook"""
    webhook_url = os.getenv('ISSUE_WEBHOOK_URL')
    if not webhook_url:
        return
    
    async with httpx.AsyncClient() as client:
        await client.post(webhook_url, json=issue_data)
```

---

## 🎓 Training & Onboarding

### For Operations Teams

1. **Read Quick Start** (~5 minutes)
   - Understand basic concepts
   - Learn how to test endpoints

2. **Study Troubleshooting Guide** (~15 minutes)
   - Know common issues
   - Learn resolution steps

3. **Hands-on Testing** (~30 minutes)
   - Test each endpoint
   - Verify functionality
   - Practice troubleshooting

### For Developers

1. **Read Full Documentation** (~1 hour)
   - Understand architecture
   - Learn about ML system
   - Review code structure

2. **Study Implementation** (~1 hour)
   - Review code files
   - Understand design decisions
   - Learn customization points

3. **Hands-on Development** (varies)
   - Set up local environment
   - Run tests
   - Implement custom features

---

## 📞 Support & Escalation

### Support Channels

1. **Internal Issues**
   - Check troubleshooting guide first
   - Review logs: `logs/ai_support.log`
   - Test endpoints manually

2. **API Issues**
   - Test with curl
   - Check request format
   - Verify authentication

3. **Database Issues**
   - Verify PostgreSQL running
   - Check connection string
   - Review database logs

### Escalation Procedure

```
Level 1: Check troubleshooting guide
  ↓
Level 2: Review logs and debug
  ↓
Level 3: Run diagnostic tests
  ↓
Level 4: Rollback to previous version
  ↓
Level 5: Escalate to development team
```

---

## 📋 Appendix

### Useful Commands

```bash
# Check backend health
curl -v http://localhost:8000/api/support/statistics

# View available endpoints
curl http://localhost:8000/docs

# Test issue analysis
curl -X POST http://localhost:8000/api/support/analyze \
  -H "Content-Type: application/json" \
  -d '{"issue_description": "test issue"}'

# View knowledge base
python -c "import json; print(json.dumps(json.load(open('support_kb.json')), indent=2))"

# Restart backend
pkill -f "uvicorn.*ai_support"
cd swipesavvy-wallet-web && uvicorn app.main:app --reload

# Clear cache
rm -rf __pycache__
rm -rf .pytest_cache
```

### Environment Variables

```bash
# Required
KNOWLEDGE_BASE_PATH=./support_kb.json

# Optional
LOG_LEVEL=INFO
API_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=100
CACHE_TTL=3600

# Database (if using)
DATABASE_URL=postgresql://user:password@localhost:5432/swipesavvy_dev
```

### File Locations

```
Project Root:
├── mcp_support_server.py          # MCP server (700 lines)
├── support_kb.json                # Knowledge base (auto-generated)
├── app/routes/ai_support.py       # API routes (286 lines)
├── logs/ai_support.log            # Application logs
└── swipesavvy-admin-portal/
    └── src/pages/
        └── AISupportConciergePage.tsx  # Admin UI (453 lines)
```

---

## ✅ Verification Checklist

Before considering the system production-ready:

- [ ] All endpoints respond correctly
- [ ] Knowledge base file created and populated
- [ ] Admin portal component loads
- [ ] Issue classification working
- [ ] Documentation search functional
- [ ] Statistics displaying correctly
- [ ] No console errors in logs
- [ ] API response times acceptable
- [ ] Database connectivity verified
- [ ] Monitoring set up
- [ ] Backup procedures tested
- [ ] Team trained on operations

---

**Document Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Next Review:** January 30, 2026
