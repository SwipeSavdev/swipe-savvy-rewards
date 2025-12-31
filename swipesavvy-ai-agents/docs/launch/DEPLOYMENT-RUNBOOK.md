# Deployment Runbook

**Service**: SwipeSavvy AI Agents  
**Version**: 1.0.0-alpha  
**Last Updated**: December 23, 2025

## Overview

This runbook provides step-by-step procedures for deploying the SwipeSavvy AI Agents system to production.

---

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved
- [ ] Security scan completed
- [ ] Performance tests passed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Team notified (deployment window)
- [ ] Customer communication prepared (if needed)

---

## Deployment Methods

### Method 1: Docker Compose (Recommended for MVP)

**Best For**: Small-scale deployments, development, staging

**Steps**:

1. **Prepare Environment**
   ```bash
   # SSH to production server
   ssh user@production-server
   
   # Navigate to application directory
   cd /opt/swipesavvy-ai-agents
   
   # Pull latest code
   git fetch origin
   git checkout Together-AI-Build
   git pull origin Together-AI-Build
   ```

2. **Configure Environment**
   ```bash
   # Copy environment template
   cp .env.template .env
   
   # Edit with production values
   nano .env
   
   # Required variables:
   # - TOGETHER_API_KEY
   # - POSTGRES_PASSWORD (strong password)
   # - PRODUCTION=true
   # - DEBUG=false
   ```

3. **Build Images**
   ```bash
   # Build all services
   docker-compose build
   
   # Verify images
   docker images | grep swipesavvy
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL only
   docker-compose up -d postgres
   
   # Wait for database to be ready
   docker-compose exec postgres pg_isready -U swipesavvy
   
   # Run migrations (if any)
   docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai -f /docker-entrypoint-initdb.d/init.sql
   ```

5. **Start Services**
   ```bash
   # Start all services
   docker-compose up -d
   
   # Verify all containers running
   docker-compose ps
   ```

6. **Health Checks**
   ```bash
   # Check Guardrails service
   curl http://localhost:8002/health
   
   # Check RAG service
   curl http://localhost:8001/health
   
   # Check Concierge service
   curl http://localhost:8000/health
   ```

7. **Smoke Tests**
   ```bash
   # Test end-to-end flow
   curl -X POST http://localhost:8000/api/v1/chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "What is my balance?",
       "session_id": "smoke_test",
       "user_id": "test_user"
     }'
   ```

8. **Monitor Logs**
   ```bash
   # Follow logs for all services
   docker-compose logs -f
   
   # Check for errors
   docker-compose logs | grep ERROR
   ```

### Method 2: Kubernetes (Future Production)

**Best For**: Large-scale deployments, high availability

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yaml

# Verify deployments
kubectl get pods -n swipesavvy
kubectl get services -n swipesavvy

# Check logs
kubectl logs -f deployment/concierge -n swipesavvy
```

---

## Rolling Deployment (Zero Downtime)

For updates without downtime:

```bash
# 1. Deploy new version alongside old
docker-compose up -d --scale concierge=2 --no-recreate

# 2. Verify new instances healthy
curl http://localhost:8000/health

# 3. Stop old instances
docker-compose stop concierge

# 4. Start only new version
docker-compose up -d concierge

# 5. Verify service
curl http://localhost:8000/health
```

---

## Database Migrations

### Before Deployment

```bash
# 1. Backup database
docker-compose exec postgres pg_dump -U swipesavvy swipesavvy_ai > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test migration on copy
# (Create test database and run migration)

# 3. Verify migration script
cat database/migrations/V001__initial_schema.sql
```

### During Deployment

```bash
# Run migration
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai -f /migrations/V001__migration.sql

# Verify schema
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai -c "\dt"
```

---

## Configuration Updates

### Environment Variables

```bash
# 1. Update .env file
nano .env

# 2. Restart affected services
docker-compose restart concierge

# 3. Verify new config loaded
docker-compose logs concierge | grep -i config
```

### Service Configuration

```bash
# 1. Update service files
# 2. Rebuild image
docker-compose build concierge

# 3. Deploy with zero downtime
docker-compose up -d --no-deps concierge
```

---

## Rollback Procedures

### Quick Rollback (Previous Version)

```bash
# 1. Stop current version
docker-compose down

# 2. Checkout previous version
git checkout <previous-commit-hash>

# 3. Rebuild and deploy
docker-compose build
docker-compose up -d

# 4. Verify
curl http://localhost:8000/health
```

### Database Rollback

```bash
# 1. Stop services
docker-compose stop concierge rag guardrails

# 2. Restore database
docker-compose exec -T postgres psql -U swipesavvy -d swipesavvy_ai < backup_20251223_120000.sql

# 3. Restart services
docker-compose up -d
```

### Partial Rollback (Single Service)

```bash
# Rollback just Concierge service
docker-compose stop concierge
git checkout <previous-commit> -- services/concierge-service/
docker-compose build concierge
docker-compose up -d concierge
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
#!/bin/bash
# health_check.sh

services=("8000" "8001" "8002")
for port in "${services[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health)
  if [ $status -eq 200 ]; then
    echo "✅ Service on port $port: HEALTHY"
  else
    echo "❌ Service on port $port: UNHEALTHY (status: $status)"
  fi
done
```

### 2. Smoke Tests

```bash
#!/bin/bash
# smoke_test.sh

# Test balance inquiry
response=$(curl -s -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my balance?", "session_id": "smoke", "user_id": "test"}')

if echo "$response" | grep -q "balance"; then
  echo "✅ Balance inquiry: PASSED"
else
  echo "❌ Balance inquiry: FAILED"
fi

# Test guardrails
response=$(curl -s -X POST http://localhost:8002/api/v1/guardrails/check \
  -H "Content-Type: application/json" \
  -d '{"text": "test message", "check_safety": true, "check_pii": true, "check_injection": true}')

if echo "$response" | grep -q '"is_safe"'; then
  echo "✅ Guardrails: PASSED"
else
  echo "❌ Guardrails: FAILED"
fi
```

### 3. Performance Check

```bash
# Run quick load test
locust -f tests/load/locustfile.py \
  --host=http://localhost:8000 \
  --users 10 \
  --spawn-rate 2 \
  --run-time 1m \
  --headless
```

### 4. Monitoring Verification

- Check Grafana dashboards
- Verify Prometheus scraping
- Review alert rules
- Check log aggregation

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Check resource usage
docker stats

# Restart service
docker-compose restart <service-name>
```

### Database Connection Issues

```bash
# Check PostgreSQL running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U swipesavvy -d swipesavvy_ai -c "SELECT 1;"

# Check connection string
docker-compose exec concierge env | grep POSTGRES
```

### High Latency

```bash
# Check resource usage
docker stats

# Check Together.AI API
curl -I https://api.together.xyz

# Check circuit breaker status
docker-compose logs concierge | grep circuit_breaker

# Check rate limiting
docker-compose logs concierge | grep rate_limit
```

---

## Deployment Schedule

### Recommended Deployment Windows

- **Production**: Tuesday or Wednesday, 10 AM - 2 PM (low traffic)
- **Avoid**: Fridays, weekends, holidays, high-traffic periods
- **Duration**: 30-60 minutes
- **Team**: 2-3 engineers, on-call ready

### Deployment Checklist Timeline

- **T-24h**: Final testing, backup verification
- **T-1h**: Team briefing, monitoring setup
- **T-0**: Begin deployment
- **T+30m**: Verification complete
- **T+1h**: Monitoring review
- **T+24h**: Post-deployment review

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| Deployment Lead | | |
| On-Call Engineer | | |
| Database Admin | | |
| DevOps Lead | | |
| Engineering Manager | | |

---

## Appendix

### Deployment Commands Quick Reference

```bash
# Full deployment
git pull && docker-compose build && docker-compose up -d

# Health check all
curl http://localhost:8000/health && \
curl http://localhost:8001/health && \
curl http://localhost:8002/health

# View logs
docker-compose logs -f --tail=100

# Restart all
docker-compose restart

# Stop all
docker-compose down

# Full teardown (DANGER: deletes volumes)
docker-compose down -v
```

### Environment Variables Reference

See `.env.template` for complete list.

Critical variables:
- `TOGETHER_API_KEY` - Together.AI authentication
- `POSTGRES_PASSWORD` - Database password
- `PRODUCTION` - Production mode flag
- `LOG_LEVEL` - Logging verbosity

---

**Document Version**: 1.0  
**Next Review**: Post-launch + 1 week
