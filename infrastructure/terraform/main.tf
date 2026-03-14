# SwipeSavvy Infrastructure - Terraform Configuration
# Designed for 99.9% uptime with Multi-AZ deployment
#
# Architecture:
# - VPC with public/private subnets across 2 AZs
# - Application Load Balancer (public)
# - Auto Scaling Group with min 2 instances (private)
# - RDS PostgreSQL Multi-AZ (private)
# - ElastiCache Redis (private)
# - CloudWatch alarms and monitoring

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state backend is configured in backend.tf
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "SwipeSavvy"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  name_prefix = "swipesavvy-${var.environment}"
  azs         = slice(data.aws_availability_zones.available.names, 0, 2)

  common_tags = {
    Project     = "SwipeSavvy"
    Environment = var.environment
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name_prefix         = local.name_prefix
  vpc_cidr            = var.vpc_cidr
  availability_zones  = local.azs
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  tags = local.common_tags
}

# Security Groups
resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP from anywhere (redirect to HTTPS)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "To app instances on API port"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description     = "To app instances on admin portal port"
    from_port       = 5173
    to_port         = 5173
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-alb-sg"
  })
}

resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app-sg"
  description = "Security group for application instances"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "HTTP from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Admin portal from ALB"
    from_port       = 5173
    to_port         = 5173
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # SSH access removed — use SSM Session Manager for shell access

  egress {
    description = "HTTPS to AWS APIs and external services"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description     = "PostgreSQL to RDS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds.id]
  }

  egress {
    description     = "Redis to ElastiCache"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.redis.id]
  }

  egress {
    description = "DNS resolution"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app-sg"
  })
}

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from app instances"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # RDS does not require outbound internet access — no egress rules

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-sg"
  })
}

resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "Redis from app instances"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # ElastiCache does not require outbound internet access — no egress rules

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-sg"
  })
}

# RDS PostgreSQL Multi-AZ
module "rds" {
  source = "./modules/rds"

  name_prefix          = local.name_prefix
  vpc_id               = module.vpc.vpc_id
  subnet_ids           = module.vpc.private_subnet_ids
  security_group_ids   = [aws_security_group.rds.id]

  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = var.db_password
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  multi_az             = var.environment == "prod" ? true : false

  backup_retention_period = var.environment == "prod" ? 7 : 1

  tags = local.common_tags
}

# ElastiCache Redis
module "elasticache" {
  source = "./modules/elasticache"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [aws_security_group.redis.id]

  node_type          = var.redis_node_type
  num_cache_nodes    = var.environment == "prod" ? 2 : 1

  tags = local.common_tags
}

# Route 53 Hosted Zone (created first if needed)
resource "aws_route53_zone" "main" {
  count = var.domain_name != "" && var.create_hosted_zone ? 1 : 0

  name    = var.domain_name
  comment = "SwipeSavvy production hosted zone"

  tags = merge(local.common_tags, {
    Name = var.domain_name
  })
}

locals {
  # Resolve hosted zone ID
  route53_zone_id = var.domain_name != "" ? (
    var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : var.existing_zone_id
  ) : ""
}

# ACM Certificate (if creating new)
module "acm" {
  source = "./modules/acm"
  count  = var.domain_name != "" && var.create_acm_certificate ? 1 : 0

  domain_name = var.domain_name
  zone_id     = local.route53_zone_id

  tags = local.common_tags
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.public_subnet_ids
  security_group_ids = [aws_security_group.alb.id]

  # Use either created certificate or provided ARN
  certificate_arn = var.create_acm_certificate && var.domain_name != "" ? module.acm[0].certificate_arn : var.acm_certificate_arn
  domain_name     = var.domain_name

  health_check_path = "/health"

  tags = local.common_tags
}

# AWS WAF (PCI DSS 6.4.2)
module "waf" {
  source = "./modules/waf"

  name_prefix = local.name_prefix
  alb_arn     = module.alb.arn
  rate_limit  = 2000  # 2000 requests per 5-minute window per IP

  tags = local.common_tags
}

# Route 53 DNS Records (created after ALB)
module "dns" {
  source = "./modules/dns"
  count  = var.domain_name != "" ? 1 : 0

  domain_name        = var.domain_name
  alb_dns_name       = module.alb.dns_name
  alb_zone_id        = module.alb.zone_id
  create_hosted_zone = false  # Zone already created above
  existing_zone_id   = local.route53_zone_id

  tags = local.common_tags
}

# AWS Secrets Manager — secrets referenced by EC2 instances at runtime
resource "aws_secretsmanager_secret" "database_url" {
  name        = "${local.name_prefix}/database-url"
  description = "PostgreSQL connection string"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = module.rds.connection_string
}

resource "aws_secretsmanager_secret" "redis_url" {
  name        = "${local.name_prefix}/redis-url"
  description = "Redis connection string"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = module.elasticache.connection_string
}

resource "aws_secretsmanager_secret" "together_api_key" {
  name        = "${local.name_prefix}/together-api-key"
  description = "Together.AI API key"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "together_api_key" {
  secret_id     = aws_secretsmanager_secret.together_api_key.id
  secret_string = var.together_api_key
}

resource "aws_secretsmanager_secret" "sendgrid_api_key" {
  name        = "${local.name_prefix}/sendgrid-api-key"
  description = "SendGrid API key"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "sendgrid_api_key" {
  secret_id     = aws_secretsmanager_secret.sendgrid_api_key.id
  secret_string = var.sendgrid_api_key
}

resource "aws_secretsmanager_secret" "twilio_account_sid" {
  name        = "${local.name_prefix}/twilio-account-sid"
  description = "Twilio Account SID"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "twilio_account_sid" {
  secret_id     = aws_secretsmanager_secret.twilio_account_sid.id
  secret_string = var.twilio_account_sid
}

resource "aws_secretsmanager_secret" "twilio_auth_token" {
  name        = "${local.name_prefix}/twilio-auth-token"
  description = "Twilio Auth Token"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "twilio_auth_token" {
  secret_id     = aws_secretsmanager_secret.twilio_auth_token.id
  secret_string = var.twilio_auth_token
}

# EC2 Auto Scaling Group
module "ec2" {
  source = "./modules/ec2"

  name_prefix        = local.name_prefix
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  security_group_ids = [aws_security_group.app.id]

  target_group_arns  = module.alb.target_group_arns

  instance_type      = var.ec2_instance_type
  min_size           = var.environment == "prod" ? 2 : 1
  max_size           = var.environment == "prod" ? 4 : 2
  desired_capacity   = var.environment == "prod" ? 2 : 1

  key_name           = var.ec2_key_name

  # Non-secret environment variables for application
  environment_variables = {
    ENVIRONMENT = var.environment
  }

  # Secret ARNs — the application retrieves these at runtime via AWS Secrets Manager SDK
  secrets_manager_arns = {
    DATABASE_URL       = aws_secretsmanager_secret.database_url.arn
    REDIS_URL          = aws_secretsmanager_secret.redis_url.arn
    TOGETHER_API_KEY   = aws_secretsmanager_secret.together_api_key.arn
    SENDGRID_API_KEY   = aws_secretsmanager_secret.sendgrid_api_key.arn
    TWILIO_ACCOUNT_SID = aws_secretsmanager_secret.twilio_account_sid.arn
    TWILIO_AUTH_TOKEN  = aws_secretsmanager_secret.twilio_auth_token.arn
  }

  tags = local.common_tags
}

# CloudWatch Alarms for 99.9% uptime monitoring
resource "aws_cloudwatch_metric_alarm" "alb_5xx_errors" {
  alarm_name          = "${local.name_prefix}-alb-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "ALB 5XX errors exceeded threshold"

  dimensions = {
    LoadBalancer = module.alb.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_target_response_time" {
  alarm_name          = "${local.name_prefix}-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 2  # 2 seconds
  alarm_description   = "Response time exceeded 2 seconds"

  dimensions = {
    LoadBalancer = module.alb.arn_suffix
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${local.name_prefix}-rds-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU utilization exceeded 80%"

  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${local.name_prefix}-rds-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80  # 80% of max connections
  alarm_description   = "RDS connections approaching limit"

  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = local.common_tags
}

# Security-focused CloudWatch Alarms

# ALB 4XX errors — indicator of brute force or unauthorized access attempts
resource "aws_cloudwatch_metric_alarm" "alb_4xx_errors" {
  alarm_name          = "${local.name_prefix}-alb-4xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_ELB_4XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 100
  alarm_description   = "High rate of 4XX errors - possible brute force or unauthorized access attempts"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = module.alb.arn_suffix
  }

  tags = local.common_tags
}

# WAF blocked requests — indicator of active attack
resource "aws_cloudwatch_metric_alarm" "waf_blocked_requests" {
  alarm_name          = "${local.name_prefix}-waf-blocked"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = 300
  statistic           = "Sum"
  threshold           = 50
  alarm_description   = "High rate of WAF-blocked requests - possible attack"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    WebACL = module.waf.web_acl_name
    Region = var.aws_region
    Rule   = "ALL"
  }

  tags = local.common_tags
}

# RDS authentication failures — detect database credential attacks
resource "aws_cloudwatch_log_metric_filter" "rds_auth_failures" {
  name           = "${local.name_prefix}-rds-auth-failures"
  pattern        = "\"FATAL:  password authentication failed\""
  log_group_name = "/aws/rds/cluster/${local.name_prefix}/postgresql"

  metric_transformation {
    name      = "RDSAuthFailures"
    namespace = "SwipeSavvy/Security"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_auth_failures" {
  alarm_name          = "${local.name_prefix}-rds-auth-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RDSAuthFailures"
  namespace           = "SwipeSavvy/Security"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Multiple RDS authentication failures detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  tags = local.common_tags
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name              = "${local.name_prefix}-alerts"
  kms_master_key_id = "alias/aws/sns"

  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Route 53 Health Check (requires existing hosted zone)
resource "aws_route53_health_check" "api" {
  count             = var.domain_name != "" ? 1 : 0
  fqdn              = "api.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-api-health-check"
  })
}
