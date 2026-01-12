# ALB Module for SwipeSavvy
# Application Load Balancer with HTTPS, health checks, and logging
# Supports host-based routing for all swipesavvy.com subdomains

variable "name_prefix" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "certificate_arn" {
  type = string
}

variable "health_check_path" {
  type    = string
  default = "/health"
}

variable "domain_name" {
  description = "Root domain name for host-based routing"
  type        = string
  default     = "swipesavvy.com"
}

variable "tags" {
  type    = map(string)
  default = {}
}

# S3 bucket for ALB access logs
resource "aws_s3_bucket" "alb_logs" {
  bucket = "${var.name_prefix}-alb-logs"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-alb-logs"
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  rule {
    id     = "expire-old-logs"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      days = 90
    }

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
  }
}

resource "aws_s3_bucket_policy" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::127311923021:root" # ELB account for us-east-1
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.alb_logs.arn}/*"
      }
    ]
  })
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids

  enable_deletion_protection = true
  enable_http2              = true
  idle_timeout              = 60

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb"
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-alb"
  })
}

# Target Group for API (FastAPI on port 8000)
resource "aws_lb_target_group" "api" {
  name     = "${var.name_prefix}-api-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = var.health_check_path
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400 # 1 day
    enabled         = true
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-api-tg"
  })
}

# Target Group for Admin Portal (Vite on port 5173)
resource "aws_lb_target_group" "admin" {
  name     = "${var.name_prefix}-admin-tg"
  port     = 5173
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-admin-tg"
  })
}

# Target Group for Wallet Web (Vite on port 3001)
resource "aws_lb_target_group" "wallet" {
  name     = "${var.name_prefix}-wallet-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-wallet-tg"
  })
}

# Target Group for Customer Website (port 8080)
resource "aws_lb_target_group" "website" {
  name     = "${var.name_prefix}-website-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-website-tg"
  })
}

# Target Group for Mobile App PWA (static files served on port 3000)
resource "aws_lb_target_group" "app" {
  name     = "${var.name_prefix}-app-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-app-tg"
  })
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  tags = var.tags
}

# HTTP Listener (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  tags = var.tags
}

# Listener rule for API (api.swipesavvy.com)
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    host_header {
      values = ["api.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Listener rule for Admin Portal (admin.swipesavvy.com)
resource "aws_lb_listener_rule" "admin" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }

  condition {
    host_header {
      values = ["admin.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Listener rule for Wallet Web (wallet.swipesavvy.com)
resource "aws_lb_listener_rule" "wallet" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.wallet.arn
  }

  condition {
    host_header {
      values = ["wallet.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Listener rule for Mobile App PWA (app.swipesavvy.com)
resource "aws_lb_listener_rule" "app" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 400

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    host_header {
      values = ["app.${var.domain_name}"]
    }
  }

  tags = var.tags
}

# Listener rule for Main Website (www.swipesavvy.com and swipesavvy.com)
resource "aws_lb_listener_rule" "website" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 500

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.website.arn
  }

  condition {
    host_header {
      values = ["www.${var.domain_name}", var.domain_name]
    }
  }

  tags = var.tags
}

# Outputs
output "dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "zone_id" {
  description = "ALB hosted zone ID"
  value       = aws_lb.main.zone_id
}

output "arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "arn_suffix" {
  description = "ALB ARN suffix for CloudWatch metrics"
  value       = aws_lb.main.arn_suffix
}

output "target_group_arns" {
  description = "All target group ARNs for ASG attachment"
  value = [
    aws_lb_target_group.api.arn,
    aws_lb_target_group.admin.arn,
    aws_lb_target_group.wallet.arn,
    aws_lb_target_group.website.arn,
    aws_lb_target_group.app.arn,
  ]
}

output "api_target_group_arn" {
  description = "API target group ARN"
  value       = aws_lb_target_group.api.arn
}

output "admin_target_group_arn" {
  description = "Admin Portal target group ARN"
  value       = aws_lb_target_group.admin.arn
}

output "wallet_target_group_arn" {
  description = "Wallet Web target group ARN"
  value       = aws_lb_target_group.wallet.arn
}

output "website_target_group_arn" {
  description = "Customer Website target group ARN"
  value       = aws_lb_target_group.website.arn
}

output "app_target_group_arn" {
  description = "Mobile App PWA target group ARN"
  value       = aws_lb_target_group.app.arn
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}
