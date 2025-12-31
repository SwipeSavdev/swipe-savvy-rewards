# Concierge Service Integration Tests

Comprehensive integration tests for the AI Concierge Service, covering the complete pipeline: Guardrails → RAG → Together.AI → Streaming Response.

## Test Coverage

### 1. Health Endpoints
- Basic health check
- Detailed health with dependency status

### 2. Guardrails Integration
- Jailbreak attempt blocking
- Toxic content filtering
- PII detection and masking

### 3. RAG Integration
- Balance query context retrieval
- Transaction history retrieval
- User data context

### 4. Together.AI Streaming
- Server-Sent Events (SSE) streaming
- Conversation continuity
- Response quality validation

### 5. End-to-End Pipeline
- Complete financial query flow
- Error handling
- Timeout management

### 6. Performance
- Concurrent request handling
- Response time benchmarks

## Setup

1. **Install test dependencies:**
   ```bash
   pip install -r tests/requirements.txt
   ```

2. **Start all services:**
   ```bash
   cd /Users/macbookpro/Documents/swipesavvy-ai-agents
   docker-compose up -d
   ```

3. **Wait for services to be healthy:**
   ```bash
   # Check all services are running
   docker-compose ps
   
   # Check Concierge health
   curl http://localhost:8000/health
   ```

## Running Tests

### Run all tests:
```bash
pytest tests/test_integration.py -v
```

### Run specific test class:
```bash
# Test Guardrails integration
pytest tests/test_integration.py::TestGuardrailsIntegration -v

# Test RAG integration  
pytest tests/test_integration.py::TestRAGIntegration -v

# Test Together.AI streaming
pytest tests/test_integration.py::TestTogetherAIStreaming -v
```

### Run specific test:
```bash
pytest tests/test_integration.py::TestTogetherAIStreaming::test_streaming_response -v
```

### Run with output:
```bash
pytest tests/test_integration.py -v -s
```

### Run with coverage:
```bash
pytest tests/test_integration.py --cov=. --cov-report=html
```

## Environment Variables

Tests use these environment variables (with defaults):

- `CONCIERGE_URL`: Concierge service URL (default: `http://localhost:8000`)
- `TEST_USER_ID`: Test user ID (default: `test-user-123`)
- `TEST_SESSION_ID`: Test session ID (default: `test-session-456`)

Override for different environments:
```bash
CONCIERGE_URL=http://concierge:8000 pytest tests/test_integration.py -v
```

## Test Scenarios

### 1. Security Tests (Guardrails)
```bash
pytest tests/test_integration.py::TestGuardrailsIntegration -v
```

Tests:
- ✓ Jailbreak attempts are blocked
- ✓ Toxic content is filtered
- ✓ PII is detected and masked

### 2. Context Retrieval (RAG)
```bash
pytest tests/test_integration.py::TestRAGIntegration -v
```

Tests:
- ✓ Balance queries retrieve account context
- ✓ Transaction queries retrieve history
- ✓ User-specific data is provided

### 3. Streaming Response (Together.AI)
```bash
pytest tests/test_integration.py::TestTogetherAIStreaming -v
```

Tests:
- ✓ Responses stream via SSE
- ✓ Conversation context is maintained
- ✓ Response quality is acceptable

### 4. Full Pipeline
```bash
pytest tests/test_integration.py::TestEndToEndPipeline -v
```

Tests:
- ✓ Complete request flows through all layers
- ✓ Error handling works correctly
- ✓ Timeouts are handled gracefully

### 5. Performance
```bash
pytest tests/test_integration.py::TestPerformance -v
```

Tests:
- ✓ Handles concurrent requests (5+)
- ✓ Response time < 5 seconds
- ✓ Streaming starts quickly

## Expected Results

All tests should pass when services are healthy:

```
tests/test_integration.py::TestHealthEndpoints::test_health_check PASSED
tests/test_integration.py::TestHealthEndpoints::test_health_check_detailed PASSED
tests/test_integration.py::TestGuardrailsIntegration::test_blocked_jailbreak_attempt PASSED
tests/test_integration.py::TestGuardrailsIntegration::test_toxic_content_blocked PASSED
tests/test_integration.py::TestGuardrailsIntegration::test_pii_detected_and_masked PASSED
tests/test_integration.py::TestRAGIntegration::test_balance_query_uses_rag PASSED
tests/test_integration.py::TestRAGIntegration::test_transaction_query_retrieves_context PASSED
tests/test_integration.py::TestTogetherAIStreaming::test_streaming_response PASSED
tests/test_integration.py::TestTogetherAIStreaming::test_conversation_continuity PASSED
tests/test_integration.py::TestTogetherAIStreaming::test_response_quality PASSED
tests/test_integration.py::TestEndToEndPipeline::test_complete_financial_query_flow PASSED
tests/test_integration.py::TestEndToEndPipeline::test_error_handling_invalid_request PASSED
tests/test_integration.py::TestEndToEndPipeline::test_timeout_handling PASSED
tests/test_integration.py::TestPerformance::test_concurrent_requests PASSED
tests/test_integration.py::TestPerformance::test_response_time PASSED

========================= 15 passed in 45.2s =========================
```

## Troubleshooting

### Services not responding:
```bash
# Check service logs
docker-compose logs concierge
docker-compose logs rag
docker-compose logs guardrails

# Restart services
docker-compose restart
```

### Test failures:
```bash
# Run with detailed output
pytest tests/test_integration.py -v -s --tb=long

# Check service health
curl http://localhost:8000/health/detailed
```

### Timeout errors:
```bash
# Increase test timeout
pytest tests/test_integration.py -v --timeout=60
```

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8000/health; do sleep 2; done'
      
      - name: Run integration tests
        run: |
          cd services/concierge-service
          pip install -r tests/requirements.txt
          pytest tests/test_integration.py -v
      
      - name: Stop services
        if: always()
        run: docker-compose down
```

## Coverage Goals

- **Overall Coverage**: ≥ 80%
- **Critical Paths**: 100% (Guardrails, RAG, Streaming)
- **Error Handling**: 100%
- **Integration Points**: 100%
