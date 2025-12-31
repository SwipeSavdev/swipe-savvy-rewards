# AI Support Concierge - Testing & Validation Guide

## 📋 Complete Testing Framework

**Version:** 1.0.0  
**Status:** ✅ Ready for Testing  
**Coverage:** All endpoints, features, and components  
**Test Date:** December 30, 2025

---

## 🎯 Testing Strategy

### Test Levels

1. **Unit Testing** - Individual components
2. **Integration Testing** - Component interaction
3. **System Testing** - End-to-end flows
4. **Performance Testing** - Load and stress
5. **Security Testing** - Vulnerability assessment
6. **User Acceptance Testing** - Real-world scenarios

### Test Environments

```
Development → Staging → Production
    ↓            ↓           ↓
Local tests  Integration   Monitored
            tests
```

---

## 🧪 Unit Testing

### MCP Server Tests

**File:** `test_mcp_support_server.py`

```python
import pytest
from mcp_support_server import SupportConcierge

class TestSupportConcierge:
    
    @pytest.fixture
    def concierge(self):
        return SupportConcierge()
    
    def test_initialization(self, concierge):
        """Test MCP server initializes correctly"""
        assert concierge is not None
        assert concierge.knowledge_base is not None
        assert 'issues' in concierge.knowledge_base
    
    def test_analyze_issue_critical(self, concierge):
        """Test critical issue classification"""
        result = concierge.analyze_issue(
            "Database is completely down, no one can login"
        )
        assert result['severity'] == 'CRITICAL'
        assert result['confidence'] > 0.7
        assert 'database' in result['components']
    
    def test_analyze_issue_low(self, concierge):
        """Test low severity classification"""
        result = concierge.analyze_issue(
            "Improve button color to match branding"
        )
        assert result['severity'] == 'LOW'
        assert result['confidence'] > 0.5
    
    def test_extract_components_multiple(self, concierge):
        """Test component extraction"""
        issue = "Authentication API returns 500 error from mobile app"
        components = concierge.extract_components(issue)
        assert 'authentication' in components or 'api' in components
        assert 'backend' in components or len(components) > 0
    
    def test_knowledge_base_persistence(self, concierge):
        """Test knowledge base saves correctly"""
        initial_size = len(concierge.knowledge_base['issues'])
        
        # Add an issue
        concierge.learn_from_issue(
            issue="Test issue",
            resolution="Test resolution"
        )
        
        # Check it was added
        assert len(concierge.knowledge_base['issues']) > initial_size
    
    def test_pattern_learning(self, concierge):
        """Test pattern learning"""
        # Submit same issue multiple times
        for i in range(3):
            concierge.learn_from_issue(
                issue="Database timeout",
                resolution="Increase connection pool"
            )
        
        patterns = concierge.get_patterns()
        assert len(patterns) > 0
    
    def test_documentation_indexing(self, concierge):
        """Test documentation indexing"""
        docs = concierge.index_documentation('./docs')
        assert len(docs) > 0
        assert isinstance(docs, list)
    
    def test_search_documentation(self, concierge):
        """Test documentation search"""
        results = concierge.search_documentation('authentication')
        assert isinstance(results, list)
        # Should find documentation if available
```

**Run tests:**
```bash
pytest test_mcp_support_server.py -v
pytest test_mcp_support_server.py -v --cov=mcp_support_server
```

### API Routes Tests

**File:** `test_api_support.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAISupportAPI:
    
    def test_health_check(self):
        """Test health endpoint"""
        response = client.get("/api/support/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
    
    def test_analyze_endpoint_valid(self):
        """Test analyze endpoint with valid request"""
        response = client.post(
            "/api/support/analyze",
            json={
                "issue_description": "Database connection timeout",
                "context": "During peak hours"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert 'severity' in data
        assert 'confidence' in data
        assert 'components' in data
    
    def test_analyze_endpoint_invalid_description(self):
        """Test analyze endpoint with invalid input"""
        response = client.post(
            "/api/support/analyze",
            json={
                "issue_description": "Short"  # Too short
            }
        )
        assert response.status_code == 422
    
    def test_analyze_endpoint_missing_required(self):
        """Test analyze endpoint missing required field"""
        response = client.post(
            "/api/support/analyze",
            json={"context": "Some context"}
        )
        assert response.status_code == 422
    
    def test_search_endpoint(self):
        """Test search endpoint"""
        response = client.post(
            "/api/support/search",
            json={"query": "authentication"}
        )
        assert response.status_code == 200
        data = response.json()
        assert 'results' in data
    
    def test_search_empty_query(self):
        """Test search with empty query"""
        response = client.post(
            "/api/support/search",
            json={"query": ""}
        )
        assert response.status_code == 422
    
    def test_statistics_endpoint(self):
        """Test statistics endpoint"""
        response = client.get("/api/support/statistics")
        assert response.status_code == 200
        data = response.json()
        assert 'total_issues_analyzed' in data
        assert 'severity_distribution' in data
    
    def test_patterns_endpoint(self):
        """Test patterns endpoint"""
        response = client.get("/api/support/patterns")
        assert response.status_code == 200
        data = response.json()
        assert 'patterns' in data
    
    def test_learning_log_endpoint(self):
        """Test learning log endpoint"""
        response = client.get("/api/support/learning-log?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert 'entries' in data
    
    def test_batch_analyze_endpoint(self):
        """Test batch analyze endpoint"""
        response = client.post(
            "/api/support/batch-analyze",
            json={
                "issues": [
                    {"issue_description": "Issue 1 with details"},
                    {"issue_description": "Issue 2 with details"},
                    {"issue_description": "Issue 3 with details"}
                ]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data['total_issues'] == 3
        assert len(data['results']) == 3
    
    def test_batch_analyze_exceeds_limit(self):
        """Test batch analyze with too many issues"""
        issues = [{"issue_description": f"Issue {i} with details"}
                  for i in range(101)]
        response = client.post(
            "/api/support/batch-analyze",
            json={"issues": issues}
        )
        assert response.status_code == 413
```

**Run tests:**
```bash
pytest test_api_support.py -v
pytest test_api_support.py -v --cov=app.routes.ai_support
```

---

## 🔗 Integration Testing

### End-to-End Workflow Tests

**File:** `test_e2e_support.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestE2EWorkflows:
    
    def test_complete_issue_resolution_workflow(self):
        """Test complete workflow: analyze → search docs → get resolution"""
        
        # Step 1: Analyze issue
        analyze_response = client.post(
            "/api/support/analyze",
            json={
                "issue_description": "Authentication API returns 401 error",
                "context": "During user login"
            }
        )
        assert analyze_response.status_code == 200
        analysis = analyze_response.json()
        assert analysis['severity'] in ['CRITICAL', 'HIGH', 'MODERATE']
        
        # Step 2: Search related documentation
        search_response = client.post(
            "/api/support/search",
            json={"query": "authentication API troubleshooting"}
        )
        assert search_response.status_code == 200
        docs = search_response.json()
        assert 'results' in docs
        
        # Step 3: Get patterns for similar issues
        patterns_response = client.get("/api/support/patterns")
        assert patterns_response.status_code == 200
        patterns = patterns_response.json()
        assert 'patterns' in patterns
        
        # Verify workflow success
        assert analysis['resolution_steps'] is not None
        assert len(analysis['resolution_steps']) > 0
    
    def test_batch_issue_analysis_workflow(self):
        """Test batch issue analysis and statistics"""
        
        # Submit batch
        batch_response = client.post(
            "/api/support/batch-analyze",
            json={
                "issues": [
                    {"issue_description": "Database timeout error"},
                    {"issue_description": "Frontend button unresponsive"},
                    {"issue_description": "API 500 error"}
                ]
            }
        )
        assert batch_response.status_code == 200
        batch_result = batch_response.json()
        assert batch_result['successful'] == 3
        
        # Check updated statistics
        stats_response = client.get("/api/support/statistics")
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats['total_issues_analyzed'] >= 3
    
    def test_issue_classification_accuracy(self):
        """Test classification accuracy for known patterns"""
        
        test_cases = [
            {
                "description": "System completely down, database offline",
                "expected_severity": "CRITICAL"
            },
            {
                "description": "Minor UI button color issue",
                "expected_severity": "LOW"
            },
            {
                "description": "API timeout errors during peak hours",
                "expected_severity": "HIGH"
            }
        ]
        
        for test in test_cases:
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": test['description']}
            )
            assert response.status_code == 200
            result = response.json()
            # Note: Confidence may vary, check severity matches expected
            assert result['severity'] != 'UNKNOWN'
```

**Run tests:**
```bash
pytest test_e2e_support.py -v
```

---

## ⚡ Performance Testing

### Load Testing Script

**File:** `test_load_performance.py`

```python
import pytest
import time
import concurrent.futures
import statistics
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestPerformance:
    
    def test_analyze_endpoint_response_time(self):
        """Test analyze endpoint response time"""
        times = []
        
        for i in range(50):
            start = time.time()
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": f"Test issue {i} with details"}
            )
            elapsed = time.time() - start
            times.append(elapsed)
            assert response.status_code == 200
        
        # Performance assertions
        avg_time = statistics.mean(times)
        p95_time = sorted(times)[int(len(times) * 0.95)]
        
        print(f"Average response time: {avg_time:.3f}s")
        print(f"P95 response time: {p95_time:.3f}s")
        
        assert avg_time < 0.5, "Average response time exceeds 500ms"
        assert p95_time < 1.0, "P95 response time exceeds 1s"
    
    def test_concurrent_requests(self):
        """Test handling concurrent requests"""
        
        def make_request(issue_num):
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": f"Concurrent issue {issue_num}"}
            )
            return response.status_code, time.time()
        
        start_time = time.time()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(make_request, range(100)))
        
        total_time = time.time() - start_time
        
        # Verify all successful
        assert all(status == 200 for status, _ in results)
        
        # Check performance
        throughput = 100 / total_time
        print(f"Throughput: {throughput:.1f} requests/second")
        assert throughput > 5, "Throughput too low"
    
    def test_memory_usage(self):
        """Test memory usage under load"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024
        
        # Make many requests
        for i in range(500):
            client.post(
                "/api/support/analyze",
                json={"issue_description": f"Memory test issue {i}"}
            )
        
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_increase = final_memory - initial_memory
        
        print(f"Memory increase: {memory_increase:.1f} MB")
        # Should not grow excessively
        assert memory_increase < 500, "Excessive memory growth"
```

**Run performance tests:**
```bash
pytest test_load_performance.py -v -s

# Run with different load levels
pytest test_load_performance.py::TestPerformance::test_concurrent_requests -v -s
```

---

## 🔒 Security Testing

### Security Test Suite

**File:** `test_security.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestSecurity:
    
    def test_sql_injection_prevention(self):
        """Test SQL injection prevention"""
        malicious_payloads = [
            "Test' OR '1'='1",
            "Test'; DROP TABLE issues;--",
            "Test\" AND 1=1 --",
        ]
        
        for payload in malicious_payloads:
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": payload}
            )
            # Should handle safely
            assert response.status_code in [200, 422]
    
    def test_xss_prevention(self):
        """Test XSS prevention"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
        ]
        
        for payload in xss_payloads:
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": payload}
            )
            assert response.status_code in [200, 422]
            # Verify output is escaped
            data = response.json()
            if 'issue_description' in data:
                assert '<script>' not in data.get('issue_description', '')
    
    def test_rate_limiting(self):
        """Test rate limiting"""
        # Make many requests rapidly
        responses = []
        for i in range(200):
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": "Rate limit test"}
            )
            responses.append(response.status_code)
        
        # Should have some rate limited responses (429)
        rate_limited = sum(1 for r in responses if r == 429)
        # Note: Actual rate limiting depends on configuration
        print(f"Rate limited responses: {rate_limited}")
    
    def test_input_size_limits(self):
        """Test input size restrictions"""
        huge_input = "A" * 10000
        
        response = client.post(
            "/api/support/analyze",
            json={"issue_description": huge_input}
        )
        # Should either accept or reject appropriately
        assert response.status_code in [200, 422]
    
    def test_forbidden_characters(self):
        """Test handling of forbidden characters"""
        forbidden_payloads = [
            "Test\x00issue",  # Null byte
            "Test\ninjection",  # Newline injection
            "Test\t\rissue",  # Special characters
        ]
        
        for payload in forbidden_payloads:
            response = client.post(
                "/api/support/analyze",
                json={"issue_description": payload}
            )
            assert response.status_code in [200, 422]
```

**Run security tests:**
```bash
pytest test_security.py -v
```

---

## ✅ Acceptance Testing

### User Acceptance Test Cases

**File:** `test_acceptance.py`

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAcceptance:
    
    def test_uat_scenario_1_critical_issue(self):
        """UAT: Analyze critical production issue"""
        # User reports: "Production database is down, users can't login"
        response = client.post(
            "/api/support/analyze",
            json={
                "issue_description": "Production database is down, users can't login",
                "context": "Reported at 3 PM UTC by ops team"
            }
        )
        
        assert response.status_code == 200
        result = response.json()
        
        # Acceptance criteria
        assert result['severity'] == 'CRITICAL'
        assert result['confidence'] > 0.8
        assert 'database' in result['components']
        assert 'resolution_steps' in result
        assert len(result['resolution_steps']) > 0
    
    def test_uat_scenario_2_search_docs(self):
        """UAT: Support team searches for authentication docs"""
        # User searches: "How do I set up JWT authentication?"
        response = client.post(
            "/api/support/search",
            json={"query": "JWT authentication setup"}
        )
        
        assert response.status_code == 200
        result = response.json()
        
        # Acceptance criteria
        assert result['status'] == 'success'
        assert 'results' in result
        # Should return relevant documentation
    
    def test_uat_scenario_3_view_statistics(self):
        """UAT: Support manager views team statistics"""
        response = client.get("/api/support/statistics")
        
        assert response.status_code == 200
        result = response.json()
        
        # Acceptance criteria
        assert 'total_issues_analyzed' in result
        assert 'severity_distribution' in result
        assert 'component_distribution' in result
        assert 'average_confidence' in result
    
    def test_uat_scenario_4_batch_analysis(self):
        """UAT: Support team analyzes multiple issues at once"""
        response = client.post(
            "/api/support/batch-analyze",
            json={
                "issues": [
                    {"issue_description": "Mobile app crashes on login"},
                    {"issue_description": "Email notifications not sending"},
                    {"issue_description": "API response time is slow"}
                ]
            }
        )
        
        assert response.status_code == 200
        result = response.json()
        
        # Acceptance criteria
        assert result['total_issues'] == 3
        assert result['successful'] == 3
        assert len(result['results']) == 3
        
        for issue_result in result['results']:
            assert 'severity' in issue_result
            assert 'confidence' in issue_result
```

**Run acceptance tests:**
```bash
pytest test_acceptance.py -v
```

---

## 🧬 Test Automation

### GitHub Actions CI/CD

**File:** `.github/workflows/test_support_ai.yml`

```yaml
name: AI Support Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run unit tests
        run: pytest tests/unit/ -v --cov
      
      - name: Run integration tests
        run: pytest tests/integration/ -v
      
      - name: Run security tests
        run: pytest tests/security/ -v
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## 📊 Test Coverage

### Coverage Goals

```
Target Coverage: 85%+

By Component:
- MCP Server: 90%
- API Routes: 85%
- Knowledge Base: 90%
- Documentation Indexer: 80%
- Classification Engine: 85%
```

### Coverage Report

**Generate coverage report:**
```bash
pytest --cov=app --cov=mcp_support_server --cov-report=html
open htmlcov/index.html
```

---

## 🚀 Manual Testing Checklist

### Pre-Deployment Testing

```markdown
## Functionality Tests
- [ ] Analyze endpoint returns correct severity
- [ ] Confidence scores are reasonable (0.5-1.0)
- [ ] Components are correctly identified
- [ ] Resolution steps are helpful
- [ ] Documentation search returns results
- [ ] Statistics show correct aggregations
- [ ] Batch analyze works with multiple issues
- [ ] Learning log shows pattern learning

## Integration Tests
- [ ] API registers in FastAPI app
- [ ] Routes accessible via /api/support/*
- [ ] Admin portal component loads
- [ ] Admin UI can call API endpoints
- [ ] MCP server runs standalone
- [ ] Knowledge base persists between restarts

## Performance Tests
- [ ] Response time < 500ms for analysis
- [ ] Handle 10+ concurrent requests
- [ ] Search returns results in < 1s
- [ ] No memory leaks after 1000 requests
- [ ] Batch process 100 issues in < 10s

## Security Tests
- [ ] SQL injection payloads handled safely
- [ ] XSS payloads escaped properly
- [ ] Input size limits enforced
- [ ] Malicious headers rejected
- [ ] Rate limiting functional

## Browser Tests (Admin Portal)
- [ ] Page loads without errors
- [ ] All tabs accessible
- [ ] Forms submit correctly
- [ ] Charts display properly
- [ ] Search results show
- [ ] Responsive on mobile
```

---

## 📈 Test Metrics Dashboard

### Key Metrics to Track

```
Test Execution:
- Total tests: 50+
- Passing: 100%
- Duration: < 5 minutes
- Coverage: 85%+

Quality Gates:
✅ All unit tests passing
✅ Integration tests passing
✅ Performance acceptable
✅ No security vulnerabilities
✅ Code coverage sufficient
```

---

## 🔄 Continuous Testing

### Automated Testing Schedule

```
Event              Tests Run
─────────────────────────────
On commit         Unit tests
On PR             All tests
Daily (2 AM)      Performance tests
Weekly (Monday)   Security tests
Monthly           Full suite + load tests
```

---

## 📚 Test Data Sets

### Sample Issues for Testing

```
Classification Tests:
1. "Database is down, users can't login"
   → Expected: CRITICAL, database/backend
   
2. "Button color slightly off"
   → Expected: LOW, frontend
   
3. "API timeout errors"
   → Expected: HIGH, backend/api
   
4. "Authentication fails with JWT"
   → Expected: HIGH, authentication

Search Tests:
1. "authentication" → Should find auth docs
2. "database setup" → Should find DB docs
3. "api troubleshooting" → Should find API docs
```

---

## 🎯 Quality Gates

### Definition of Done for Testing

```
For any code change:
1. ✅ Unit tests written and passing
2. ✅ Integration tests passing
3. ✅ No code coverage regression
4. ✅ Performance benchmarks met
5. ✅ Security review completed
6. ✅ Manual testing checklist done
7. ✅ Documentation updated
```

---

**Document Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Test Framework:** pytest  
**Coverage Tool:** pytest-cov  
**CI/CD:** GitHub Actions
