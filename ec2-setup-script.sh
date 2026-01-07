#!/bin/bash
# EC2 Instance Setup Script for SwipeSavvy
# Run this script on a fresh EC2 Amazon Linux 2023 instance

set -e

echo "========================================"
echo "  SwipeSavvy EC2 Setup Script"
echo "========================================"
echo ""

# Update system
echo "[1/12] Updating system packages..."
sudo yum update -y

# Install Node.js 18.x
echo "[2/12] Installing Node.js 18.x..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
node --version
npm --version

# Install Python 3.11
echo "[3/12] Installing Python 3.11..."
sudo yum install -y python3.11 python3.11-pip python3.11-devel
python3.11 --version

# Create symlink for pip
sudo ln -sf /usr/bin/pip3.11 /usr/local/bin/pip3
sudo ln -sf /usr/bin/python3.11 /usr/local/bin/python3

# Install PostgreSQL client
echo "[4/12] Installing PostgreSQL client..."
sudo yum install -y postgresql15
psql --version

# Install Redis
echo "[5/12] Installing and starting Redis..."
sudo yum install -y redis6
sudo systemctl start redis6
sudo systemctl enable redis6
redis-cli ping

# Install Nginx
echo "[6/12] Installing and starting Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
nginx -v

# Install Git
echo "[7/12] Installing Git..."
sudo yum install -y git
git --version

# Install development tools
echo "[8/12] Installing development tools..."
sudo yum groupinstall -y "Development Tools"
sudo yum install -y gcc gcc-c++ make

# Install PM2 for process management
echo "[9/12] Installing PM2..."
sudo npm install -g pm2
pm2 --version

# Install Certbot for SSL
echo "[10/12] Installing Certbot..."
sudo yum install -y certbot python3-certbot-nginx

# Create application directory
echo "[11/12] Creating application directories..."
sudo mkdir -p /var/www/swipesavvy
sudo chown -R ec2-user:ec2-user /var/www/swipesavvy

# Create log directory
sudo mkdir -p /var/log/swipesavvy
sudo chown -R ec2-user:ec2-user /var/log/swipesavvy

# Create backup directory
sudo mkdir -p /var/backups/postgres
sudo chown -R ec2-user:ec2-user /var/backups/postgres

# Install Python packages
echo "[12/12] Installing common Python packages..."
pip3 install --user --upgrade pip
pip3 install --user uvicorn fastapi psycopg2-binary redis alembic

# Configure PM2 startup
pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Create swap space (helps with builds on smaller instances)
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Optimize system for production
echo "Optimizing system settings..."
cat <<EOF | sudo tee -a /etc/sysctl.conf
# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1
net.ipv4.ip_local_port_range = 10000 65535

# File descriptor limits
fs.file-max = 2097152
EOF

sudo sysctl -p

# Set file descriptor limits
cat <<EOF | sudo tee -a /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
EOF

# Create basic Nginx configuration
sudo tee /etc/nginx/nginx.conf > /dev/null <<'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 4096;
    client_max_body_size 100M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Create placeholder Nginx site config
sudo tee /etc/nginx/conf.d/default.conf > /dev/null <<'EOF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        return 200 'SwipeSavvy Server - OK\n';
        add_header Content-Type text/plain;
    }

    location /health {
        return 200 'healthy\n';
        add_header Content-Type text/plain;
    }
}
EOF

sudo nginx -t
sudo systemctl reload nginx

# Create environment template
cat > /home/ec2-user/.env.example <<'EOF'
# Database Configuration (AWS RDS)
DATABASE_URL=postgresql://swipesavvy_admin:PASSWORD@RDS_ENDPOINT:5432/swipesavvy_db
POSTGRES_HOST=RDS_ENDPOINT
POSTGRES_PORT=5432
POSTGRES_DB=swipesavvy_db
POSTGRES_USER=swipesavvy_admin
POSTGRES_PASSWORD=PASSWORD

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_BASE_URL=http://localhost:8000
BACKEND_PORT=8000

# Together.AI Configuration
TOGETHER_AI_API_KEY=YOUR_API_KEY
TOGETHER_AI_BASE_URL=https://api.together.xyz/v1
TOGETHER_AI_MODEL=meta-llama/Llama-3.3-70b-instruct-turbo

# JWT Configuration
JWT_SECRET_KEY=GENERATE_STRONG_SECRET_KEY
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Configuration
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
EOF

# Create PM2 ecosystem template
cat > /home/ec2-user/ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'swipesavvy-backend',
      script: 'uvicorn',
      args: 'main:app --host 0.0.0.0 --port 8000 --workers 4',
      interpreter: 'python3.11',
      cwd: '/var/www/swipesavvy',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/swipesavvy/backend-error.log',
      out_file: '/var/log/swipesavvy/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      autorestart: true,
      watch: false
    },
    {
      name: 'swipesavvy-admin',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 5173',
      cwd: '/var/www/swipesavvy/swipesavvy-admin-portal',
      env: {
        PORT: 5173
      },
      error_file: '/var/log/swipesavvy/admin-error.log',
      out_file: '/var/log/swipesavvy/admin-out.log',
      max_memory_restart: '500M',
      autorestart: true
    },
    {
      name: 'swipesavvy-wallet',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3001',
      cwd: '/var/www/swipesavvy/swipesavvy-wallet-web',
      env: {
        PORT: 3001
      },
      error_file: '/var/log/swipesavvy/wallet-error.log',
      out_file: '/var/log/swipesavvy/wallet-out.log',
      max_memory_restart: '500M',
      autorestart: true
    }
  ]
};
EOF

# Create database backup script
cat > /home/ec2-user/backup-db.sh <<'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DAYS_TO_KEEP=7

# Load environment variables
if [ -f /var/www/swipesavvy/.env.production ]; then
    source /var/www/swipesavvy/.env.production
else
    echo "Error: .env.production not found"
    exit 1
fi

echo "Starting database backup at $TIMESTAMP..."

# Create backup
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
    -h $POSTGRES_HOST \
    -U $POSTGRES_USER \
    -d $POSTGRES_DB \
    -F c \
    -f $BACKUP_DIR/swipesavvy_backup_$TIMESTAMP.dump

if [ $? -eq 0 ]; then
    echo "Backup completed: $BACKUP_DIR/swipesavvy_backup_$TIMESTAMP.dump"

    # Compress backup
    gzip $BACKUP_DIR/swipesavvy_backup_$TIMESTAMP.dump

    # Delete old backups
    find $BACKUP_DIR -name "*.dump.gz" -mtime +$DAYS_TO_KEEP -delete
    echo "Old backups cleaned up (kept last $DAYS_TO_KEEP days)"
else
    echo "Backup failed!"
    exit 1
fi
EOF

chmod +x /home/ec2-user/backup-db.sh

# Create health check script
cat > /home/ec2-user/health-check.sh <<'EOF'
#!/bin/bash
# Health check script

echo "=== SwipeSavvy Health Check ==="
echo ""

# Check backend API
echo -n "Backend API: "
if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
    echo "✓ OK"
else
    echo "✗ FAILED"
fi

# Check admin portal
echo -n "Admin Portal: "
if curl -sf http://localhost:5173 > /dev/null 2>&1; then
    echo "✓ OK"
else
    echo "✗ FAILED"
fi

# Check wallet portal
echo -n "Wallet Portal: "
if curl -sf http://localhost:3001 > /dev/null 2>&1; then
    echo "✓ OK"
else
    echo "✗ FAILED"
fi

# Check Redis
echo -n "Redis: "
if redis-cli ping > /dev/null 2>&1; then
    echo "✓ OK"
else
    echo "✗ FAILED"
fi

# Check PostgreSQL connection (if RDS endpoint is configured)
if [ ! -z "$POSTGRES_HOST" ]; then
    echo -n "PostgreSQL: "
    if PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✓ OK"
    else
        echo "✗ FAILED"
    fi
fi

# Check disk space
echo ""
echo "Disk Usage:"
df -h / | tail -1

# Check memory
echo ""
echo "Memory Usage:"
free -h | grep Mem

# Check PM2 processes
echo ""
echo "PM2 Processes:"
pm2 list
EOF

chmod +x /home/ec2-user/health-check.sh

# Create quick start guide
cat > /home/ec2-user/QUICK_START.txt <<'EOF'
SwipeSavvy EC2 Quick Start Guide
=================================

1. Deploy Application Code:
   - Clone repo: git clone https://github.com/SwipeSavdev/swipe-savvy-rewards.git /var/www/swipesavvy
   - Or use rsync from local machine

2. Configure Environment:
   - Copy: cp .env.example /var/www/swipesavvy/.env.production
   - Edit: nano /var/www/swipesavvy/.env.production
   - Update DATABASE_URL with RDS endpoint
   - Update TOGETHER_AI_API_KEY
   - Update JWT_SECRET_KEY

3. Install Dependencies:
   cd /var/www/swipesavvy
   pip3 install -r requirements.txt

   cd swipesavvy-admin-portal
   npm install && npm run build

   cd ../swipesavvy-wallet-web
   npm install && npm run build

4. Run Database Migrations:
   cd /var/www/swipesavvy
   python3.11 -m alembic upgrade head

5. Start Services:
   cp /home/ec2-user/ecosystem.config.js /var/www/swipesavvy/
   cd /var/www/swipesavvy
   pm2 start ecosystem.config.js
   pm2 save

6. Configure Nginx:
   sudo nano /etc/nginx/conf.d/swipesavvy.conf
   (See AWS_INFRASTRUCTURE_SETUP.md for config)
   sudo nginx -t
   sudo systemctl reload nginx

7. Setup SSL (if using domain):
   sudo certbot --nginx -d yourdomain.com

8. Health Check:
   ~/health-check.sh

9. Setup Automated Backups:
   crontab -e
   Add: 0 2 * * * /home/ec2-user/backup-db.sh

Common Commands:
- View logs: pm2 logs
- Restart services: pm2 restart all
- Check status: pm2 status
- Health check: ~/health-check.sh
- Backup database: ~/backup-db.sh

For detailed instructions, see:
/var/www/swipesavvy/AWS_INFRASTRUCTURE_SETUP.md
EOF

echo ""
echo "========================================"
echo "  EC2 Setup Complete!"
echo "========================================"
echo ""
echo "System Information:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Python: $(python3.11 --version)"
echo "  - PostgreSQL client: $(psql --version | head -1)"
echo "  - Redis: $(redis-cli --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
echo "  - PM2: $(pm2 --version)"
echo ""
echo "Next Steps:"
echo "  1. Read: cat /home/ec2-user/QUICK_START.txt"
echo "  2. Deploy your application code"
echo "  3. Configure environment variables"
echo "  4. Start services with PM2"
echo ""
echo "Useful files created:"
echo "  - ~/ecosystem.config.js (PM2 config)"
echo "  - ~/backup-db.sh (Database backup script)"
echo "  - ~/health-check.sh (Health check script)"
echo "  - ~/.env.example (Environment template)"
echo "  - ~/QUICK_START.txt (Quick start guide)"
echo ""
