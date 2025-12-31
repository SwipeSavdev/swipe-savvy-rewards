# Operations Runbook

**Service**: SwipeSavvy AI Agents  
**Version**: 1.0.0-alpha  
**Last Updated**: December 23, 2025

## Overview

This runbook provides operational procedures, troubleshooting guides, and incident response for the SwipeSavvy AI Agents system.

---

## Quick Reference

### Service URLs (Production)
- **Concierge**: https://api.swipesavvy.com
- **RAG**: http://internal-rag:8001
- **Guardrails**: http://internal-guardrails:8002
- **Monitoring**: https://grafana.swipesavvy.com
- **Logs**: https://logs.swipesavvy.com

### Critical Contacts
- **On-Call**: Check PagerDuty schedule
- **Engineering Lead**: [Contact]
- **DevOps Lead**: [Contact]
- **Database Admin**: [Contact]

### Service Ports
- Concierge: 8000
- RAG: 8001
- Guardrails: 8002
- PostgreSQL: 5432
- Prometheus: 9090
- Grafana: 3000

---

## Common Operations

### Checking Service Health

```bash
# All health endpoints
curl https://api.swipesavvy.com/health
curl http://internal-rag:8001/health
curl http://internal-guardrails:8002/health

# Detailed readiness
curl https://api.swipesavvy.com/ready

# Liveness with resource metrics
curl https://api.swipesavvy.com/live

# Prometheus metrics
curl https://api.swipesavvy.com/metrics
```

### Viewing Logs

```bash
# Docker Compose
docker-compose logs -f --tail=100 concierge
docker-compose logs -f --tail=100 rag
docker-compose logs -f --tail=100 guardrails

# Filter by level
docker-compose logs concierge | jq 'select(.level=="ERROR")'

# Search for specific pattern
docker-compose logs concierge | grep "session_id=abc123"

# Kubernetes
kubectl logs -f deployment/concierge -n swipesavvy
kubectl logs -f deployment/rag -n swipesavvy --tail=100
```

### Restarting Services

```bash
# Restart single service
docker-compose restart concierge

# Restart all services
docker-compose restart

# Graceful restart with zero downtime
docker-compose up -d --no-deps --force-recreate concierge

# Kubernetes rolling restart
kubectl rollout restart deployment/concierge -n swipesavvy
```

### Scaling Services

```bash
# Docker Compose
docker-compose up -d --scale concierge=3

# Kubernetes
kubectl scale deployment concierge --replicas=5 -n swipesavvy
```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P0** | Critical outage | 15 minutes | Complete service down, data breach |
| **P1** | Major degradation | 1 hour | High error rate, severe latency |
| **P2** | Partial degradation | 4 hours | Single feature down, minor latency |
| **P3** | Minor issue | 1 business day | Cosmetic bugs, minor issues |

### Incident Response Process

1. **Acknowledge**
   - Acknowledge alert in PagerDuty
   - Join incident Slack channel
   - Notify team lead

2. **Assess**
   - Check monitoring dashboards
   - Review recent deployments
   - Check error logs
   - Determine severity

3. **Mitigate**
   - Follow troubleshooting guides
   - Implement quick fix if available
   - Rollback if recent deployment
   - Scale resources if needed

4. **Communicate**
   - Update status page
   - Notify stakeholders
   - Post updates every 30 minutes

5. **Resolve**
   - Fix root cause
   - Verify system stable
   - Update documentation

6. **Post-Incident**
   - Write incident report
   - Conduct post-mortem
   - Create action items
   - Update runbooks

---

## Troubleshooting Guides

### Issue: Service Returning 503 / Unhealthy

**Symptoms**: Health endpoint returns 503 or timeout

**Diagnosis**:
```bash
# Check container status
docker-compose ps

# Check logs for startup errors
docker-compose logs --tail=50 <service>

# Check resource usage
docker stats

# Check dependencies
curl http://postgres:5432
curl https://api.together.xyz
```

**Solutions**:
1. **Restart service**: `docker-compose restart <service>`
2. **Check environment variables**: `docker-compose exec <service> env`
3. **Rebuild container**: `docker-compose up -d --build <service>`
4. **Check database connection**: Verify POSTGRES_* env vars
5. **Scale down/up**: Kill unhealthy instance, start new one

**Escalation**: If issue persists > 15 minutes, escalate to Engineering Lead

---

### Issue: High Latency (P95 > 2s)

**Symptoms**: Slow responses, timeouts

**Diagnosis**:
```bash
# Check Grafana dashboard for latency metrics
# Check Prometheus for p95/p99 latencies

# Check Together.AI API latency
docker-compose logs concierge | grep together_api_latency

# Check database query times
docker-compose logs rag | grep database_query_time

# Check circuit breaker state
docker-compose logs concierge | grep circuit_breaker
```

**Solutions**:
1. **Check Together.AI status**: Visit status.together.ai
2. **Circuit breaker open**: Wait for recovery, check API limits
3. **Database slow**: Check connection pool, run EXPLAIN on slow queries
4. **High load**: Scale up instances
5. **Memory leak**: Restart service, investigate in logs

**Prevention**:
- Monitor P95/P99 latencies continuously
- Set up alerts for latency spikes
- Implement response caching for common queries

---

### Issue: High Error Rate (> 1%)

**Symptoms**: Increased 4xx/5xx errors

**Diagnosis**:
```bash
# Check error rate in Grafana
# View recent errors
docker-compose logs concierge | grep '"level":"ERROR"' | tail -50

# Check error distribution
docker-compose logs | jq 'select(.level=="ERROR") | .message' | sort | uniq -c

# Check specific error types
docker-compose logs | grep -E "(ValidationError|TimeoutError|ConnectionError)"
```

**Solutions**:
1. **ValidationError**: Check recent API changes, review request format
2. **TimeoutError**: Check Together.AI, database, network latency
3. **ConnectionError**: Check service dependencies, network issues
4. **AuthenticationError**: Check API keys, token expiration
5. **RateLimitError**: Implement backoff, check rate limit settings

**Immediate Actions**:
- If error rate > 10%: Consider rollback
- If specific endpoint: Disable feature flag
- If Together.AI issue: Enable circuit breaker

---

### Issue: Database Connection Failures

**Symptoms**: Can't connect to PostgreSQL

**Diagnosis**:
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready -U swipesavvy

# Check connection pool
docker-compose logs rag | grep "connection pool"

# Check credentials
docker-compose exec concierge env | grep POSTGRES
```

**Solutions**:
1. **PostgreSQL down**: `docker-compose restart postgres`
2. **Wrong credentials**: Verify POSTGRES_PASSWORD in .env
3. **Connection pool exhausted**: Restart services, increase pool size
4. **Network issue**: Check Docker network, DNS resolution
5. **Too many connections**: Kill idle connections, increase max_connections

**Commands**:
```bash
# Kill idle connections
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"

# Check connection count
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai \
  -c "SELECT count(*) FROM pg_stat_activity;"
```

---

### Issue: Together.AI API Failures

**Symptoms**: AI responses failing, timeouts

**Diagnosis**:
```bash
# Check Together.AI API status
curl https://status.together.ai

# Check API error rate
docker-compose logs concierge | grep together_api | grep error

# Check rate limits
docker-compose logs concierge | grep rate_limit

# Check circuit breaker
docker-compose logs concierge | grep circuit_breaker_state
```

**Solutions**:
1. **API down**: Wait for recovery, check status page
2. **Rate limited**: Implement backoff, reduce request rate
3. **Authentication failed**: Verify TOGETHER_API_KEY
4. **Timeout**: Increase timeout, check network latency
5. **Circuit breaker open**: Wait for auto-recovery (60s default)

**Temporary Mitigation**:
```bash
# Enable circuit breaker if not already
# Reduce traffic with rate limiting
# Display cached responses where possible
# Show degraded service message to users
```

---

### Issue: Memory Leak / High Memory Usage

**Symptoms**: Memory usage growing over time

**Diagnosis**:
```bash
# Check memory usage
docker stats

# Check process memory
docker-compose exec concierge ps aux

# Review memory trends in Grafana
# Check for memory alerts

# Look for memory issues in logs
docker-compose logs | grep -i "memory\|oom"
```

**Solutions**:
1. **Restart affected service**: `docker-compose restart <service>`
2. **Check for resource leaks**: Review recent code changes
3. **Increase container memory limit**: Update docker-compose.yml
4. **Implement connection pooling**: Ensure connections released
5. **Profile application**: Use memory profiler to find leaks

**Prevention**:
- Set container memory limits
- Monitor memory trends
- Run soak tests before deployment
- Implement automatic restarts on high memory

---

### Issue: Guardrails Blocking Legitimate Content

**Symptoms**: False positives, users reporting blocks

**Diagnosis**:
```bash
# Check guardrails logs
docker-compose logs guardrails | grep violation

# Review blocked content patterns
docker-compose logs guardrails | jq 'select(.safety_violations != [])'

# Check PII detections
docker-compose logs guardrails | jq 'select(.has_pii == true)'
```

**Solutions**:
1. **Tune safety patterns**: Adjust regex in guardrails-service/main.py
2. **Whitelist legitimate patterns**: Add exceptions for known safe content
3. **Adjust confidence thresholds**: Lower thresholds for less strict filtering
4. **Review and update**: Collect false positives, improve patterns

**Temporary Mitigation**:
- Manually approve flagged content
- Provide override mechanism for support team
- Document false positive patterns

---

### Issue: Disk Space Running Low

**Symptoms**: Disk usage > 80%

**Diagnosis**:
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Find large files
du -sh /var/lib/docker/* | sort -h

# Check log sizes
du -sh /var/log/*
```

**Solutions**:
```bash
# Clean up Docker images
docker system prune -a

# Clean up volumes
docker volume prune

# Rotate logs
docker-compose restart

# Clean old backups
find /backups -type f -mtime +30 -delete

# Increase disk size (if cloud)
# Resize volume in cloud provider console
```

---

## Monitoring & Alerts

### Key Metrics to Watch

**Application Metrics**:
- Request rate (requests/second)
- Error rate (%)
- Latency (P50, P95, P99)
- Active sessions
- Queue depth

**Infrastructure Metrics**:
- CPU usage (%)
- Memory usage (MB)
- Disk usage (%)
- Network I/O
- Container restarts

**Business Metrics**:
- Active users
- Successful transactions
- Guardrails violations
- Feature usage

### Alert Response

**Critical Alerts (Page Immediately)**:
- Service down (> 1 minute)
- Error rate > 5%
- P95 latency > 2 seconds
- Database down
- Disk usage > 90%

**Warning Alerts (Investigate)**:
- Error rate > 1%
- P95 latency > 1 second
- Memory usage > 80%
- Circuit breaker open
- High rate limit hits

**Info Alerts (Track)**:
- Deployment events
- Scaling events
- Configuration changes

---

## Maintenance Tasks

### Daily
- [ ] Review error logs
- [ ] Check monitoring dashboards
- [ ] Verify backup completion
- [ ] Review guardrails violations

### Weekly
- [ ] Review performance metrics
- [ ] Check security scan results
- [ ] Update dependencies (if needed)
- [ ] Review incident reports
- [ ] Team sync on operational issues

### Monthly
- [ ] SLO review and reporting
- [ ] Capacity planning review
- [ ] Security audit
- [ ] Documentation updates
- [ ] Runbook review and updates

### Quarterly
- [ ] Disaster recovery test
- [ ] Full security penetration test
- [ ] Infrastructure cost review
- [ ] Technology stack review
- [ ] Team training updates

---

## Backup & Recovery

### Database Backups

**Automated Daily Backups**:
```bash
# Backup script (runs daily via cron)
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T postgres pg_dump -U swipesavvy swipesavvy_ai > /backups/$BACKUP_FILE
gzip /backups/$BACKUP_FILE
```

**Manual Backup**:
```bash
docker-compose exec postgres pg_dump -U swipesavvy swipesavvy_ai > manual_backup.sql
```

**Restore**:
```bash
# Stop services
docker-compose stop concierge rag guardrails

# Restore database
docker-compose exec -T postgres psql -U swipesavvy -d swipesavvy_ai < backup.sql

# Restart services
docker-compose up -d
```

### Configuration Backups

```bash
# Backup .env and configs
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env docker-compose.yml monitoring/

# Store in secure location
scp config_backup_*.tar.gz backup-server:/backups/
```

---

## Runbook Contacts

| Role | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| On-Call Engineer | PagerDuty | PagerDuty | Engineering Lead |
| Database Admin | [Name] | [Name] | DevOps Lead |
| Security | [Name] | [Name] | CISO |
| Product | [Name] | [Name] | VP Product |

---

## Appendix

### Useful Commands

```bash
# Quick service restart
alias restart-all="docker-compose restart"
alias restart-concierge="docker-compose restart concierge"

# Log viewing
alias logs-error="docker-compose logs | jq 'select(.level==\"ERROR\")'"
alias logs-live="docker-compose logs -f --tail=100"

# Health check all
alias health-all="curl -s http://localhost:8000/health && curl -s http://localhost:8001/health && curl -s http://localhost:8002/health"
```

### Emergency Procedures

**Complete Service Outage**:
1. Check infrastructure provider status
2. Verify all containers running
3. Check database accessibility
4. Review recent deployments
5. Initiate rollback if recent deployment
6. Update status page
7. Notify stakeholders

**Data Breach Suspected**:
1. Isolate affected systems
2. Preserve logs and evidence
3. Notify security team immediately
4. Follow incident response plan
5. Do NOT restart services (preserves evidence)
6. Contact legal/compliance team

---

**Document Version**: 1.0  
**Last Incident**: None  
**Next Review**: Monthly or after major incident
