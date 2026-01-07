# AWS Infrastructure Setup Guide

Complete guide for deploying SwipeSavvy platform on AWS with RDS and EC2.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS RDS PostgreSQL Setup](#aws-rds-postgresql-setup)
3. [AWS EC2 Instance Setup](#aws-ec2-instance-setup)
4. [Security Groups Configuration](#security-groups-configuration)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Steps](#deployment-steps)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Tools
- AWS CLI installed and configured
- SSH key pair for EC2 access
- Domain name (optional, for production)
- SSL certificate (for HTTPS)

### AWS Account Requirements
- Active AWS account with billing enabled
- IAM user with appropriate permissions:
  - EC2 full access
  - RDS full access
  - VPC configuration access
  - Security Groups management

### Install AWS CLI
```bash
# macOS
brew install awscli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

---

## AWS RDS PostgreSQL Setup

### Step 1: Create RDS PostgreSQL Database

#### Using AWS Console:

1. **Navigate to RDS Dashboard**
   - Go to AWS Console → Services → RDS
   - Click "Create database"

2. **Database Creation Method**
   - Choose: **Standard Create**

3. **Engine Options**
   - Engine type: **PostgreSQL**
   - Version: **PostgreSQL 14.x** or **15.x**
   - Template: **Production** (or Dev/Test for lower cost)

4. **Settings**
   ```
   DB instance identifier: swipesavvy-postgres-prod
   Master username: swipesavvy_admin
   Master password: [Generate strong password - save this!]
   Confirm password: [Same password]
   ```

5. **DB Instance Class**
   - **Production**: db.t3.medium (2 vCPU, 4 GB RAM)
   - **Development**: db.t3.micro (2 vCPU, 1 GB RAM)
   - **High Traffic**: db.r6g.large (2 vCPU, 16 GB RAM)

6. **Storage**
   ```
   Storage type: General Purpose SSD (gp3)
   Allocated storage: 100 GB (production) or 20 GB (dev)
   Enable storage autoscaling: Yes
   Maximum storage threshold: 500 GB
   ```

7. **Connectivity**
   ```
   Virtual Private Cloud (VPC): Default VPC or create new
   Subnet group: Default or create new
   Public access: No (for security - access via EC2 only)
   VPC security group: Create new → swipesavvy-rds-sg
   Availability Zone: No preference
   ```

8. **Database Authentication**
   - Password authentication

9. **Additional Configuration**
   ```
   Initial database name: swipesavvy_db
   DB parameter group: default.postgres14
   Backup retention period: 7 days (production) or 1 day (dev)
   Backup window: 03:00-04:00 UTC
   Enable encryption: Yes
   Maintenance window: Sun:04:00-Sun:05:00 UTC
   Enable auto minor version upgrade: Yes
   Enable deletion protection: Yes (production)
   ```

10. **Click "Create database"**
    - Wait 5-10 minutes for provisioning

#### Using AWS CLI:

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier swipesavvy-postgres-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.10 \
  --master-username swipesavvy_admin \
  --master-user-password 'YourSecurePassword123!' \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-name swipesavvy_db \
  --backup-retention-period 7 \
  --preferred-backup-window 03:00-04:00 \
  --preferred-maintenance-window sun:04:00-sun:05:00 \
  --no-publicly-accessible \
  --enable-cloudwatch-logs-exports '["postgresql","upgrade"]' \
  --tags Key=Environment,Value=Production Key=Project,Value=SwipeSavvy

# Check status
aws rds describe-db-instances \
  --db-instance-identifier swipesavvy-postgres-prod \
  --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address,Endpoint.Port]'
```

### Step 2: Retrieve RDS Connection Details

```bash
# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier swipesavvy-postgres-prod \
  --query 'DBInstances[0].Endpoint' \
  --output json

# Expected output:
# {
#   "Address": "swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com",
#   "Port": 5432
# }
```

**Save these details:**
```
RDS_HOST=swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com
RDS_PORT=5432
RDS_DATABASE=swipesavvy_db
RDS_USER=swipesavvy_admin
RDS_PASSWORD=[Your master password]
```

---

## AWS EC2 Instance Setup

### Step 1: Create EC2 Key Pair

```bash
# Create SSH key pair
aws ec2 create-key-pair \
  --key-name swipesavvy-prod-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/swipesavvy-prod-key.pem

# Set proper permissions
chmod 400 ~/.ssh/swipesavvy-prod-key.pem
```

### Step 2: Launch EC2 Instance

#### Using AWS Console:

1. **Navigate to EC2 Dashboard**
   - Go to AWS Console → Services → EC2
   - Click "Launch Instance"

2. **Name and Tags**
   ```
   Name: SwipeSavvy-Production-Server
   Tags:
     - Environment: Production
     - Project: SwipeSavvy
   ```

3. **Application and OS Images (AMI)**
   - Amazon Linux 2023 AMI (recommended)
   - Or: Ubuntu Server 22.04 LTS
   - Architecture: 64-bit (x86)

4. **Instance Type**
   - **Production**: t3.large (2 vCPU, 8 GB RAM)
   - **Development**: t3.medium (2 vCPU, 4 GB RAM)
   - **High Traffic**: c6i.xlarge (4 vCPU, 8 GB RAM)

5. **Key Pair**
   - Select: swipesavvy-prod-key (created above)

6. **Network Settings**
   ```
   VPC: Same as RDS
   Subnet: Same availability zone as RDS (if possible)
   Auto-assign public IP: Enable
   Firewall (security groups): Create new → swipesavvy-ec2-sg
   ```

7. **Configure Storage**
   ```
   Root volume:
     - Type: gp3
     - Size: 50 GB (production) or 20 GB (dev)
     - IOPS: 3000
     - Throughput: 125 MB/s
     - Encrypted: Yes
   ```

8. **Advanced Details**
   ```
   IAM instance profile: None (or create for CloudWatch)
   Enable detailed monitoring: Yes (production)
   Enable termination protection: Yes (production)
   ```

9. **Click "Launch Instance"**

#### Using AWS CLI:

```bash
# Get latest Amazon Linux 2023 AMI ID
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text)

# Launch EC2 instance
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.large \
  --key-name swipesavvy-prod-key \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":50,"VolumeType":"gp3","Encrypted":true}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=SwipeSavvy-Production-Server},{Key=Environment,Value=Production}]' \
  --user-data file://ec2-user-data.sh

# Get instance details
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production-Server" \
  --query 'Reservations[0].Instances[0].[InstanceId,PublicIpAddress,State.Name]'
```

### Step 3: Allocate Elastic IP (Optional but Recommended)

```bash
# Allocate Elastic IP
aws ec2 allocate-address \
  --domain vpc \
  --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=SwipeSavvy-EIP}]'

# Associate with instance
aws ec2 associate-address \
  --instance-id i-xxxxxxxxxxxxxxxxx \
  --allocation-id eipalloc-xxxxxxxxxxxxxxxxx
```

---

## Security Groups Configuration

### RDS Security Group (swipesavvy-rds-sg)

```bash
# Create RDS security group
aws ec2 create-security-group \
  --group-name swipesavvy-rds-sg \
  --description "Security group for SwipeSavvy RDS PostgreSQL" \
  --vpc-id vpc-xxxxxxxxx

# Allow PostgreSQL from EC2 security group only
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ec2-xxxxxxxxx
```

**Console Configuration:**
```
Inbound Rules:
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Custom → [EC2 Security Group ID]
Description: Allow PostgreSQL from EC2 instances

Outbound Rules:
Type: All traffic
Protocol: All
Port: All
Destination: 0.0.0.0/0
```

### EC2 Security Group (swipesavvy-ec2-sg)

```bash
# Create EC2 security group
aws ec2 create-security-group \
  --group-name swipesavvy-ec2-sg \
  --description "Security group for SwipeSavvy EC2 instances" \
  --vpc-id vpc-xxxxxxxxx

# SSH access
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-xxxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# HTTP
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

# HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Backend API
aws ec2 authorize-security-group-ingress \
  --group-id sg-ec2-xxxxxxxxx \
  --protocol tcp \
  --port 8000 \
  --cidr 0.0.0.0/0
```

**Console Configuration:**
```
Inbound Rules:
1. SSH
   Type: SSH
   Protocol: TCP
   Port: 22
   Source: My IP (for security) or 0.0.0.0/0
   Description: SSH access

2. HTTP
   Type: HTTP
   Protocol: TCP
   Port: 80
   Source: 0.0.0.0/0
   Description: HTTP traffic

3. HTTPS
   Type: HTTPS
   Protocol: TCP
   Port: 443
   Source: 0.0.0.0/0
   Description: HTTPS traffic

4. Backend API
   Type: Custom TCP
   Protocol: TCP
   Port: 8000
   Source: 0.0.0.0/0
   Description: FastAPI Backend

5. Admin Portal
   Type: Custom TCP
   Protocol: TCP
   Port: 5173-5176
   Source: 0.0.0.0/0
   Description: Admin portal

6. Wallet Web
   Type: Custom TCP
   Protocol: TCP
   Port: 3001
   Source: 0.0.0.0/0
   Description: Customer wallet portal

Outbound Rules:
Type: All traffic
Protocol: All
Port: All
Destination: 0.0.0.0/0
```

---

## Environment Configuration

### Production Environment File

Create `/home/ec2-user/swipesavvy/.env.production`:

```bash
# Database Configuration (AWS RDS)
DATABASE_URL=postgresql://swipesavvy_admin:[PASSWORD]@swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/swipesavvy_db
POSTGRES_HOST=swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=swipesavvy_db
POSTGRES_USER=swipesavvy_admin
POSTGRES_PASSWORD=[Your RDS master password]

# Redis Configuration (ElastiCache or local)
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_BASE_URL=https://api.swipesavvy.com
BACKEND_PORT=8000
FRONTEND_URL=https://admin.swipesavvy.com

# Together.AI Configuration
TOGETHER_AI_API_KEY=[Your Together.AI API Key]
TOGETHER_AI_BASE_URL=https://api.together.xyz/v1
TOGETHER_AI_MODEL=meta-llama/Llama-3.3-70b-instruct-turbo

# JWT Configuration
JWT_SECRET_KEY=[Generate strong secret key]
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
CORS_ORIGINS=["https://admin.swipesavvy.com","https://wallet.swipesavvy.com","https://www.swipesavvy.com"]

# Application Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# AWS Configuration (if using S3 for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[Your AWS Access Key]
AWS_SECRET_ACCESS_KEY=[Your AWS Secret Key]
AWS_S3_BUCKET=swipesavvy-uploads

# Email Configuration (SES or SMTP)
EMAIL_FROM=noreply@swipesavvy.com
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=[Your SES SMTP username]
EMAIL_PASSWORD=[Your SES SMTP password]

# Security
ALLOWED_HOSTS=["api.swipesavvy.com","admin.swipesavvy.com"]
SECURE_SSL_REDIRECT=true
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
```

---

## Deployment Steps

### Step 1: Connect to EC2 Instance

```bash
# Get EC2 public IP
EC2_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production-Server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

# SSH into instance
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@$EC2_IP
```

### Step 2: Install Required Software on EC2

Create `ec2-setup.sh`:

```bash
#!/bin/bash
set -e

echo "=== SwipeSavvy EC2 Setup Script ==="

# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3.11
sudo yum install -y python3.11 python3.11-pip

# Install PostgreSQL client
sudo yum install -y postgresql15

# Install Redis
sudo yum install -y redis6
sudo systemctl start redis6
sudo systemctl enable redis6

# Install Nginx
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install Git
sudo yum install -y git

# Install PM2 for process management
sudo npm install -g pm2

# Install Certbot for SSL
sudo yum install -y certbot python3-certbot-nginx

# Create application directory
sudo mkdir -p /var/www/swipesavvy
sudo chown -R ec2-user:ec2-user /var/www/swipesavvy

# Create log directory
sudo mkdir -p /var/log/swipesavvy
sudo chown -R ec2-user:ec2-user /var/log/swipesavvy

echo "=== EC2 Setup Complete ==="
```

Run setup:
```bash
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### Step 3: Clone and Deploy Application

```bash
# Clone repository
cd /var/www/swipesavvy
git clone https://github.com/SwipeSavdev/swipe-savvy-rewards.git .

# Or deploy via rsync from local machine
rsync -avz -e "ssh -i ~/.ssh/swipesavvy-prod-key.pem" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '__pycache__' \
  ./ ec2-user@$EC2_IP:/var/www/swipesavvy/
```

### Step 4: Install Dependencies

```bash
# Backend dependencies (Python)
cd /var/www/swipesavvy
python3.11 -m pip install -r requirements.txt

# Frontend dependencies
cd swipesavvy-admin-portal
npm install
npm run build

cd ../swipesavvy-wallet-web
npm install
npm run build

cd ../swipesavvy-mobile-app-v2
npm install
```

### Step 5: Configure Environment

```bash
# Copy production environment file
cp .env.production.example .env.production

# Edit with actual credentials
nano .env.production
# Update DATABASE_URL, TOGETHER_AI_API_KEY, JWT_SECRET_KEY, etc.
```

### Step 6: Run Database Migrations

```bash
# Test RDS connection
psql -h swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com \
     -U swipesavvy_admin \
     -d swipesavvy_db \
     -c "SELECT version();"

# Run migrations
cd /var/www/swipesavvy
python3.11 -m alembic upgrade head

# Or run initial schema
psql -h [RDS_HOST] -U swipesavvy_admin -d swipesavvy_db -f database/init.sql
```

### Step 7: Start Services with PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'swipesavvy-backend',
      script: 'uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000 --workers 4',
      interpreter: 'python3.11',
      cwd: '/var/www/swipesavvy',
      env: {
        NODE_ENV: 'production',
        ENV_FILE: '.env.production'
      },
      error_file: '/var/log/swipesavvy/backend-error.log',
      out_file: '/var/log/swipesavvy/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'swipesavvy-admin',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/swipesavvy/swipesavvy-admin-portal',
      env: {
        PORT: 5173
      },
      error_file: '/var/log/swipesavvy/admin-error.log',
      out_file: '/var/log/swipesavvy/admin-out.log'
    },
    {
      name: 'swipesavvy-wallet',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/swipesavvy/swipesavvy-wallet-web',
      env: {
        PORT: 3001
      },
      error_file: '/var/log/swipesavvy/wallet-error.log',
      out_file: '/var/log/swipesavvy/wallet-out.log'
    }
  ]
};
```

Start services:
```bash
cd /var/www/swipesavvy
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 8: Configure Nginx Reverse Proxy

Create `/etc/nginx/conf.d/swipesavvy.conf`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.swipesavvy.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Portal
server {
    listen 80;
    server_name admin.swipesavvy.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wallet Portal
server {
    listen 80;
    server_name wallet.swipesavvy.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Configure SSL with Let's Encrypt

```bash
# Get SSL certificates
sudo certbot --nginx -d api.swipesavvy.com
sudo certbot --nginx -d admin.swipesavvy.com
sudo certbot --nginx -d wallet.swipesavvy.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Monitoring and Maintenance

### CloudWatch Monitoring

```bash
# Install CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Configure CloudWatch
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

### Log Management

```bash
# View logs
pm2 logs swipesavvy-backend
pm2 logs swipesavvy-admin
pm2 logs swipesavvy-wallet

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy

```bash
# Database backup script
cat > /home/ec2-user/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -h [RDS_HOST] \
        -U swipesavvy_admin \
        -d swipesavvy_db \
        -F c \
        -f $BACKUP_DIR/swipesavvy_backup_$TIMESTAMP.dump

# Upload to S3
aws s3 cp $BACKUP_DIR/swipesavvy_backup_$TIMESTAMP.dump \
           s3://swipesavvy-backups/postgres/

# Keep only last 7 days locally
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete
EOF

chmod +x /home/ec2-user/backup-db.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/ec2-user/backup-db.sh
```

### Health Checks

```bash
# API health check
curl -f http://localhost:8000/health || exit 1

# Database connection check
psql -h [RDS_HOST] -U swipesavvy_admin -d swipesavvy_db -c "SELECT 1;" > /dev/null || exit 1

# Redis check
redis-cli ping || exit 1
```

---

## Quick Reference Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@[EC2_IP]

# View service status
pm2 status

# Restart services
pm2 restart all

# View logs
pm2 logs

# Pull latest code
cd /var/www/swipesavvy && git pull origin main

# Rebuild frontend
cd swipesavvy-admin-portal && npm run build
pm2 restart swipesavvy-admin

# Database connection
psql -h [RDS_HOST] -U swipesavvy_admin -d swipesavvy_db

# Check disk space
df -h

# Check memory usage
free -h

# Check system logs
sudo journalctl -u nginx -f
```

---

## Estimated AWS Costs (Monthly)

### Production Setup:
- **EC2 t3.large**: ~$60-70/month
- **RDS db.t3.medium (100GB)**: ~$80-100/month
- **Elastic IP**: $0 (when associated)
- **Data Transfer**: ~$10-20/month
- **CloudWatch**: ~$10/month
- **Total**: ~$160-200/month

### Development Setup:
- **EC2 t3.micro**: ~$7-10/month
- **RDS db.t3.micro (20GB)**: ~$15-20/month
- **Total**: ~$25-35/month

---

## Security Best Practices

1. ✅ Never expose RDS publicly - access only via EC2
2. ✅ Use strong passwords for RDS master user
3. ✅ Enable RDS encryption at rest
4. ✅ Restrict SSH access to specific IPs
5. ✅ Use SSL/TLS for all connections
6. ✅ Enable CloudWatch logging
7. ✅ Regular security updates: `sudo yum update -y`
8. ✅ Implement rate limiting on APIs
9. ✅ Use IAM roles instead of access keys where possible
10. ✅ Enable MFA for AWS root account

---

## Troubleshooting

### Cannot connect to RDS from EC2
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test connection
telnet [RDS_HOST] 5432

# Check RDS status
aws rds describe-db-instances --db-instance-identifier swipesavvy-postgres-prod
```

### EC2 instance not accessible
```bash
# Check instance state
aws ec2 describe-instances --instance-ids i-xxxxxxxxx

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

### Service not starting
```bash
# Check PM2 logs
pm2 logs --lines 100

# Check system resources
top
df -h

# Check port availability
sudo netstat -tulpn | grep LISTEN
```

---

## Next Steps

After infrastructure setup:
1. Configure DNS records for your domain
2. Set up continuous deployment with GitHub Actions
3. Configure monitoring alerts in CloudWatch
4. Set up backup automation
5. Implement load balancer for high availability
6. Consider Multi-AZ RDS deployment for production

For questions or issues, refer to AWS documentation or contact the DevOps team.
