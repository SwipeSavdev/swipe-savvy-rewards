# Load Testing Configuration

## Performance Baselines

### Service Level Objectives (SLOs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Availability** | 99.9% | Uptime over 30 days |
| **Response Time (p95)** | < 500ms | 95th percentile |
| **Response Time (p99)** | < 1000ms | 99th percentile |
| **Error Rate** | < 0.1% | Errors / Total requests |
| **Throughput** | > 100 RPS | Requests per second |

### Concierge Service

- **Expected Load**: 10-50 concurrent users
- **Peak Load**: 100 concurrent users
- **Average Response Time**: 200-400ms
- **Max Response Time**: < 2000ms (includes AI inference)

### RAG Service

- **Expected Load**: 20-80 queries/min
- **Peak Load**: 200 queries/min
- **Average Response Time**: 100-200ms
- **Max Response Time**: < 500ms

### Guardrails Service

- **Expected Load**: 50-150 checks/min
- **Peak Load**: 500 checks/min
- **Average Response Time**: 50-100ms
- **Max Response Time**: < 200ms

## Running Load Tests

### Using Locust

```bash
# Install Locust
pip install locust

# Run Concierge load test
locust -f tests/load/locustfile.py --host=http://localhost:8000

# Run with specific user count and spawn rate
locust -f tests/load/locustfile.py --host=http://localhost:8000 \
    --users 100 --spawn-rate 10 --run-time 5m --headless

# Run distributed load test
locust -f tests/load/locustfile.py --host=http://localhost:8000 \
    --master --expect-workers 4

# On worker machines
locust -f tests/load/locustfile.py --worker --master-host=<master-ip>
```

### Using k6 (Alternative)

```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Run basic test
k6 run tests/load/k6-script.js

# Run with specific virtual users and duration
k6 run --vus 50 --duration 30s tests/load/k6-script.js

# Run and output results to cloud
k6 run --out cloud tests/load/k6-script.js
```

## Load Test Scenarios

### 1. Baseline Load Test
- **Duration**: 5 minutes
- **Users**: 10 concurrent
- **Purpose**: Establish baseline performance

### 2. Stress Test
- **Duration**: 10 minutes
- **Users**: Ramp from 10 to 200
- **Purpose**: Find breaking point

### 3. Spike Test
- **Duration**: 5 minutes
- **Pattern**: Normal (10) → Spike (100) → Normal (10)
- **Purpose**: Test recovery from sudden load

### 4. Soak Test
- **Duration**: 2 hours
- **Users**: 50 concurrent (constant)
- **Purpose**: Detect memory leaks and degradation

## Metrics to Monitor

### Application Metrics
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections
- Queue depth

### System Metrics
- CPU usage (%)
- Memory usage (MB)
- Network I/O (bytes/sec)
- Database connections
- Thread count

### AI Provider Metrics
- Together.AI API latency
- Token usage rate
- API error rate
- Rate limit hits

## Performance Optimization Checklist

- [ ] Database connection pooling configured
- [ ] Response caching implemented
- [ ] Static file compression enabled
- [ ] Database queries optimized with indexes
- [ ] Circuit breakers configured
- [ ] Rate limiting tuned
- [ ] Health checks optimized
- [ ] Logging performance reviewed
- [ ] Memory leaks checked
- [ ] Resource limits set (Docker)

## Expected Results

### Healthy System Indicators
✅ Response times stay consistent under load  
✅ Error rate remains below 0.1%  
✅ CPU usage < 70% at peak  
✅ Memory usage stable (no growth)  
✅ Database connections properly pooled  
✅ No connection timeouts  

### Warning Signs
⚠️ Response times increasing over time  
⚠️ Error rate climbing  
⚠️ Memory usage growing  
⚠️ Database connection pool exhausted  
⚠️ High CPU usage (> 80%)  
⚠️ Circuit breakers frequently open  

## Post-Test Analysis

1. **Review Locust Dashboard**
   - Check response time graphs
   - Analyze failure rates
   - Identify bottlenecks

2. **Check Application Logs**
   - Look for errors and warnings
   - Review slow query logs
   - Check circuit breaker trips

3. **System Metrics**
   - CPU and memory trends
   - Network saturation
   - Database performance

4. **Optimize Based on Findings**
   - Tune configuration
   - Add caching
   - Optimize slow endpoints
   - Scale resources if needed

---

**Next Steps**: Run baseline tests and document actual performance metrics.
