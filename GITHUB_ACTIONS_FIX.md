# GitHub Actions Deployment Fix

## Current Issues

1. **Placeholder deployment steps** - The workflow has echo statements instead of real deployment
2. **Missing AWS credentials** - Need to configure GitHub secrets
3. **No actual infrastructure deployment** - Workflow doesn't deploy to AWS

---

## Solution 1: Configure GitHub Secrets

Go to: https://github.com/SwipeSavdev/swipe-savvy-rewards/settings/secrets/actions

Add these secrets:

```
AWS_ACCESS_KEY_ID          = <from AWS IAM>
AWS_SECRET_ACCESS_KEY      = <from AWS IAM>
AWS_ACCOUNT_ID             = 858955002750
DOCKER_USERNAME            = <Docker Hub username>
DOCKER_PASSWORD            = <Docker Hub password>
```

---

## Solution 2: Use the Simplified Workflow

I've created `.github/workflows/deploy-simple.yml` which:
- ✅ Builds Docker images
- ✅ Pushes to Amazon ECR
- ✅ Uses actual AWS credentials
- ✅ Works with manual trigger

### To use it:

1. **Push the new workflow**:
   ```bash
   git add .github/workflows/deploy-simple.yml
   git commit -m "feat: add functional GitHub Actions deployment workflow"
   git push origin main
   ```

2. **Trigger manually**:
   - Go to: https://github.com/SwipeSavdev/swipe-savvy-rewards/actions/workflows/deploy-simple.yml
   - Click "Run workflow"
   - Select branch: `main`
   - Click "Run workflow"

---

## Solution 3: Manual Deployment (Fastest)

If GitHub Actions is blocked, deploy manually:

### Step 1: Build Docker Image Locally

```bash
cd /Users/papajr/Documents/Projects\ -\ 2026/swipesavvy-mobile-app-v2/swipe-savvy-rewards/swipesavvy-ai-agents

# Build the image
docker build -t swipesavvy-api:latest .

# Test it locally
docker run -p 8000:8000 --env-file .env.production swipesavvy-api:latest
```

### Step 2: Push to AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 858955002750.dkr.ecr.us-east-1.amazonaws.com

# Tag the image
docker tag swipesavvy-api:latest 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest

# Push to ECR
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest
```

### Step 3: Deploy to EC2/ECS

**Option A: EC2 with Docker Compose**
```bash
# SSH into your EC2 instance
ssh ec2-user@<your-ec2-ip>

# Pull latest image
docker-compose pull

# Restart services
docker-compose up -d

# Verify
docker-compose ps
curl http://localhost:8000/health
```

**Option B: ECS (Elastic Container Service)**
```bash
# Update ECS service to use new image
aws ecs update-service \
  --cluster swipesavvy-prod \
  --service swipesavvy-api \
  --force-new-deployment \
  --region us-east-1
```

---

## Solution 4: Fix Existing Workflow

Edit `.github/workflows/deploy-production.yml`:

Replace the placeholder sections with actual deployment:

```yaml
- name: Deploy to production
  env:
    DEPLOY_VERSION: ${{ needs.pre-deploy-checks.outputs.version }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: |
    echo "🚀 Deploying version $DEPLOY_VERSION to production..."

    # Configure AWS CLI
    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
    aws configure set region us-east-1

    # Option 1: Deploy via ECS
    aws ecs update-service \
      --cluster swipesavvy-prod \
      --service swipesavvy-api \
      --force-new-deployment

    # Option 2: Deploy via EC2 SSH
    # ssh -i ~/.ssh/deploy-key ec2-user@<ec2-ip> "cd /opt/swipesavvy && docker-compose pull && docker-compose up -d"

    echo "✅ Deployment initiated"
```

---

## Troubleshooting

### Error: "AWS credentials not configured"

**Fix**: Add secrets to GitHub repo settings

### Error: "ECR repository does not exist"

**Create it**:
```bash
aws ecr create-repository --repository-name swipesavvy-api --region us-east-1
```

### Error: "ECS cluster not found"

**You need to provision infrastructure first**:
```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### Workflow runs but doesn't deploy

**Check**: The placeholder deployment steps just echo messages. Use one of the solutions above to add real deployment logic.

---

## Quick Deployment Script

Save as `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🔨 Building Docker image..."
cd swipesavvy-ai-agents
docker build -t swipesavvy-api:latest .

echo "🔐 Logging into AWS ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 858955002750.dkr.ecr.us-east-1.amazonaws.com

echo "🏷️  Tagging image..."
docker tag swipesavvy-api:latest 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest

echo "📤 Pushing to ECR..."
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest

echo "🚀 Deploying to ECS..."
aws ecs update-service \
  --cluster swipesavvy-prod \
  --service swipesavvy-api \
  --force-new-deployment \
  --region us-east-1

echo "✅ Deployment complete!"
```

Run it:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Recommended Approach

**For immediate deployment**:
1. Use Solution 3 (Manual Deployment) - fastest and most reliable
2. Test locally first
3. Deploy to staging/dev environment first
4. Then deploy to production

**For long-term**:
1. Configure GitHub secrets (Solution 1)
2. Use simplified workflow (Solution 2)
3. Set up proper CI/CD pipeline
4. Add proper testing and rollback procedures

---

## Status Check

After deployment, verify:

```bash
# Check ECS service status
aws ecs describe-services --cluster swipesavvy-prod --services swipesavvy-api --region us-east-1

# Check API health
curl https://api.swipesavvy.com/health

# Check logs
aws logs tail /aws/ecs/swipesavvy-api --follow
```

---

## Next Steps

1. ✅ Fix splash screen (requires native rebuild - see SPLASH_SCREEN_FIX.md)
2. ✅ Configure GitHub secrets
3. ✅ Run manual deployment script
4. ✅ Verify deployment
5. ✅ Set up monitoring and alerts

---

## Summary

The GitHub Actions workflow has placeholder code that doesn't actually deploy. To fix:
- **Quick fix**: Use manual deployment (Solution 3)
- **Proper fix**: Configure secrets and use simplified workflow (Solutions 1 & 2)
- **Infrastructure**: May need to provision AWS resources first with Terraform
