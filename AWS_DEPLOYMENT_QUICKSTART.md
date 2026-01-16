# AWS Deployment Quick Start

This guide covers deploying SwipeSavvy to AWS using Terraform infrastructure-as-code.

## Prerequisites

```bash
# Install AWS CLI
brew install awscli

# Install Terraform
brew install terraform

# Configure AWS credentials
aws configure
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json
```

---

## Architecture Overview

SwipeSavvy uses a highly available architecture:

| Component | AWS Service | Configuration |
|-----------|-------------|---------------|
| Load Balancer | ALB | HTTPS termination, host-based routing |
| Compute | EC2 ASG | Min 2, Max 4 instances (t3.large) |
| Database | RDS PostgreSQL | Multi-AZ, 7-day backups |
| Cache | ElastiCache Redis | Multi-AZ, 7-day snapshots |
| SSL | ACM | Wildcard certificate (*.swipesavvy.com) |
| DNS | Route 53 | Hosted zone with alias records |
| Monitoring | CloudWatch | Alarms, logs, metrics |

---

## Terraform Deployment (Recommended)

### Step 1: Configure Variables

```bash
cd infrastructure/terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

**Required variables in `terraform.tfvars`:**

```hcl
# AWS Configuration
aws_region  = "us-east-1"
environment = "prod"

# Database
db_password = "YourSecurePassword123!"

# Domain
domain_name      = "swipesavvy.com"
certificate_arn  = "arn:aws:acm:us-east-1:858955002750:certificate/8924078e-db8a-4bf1-a6ea-8a1f4fe814be"

# API Keys
together_api_key = "your-together-ai-key"
sendgrid_api_key = "your-sendgrid-key"
```

### Step 2: Initialize and Apply

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan -var-file="terraform.tfvars"

# Apply infrastructure
terraform apply -var-file="terraform.tfvars"
```

### Step 3: Save Outputs

After successful apply, save the outputs:

```bash
# View all outputs
terraform output

# Key outputs:
# - alb_dns_name: Load balancer DNS
# - rds_endpoint: Database endpoint
# - redis_endpoint: Cache endpoint
# - vpc_id: VPC identifier
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://api.swipesavvy.com |
| Admin Portal | https://admin.swipesavvy.com |
| Wallet Web | https://wallet.swipesavvy.com |
| Customer Website | https://www.swipesavvy.com |
| API Documentation | https://api.swipesavvy.com/docs |

---

## Infrastructure Configuration

### SSL/TLS

| Setting | Value |
|---------|-------|
| Certificate ARN | `arn:aws:acm:us-east-1:858955002750:certificate/8924078e-db8a-4bf1-a6ea-8a1f4fe814be` |
| Domains | `swipesavvy.com`, `*.swipesavvy.com` |
| SSL Policy | `ELBSecurityPolicy-TLS13-1-2-2021-06` |
| Minimum TLS | TLS 1.2 |

### Database Backups

| Setting | Production | Dev/Staging |
|---------|------------|-------------|
| Retention | 7 days | 1 day |
| Backup Window | 03:00-04:00 UTC | 03:00-04:00 UTC |
| Final Snapshot | Required | Optional |
| Deletion Protection | Enabled | Disabled |

### CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| ALB 5XX Errors | > 10 in 60s | SNS Alert |
| ALB Response Time | > 2 seconds | SNS Alert |
| RDS CPU | > 80% | SNS Alert |
| Redis CPU | > 75% | SNS Alert |
| EC2 CPU (scale up) | > 80% | Add instance |
| EC2 CPU (scale down) | < 30% | Remove instance |

### Auto Scaling

| Setting | Value |
|---------|-------|
| Min Instances | 2 |
| Max Instances | 4 |
| Scale Up Threshold | CPU > 80% for 2 min |
| Scale Down Threshold | CPU < 30% for 5 min |

---

## Environment Variables

Create `.env.production` on EC2 instances:

```bash
# Database
DATABASE_URL=postgresql://swipesavvy_admin:PASSWORD@swipesavvy-prod-postgres.xxx.us-east-1.rds.amazonaws.com:5432/swipesavvy
REDIS_URL=redis://master.swipesavvy-prod-redis.xxx.use1.cache.amazonaws.com:6379

# Security
JWT_SECRET_KEY=your-secure-jwt-secret
ENVIRONMENT=production

# API Keys
TOGETHER_API_KEY=your-together-ai-key
SENDGRID_API_KEY=your-sendgrid-key

# CORS
CORS_ORIGINS=https://admin.swipesavvy.com,https://wallet.swipesavvy.com,https://www.swipesavvy.com
```

---

## Useful Commands

### SSH to EC2

```bash
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@INSTANCE_IP
```

### Service Management

```bash
pm2 restart all
pm2 logs swipesavvy-backend
pm2 status
```

### Database Operations

```bash
# Connect to RDS
psql -h RDS_ENDPOINT -U swipesavvy_admin -d swipesavvy

# Run migrations
alembic upgrade head
```

### Manual Scaling

```bash
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name swipesavvy-prod-asg \
  --desired-capacity 3
```

---

## Cost Estimate

**Production (~$250-350/month):**
- EC2 ASG (2x t3.large): ~$120/month
- RDS db.t3.medium (Multi-AZ): ~$100/month
- ElastiCache (Multi-AZ): ~$70/month
- ALB + Data transfer: ~$40/month

**Development (~$50-80/month):**
- EC2 t3.micro: ~$10/month
- RDS db.t3.micro: ~$20/month
- ElastiCache t3.micro: ~$15/month
- ALB: ~$20/month

---

## Related Documentation

- [PLATFORM_DOCUMENTATION.md](./PLATFORM_DOCUMENTATION.md) - Full platform docs
- [infrastructure/GITHUB_SECRETS.md](./infrastructure/GITHUB_SECRETS.md) - CI/CD secrets
- [infrastructure/terraform/](./infrastructure/terraform/) - Terraform modules

---

*Last Updated: January 16, 2026*
