# 🚀 SwipeSavvy Operational Runbooks
**Last Updated:** December 30, 2025  
**Confidence Score Target:** >95%

---

## Table of Contents
1. [Incident Response Procedures](#incident-response)
2. [Deployment Procedures](#deployment)
3. [Troubleshooting Guide](#troubleshooting)
4. [Performance Tuning](#performance-tuning)
5. [Disaster Recovery](#disaster-recovery)

---

## <a id="incident-response"></a>Incident Response Procedures

### P0: Service Down (All requests failing)

**Detection:** Health check failing, error rate > 50%

**Immediate Actions (0-5 minutes):**
```bash
# 1. Check service status
curl http://localhost:8000/health
curl http://localhost:8000/ready

# 2. Check logs for errors
tail -f /var/log/swipesavvy/backend.log | grep ERROR

# 3. Check database connectivity
psql -h localhost -U postgres -c "SELECT 1" swipesavvy_dev

# 4. Check system resources
free -h
df -h
ps aux | grep uvicorn
```

**Diagnosis Checklist:**
- [ ] Is the backend process running?
- [ ] Is the database accessible?
- [ ] Are there connection pool errors?
- [ ] Are there out-of-memory errors?
- [ ] Did code change cause regression?

**Resolution Actions:**

**If backend process crashed:**
```bash
# Restart backend
systemctl restart swipesavvy-backend

# Or manually
cd /path/to/swipesavvy-ai-agents
PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**If database connection fails:**
```bash
# Check PostgreSQL status
systemctl status postgresql@14
sudo systemctl restart postgresql@14

# Verify connection pool
psql -h localhost -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check for stuck connections
psql -h localhost -U postgres -c "
  SELECT * FROM pg_stat_activity WHERE state = 'active' AND duration > '10 min';
"
```

**If memory exhausted:**
```bash
# Check memory usage
ps aux | grep uvicorn
free -h

# Restart backend (clears memory)
systemctl restart swipesavvy-backend

# If restarting doesn't help, check for leaks
# See "Memory Leak Investigation" section
```

**Escalation (if not resolved in 10 minutes):**
- Page on-call engineer
- Check recent deployments: `git log --oneline -5`
- Consider rollback if recent deploy caused issue

---

### P1: High Error Rate (> 1%)

**Detection:** Alert triggered, CloudWatch shows > 1% 5xx errors

**Immediate Actions:**
```bash
# 1. Check error logs
tail -100 /var/log/swipesavvy/backend.log | grep ERROR

# 2. Check recent changes
git diff HEAD~5 HEAD

# 3. Monitor real-time errors
curl -s http://localhost:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])
```

**Common Root Causes:**

**Database Connection Pool Exhaustion:**
```bash
# Check current connections
psql -h localhost -U postgres -c "
  SELECT count(*) FROM pg_stat_activity WHERE datname='swipesavvy_dev';
"

# Should be < 60 (pool_size 20 + max_overflow 40)
# If > 55, circuit break external calls to prevent cascade

# Kill stuck connections (if safe)
psql -h localhost -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname='swipesavvy_dev'
  AND state = 'idle'
  AND query_start < now() - interval '30 minutes';
"
```

**Rate Limiting Triggered:**
```bash
# Check rate limit metrics
curl -s http://localhost:9090/api/v1/query?query=rate_limit_exceeded

# If legitimate traffic spike:
# 1. Scale horizontally (add more instances)
# 2. Temporarily increase rate limit (use feature flag)

# Feature flag toggle
curl -X POST http://localhost:8000/admin/feature-flags/rate-limit \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"limit_per_minute": 10}' # Increase from default 5
```

**Slow Database Queries:**
```bash
# Enable query logging
psql -h localhost -U postgres -d swipesavvy_dev -c "
  SET log_min_duration_statement = 1000;
"

# Check slow query log
tail -50 /var/log/postgresql/postgresql.log | grep duration

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

---

### P2: Elevated Latency (p99 > 2s)

**Detection:** Alert triggered, histogram_quantile(0.99) > 2000ms

**Investigation:**
```bash
# 1. Check if database queries are slow
curl -s http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,\ db_query_duration)

# 2. Check network latency
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/health

# 3. Check for GC pauses (Python)
python3 -m py_spy record -o profile.svg --pid $(pgrep -f uvicorn)

# 4. Check system load
top -b -n 1 | head -20
```

**Resolution Options:**

**Add caching layer:**
```python
# In app/main.py
from functools import lru_cache

@app.get("/api/cache-test")
@lru_cache(maxsize=128)
async def cached_endpoint():
    return {"cached": True}
```

**Optimize database query:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

**Scale vertically or horizontally:**
```bash
# Vertical: increase instance CPU/memory
# Check current utilization
top -b -n 1 | head -5

# Horizontal: add more backend instances
docker-compose up -d --scale backend=3
```

---

## <a id="deployment"></a>Deployment Procedures

### Zero-Downtime Blue-Green Deployment

**Pre-Deployment:**
```bash
# 1. Create release tag
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3

# 2. Build and test
npm run build
pytest tests/

# 3. Verify no secret leaks
git diff master...release/1.2.3 | grep -E "(password|token|secret|api_key)"
```

**Deployment:**
```bash
# 1. Deploy to "green" environment (inactive)
deploy.sh --target=green --version=v1.2.3

# 2. Run smoke tests on green
curl http://localhost:8001/health  # Green runs on 8001
pytest tests/smoke_tests.py --target=green

# 3. If tests pass, switch traffic
switchover.sh --from=blue --to=green

# 4. Monitor blue for 30 minutes
watch 'curl -s http://localhost:8000/metrics | grep http_requests_total'
```

**If Issues Detected:**
```bash
# Quick rollback to blue
switchover.sh --from=green --to=blue

# Then investigate
docker logs swipesavvy-backend-green | tail -100
```

### Canary Deployment (Safer for large changes)

```bash
# 1. Deploy to canary (1% of traffic)
deploy.sh --strategy=canary --target=10%

# 2. Monitor metrics for 5 minutes
curl -s http://localhost:9090/api/v1/query?query=canary_error_rate

# 3. Gradually increase traffic
for percent in 25 50 75 100; do
  echo "Rolling out to $percent..."
  deploy.sh --strategy=canary --target=$percent
  sleep 300  # Wait 5 minutes between rolls
done
```

### Database Migrations

```bash
# 1. Backup current database
pg_dump swipesavvy_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on replica first
psql swipesavvy_dev_replica < alembic/versions/migration.py

# 3. Run migration with transaction (can rollback)
alembic upgrade head

# 4. Verify migration
psql -c "SELECT * FROM alembic_version;"

# 5. Rollback if needed
alembic downgrade -1  # Go back one version
```

---

## <a id="troubleshooting"></a>Troubleshooting Guide

### Database Connection Pool Leaks

**Symptoms:**
- "Pool size exceeded" errors
- Gradually increasing connection count
- Requests timeout waiting for connections

**Diagnosis:**
```bash
# Check connection count over time
for i in {1..10}; do
  echo "$(date): $(psql -h localhost -U postgres -tc "SELECT count(*) FROM pg_stat_activity WHERE datname='swipesavvy_dev;'" | tr -d ' ')"
  sleep 10
done

# List connections by query
psql -h localhost -U postgres -c "
  SELECT pid, usename, state, query, query_start
  FROM pg_stat_activity
  WHERE datname='swipesavvy_dev'
  ORDER BY query_start DESC;
"
```

**Fix:**
```python
# In database.py - ensure finally block
db = SessionLocal()
try:
    result = db.query(User).filter(...).all()
finally:
    db.close()  # MUST be called!
```

**Prevent Future Leaks:**
```bash
# Add monitoring alert
cat > prometheus_alert.yaml << 'EOF'
- alert: DatabaseConnectionLeak
  expr: pg_stat_activity_count > 50
  for: 5m
  annotations:
    summary: "Possible connection leak detected"
EOF
```

---

### WebSocket Reconnection Storms

**Symptoms:**
- Heavy logging ("Reconnecting in...")
- CPU spike on backend
- Latency increase

**Diagnosis:**
```bash
# Count reconnect attempts
tail -1000 /var/log/swipesavvy/backend.log | grep "Reconnecting in" | wc -l

# Check if pattern matches exponential backoff
tail -100 /var/log/swipesavvy/backend.log | grep "Reconnecting in"
# Should see: 1s, 2s, 4s, 8s, 16s, 30s (capped), 30s, 30s...
```

**Fix (if backoff not working):**
```typescript
// In websocket.ts
const exponentialDelay = Math.min(Math.pow(2, attempt) * 1000, 60000);
const jitter = Math.random() * 1000;
const delay = exponentialDelay + jitter;

// Clear previous timeout
if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
this.reconnectTimer = setTimeout(() => this.connect(), delay);
```

---

### Memory Leaks

**Symptoms:**
- Memory usage grows over time
- Process eventually OOMKilled
- No new requests coming in

**Diagnosis:**
```bash
# Monitor memory growth
watch -n 10 'ps aux | grep uvicorn | grep -v grep'

# Profile with py-spy
python3 -m pip install py-spy
py-spy record -o profile.svg --pid $(pgrep -f uvicorn) --duration 60

# Check for event listener leaks
grep -r "addEventListener" swipesavvy-admin-portal/src | grep -v removeEventListener
```

**Common Causes:**

1. **Event listeners not removed:**
```typescript
// BAD - listener never removed
useEffect(() => {
  window.addEventListener('resize', handler);
  // Missing cleanup!
}, []);

// GOOD - listener removed on unmount
useEffect(() => {
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

2. **Database connections not closed:**
```python
# BAD
db = SessionLocal()
# no cleanup

# GOOD
db = SessionLocal()
try:
    ...
finally:
    db.close()
```

---

## <a id="performance-tuning"></a>Performance Tuning

### Database Query Optimization

```bash
# 1. Find slow queries
psql -h localhost -U postgres -d swipesavvy_dev -c "
  SELECT query, calls, mean_time, max_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;
"

# 2. Analyze query plan
EXPLAIN ANALYZE SELECT * FROM users WHERE email = ?;

# 3. Add indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_transactions_user_id_created_at ON transactions(user_id, created_at);

# 4. Verify index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
```

### API Response Caching

```python
# In app/main.py
from functools import lru_cache
import time

class CacheExpiry:
    def __init__(self, ttl_seconds=300):
        self.ttl = ttl_seconds
        self.cache = {}
        self.timestamps = {}
    
    def get(self, key):
        if key not in self.cache:
            return None
        if time.time() - self.timestamps[key] > self.ttl:
            del self.cache[key]
            del self.timestamps[key]
            return None
        return self.cache[key]
    
    def set(self, key, value):
        self.cache[key] = value
        self.timestamps[key] = time.time()

# Usage
feature_flags_cache = CacheExpiry(ttl_seconds=60)

@app.get("/feature-flags")
async def get_feature_flags():
    cached = feature_flags_cache.get("flags")
    if cached:
        return cached
    
    flags = await db.query(FeatureFlag).all()
    feature_flags_cache.set("flags", flags)
    return flags
```

---

## <a id="disaster-recovery"></a>Disaster Recovery

### Database Backup & Restore

```bash
# Daily backup
0 2 * * * /usr/local/bin/backup-db.sh

# Backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U postgres swipesavvy_dev | gzip > /backups/swipesavvy_dev_$TIMESTAMP.sql.gz

# Restore from backup
gunzip < /backups/swipesavvy_dev_20251230_120000.sql.gz | psql swipesavvy_dev
```

### Service Failover

```bash
# If primary server fails, switch to standby
# 1. Verify standby is healthy
psql -h standby.example.com -U postgres -c "SELECT version();"

# 2. Promote standby to primary
sudo systemctl stop postgresql@14
sudo rm /var/lib/postgresql/14/main/standby.signal
sudo systemctl start postgresql@14

# 3. Update DNS/load balancer
aws route53 change-resource-record-sets --hosted-zone-id Z123 \
  --change-batch 'Changes=[{Action=UPSERT,ResourceRecordSet={Name=db.swipesavvy.com,Type=CNAME,TTL=60,ResourceRecords=[{Value=standby.example.com}]}}]'

# 4. Monitor new primary
tail -f /var/log/postgresql/postgresql.log
```

### Code Rollback

```bash
# If recent deploy caused critical issue

# 1. Identify previous good version
git log --oneline | head -10

# 2. Checkout and rebuild
git checkout v1.2.2
npm run build
docker build -t swipesavvy:rollback .

# 3. Switch traffic
docker stop swipesavvy-backend-current
docker run -d -p 8000:8000 --name swipesavvy-backend swipesavvy:rollback

# 4. Verify
curl http://localhost:8000/health

# 5. Communicate rollback
echo "Rolled back to v1.2.2 due to [REASON]" > /var/log/swipesavvy/rollback.log
slack-notify "🔄 Rollback to v1.2.2 - service restored"
```

---

## On-Call Escalation

**Tier 1 (Engineering Team):** 0-15 minutes
- Check logs and metrics
- Restart services if needed
- Page Tier 2 if not resolved

**Tier 2 (Senior Engineer):** 15-30 minutes  
- Deep diagnosis
- Database tuning
- Code rollback decision

**Tier 3 (Architecture):** 30+ minutes
- Infrastructure changes
- Major configuration updates
- Post-incident review

---

## Metrics Dashboard

Access Grafana at `https://monitoring.swipesavvy.com`

Key dashboards:
- **System Health:** CPU, memory, disk, network
- **Application:** Request rate, error rate, latency
- **Database:** Connection pool, query latency, replication lag
- **WebSocket:** Connection count, reconnect rate
- **Business:** Active users, transaction success rate

---

## Post-Incident Review Template

```markdown
# Incident Review - [YYYY-MM-DD HH:MM]

## Summary
[2-3 sentence description of what happened]

## Impact
- Duration: XX minutes
- Users affected: XX
- Services impacted: [list]

## Root Cause
[What caused the incident]

## Timeline
- HH:MM: Incident detected
- HH:MM: On-call paged
- HH:MM: Root cause identified
- HH:MM: Mitigation applied
- HH:MM: Service restored

## Resolution
[What was done to fix it]

## Follow-up Actions
- [ ] Action 1: [Owner] by [Date]
- [ ] Action 2: [Owner] by [Date]
- [ ] Update runbook
- [ ] Add monitoring alert

## Lessons Learned
1. [Learning 1]
2. [Learning 2]
```

---

**For Questions:** #swipesavvy-ops Slack channel  
**Last Review:** December 30, 2025  
**Next Review:** January 30, 2026
