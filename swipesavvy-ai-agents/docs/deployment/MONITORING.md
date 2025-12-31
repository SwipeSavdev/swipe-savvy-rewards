# Prometheus Monitoring Configuration

## Overview

This directory contains Prometheus and Grafana configurations for monitoring the SwipeSavvy AI Agents system.

## Setup

### 1. Start Monitoring Stack

```bash
# Add to docker-compose.yml
docker-compose -f docker-compose.monitoring.yml up -d
```

### 2. Access Dashboards

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### 3. Import Dashboards

1. Login to Grafana
2. Go to Dashboards → Import
3. Upload `grafana-dashboard.json`

## Metrics Collected

### Service Metrics

All services expose metrics at `/metrics`:

```
# Service uptime
service_uptime_seconds

# Process metrics
process_memory_bytes
process_cpu_percent
process_threads

# HTTP metrics (via FastAPI middleware)
http_requests_total
http_request_duration_seconds
http_requests_in_progress

# Custom metrics
together_api_calls_total
together_api_latency_seconds
circuit_breaker_state
rate_limit_hits_total
```

### Application Metrics

**Concierge Service:**
- Chat requests per second
- AI inference latency
- Function call success rate
- Session count

**RAG Service:**
- Semantic searches per second
- Search latency
- Cache hit rate
- Database query time

**Guardrails Service:**
- Safety checks per second
- Violation detection rate
- PII detections
- Injection attempts blocked

## Alert Rules

### Critical Alerts

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"

# Service down
- alert: ServiceDown
  expr: up{job=~"swipesavvy-.*"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service {{ $labels.job }} is down"

# High latency
- alert: HighLatency
  expr: http_request_duration_seconds{quantile="0.95"} > 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High latency detected (p95 > 2s)"
```

### Warning Alerts

```yaml
# High memory usage
- alert: HighMemoryUsage
  expr: process_memory_bytes > 2000000000  # 2GB
  for: 10m
  labels:
    severity: warning

# Circuit breaker open
- alert: CircuitBreakerOpen
  expr: circuit_breaker_state == 1
  for: 5m
  labels:
    severity: warning
```

## Grafana Dashboards

### System Overview Dashboard

Panels:
- Request rate (all services)
- Error rate percentage
- Response time (p50, p95, p99)
- Active sessions
- Resource usage (CPU, memory)

### Service-Specific Dashboards

**Concierge:**
- Chat requests/second
- AI API latency histogram
- Function call distribution
- Session duration

**RAG:**
- Search queries/second
- Embedding generation time
- Database connection pool
- Cache statistics

**Guardrails:**
- Safety checks/second
- Violation types breakdown
- PII detection rate
- Processing time

### Infrastructure Dashboard

- Container CPU/Memory usage
- Network I/O
- Database connections
- Disk usage

## Query Examples

### Request Rate

```promql
# Total requests per second
rate(http_requests_total[5m])

# By service
rate(http_requests_total{job="swipesavvy-concierge"}[5m])

# By endpoint
rate(http_requests_total{path="/api/v1/chat"}[5m])
```

### Error Rate

```promql
# Overall error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# 4xx vs 5xx
rate(http_requests_total{status=~"4.."}[5m])
rate(http_requests_total{status=~"5.."}[5m])
```

### Latency

```promql
# p95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# p99 latency
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### Resource Usage

```promql
# Memory usage
process_memory_bytes / 1024 / 1024  # in MB

# CPU usage
rate(process_cpu_percent[5m])
```

## Monitoring Best Practices

1. **Set appropriate SLOs**
   - Define acceptable latency thresholds
   - Set error rate targets
   - Monitor availability

2. **Use labels wisely**
   - Service name
   - Environment (prod, staging)
   - Version
   - Endpoint

3. **Avoid high cardinality**
   - Don't use user IDs in labels
   - Limit dynamic label values
   - Use exemplars for traces

4. **Set up alerting**
   - Critical: Page immediately
   - Warning: Ticket for investigation
   - Info: Track trends

5. **Regular review**
   - Weekly metric review
   - Monthly SLO assessment
   - Quarterly dashboard cleanup

## Troubleshooting

### No metrics showing

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check service metrics endpoint
curl http://localhost:8000/metrics
curl http://localhost:8001/metrics
curl http://localhost:8002/metrics
```

### High cardinality warnings

```promql
# Find high cardinality metrics
topk(10, count by (__name__)({__name__=~".+"}))
```

### Missing data points

- Check scrape interval (default: 15s)
- Verify service uptime
- Review Prometheus logs

---

**Next**: Set up alerting to Slack/PagerDuty  
**Docs**: See [Prometheus docs](https://prometheus.io/docs/)
