# Deployment Guide - Production Release

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No security vulnerabilities
- [ ] ESLint/TypeScript checks pass
- [ ] Code reviewed by 2+ team members

### Infrastructure
- [ ] Production database running
- [ ] Redis cache running
- [ ] SSL/TLS certificates valid
- [ ] DNS records configured
- [ ] Monitoring tools configured

### Configuration
- [ ] All environment variables set
- [ ] Database migrations ready
- [ ] Backup strategy implemented
- [ ] Logging configured
- [ ] Error tracking enabled

### Security
- [ ] JWT secrets rotated
- [ ] Database passwords strong
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled

---

## Deployment Steps

### 1. Backend Deployment (FastAPI)

#### AWS EC2/ECS Deployment

```bash
# Build Docker image
docker build -t swioe-savvy-backend:latest .
docker tag swioe-savvy-backend:latest \
  123456789.dkr.ecr.us-east-1.amazonaws.com/swioe-savvy-backend:latest

# Push to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/swioe-savvy-backend:latest

# Update ECS service
aws ecs update-service \
  --cluster swioe-prod \
  --service swioe-backend \
  --force-new-deployment
```

#### Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create swioe-savvy-backend

# Set environment variables
heroku config:set -a swioe-savvy-backend \
  JWT_SECRET_KEY=your-secret-key \
  DATABASE_URL=postgresql://... \
  STRIPE_SECRET_KEY=... \
  TWILIO_ACCOUNT_SID=...

# Deploy
git push heroku main

# Monitor logs
heroku logs -a swioe-savvy-backend --tail
```

#### DigitalOcean App Platform

```bash
# Deploy via GitHub
# 1. Push code to GitHub
# 2. Connect GitHub repo to DigitalOcean
# 3. Configure environment variables
# 4. Deploy

# Access app
https://swioe-backend-xxxxx.ondigitalocean.app
```

### 2. Admin Portal Deployment (React)

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd swioe-savvy-admin-portal
vercel --prod

# Configure environment variables in Vercel dashboard
REACT_APP_API_URL=https://api.swipesavvy.com
```

#### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd swioe-savvy-admin-portal
netlify deploy --prod

# Set environment variables
netlify env:set REACT_APP_API_URL https://api.swipesavvy.com
```

#### AWS S3 + CloudFront

```bash
# Build React app
npm run build

# Upload to S3
aws s3 sync dist/ s3://admin-portal-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1EXAMPLE2EXAMPLE \
  --paths "/*"
```

### 3. Mobile App Deployment (Expo)

#### iOS Deployment

```bash
# Build for iOS
eas build --platform ios --auto-submit

# Monitor build
eas build:list

# Submit to App Store
eas submit --platform ios

# Approx. time to approval: 24-48 hours
```

#### Android Deployment

```bash
# Build for Android
eas build --platform android --auto-submit

# Monitor build
eas build:list

# Submit to Google Play
eas submit --platform android

# Approx. time to approval: 2-4 hours
```

#### Internal Testing

```bash
# Create internal testing build
eas build --platform all

# Share preview with QA team
# Link: exp://your-app-url
```

### 4. Database Migration

#### Pre-Migration

```bash
# Backup current database
pg_dump swioe_savvy_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Test migration in staging
psql swioe_savvy_staging < migration_001.sql
```

#### Migration

```bash
# Run migrations
alembic upgrade head

# Verify migration
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

#### Post-Migration

```bash
# Run data validation
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM accounts;
SELECT COUNT(*) FROM transactions;

# Monitor application logs
tail -f /var/log/swioe-savvy/backend.log
```

---

## Monitoring & Health Checks

### Application Health

```bash
# Check backend health
curl https://api.swipesavvy.com/health

# Check database
curl https://api.swipesavvy.com/health/db

# Check external services
curl https://api.swipesavvy.com/health/services
```

### Monitoring Dashboard

```
Datadog / New Relic / CloudWatch Setup:
- Response times
- Error rates
- Database query performance
- API endpoint latency
- Memory usage
- CPU utilization
```

### Log Aggregation

```bash
# View application logs
kubectl logs -n production -l app=swioe-backend

# Search for errors
kubectl logs -n production -l app=swioe-backend | grep "ERROR"

# Stream real-time logs
kubectl logs -n production -l app=swioe-backend -f
```

---

## Rollback Procedure

### If Deployment Fails

```bash
# Check deployment status
kubectl rollout status deployment/swioe-backend

# Rollback to previous version
kubectl rollout undo deployment/swioe-backend

# Verify rollback
kubectl get pods -n production

# Check logs
kubectl logs -n production -l app=swioe-backend
```

### Emergency Rollback

```bash
# Immediate rollback (no waiting)
kubectl rollout undo deployment/swioe-backend --to-revision=previous

# Verify application is responsive
curl https://api.swipesavvy.com/health

# Notify team
# Send alert to Slack/PagerDuty
```

---

## Post-Deployment Verification

### Automated Tests

```bash
# Run smoke tests
npm run test:smoke

# Run integration tests
npm run test:integration

# Monitor test results
echo "All tests passed" || echo "Tests failed"
```

### Manual Verification

- [ ] Login functionality works
- [ ] Financial dashboard loads
- [ ] Transactions process correctly
- [ ] Notifications send
- [ ] Payments integrate
- [ ] Admin portal accessible
- [ ] API endpoints responsive

### Performance Testing

```bash
# Load testing
k6 run load-test.js

# Benchmark critical paths
ab -n 10000 -c 100 https://api.swipesavvy.com/api/transactions
```

---

## Scaling Considerations

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: swioe-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: swioe-backend
  template:
    metadata:
      labels:
        app: swioe-backend
    spec:
      containers:
      - name: backend
        image: swioe-backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: swioe-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: swioe-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Optimization

```sql
-- Add read replicas
CREATE PUBLICATION prod_publication FOR TABLE users, accounts, transactions;

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW monthly_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) AS month,
  user_id,
  SUM(amount) AS total
FROM transactions
GROUP BY DATE_TRUNC('month', created_at), user_id;

-- Index frequently queried columns
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
```

### Caching Strategy

```python
# Redis caching
from redis import Redis

redis_client = Redis.from_url(settings.REDIS_URL)

@app.get("/api/user/{user_id}/balance")
async def get_balance(user_id: str):
    # Check cache first
    cached = redis_client.get(f"balance:{user_id}")
    if cached:
        return json.loads(cached)
    
    # Get from database
    balance = get_balance_from_db(user_id)
    
    # Cache for 5 minutes
    redis_client.setex(
        f"balance:{user_id}",
        300,
        json.dumps(balance)
    )
    
    return balance
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Daily backups
0 2 * * * pg_dump swioe_savvy_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Weekly full backups to S3
0 3 * * 0 aws s3 sync /backups/ s3://swioe-backups/$(date +\%Y\%m\%d)/

# Retention policy: 30 days local, 90 days on S3
```

### Recovery Procedure

```bash
# Restore from backup
gunzip < /backups/db_20240115.sql.gz | psql swioe_savvy_prod

# Verify restore
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM transactions;

# Test application connectivity
curl https://api.swipesavvy.com/health
```

---

## Team Communication

### Deployment Notification

```
Slack Message Format:
📦 Production Deployment
Version: v2.1.0
Services: Backend, Admin Portal, Mobile (iOS/Android)
Status: ✅ Deployed
Duration: 15 minutes
Changes: Feature flags, Financial dashboard, Enhanced notifications

Rollback available: v2.0.5
Support: @devops team
```

---

**Status**: ✅ COMPLETE - Full deployment guide with procedures for all platforms, monitoring, scaling, and disaster recovery.
