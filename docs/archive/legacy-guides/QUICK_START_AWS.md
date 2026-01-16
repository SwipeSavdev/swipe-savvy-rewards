# SwipeSavvy AWS Deployment Quick Start

Streamlined guide to deploy SwipeSavvy to AWS production environment.

## Prerequisites

- AWS CLI configured (`aws configure`)
- AWS Account with appropriate IAM permissions
- Domain name (optional, for SSL)

---

## AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Route 53  │───▶│    ALB      │───▶│   ECS / EC2         │  │
│  │   (DNS)     │    │ (SSL/HTTPS) │    │                     │  │
│  └─────────────┘    └─────────────┘    │  ┌───────────────┐  │  │
│                                         │  │ Backend API   │  │  │
│                                         │  │ (Port 8000)   │  │  │
│                                         │  └───────────────┘  │  │
│                                         │  ┌───────────────┐  │  │
│                                         │  │ AI Agents     │  │  │
│                                         │  │ (Port 8001)   │  │  │
│                                         │  └───────────────┘  │  │
│                                         │  ┌───────────────┐  │  │
│                                         │  │ Admin Portal  │  │  │
│                                         │  │ (Port 5173)   │  │  │
│                                         │  └───────────────┘  │  │
│                                         └─────────────────────┘  │
│                                                    │             │
│                                         ┌──────────▼──────────┐  │
│                                         │   RDS PostgreSQL    │  │
│                                         │   (Port 5432)       │  │
│                                         └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Option 1: Automated Deployment (Recommended)

```bash
# Make script executable
chmod +x deploy-to-aws.sh

# Run deployment
./deploy-to-aws.sh
```

Select deployment type:
1. **Full deployment** - Infrastructure + Code
2. **Code deployment only** - Update existing EC2
3. **Infrastructure only** - Create RDS + EC2

---

## Option 2: Manual Deployment

### Step 1: Create RDS Database

```bash
# Set credentials (SAVE THESE!)
export RDS_PASSWORD="YourSecurePassword123!"
export AWS_REGION="us-east-1"

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier swipesavvy-postgres-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.10 \
  --master-username swipesavvy_admin \
  --master-user-password "$RDS_PASSWORD" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --db-name swipesavvy_db \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --region $AWS_REGION

# Wait for RDS (5-10 min)
aws rds wait db-instance-available \
  --db-instance-identifier swipesavvy-postgres-prod

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier swipesavvy-postgres-prod \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "RDS Endpoint: $RDS_ENDPOINT"
```

### Step 2: Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name swipesavvy-prod-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/swipesavvy-prod-key.pem

chmod 400 ~/.ssh/swipesavvy-prod-key.pem

# Get latest Amazon Linux 2023 AMI
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text)

# Launch EC2
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.large \
  --key-name swipesavvy-prod-key \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=SwipeSavvy-Production}]' \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":50,"VolumeType":"gp3"}}]'

# Get Public IP
EC2_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo "EC2 IP: $EC2_IP"
```

### Step 3: Configure Security Groups

```bash
# Get security group ID
SG_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# Open required ports
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8001 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 5173 --cidr 0.0.0.0/0
```

### Step 4: Setup EC2 & Deploy

```bash
# Copy setup script to EC2
scp -i ~/.ssh/swipesavvy-prod-key.pem ec2-setup-script.sh ec2-user@$EC2_IP:/home/ec2-user/

# SSH and run setup
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@$EC2_IP
chmod +x ec2-setup-script.sh
./ec2-setup-script.sh
exit

# Deploy code
rsync -avz -e "ssh -i ~/.ssh/swipesavvy-prod-key.pem" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '__pycache__' \
  --exclude '.venv' \
  ./ ec2-user@$EC2_IP:/var/www/swipesavvy/
```

### Step 5: Configure Production Environment

```bash
# SSH to EC2
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@$EC2_IP

# Configure environment
cd /var/www/swipesavvy
cp .env.production.example .env.production
nano .env.production
```

Required environment variables:
```bash
# Database
POSTGRES_HOST=your-rds-endpoint.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=swipesavvy_db
POSTGRES_USER=swipesavvy_admin
POSTGRES_PASSWORD=YourSecurePassword123!

# Security
JWT_SECRET_KEY=$(openssl rand -base64 64)

# AI Services
TOGETHER_API_KEY=your_together_ai_api_key

# Production URLs
API_BASE_URL=https://api.swipesavvy.com
ADMIN_URL=https://admin.swipesavvy.com
```

### Step 6: Start Services

```bash
# Install dependencies
pip3 install -r requirements.txt
cd swipesavvy-admin-portal && npm install && npm run build && cd ..
cd swipesavvy-ai-agents && pip3 install -r requirements.txt && cd ..

# Run migrations
python3.11 -m alembic upgrade head

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Production URLs

| Service | URL |
|---------|-----|
| Backend API | `http://[EC2_IP]:8000` |
| API Docs | `http://[EC2_IP]:8000/docs` |
| Admin Portal | `http://[EC2_IP]:5173` |
| AI Agents | `http://[EC2_IP]:8001` |

---

## SSL Setup (Optional)

### With Custom Domain

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d api.swipesavvy.com
sudo certbot --nginx -d admin.swipesavvy.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Monitoring & Logs

```bash
# PM2 status
pm2 status
pm2 logs

# Health check
curl http://localhost:8000/health

# System resources
htop
df -h
```

---

## Database Backups

```bash
# Manual backup
pg_dump -h $RDS_ENDPOINT -U swipesavvy_admin -d swipesavvy_db > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
crontab -e
# Add: 0 2 * * * /home/ec2-user/backup-db.sh
```

---

## Update Deployment

```bash
# From local machine
rsync -avz -e "ssh -i ~/.ssh/swipesavvy-prod-key.pem" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '__pycache__' \
  ./ ec2-user@$EC2_IP:/var/www/swipesavvy/

# SSH and restart
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@$EC2_IP
cd /var/www/swipesavvy
pm2 restart all
```

---

## Cost Estimate

| Environment | Monthly Cost |
|-------------|--------------|
| **Production** (t3.large + db.t3.medium) | ~$160-200 |
| **Development** (t3.micro + db.t3.micro) | ~$25-35 |

---

## Troubleshooting

### Can't connect to RDS
```bash
# Verify RDS security group allows EC2
# Check VPC settings
aws rds describe-db-instances --db-instance-identifier swipesavvy-postgres-prod
```

### Services not starting
```bash
pm2 logs --lines 100
cat /var/www/swipesavvy/.env.production
```

### Out of disk space
```bash
df -h
# Clean up
docker system prune -a
pm2 flush
```

---

## Related Documentation

- [DATABASE_SYNC.md](./DATABASE_SYNC.md) - Sync local with AWS database
- [QUICK_START_LOCAL.md](./QUICK_START_LOCAL.md) - Local development setup
- [AWS_DEPLOYMENT_QUICKSTART.md](./AWS_DEPLOYMENT_QUICKSTART.md) - Detailed AWS guide
