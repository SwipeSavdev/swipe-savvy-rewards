#!/bin/bash
# SwipeSavvy AWS Deployment Script
# This script automates the deployment of SwipeSavvy to AWS EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="SwipeSavvy"
AWS_REGION="us-east-1"
EC2_KEY_NAME="swipesavvy-prod-key"
INSTANCE_TYPE="t3.large"
DEPLOYMENT_DIR="/var/www/swipesavvy"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}  SwipeSavvy AWS Deployment Script  ${NC}"
echo -e "${GREEN}=====================================${NC}\n"

# Function to print step messages
print_step() {
    echo -e "\n${YELLOW}[STEP]${NC} $1\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first:"
    echo "  brew install awscli"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not configured. Please run: aws configure"
    exit 1
fi

print_success "AWS CLI is configured"

# Prompt for deployment type
echo -e "${YELLOW}Select deployment type:${NC}"
echo "  1) Full deployment (create RDS + EC2 + deploy code)"
echo "  2) Deploy code only (update existing EC2)"
echo "  3) Create infrastructure only (RDS + EC2)"
read -p "Enter choice [1-3]: " DEPLOY_TYPE

# Get EC2 instance details if updating existing
if [ "$DEPLOY_TYPE" == "2" ]; then
    read -p "Enter EC2 instance ID or public IP: " EC2_TARGET

    if [[ $EC2_TARGET == i-* ]]; then
        EC2_IP=$(aws ec2 describe-instances \
            --instance-ids $EC2_TARGET \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text)
    else
        EC2_IP=$EC2_TARGET
    fi

    print_step "Deploying to EC2: $EC2_IP"

    # Build frontend applications
    print_step "Building frontend applications..."

    cd swipesavvy-admin-portal
    npm install
    npm run build
    print_success "Admin portal built"

    cd ../swipesavvy-wallet-web
    npm install
    npm run build
    print_success "Wallet portal built"

    cd ..

    # Deploy via rsync
    print_step "Deploying files to EC2..."

    rsync -avz --progress \
        -e "ssh -i ~/.ssh/${EC2_KEY_NAME}.pem -o StrictHostKeyChecking=no" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '__pycache__' \
        --exclude '.env' \
        --exclude '*.pyc' \
        ./ ec2-user@$EC2_IP:$DEPLOYMENT_DIR/

    print_success "Files deployed"

    # Restart services on EC2
    print_step "Restarting services..."

    ssh -i ~/.ssh/${EC2_KEY_NAME}.pem ec2-user@$EC2_IP << 'ENDSSH'
        cd /var/www/swipesavvy

        # Install/update Python dependencies
        python3.11 -m pip install -r requirements.txt

        # Install/update Node dependencies and rebuild
        cd swipesavvy-admin-portal
        npm install

        cd ../swipesavvy-wallet-web
        npm install

        # Restart all services
        pm2 restart all

        # Show status
        pm2 status
ENDSSH

    print_success "Services restarted successfully"

    echo -e "\n${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Deployment Complete!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo -e "Access your applications at:"
    echo -e "  Admin Portal: http://$EC2_IP:5173"
    echo -e "  Wallet Portal: http://$EC2_IP:3001"
    echo -e "  Backend API: http://$EC2_IP:8000"
    echo -e "  API Docs: http://$EC2_IP:8000/docs"

    exit 0
fi

# Full deployment or infrastructure only
if [ "$DEPLOY_TYPE" == "1" ] || [ "$DEPLOY_TYPE" == "3" ]; then

    print_step "Creating infrastructure..."

    # Get VPC ID
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --query 'Vpcs[0].VpcId' \
        --output text \
        --region $AWS_REGION)

    if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
        print_error "No default VPC found. Please create one first."
        exit 1
    fi

    print_success "Using VPC: $VPC_ID"

    # Create RDS Security Group
    print_step "Creating RDS security group..."

    RDS_SG_ID=$(aws ec2 create-security-group \
        --group-name swipesavvy-rds-sg \
        --description "Security group for SwipeSavvy RDS PostgreSQL" \
        --vpc-id $VPC_ID \
        --query 'GroupId' \
        --output text \
        --region $AWS_REGION 2>/dev/null || \
        aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=swipesavvy-rds-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

    print_success "RDS Security Group: $RDS_SG_ID"

    # Create EC2 Security Group
    print_step "Creating EC2 security group..."

    EC2_SG_ID=$(aws ec2 create-security-group \
        --group-name swipesavvy-ec2-sg \
        --description "Security group for SwipeSavvy EC2 instances" \
        --vpc-id $VPC_ID \
        --query 'GroupId' \
        --output text \
        --region $AWS_REGION 2>/dev/null || \
        aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=swipesavvy-ec2-sg" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

    print_success "EC2 Security Group: $EC2_SG_ID"

    # Configure EC2 security group rules
    print_step "Configuring EC2 security group rules..."

    # SSH
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 22 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    # HTTP
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 80 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    # HTTPS
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 443 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    # Backend API
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 8000 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    # Admin Portal
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 5173-5176 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    # Wallet Portal
    aws ec2 authorize-security-group-ingress \
        --group-id $EC2_SG_ID \
        --protocol tcp --port 3001 --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || true

    print_success "EC2 security rules configured"

    # Configure RDS security group
    print_step "Configuring RDS security group rules..."

    aws ec2 authorize-security-group-ingress \
        --group-id $RDS_SG_ID \
        --protocol tcp --port 5432 \
        --source-group $EC2_SG_ID \
        --region $AWS_REGION 2>/dev/null || true

    print_success "RDS security rules configured"

    # Create RDS database
    read -p "Do you want to create RDS PostgreSQL database? (y/n): " CREATE_RDS

    if [ "$CREATE_RDS" == "y" ]; then
        print_step "Creating RDS PostgreSQL database..."

        read -p "Enter RDS master password (min 8 chars): " -s RDS_PASSWORD
        echo

        RDS_IDENTIFIER="swipesavvy-postgres-prod"

        aws rds create-db-instance \
            --db-instance-identifier $RDS_IDENTIFIER \
            --db-instance-class db.t3.medium \
            --engine postgres \
            --engine-version 14.10 \
            --master-username swipesavvy_admin \
            --master-user-password "$RDS_PASSWORD" \
            --allocated-storage 100 \
            --storage-type gp3 \
            --storage-encrypted \
            --vpc-security-group-ids $RDS_SG_ID \
            --db-name swipesavvy_db \
            --backup-retention-period 7 \
            --no-publicly-accessible \
            --region $AWS_REGION 2>/dev/null || print_error "RDS instance may already exist"

        print_success "RDS creation initiated (this takes 5-10 minutes)"

        # Wait for RDS to be available
        print_step "Waiting for RDS to become available..."
        aws rds wait db-instance-available \
            --db-instance-identifier $RDS_IDENTIFIER \
            --region $AWS_REGION

        # Get RDS endpoint
        RDS_ENDPOINT=$(aws rds describe-db-instances \
            --db-instance-identifier $RDS_IDENTIFIER \
            --query 'DBInstances[0].Endpoint.Address' \
            --output text \
            --region $AWS_REGION)

        print_success "RDS endpoint: $RDS_ENDPOINT"

        # Save RDS credentials
        cat > rds-credentials.txt << EOF
RDS Configuration:
==================
RDS Endpoint: $RDS_ENDPOINT
Database Name: swipesavvy_db
Username: swipesavvy_admin
Password: $RDS_PASSWORD
Port: 5432

Connection String:
postgresql://swipesavvy_admin:$RDS_PASSWORD@$RDS_ENDPOINT:5432/swipesavvy_db
EOF
        print_success "RDS credentials saved to rds-credentials.txt"
    fi

    # Create EC2 key pair if it doesn't exist
    if [ ! -f ~/.ssh/${EC2_KEY_NAME}.pem ]; then
        print_step "Creating EC2 key pair..."

        aws ec2 create-key-pair \
            --key-name $EC2_KEY_NAME \
            --query 'KeyMaterial' \
            --output text \
            --region $AWS_REGION > ~/.ssh/${EC2_KEY_NAME}.pem

        chmod 400 ~/.ssh/${EC2_KEY_NAME}.pem
        print_success "Key pair created: ~/.ssh/${EC2_KEY_NAME}.pem"
    fi

    # Launch EC2 instance
    read -p "Do you want to launch EC2 instance? (y/n): " LAUNCH_EC2

    if [ "$LAUNCH_EC2" == "y" ]; then
        print_step "Launching EC2 instance..."

        # Get latest Amazon Linux 2023 AMI
        AMI_ID=$(aws ec2 describe-images \
            --owners amazon \
            --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" \
            --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
            --output text \
            --region $AWS_REGION)

        print_success "Using AMI: $AMI_ID"

        INSTANCE_ID=$(aws ec2 run-instances \
            --image-id $AMI_ID \
            --instance-type $INSTANCE_TYPE \
            --key-name $EC2_KEY_NAME \
            --security-group-ids $EC2_SG_ID \
            --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=SwipeSavvy-Production-Server},{Key=Environment,Value=Production}]" \
            --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":50,"VolumeType":"gp3","Encrypted":true}}]' \
            --query 'Instances[0].InstanceId' \
            --output text \
            --region $AWS_REGION)

        print_success "EC2 instance launched: $INSTANCE_ID"

        # Wait for instance to be running
        print_step "Waiting for EC2 instance to start..."
        aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $AWS_REGION

        # Get public IP
        EC2_IP=$(aws ec2 describe-instances \
            --instance-ids $INSTANCE_ID \
            --query 'Reservations[0].Instances[0].PublicIpAddress' \
            --output text \
            --region $AWS_REGION)

        print_success "EC2 instance running at: $EC2_IP"

        # Save EC2 details
        cat > ec2-details.txt << EOF
EC2 Configuration:
==================
Instance ID: $INSTANCE_ID
Public IP: $EC2_IP
Instance Type: $INSTANCE_TYPE
Key Pair: ~/.ssh/${EC2_KEY_NAME}.pem

SSH Command:
ssh -i ~/.ssh/${EC2_KEY_NAME}.pem ec2-user@$EC2_IP
EOF
        print_success "EC2 details saved to ec2-details.txt"

        # Wait for SSH to be ready
        print_step "Waiting for SSH to become available (this may take a minute)..."
        sleep 30

        MAX_RETRIES=10
        RETRY_COUNT=0
        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            if ssh -i ~/.ssh/${EC2_KEY_NAME}.pem -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@$EC2_IP "echo SSH Ready" &>/dev/null; then
                print_success "SSH connection established"
                break
            fi
            RETRY_COUNT=$((RETRY_COUNT+1))
            echo "Retry $RETRY_COUNT/$MAX_RETRIES..."
            sleep 10
        done

        if [ "$DEPLOY_TYPE" == "1" ]; then
            # Full deployment - setup EC2 and deploy code
            print_step "Setting up EC2 instance..."

            # Transfer setup script
            scp -i ~/.ssh/${EC2_KEY_NAME}.pem -o StrictHostKeyChecking=no \
                ec2-setup-script.sh ec2-user@$EC2_IP:/home/ec2-user/

            # Run setup script
            ssh -i ~/.ssh/${EC2_KEY_NAME}.pem ec2-user@$EC2_IP "chmod +x /home/ec2-user/ec2-setup-script.sh && /home/ec2-user/ec2-setup-script.sh"

            print_success "EC2 setup complete"

            # Deploy code
            print_step "Deploying application code..."

            # Build frontend
            cd swipesavvy-admin-portal && npm install && npm run build && cd ..
            cd swipesavvy-wallet-web && npm install && npm run build && cd ..

            # Transfer files
            rsync -avz --progress \
                -e "ssh -i ~/.ssh/${EC2_KEY_NAME}.pem -o StrictHostKeyChecking=no" \
                --exclude 'node_modules' \
                --exclude '.git' \
                --exclude '__pycache__' \
                ./ ec2-user@$EC2_IP:$DEPLOYMENT_DIR/

            print_success "Code deployed"
        fi
    fi

    echo -e "\n${GREEN}=====================================${NC}"
    echo -e "${GREEN}  Infrastructure Setup Complete!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo -e "\nNext steps:"
    echo -e "1. SSH into EC2: ssh -i ~/.ssh/${EC2_KEY_NAME}.pem ec2-user@$EC2_IP"
    echo -e "2. Review and edit .env.production with RDS credentials"
    echo -e "3. Run database migrations"
    echo -e "4. Start services with PM2"
    echo -e "5. Configure Nginx and SSL certificates"
    echo -e "\nSee AWS_INFRASTRUCTURE_SETUP.md for detailed instructions"
fi
