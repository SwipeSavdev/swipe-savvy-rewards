# AWS Deployment Quick Start

This is a condensed guide to get SwipeSavvy running on AWS quickly. For detailed instructions, see [AWS_INFRASTRUCTURE_SETUP.md](./AWS_INFRASTRUCTURE_SETUP.md).

## Prerequisites

```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json
```

## Option 1: Automated Deployment (Recommended)

We've created an automated deployment script that handles everything:

```bash
# Make script executable (if not already)
chmod +x deploy-to-aws.sh

# Run automated deployment
./deploy-to-aws.sh
```

**Select from 3 deployment options:**
1. **Full deployment** - Creates RDS + EC2 + deploys code
2. **Code deployment only** - Updates existing EC2 instance
3. **Infrastructure only** - Creates RDS + EC2 without deploying code

The script will:
- ✅ Create security groups
- ✅ Launch RDS PostgreSQL database
- ✅ Launch EC2 instance
- ✅ Configure networking
- ✅ Deploy application code
- ✅ Save credentials to `rds-credentials.txt` and `ec2-details.txt`

## Option 2: Manual Step-by-Step

### Step 1: Create RDS Database (5-10 minutes)

```bash
# Set your RDS password (save this!)
export RDS_PASSWORD="YourSecurePassword123!"

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
  --region us-east-1

# Wait for RDS to be available (5-10 min)
aws rds wait db-instance-available \
  --db-instance-identifier swipesavvy-postgres-prod

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier swipesavvy-postgres-prod \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

**Save the output:**
```
RDS Endpoint: swipesavvy-postgres-prod.xxxxxxxxx.us-east-1.rds.amazonaws.com
Database: swipesavvy_db
Username: swipesavvy_admin
Password: [Your password]
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

# Launch EC2 instance
aws ec2 run-instances \
  --image-id $AMI_ID \
  --instance-type t3.large \
  --key-name swipesavvy-prod-key \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=SwipeSavvy-Production}]' \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":50,"VolumeType":"gp3"}}]'

# Get instance ID and public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production" \
  --query 'Reservations[0].Instances[0].[InstanceId,PublicIpAddress]' \
  --output text
```

**Save the output:**
```
Instance ID: i-xxxxxxxxxxxxxxxxx
Public IP: XX.XX.XX.XX
```

### Step 3: Configure Security Groups

```bash
# Get instance security group
SG_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=SwipeSavvy-Production" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# Allow HTTP, HTTPS, SSH, and application ports
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 8000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 5173 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3001 --cidr 0.0.0.0/0
```

### Step 4: Setup EC2 Instance

```bash
# SSH into EC2
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@[EC2_PUBLIC_IP]

# Transfer and run setup script
exit  # Exit SSH first
scp -i ~/.ssh/swipesavvy-prod-key.pem ec2-setup-script.sh ec2-user@[EC2_PUBLIC_IP]:/home/ec2-user/
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@[EC2_PUBLIC_IP]

# Run setup (takes 3-5 minutes)
chmod +x ec2-setup-script.sh
./ec2-setup-script.sh
```

### Step 5: Deploy Application

```bash
# On your local machine, build and deploy
cd /path/to/swipesavvy

# Build frontends
cd swipesavvy-admin-portal && npm install && npm run build && cd ..
cd swipesavvy-wallet-web && npm install && npm run build && cd ..

# Deploy to EC2
rsync -avz -e "ssh -i ~/.ssh/swipesavvy-prod-key.pem" \
  --exclude 'node_modules' --exclude '.git' --exclude '__pycache__' \
  ./ ec2-user@[EC2_PUBLIC_IP]:/var/www/swipesavvy/
```

### Step 6: Configure Environment

```bash
# SSH into EC2
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@[EC2_PUBLIC_IP]

# Create production environment file
cd /var/www/swipesavvy
cp .env.production.example .env.production
nano .env.production

# Update these critical values:
# - POSTGRES_HOST=[Your RDS endpoint]
# - POSTGRES_PASSWORD=[Your RDS password]
# - TOGETHER_AI_API_KEY=[Your Together.AI key]
# - JWT_SECRET_KEY=[Generate: openssl rand -base64 64]
```

### Step 7: Install Dependencies and Start Services

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Install frontend dependencies
cd swipesavvy-admin-portal && npm install && cd ..
cd swipesavvy-wallet-web && npm install && cd ..

# Run database migrations
python3.11 -m alembic upgrade head

# Start services with PM2
cp /home/ec2-user/ecosystem.config.js .
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions

# Check status
pm2 status
pm2 logs
```

### Step 8: Access Your Application

```bash
# Get your EC2 public IP
echo [EC2_PUBLIC_IP]
```

**Access URLs:**
- **Backend API**: `http://[EC2_PUBLIC_IP]:8000`
- **API Docs**: `http://[EC2_PUBLIC_IP]:8000/docs`
- **Admin Portal**: `http://[EC2_PUBLIC_IP]:5173`
- **Wallet Portal**: `http://[EC2_PUBLIC_IP]:3001`

## Post-Deployment Steps

### 1. Configure Nginx (Optional - for production domains)

```bash
sudo nano /etc/nginx/conf.d/swipesavvy.conf
# See AWS_INFRASTRUCTURE_SETUP.md for configuration

sudo nginx -t
sudo systemctl reload nginx
```

### 2. Setup SSL with Let's Encrypt (Optional - requires domain)

```bash
sudo certbot --nginx -d api.yourdomain.com
sudo certbot --nginx -d admin.yourdomain.com
sudo certbot --nginx -d wallet.yourdomain.com
```

### 3. Setup Automated Backups

```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/ec2-user/backup-db.sh
```

### 4. Monitor Application

```bash
# Check health
~/health-check.sh

# View logs
pm2 logs

# Monitor resources
htop
```

## Useful Commands

```bash
# SSH to EC2
ssh -i ~/.ssh/swipesavvy-prod-key.pem ec2-user@[EC2_IP]

# Restart services
pm2 restart all

# View logs
pm2 logs swipesavvy-backend
pm2 logs swipesavvy-admin
pm2 logs swipesavvy-wallet

# Update code (from local machine)
rsync -avz -e "ssh -i ~/.ssh/swipesavvy-prod-key.pem" \
  --exclude 'node_modules' ./ ec2-user@[EC2_IP]:/var/www/swipesavvy/

# Database backup
/home/ec2-user/backup-db.sh

# Health check
/home/ec2-user/health-check.sh
```

## Troubleshooting

### Can't connect to EC2
```bash
# Check instance status
aws ec2 describe-instances --instance-ids [INSTANCE_ID]

# Check security group
aws ec2 describe-security-groups --group-ids [SG_ID]
```

### Can't connect to RDS from EC2
```bash
# Test connection
psql -h [RDS_ENDPOINT] -U swipesavvy_admin -d swipesavvy_db

# Check RDS security group allows EC2 security group on port 5432
```

### Services not starting
```bash
# Check logs
pm2 logs --lines 100

# Check environment variables
cat /var/www/swipesavvy/.env.production

# Check if ports are available
sudo netstat -tulpn | grep LISTEN
```

## Cost Estimate

**Production Setup (~$160-200/month):**
- EC2 t3.large: ~$60-70/month
- RDS db.t3.medium (100GB): ~$80-100/month
- Data transfer: ~$10-20/month
- CloudWatch: ~$10/month

**Development Setup (~$25-35/month):**
- EC2 t3.micro: ~$7-10/month
- RDS db.t3.micro (20GB): ~$15-20/month

## Next Steps

1. ✅ Configure your domain's DNS to point to EC2 Elastic IP
2. ✅ Setup SSL certificates with Let's Encrypt
3. ✅ Configure CloudWatch monitoring
4. ✅ Setup automated backups
5. ✅ Review security groups and IAM policies
6. ✅ Configure application monitoring (Sentry, DataDog)
7. ✅ Setup CI/CD pipeline for automated deployments

## Support

For detailed instructions, see:
- [AWS_INFRASTRUCTURE_SETUP.md](./AWS_INFRASTRUCTURE_SETUP.md) - Complete setup guide
- [.env.production.example](./.env.production.example) - Environment configuration
- AWS Documentation: https://docs.aws.amazon.com/

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- System logs: `sudo journalctl -xe`
