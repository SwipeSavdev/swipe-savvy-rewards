# SwipeSavvy AWS Deployment Instructions

## Current Status
- ✅ Code committed: `25db8b191` (splash screen removal + email verification)
- ✅ AWS credentials configured: Account `858955002750`
- ✅ GitHub Actions workflows configured
- ✅ Terraform infrastructure defined
- ❌ Terraform not installed locally
- ❌ GitHub CLI not installed locally

---

## Deployment Options

### Option 1: GitHub Actions Workflow (Recommended)

This is the safest and most automated approach.

#### Steps:

1. **Push a Git Tag to Trigger Production Deployment**
   ```bash
   cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards

   # Create a release tag
   git tag -a v1.0.0 -m "Release v1.0.0: Email verification + splash screen removal"

   # Push the tag to trigger production deployment
   git push origin v1.0.0
   ```

2. **Monitor Deployment**
   - Go to: https://github.com/SwipeSavdev/swipe-savvy-rewards/actions
   - Watch the "Deploy to Production" workflow
   - Workflow will:
     - Build Docker images
     - Push to GitHub Container Registry
     - Deploy to staging first
     - Run smoke tests
     - Deploy to production (requires manual approval)

#### Required GitHub Secrets

The following secrets must be configured in GitHub repository settings:

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
DEPLOY_TOKEN             # Deployment API token
BACKUP_TOKEN             # Backup API token
ROLLBACK_TOKEN           # Rollback API token
SLACK_WEBHOOK            # Slack notifications (optional)
AWS_ACCESS_KEY_ID        # AWS credentials
AWS_SECRET_ACCESS_KEY    # AWS credentials
DB_PASSWORD              # Production database password
TOGETHER_API_KEY         # Together AI API key
SENDGRID_API_KEY         # SendGrid API key
TWILIO_ACCOUNT_SID       # Twilio account SID
TWILIO_AUTH_TOKEN        # Twilio auth token
```

---

### Option 2: Manual Deployment via GitHub Web Interface

1. Go to https://github.com/SwipeSavdev/swipe-savvy-rewards/actions/workflows/deploy-production.yml
2. Click "Run workflow"
3. Select environment: `production`
4. Click "Run workflow"

This will manually trigger the deployment pipeline.

---

### Option 3: Install Terraform and Deploy Locally (Advanced)

If you need direct control over infrastructure:

#### Prerequisites:

```bash
# Install Terraform
brew install terraform

# Verify installation
terraform --version
```

#### Deploy Infrastructure:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards/infrastructure/terraform

# Initialize Terraform
terraform init

# Review infrastructure changes
terraform plan

# Apply changes (requires manual approval)
terraform apply
```

#### Deploy Application:

After infrastructure is ready:

```bash
# Option A: Docker Compose (Simple)
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
docker-compose -f docker-compose.production.yml up -d

# Option B: Push to ECR and update ECS (Production)
# ... (requires additional AWS configuration)
```

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure these are set in your deployment environment:

```bash
# Critical
JWT_SECRET=<generate-with-openssl-rand-base64-32>
POSTGRES_PASSWORD=<strong-password>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>

# Email Configuration (AWS SES)
SES_FROM_EMAIL=noreply@swipesavvy.com
SES_FROM_NAME=SwipeSavvy
SUPPORT_EMAIL=support@swipesavvy.com
SALES_EMAIL=sales@swipesavvy.com

# Application URLs
APP_BASE_URL=https://app.swipesavvy.com
API_BASE_URL=https://api.swipesavvy.com
```

### 2. Database Migrations

After deployment, run migrations:

```bash
# If using Docker
docker exec swipesavvy-api alembic upgrade head

# If SSH'd into EC2
cd /opt/swipesavvy-ai-agents
python -m alembic upgrade head
```

### 3. Verify Health Endpoints

```bash
# API Health
curl https://api.swipesavvy.com/health

# Expected response:
# {"status": "healthy", "version": "1.0.0"}
```

---

## Post-Deployment Verification

### 1. Test Email Verification
```bash
# Create test account via API
curl -X POST https://api.swipesavvy.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'

# Check email for OTP code
# Verify code via API
curl -X POST https://api.swipesavvy.com/api/v1/auth/verify-login-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "...",
    "code": "123456"
  }'
```

### 2. Monitor Logs
```bash
# CloudWatch Logs
aws logs tail /aws/ec2/swipesavvy --follow

# Docker Logs (if applicable)
docker logs -f swipesavvy-api
```

### 3. Check Metrics
- CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch
- Application metrics at `/metrics` endpoint

---

## Rollback Procedure

If deployment fails or issues arise:

### Via GitHub Actions:
The workflow includes automatic rollback on failure.

### Manual Rollback:
```bash
# Revert to previous Docker image tag
docker pull ghcr.io/swipesavdev/swipe-savvy-rewards/ai-agents:<previous-tag>
docker-compose up -d

# Or revert Git and redeploy
git revert HEAD
git push origin main
```

---

## Monitoring & Alerts

- **CloudWatch Alarms**: Configured for 5XX errors, response time, CPU, connections
- **SNS Alerts**: Email notifications for critical issues
- **Route 53 Health Checks**: API health monitoring every 30 seconds

---

## Support Contacts

- **Infrastructure Issues**: DevOps team
- **Application Issues**: Engineering team
- **AWS Account**: 858955002750
- **AWS User**: github.user@swipesavvyrewards.com

---

## Next Steps

**Recommended**: Use Option 1 (GitHub Actions) to trigger automated deployment:

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards
git tag -a v1.0.0 -m "Release v1.0.0: Email verification + splash screen removal"
git push origin v1.0.0
```

Then monitor: https://github.com/SwipeSavdev/swipe-savvy-rewards/actions
