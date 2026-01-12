# SwipeSavvy Domain and DNS Configuration Guide

This document outlines the complete DNS setup and domain alias configuration for all SwipeSavvy frontend applications.

## Domain Structure

| Subdomain | Purpose | Port | Service |
|-----------|---------|------|---------|
| `www.swipesavvy.com` | Main marketing website | 8080 | Customer Website |
| `api.swipesavvy.com` | Backend API Gateway | 8000 | FastAPI Backend |
| `admin.swipesavvy.com` | Admin Portal | 5173 | Vite React App |
| `wallet.swipesavvy.com` | Wallet Web App | 3001 | Vite React App |
| `app.swipesavvy.com` | Mobile PWA | - | Static/Expo Web |

## Current AWS Infrastructure

- **ALB DNS**: `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com`
- **EC2 Public IP**: `54.224.8.14`
- **Region**: `us-east-1`

---

## DNS Configuration (Route 53)

### Step 1: Create Hosted Zone

```bash
aws route53 create-hosted-zone \
  --name swipesavvy.com \
  --caller-reference "swipesavvy-$(date +%s)"
```

### Step 2: Configure DNS Records

Add these records to your Route 53 hosted zone:

#### A Records (Alias to ALB)

| Name | Type | Alias Target |
|------|------|--------------|
| `swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |
| `www.swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |
| `api.swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |
| `admin.swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |
| `wallet.swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |
| `app.swipesavvy.com` | A | `swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com` |

#### Terraform Configuration

```hcl
# DNS Records for swipesavvy.com
resource "aws_route53_zone" "main" {
  name = "swipesavvy.com"
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "admin" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "admin.swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wallet" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "wallet.swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.swipesavvy.com"
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}
```

---

## SSL/TLS Certificate Setup

### Option 1: AWS Certificate Manager (Recommended)

```bash
# Request certificate with all subdomains
aws acm request-certificate \
  --domain-name swipesavvy.com \
  --subject-alternative-names \
    "*.swipesavvy.com" \
    "www.swipesavvy.com" \
    "api.swipesavvy.com" \
    "admin.swipesavvy.com" \
    "wallet.swipesavvy.com" \
    "app.swipesavvy.com" \
  --validation-method DNS \
  --region us-east-1
```

### Option 2: Let's Encrypt (For Nginx)

```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Generate certificate for all domains
sudo certbot certonly --nginx \
  -d swipesavvy.com \
  -d www.swipesavvy.com \
  -d api.swipesavvy.com \
  -d admin.swipesavvy.com \
  -d wallet.swipesavvy.com \
  -d app.swipesavvy.com

# Auto-renewal cron job
echo "0 0,12 * * * root certbot renew --quiet" | sudo tee /etc/cron.d/certbot-renew
```

---

## ALB Listener Rules

Update ALB to route traffic based on hostname:

```hcl
# ALB HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.website.arn
  }
}

# API routing rule
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    host_header {
      values = ["api.swipesavvy.com"]
    }
  }
}

# Admin Portal routing rule
resource "aws_lb_listener_rule" "admin" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    host_header {
      values = ["admin.swipesavvy.com"]
    }
  }
}

# Wallet Web routing rule
resource "aws_lb_listener_rule" "wallet" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wallet.arn
  }

  condition {
    host_header {
      values = ["wallet.swipesavvy.com"]
    }
  }
}

# Mobile App PWA routing rule
resource "aws_lb_listener_rule" "app" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    host_header {
      values = ["app.swipesavvy.com"]
    }
  }
}
```

---

## Environment Configuration Files

### Mobile App (.env.production)
```env
EXPO_PUBLIC_API_URL=https://api.swipesavvy.com
EXPO_PUBLIC_WS_URL=wss://api.swipesavvy.com/ws
```

### Admin Portal (.env.production)
```env
VITE_API_BASE_URL=https://api.swipesavvy.com
VITE_WS_URL=wss://api.swipesavvy.com/ws
```

### Wallet Web (.env.production)
```env
VITE_API_BASE_URL=https://api.swipesavvy.com
VITE_WS_URL=wss://api.swipesavvy.com/ws
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Purchase/transfer domain `swipesavvy.com`
- [ ] Create Route 53 hosted zone
- [ ] Update domain registrar nameservers to Route 53
- [ ] Request ACM wildcard certificate
- [ ] Validate ACM certificate via DNS

### DNS Setup
- [ ] Create A record for root domain
- [ ] Create A records for all subdomains
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify DNS with `dig` or `nslookup`

### SSL Configuration
- [ ] Attach ACM certificate to ALB HTTPS listener
- [ ] Configure ALB listener rules for each subdomain
- [ ] Test HTTPS connectivity for each subdomain

### Application Configuration
- [ ] Deploy with production environment files
- [ ] Update CORS settings in backend
- [ ] Test API connectivity from each frontend
- [ ] Verify WebSocket connections work

### Post-Deployment Verification
- [ ] `https://www.swipesavvy.com` loads marketing site
- [ ] `https://api.swipesavvy.com/health` returns healthy
- [ ] `https://admin.swipesavvy.com` loads admin portal
- [ ] `https://wallet.swipesavvy.com` loads wallet app
- [ ] `https://app.swipesavvy.com` loads mobile PWA
- [ ] All forms and API calls work correctly
- [ ] SSL certificate shows valid in browser

---

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
dig swipesavvy.com
dig api.swipesavvy.com

# Check nameservers
dig NS swipesavvy.com
```

### SSL Certificate Issues
```bash
# Test SSL
openssl s_client -connect api.swipesavvy.com:443 -servername api.swipesavvy.com

# Check certificate details
echo | openssl s_client -connect api.swipesavvy.com:443 2>/dev/null | openssl x509 -noout -dates
```

### CORS Errors
- Verify `CORS_ORIGINS` in backend config includes the requesting domain
- Check nginx `add_header Access-Control-Allow-Origin` directives
- Ensure preflight OPTIONS requests are handled

### WebSocket Connection Failed
- Verify `wss://` protocol is used (not `ws://`)
- Check ALB WebSocket idle timeout (default 60s, increase if needed)
- Verify backend WebSocket endpoint is correct

---

## Quick Reference

| Service | Production URL | Health Check |
|---------|----------------|--------------|
| API | https://api.swipesavvy.com | `/health` |
| Admin | https://admin.swipesavvy.com | - |
| Wallet | https://wallet.swipesavvy.com | - |
| App | https://app.swipesavvy.com | - |
| Website | https://www.swipesavvy.com | - |
