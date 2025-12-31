# Week 13 Day 5: Monitoring Dashboards & Alerting

**Date**: December 27, 2025  
**Focus**: Production monitoring, dashboards, alerts, observability  
**Status**: In Progress

---

## Objectives

1. ✅ Set up comprehensive monitoring dashboards
2. ✅ Configure alerting rules and thresholds
3. ✅ Implement log aggregation
4. ✅ Create on-call procedures
5. ✅ Test alert notifications

---

## Monitoring Stack Overview

```
┌─────────────────────────────────────────────────────┐
│              Monitoring Architecture                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Application Metrics → Prometheus → Grafana        │
│  (FastAPI, Redis)      (Storage)    (Visualization) │
│                                                      │
│  Application Logs   → Loki      → Grafana          │
│  (Python logging)     (Storage)    (Visualization)  │
│                                                      │
│  Alerts             → Alertmanager → Notifications  │
│  (Rules)              (Routing)      (Slack/Email)  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Grafana Dashboards

### Dashboard 1: System Overview

**File**: `monitoring/dashboards/system-overview.json`

```json
{
  "dashboard": {
    "title": "SwipeSavvy AI - System Overview",
    "tags": ["production", "overview"],
    "timezone": "UTC",
    "panels": [
      {
        "title": "Service Health Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=~\"concierge|rag|guardrails\"}",
            "legendFormat": "{{job}}"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 8, "h": 4}
      },
      {
        "title": "Request Rate (req/min)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m]) * 60",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"x": 8, "y": 0, "w": 16, "h": 8}
      },
      {
        "title": "Response Time (P95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{service}}"
          }
        ],
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8}
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{service}} - {{status}}"
          }
        ],
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8}
      },
      {
        "title": "Active Sessions",
        "type": "stat",
        "targets": [
          {
            "expr": "active_sessions_total",
            "legendFormat": "Sessions"
          }
        ],
        "gridPos": {"x": 0, "y": 16, "w": 6, "h": 4}
      },
      {
        "title": "Database Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "PostgreSQL"
          }
        ],
        "gridPos": {"x": 6, "y": 16, "w": 6, "h": 4}
      },
      {
        "title": "Redis Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "redis_memory_used_bytes",
            "legendFormat": "Used Memory"
          }
        ],
        "gridPos": {"x": 12, "y": 16, "w": 12, "h": 8}
      }
    ]
  }
}
```

---

### Dashboard 2: AI Performance

**Metrics**:
- AI response time (end-to-end)
- Together.AI API latency
- Tool execution time
- Token usage
- Conversation completion rate

```json
{
  "dashboard": {
    "title": "SwipeSavvy AI - AI Performance",
    "panels": [
      {
        "title": "AI Response Time Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(ai_response_duration_seconds_bucket[5m]))",
            "legendFormat": "P50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(ai_response_duration_seconds_bucket[5m]))",
            "legendFormat": "P95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(ai_response_duration_seconds_bucket[5m]))",
            "legendFormat": "P99"
          }
        ]
      },
      {
        "title": "Together.AI API Latency",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(together_api_duration_seconds_sum[5m]) / rate(together_api_duration_seconds_count[5m])",
            "legendFormat": "Avg Latency"
          }
        ]
      },
      {
        "title": "Tool Usage Breakdown",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (tool_name) (tool_execution_total)",
            "legendFormat": "{{tool_name}}"
          }
        ]
      },
      {
        "title": "Token Usage (hourly)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ai_tokens_used_total[1h]) * 3600",
            "legendFormat": "Tokens/hour"
          }
        ]
      },
      {
        "title": "Conversation Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "(sum(conversation_completed_total) / sum(conversation_started_total)) * 100",
            "legendFormat": "Success %"
          }
        ]
      }
    ]
  }
}
```

---

### Dashboard 3: Business Metrics

**KPIs**:
- Active users (daily/monthly)
- Total conversations
- Messages per conversation
- User satisfaction scores
- Feature usage

```json
{
  "dashboard": {
    "title": "SwipeSavvy AI - Business Metrics",
    "panels": [
      {
        "title": "Daily Active Users",
        "type": "graph",
        "targets": [
          {
            "expr": "count(count by (user_id) (http_requests_total[1d]))",
            "legendFormat": "DAU"
          }
        ]
      },
      {
        "title": "Conversations Today",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(increase(conversation_started_total[1d]))",
            "legendFormat": "Conversations"
          }
        ]
      },
      {
        "title": "Messages per Conversation",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(messages_per_conversation)",
            "legendFormat": "Avg Messages"
          }
        ]
      },
      {
        "title": "Top Used Features",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, sum by (action_type) (action_performed_total))",
            "format": "table"
          }
        ]
      },
      {
        "title": "User Satisfaction Score",
        "type": "gauge",
        "targets": [
          {
            "expr": "avg(user_satisfaction_score)",
            "legendFormat": "Avg Score"
          }
        ],
        "thresholds": [
          {"value": 0, "color": "red"},
          {"value": 3, "color": "yellow"},
          {"value": 4, "color": "green"}
        ]
      }
    ]
  }
}
```

---

## Alerting Rules

### File: `monitoring/alerts/production.yml`

```yaml
groups:
  - name: production_alerts
    interval: 30s
    rules:
      # Service Health
      - alert: ServiceDown
        expr: up{job=~"concierge|rag|guardrails"} == 0
        for: 1m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"
          runbook: "https://docs.swipesavvy.com/runbooks/service-down"

      # Performance
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High response time on {{ $labels.service }}"
          description: "P95 response time is {{ $value }}s (threshold: 3s)"
          runbook: "https://docs.swipesavvy.com/runbooks/high-latency"

      - alert: CriticalResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 5
        for: 2m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "CRITICAL: Response time on {{ $labels.service }}"
          description: "P95 response time is {{ $value }}s (threshold: 5s)"

      # Error Rates
      - alert: HighErrorRate
        expr: (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"
          runbook: "https://docs.swipesavvy.com/runbooks/high-errors"

      - alert: CriticalErrorRate
        expr: (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) > 0.10
        for: 2m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "CRITICAL: Error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 10%)"

      # Database
      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_database_numbackends > 90
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }} connections active (max: 100)"

      - alert: DatabaseSlowQueries
        expr: rate(pg_stat_database_blks_read[5m]) > 1000
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High number of slow database queries"
          description: "{{ $value }} blocks read per second"

      # AI Performance
      - alert: AIResponseTimeSlow
        expr: histogram_quantile(0.95, rate(ai_response_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "AI response time degraded"
          description: "P95 AI response time is {{ $value }}s (threshold: 2s)"

      - alert: TogetherAPIErrors
        expr: rate(together_api_errors_total[5m]) > 0.1
        for: 3m
        labels:
          severity: critical
          team: ai
        annotations:
          summary: "High error rate from Together.AI API"
          description: "Error rate: {{ $value }}/s"

      # Resource Usage
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 15
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Only {{ $value }}% free"

      # Business Metrics
      - alert: NoActiveUsers
        expr: count(count by (user_id) (http_requests_total[1h])) == 0
        for: 30m
        labels:
          severity: warning
          team: product
        annotations:
          summary: "No active users in the last hour"
          description: "This might indicate a problem with the service"

      - alert: ConversationFailureSpike
        expr: rate(conversation_failed_total[5m]) > 0.2
        for: 5m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "High conversation failure rate"
          description: "{{ $value }} conversations failing per second"
```

---

## Alertmanager Configuration

### File: `monitoring/alertmanager/config.yml`

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  receiver: 'default'
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  
  routes:
    # Critical alerts go to Slack immediately and page on-call
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    
    # Warnings go to Slack
    - match:
        severity: warning
      receiver: 'warning'
    
    # AI team alerts
    - match:
        team: ai
      receiver: 'ai-team'
    
    # Platform team alerts
    - match:
        team: platform
      receiver: 'platform-team'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true
    email_configs:
      - to: 'oncall@swipesavvy.com'
        from: 'alerts@swipesavvy.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@swipesavvy.com'
        auth_password: 'YOUR_PASSWORD'
        headers:
          Subject: '🚨 CRITICAL ALERT: {{ .GroupLabels.alertname }}'

  - name: 'warning'
    slack_configs:
      - channel: '#alerts'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'ai-team'
    slack_configs:
      - channel: '#team-ai-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'platform-team'
    slack_configs:
      - channel: '#team-platform-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

inhibit_rules:
  # Inhibit warning if critical is firing
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

---

## Log Aggregation with Loki

### File: `monitoring/loki/config.yml`

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2025-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 720h  # 30 days
```

---

## Promtail Configuration (Log Shipping)

### File: `monitoring/promtail/config.yml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Concierge service logs
  - job_name: concierge
    static_configs:
      - targets:
          - localhost
        labels:
          job: concierge
          service: concierge
          __path__: /var/log/swipesavvy/concierge/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            timestamp: timestamp
            message: message
            user_id: user_id
            session_id: session_id
      - labels:
          level:
          user_id:
          session_id:
      - timestamp:
          source: timestamp
          format: RFC3339

  # RAG service logs
  - job_name: rag
    static_configs:
      - targets:
          - localhost
        labels:
          job: rag
          service: rag
          __path__: /var/log/swipesavvy/rag/*.log

  # Guardrails service logs
  - job_name: guardrails
    static_configs:
      - targets:
          - localhost
        labels:
          job: guardrails
          service: guardrails
          __path__: /var/log/swipesavvy/guardrails/*.log

  # Nginx access logs
  - job_name: nginx
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<remote_addr>[\w\.]+) - (?P<remote_user>[^ ]*) \[(?P<time_local>.*)\] "(?P<method>[^ ]*) (?P<request>[^ ]*) [^ ]*" (?P<status>[\d]+) (?P<body_bytes_sent>[\d]+) "(?P<http_referer>[^"]*)" "(?P<http_user_agent>[^"]*)"'
      - labels:
          method:
          status:
```

---

## On-Call Procedures

### On-Call Runbook

```markdown
# ON-CALL RUNBOOK

## Getting Started

You're on-call! Here's what you need to know.

### Pre-Requisites

✓ Access to:
  - Grafana dashboards: https://grafana.swipesavvy.com
  - Slack: #alerts, #alerts-critical
  - SSH access to production servers
  - Database credentials (in 1Password)
  - PagerDuty account

✓ Tools installed:
  - kubectl (Kubernetes CLI)
  - psql (PostgreSQL client)
  - curl, jq

### Alert Response Procedure

1. **Acknowledge** the alert in PagerDuty/Slack
2. **Assess** severity and impact
3. **Investigate** using dashboards and logs
4. **Mitigate** the issue
5. **Document** in incident log
6. **Follow up** with postmortem (if needed)

---

## Common Alerts & Solutions

### ServiceDown

**Symptoms**: Service health check failing

**Investigation**:
```bash
# Check service status
docker ps | grep <service_name>

# Check logs
docker logs <container_id> --tail 100

# Check health endpoint
curl http://localhost:8000/health
```

**Resolution**:
```bash
# Restart service
docker-compose restart <service_name>

# If that fails, redeploy
./scripts/deploy-production.sh
```

---

### HighResponseTime

**Symptoms**: P95 response time > 3 seconds

**Investigation**:
```bash
# Check current load
curl http://localhost:8000/metrics | grep http_requests

# Check database connections
psql -h localhost -U swipesavvy -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -h localhost -U swipesavvy -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

**Resolution**:
- If database: Kill slow queries, add indexes
- If CPU: Scale horizontally, add more instances
- If memory: Restart service, investigate memory leak

---

### HighErrorRate

**Symptoms**: > 5% of requests returning 5xx errors

**Investigation**:
```bash
# Check error logs
docker logs concierge_1 | grep ERROR | tail -50

# Check specific error patterns
grep "Internal Server Error" /var/log/swipesavvy/*.log
```

**Resolution**:
- Review stack traces
- Check external API status (Together.AI)
- Restart affected service
- Rollback if recent deployment

---

### DatabaseConnectionPoolExhausted

**Symptoms**: All database connections in use

**Investigation**:
```bash
# Check active connections
psql -h localhost -U swipesavvy -c "
  SELECT 
    pid, 
    usename, 
    application_name, 
    state, 
    query_start, 
    state_change,
    query
  FROM pg_stat_activity 
  WHERE state != 'idle' 
  ORDER BY query_start;
"
```

**Resolution**:
```bash
# Kill long-running queries
psql -h localhost -U swipesavvy -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '10 minutes';"

# Restart application (releases connections)
docker-compose restart concierge
```

---

## Escalation

### When to Escalate

- Critical alert lasting > 15 minutes
- Unable to diagnose root cause
- Requires code change/deployment
- Customer impact > 50% of users

### Who to Contact

| Severity | Contact | Method |
|----------|---------|--------|
| Critical | CTO | Phone + Slack |
| High | Engineering Lead | Slack + Page |
| Medium | Team Lead | Slack |
| Low | Document for standup | Ticket |

### Escalation Contacts

- **CTO**: +1-555-0100 (call anytime)
- **Engineering Lead**: @eng-lead (Slack)
- **Platform Team**: @platform-team (Slack)
- **AI Team**: @ai-team (Slack)

---

## Communication Templates

### Incident Update (Slack)

```
🚨 INCIDENT UPDATE - [ONGOING/RESOLVED]

Severity: [Critical/High/Medium/Low]
Service: [Service Name]
Impact: [User-facing description]
Started: [Timestamp]
Duration: [Time elapsed]

Current Status:
[Brief description]

Actions Taken:
- [Action 1]
- [Action 2]

Next Steps:
- [Next step 1]
- [Next step 2]

ETA to Resolution: [Estimate or "Unknown"]
```

### All-Clear Message

```
✅ INCIDENT RESOLVED

The issue with [Service Name] has been resolved.

Root Cause: [Brief explanation]
Resolution: [What was done]
Duration: [Total time]

Impact: [How many users/requests affected]

Postmortem: Will be posted to #incidents within 24 hours

Thank you for your patience.
```

---

## Useful Commands

### Check Service Health
```bash
./scripts/monitor-health.sh
```

### View Recent Logs
```bash
docker-compose logs --tail=100 -f concierge
```

### Database Query
```bash
psql -h localhost -U swipesavvy -d swipesavvy -c "SELECT version();"
```

### Restart All Services
```bash
docker-compose restart
```

### Rollback Deployment
```bash
./scripts/rollback-production.sh
```

### Check Metrics
```bash
curl http://localhost:8000/metrics
```

---

## Post-Incident

After resolving an incident:

1. Write incident report (template in Notion)
2. Schedule postmortem meeting (within 48 hours)
3. Create follow-up tickets
4. Update runbook if needed
5. Share learnings in #engineering

**Template**: https://notion.swipesavvy.com/incidents/template
```

---

## Health Check Dashboard

### Quick Health Check Script

```bash
#!/bin/bash
# monitoring/scripts/quick-health-check.sh

echo "=== SwipeSavvy AI Health Check ==="
echo ""

# Services
echo "1. Service Status:"
services=("concierge" "rag" "guardrails" "postgres" "redis")
for service in "${services[@]}"; do
    if docker ps | grep -q $service; then
        echo "  ✓ $service: Running"
    else
        echo "  ✗ $service: Down"
    fi
done
echo ""

# Response times
echo "2. Response Times:"
for port in 8000 8001 8002; do
    start=$(date +%s%N)
    curl -s http://localhost:$port/health > /dev/null
    end=$(date +%s%N)
    duration=$(( (end - start) / 1000000 ))
    echo "  Port $port: ${duration}ms"
done
echo ""

# Database
echo "3. Database:"
conn_count=$(psql -h localhost -U swipesavvy -t -c "SELECT count(*) FROM pg_stat_activity;")
echo "  Active connections: $conn_count"
echo ""

# Disk space
echo "4. Disk Space:"
df -h / | tail -1 | awk '{print "  Used: " $3 " / " $2 " (" $5 ")"}'
echo ""

# Memory
echo "5. Memory:"
free -h | grep Mem | awk '{print "  Used: " $3 " / " $2}'
echo ""

echo "=== End Health Check ==="
```

---

## Deliverables (Day 5)

✅ Grafana dashboards (System, AI Performance, Business)  
✅ Prometheus alerting rules  
✅ Alertmanager configuration  
✅ Loki + Promtail setup  
✅ On-call runbook  
✅ Quick health check script  

**Status**: Monitoring infrastructure complete  
**Next**: Day 6 - Load testing & performance validation
