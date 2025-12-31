#!/bin/bash
# SSL Certificate Setup Script using Let's Encrypt
# Usage: sudo ./scripts/setup-ssl.sh api.swipesavvy.com monitoring.swipesavvy.com

set -e

echo "========================================="
echo "SSL Certificate Setup - Let's Encrypt"
echo "========================================="

# Check if domains provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 domain1.com domain2.com ..."
    exit 1
fi

DOMAINS=("$@")
EMAIL="admin@swipesavvy.com"  # Change this to your email
NGINX_DIR="./nginx"
SSL_DIR="$NGINX_DIR/ssl"
WEBROOT="/var/www/certbot"

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Create directories
mkdir -p "$SSL_DIR"
mkdir -p "$WEBROOT"

# Build domain arguments for certbot
DOMAIN_ARGS=""
for domain in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
done

echo "Requesting SSL certificate for: ${DOMAINS[*]}"

# Request certificate
certbot certonly \
    --webroot \
    --webroot-path="$WEBROOT" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    $DOMAIN_ARGS

# Copy certificates to nginx directory
CERT_PATH="/etc/letsencrypt/live/${DOMAINS[0]}"
cp "$CERT_PATH/fullchain.pem" "$SSL_DIR/"
cp "$CERT_PATH/privkey.pem" "$SSL_DIR/"

echo "✓ SSL certificates installed"
echo "✓ Certificates location: $SSL_DIR"

# Set up auto-renewal
echo "Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/${DOMAINS[0]}/fullchain.pem $SSL_DIR/ && cp /etc/letsencrypt/live/${DOMAINS[0]}/privkey.pem $SSL_DIR/ && docker-compose -f /opt/swipesavvy-ai-agents/docker-compose.prod.yml restart nginx") | crontab -

echo "✓ Auto-renewal configured (daily at 3 AM)"
echo ""
echo "Certificates valid for 90 days. Auto-renewal will run daily."
echo "To manually renew: sudo certbot renew"
