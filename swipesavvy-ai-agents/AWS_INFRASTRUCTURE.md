# SwipeSavvy AWS Infrastructure

## Production Environment Overview

This document details the current AWS infrastructure for the SwipeSavvy platform.

---

## AWS Resources Summary

| Service | Resource | Details |
|---------|----------|---------|
| **ECS** | swipe-savvy-prod | Production cluster |
| **ECR** | swipe-savvy-api | Docker image repository |
| **RDS** | PostgreSQL | swipesavvy-postgres-prod |
| **S3** | swipesavvy-website-prod | Customer website hosting |
| **S3** | swipesavvy-admin-portal-prod | Admin portal hosting |
| **CloudFront** | EUVVZV7PZ373M | Website CDN |
| **CloudFront** | ESEUMWFFEW03U | Admin portal CDN |
| **Route 53** | swipesavvy.com | DNS management |
| **ACM** | *.swipesavvy.com | Wildcard SSL certificate |
| **NLB** | swipe-savvy-nlb | Network Load Balancer |

---

## Domain Configuration

### DNS Records (Route 53)

| Domain | Type | Target |
|--------|------|--------|
| swipesavvy.com | A (Alias) | CloudFront EUVVZV7PZ373M |
| www.swipesavvy.com | A (Alias) | CloudFront EUVVZV7PZ373M |
| api.swipesavvy.com | A (Alias) | NLB swipe-savvy-nlb-*.elb.amazonaws.com |
| admin.swipesavvy.com | A (Alias) | CloudFront ESEUMWFFEW03U |

### SSL Certificates (ACM)

- **Wildcard Certificate**: `*.swipesavvy.com`
- **ARN**: `arn:aws:acm:us-east-1:858955002750:certificate/aaf586b1-50b3-469c-afc2-87df46da32bc`
- **Status**: Issued
- **Expiry**: Check ACM console

---

## Backend API (ECS)

### Cluster Configuration

- **Cluster Name**: `swipe-savvy-prod`
- **Service Name**: `swipe-savvy-api-blue`
- **Task Definition**: `swipe-savvy-api`
- **Desired Count**: 2
- **Launch Type**: Fargate

### Current Task Definition (v22)

```json
{
  "family": "swipe-savvy-api",
  "containerDefinitions": [{
    "name": "swipe-savvy-api",
    "image": "858955002750.dkr.ecr.us-east-1.amazonaws.com/swipe-savvy-api:v6-model-fix",
    "portMappings": [{"containerPort": 3000}],
    "environment": [
      {"name": "ENVIRONMENT", "value": "production"},
      {"name": "AWS_REGION", "value": "us-east-1"},
      {"name": "PORT", "value": "3000"},
      {"name": "MOCK_EMAIL", "value": "false"},
      {"name": "MOCK_SMS", "value": "false"},
      {"name": "SES_FROM_EMAIL", "value": "noreply@swipesavvy.com"},
      {"name": "SNS_SENDER_ID", "value": "SwipeSavvy"}
    ]
  }],
  "cpu": "512",
  "memory": "1024",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"]
}
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| ENVIRONMENT | `production` |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET_KEY | JWT signing key |
| AWS_REGION | `us-east-1` |
| PORT | `3000` |
| SES_FROM_EMAIL | `noreply@swipesavvy.com` |

### Deployment Commands

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  858955002750.dkr.ecr.us-east-1.amazonaws.com

# Build and push Docker image
docker build --platform linux/amd64 -t \
  858955002750.dkr.ecr.us-east-1.amazonaws.com/swipe-savvy-api:TAG .
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipe-savvy-api:TAG

# Register new task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Update service
aws ecs update-service \
  --cluster swipe-savvy-prod \
  --service swipe-savvy-api-blue \
  --task-definition swipe-savvy-api:VERSION \
  --force-new-deployment

# Monitor deployment
aws ecs describe-services \
  --cluster swipe-savvy-prod \
  --services swipe-savvy-api-blue \
  --query 'services[0].deployments'
```

### Health Check

```bash
# Check API health
curl https://api.swipesavvy.com/health

# Check CloudWatch logs
aws logs tail /ecs/swipe-savvy-api --since 5m
```

---

## Customer Website (S3 + CloudFront)

### S3 Bucket

- **Bucket Name**: `swipesavvy-website-prod`
- **Region**: us-east-1
- **Static Website Hosting**: Enabled
- **Index Document**: `index.html`
- **Error Document**: `404.html`

### CloudFront Distribution

- **Distribution ID**: `EUVVZV7PZ373M`
- **Domain**: `d2example.cloudfront.net`
- **Alternate Domains**: `swipesavvy.com`, `www.swipesavvy.com`
- **SSL Certificate**: `*.swipesavvy.com` (ACM)
- **Price Class**: PriceClass_100

### Deployment Commands

```bash
# Sync website files to S3
aws s3 sync ./swipesavvy-customer-website-nextjs/ \
  s3://swipesavvy-website-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id EUVVZV7PZ373M \
  --paths "/*"
```

---

## Admin Portal (S3 + CloudFront)

### S3 Bucket

- **Bucket Name**: `swipesavvy-admin-portal-prod`
- **Region**: us-east-1
- **Static Website Hosting**: Enabled
- **Index Document**: `index.html`
- **Error Document**: `index.html` (SPA fallback)

### CloudFront Distribution

- **Distribution ID**: `ESEUMWFFEW03U`
- **Domain**: `d1676hf63wa24j.cloudfront.net`
- **Alternate Domains**: `admin.swipesavvy.com`
- **SSL Certificate**: `*.swipesavvy.com` (ACM)
- **Price Class**: PriceClass_100
- **Default Root Object**: `index.html`

### Build & Deployment

```bash
# Build admin portal (production mode)
cd swipesavvy-admin-portal
npm run build -- --mode production

# Sync to S3
aws s3 sync dist/ s3://swipesavvy-admin-portal-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id ESEUMWFFEW03U \
  --paths "/*"
```

### Environment Configuration

Production build uses `.env.production`:

```env
VITE_API_BASE_URL=https://api.swipesavvy.com
VITE_USE_MOCK_API=false
VITE_API_TIMEOUT=30000
VITE_WS_URL=wss://api.swipesavvy.com/ws
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AI_CONCIERGE=true
VITE_ENABLE_LIVE_CHAT=true
```

---

## Database (RDS PostgreSQL)

### Configuration

- **Instance**: `swipesavvy-postgres-prod`
- **Engine**: PostgreSQL
- **Endpoint**: `swipesavvy-postgres-prod.c8x2qqc8o3ow.us-east-1.rds.amazonaws.com`
- **Port**: 5432
- **Database**: `swipesavvy_db`

### Connection

```bash
# Connection string format
postgresql+psycopg2://USER:PASSWORD@swipesavvy-postgres-prod.c8x2qqc8o3ow.us-east-1.rds.amazonaws.com:5432/swipesavvy_db
```

---

## CORS Configuration

The backend API allows requests from the following origins in production:

```python
CORS_ORIGINS = [
    "https://www.swipesavvy.com",
    "https://swipesavvy.com",
    "https://api.swipesavvy.com",
    "https://admin.swipesavvy.com",
    "https://wallet.swipesavvy.com",
    "https://app.swipesavvy.com",
]
```

### CORS Headers

```
Access-Control-Allow-Origin: https://admin.swipesavvy.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

---

## Monitoring & Logs

### CloudWatch Log Groups

- `/ecs/swipe-savvy-api` - Backend API logs

### Useful Commands

```bash
# View recent logs
aws logs tail /ecs/swipe-savvy-api --since 10m

# Filter for errors
aws logs filter-log-events \
  --log-group-name /ecs/swipe-savvy-api \
  --filter-pattern "ERROR" \
  --limit 50

# Check ECS task status
aws ecs describe-tasks \
  --cluster swipe-savvy-prod \
  --tasks $(aws ecs list-tasks --cluster swipe-savvy-prod --service-name swipe-savvy-api-blue --query 'taskArns' --output text)
```

---

## Rollback Procedures

### Backend API Rollback

```bash
# List recent task definitions
aws ecs list-task-definitions --family-prefix swipe-savvy-api --sort DESC --max-items 5

# Rollback to previous version
aws ecs update-service \
  --cluster swipe-savvy-prod \
  --service swipe-savvy-api-blue \
  --task-definition swipe-savvy-api:PREVIOUS_VERSION \
  --force-new-deployment
```

### Frontend Rollback

For S3-hosted frontends, restore from a previous deployment or rebuild from a previous git commit.

---

## Security Best Practices

1. **Never commit secrets** - Use AWS Secrets Manager or Parameter Store
2. **Use IAM roles** - ECS tasks use task roles, not access keys
3. **Enable encryption** - RDS encryption at rest, S3 bucket encryption
4. **Rotate credentials** - JWT secrets, database passwords
5. **Monitor access** - CloudTrail for API calls, VPC Flow Logs

---

## Cost Optimization

- ECS Fargate: Pay per vCPU and memory used
- CloudFront: Pay per request and data transfer
- S3: Pay per storage and requests
- RDS: Reserved instances for production workloads

---

**Last Updated**: January 2026
**Maintained By**: SwipeSavvy DevOps Team
