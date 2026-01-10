# ElastiCache Module for SwipeSavvy
# Redis cluster for session storage, caching, and feature flags

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

variable "node_type" {
  type    = string
  default = "cache.t3.medium"
}

variable "num_cache_nodes" {
  type    = number
  default = 2
}

variable "tags" {
  type    = map(string)
  default = {}
}

# Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name        = "${var.name_prefix}-redis-subnet-group"
  description = "Redis subnet group for ${var.name_prefix}"
  subnet_ids  = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis-subnet-group"
  })
}

# Parameter Group with optimized settings
resource "aws_elasticache_parameter_group" "main" {
  name        = "${var.name_prefix}-redis-params"
  family      = "redis7"
  description = "Custom Redis parameter group for ${var.name_prefix}"

  # Memory management
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  # Persistence
  parameter {
    name  = "appendonly"
    value = "yes"
  }

  parameter {
    name  = "appendfsync"
    value = "everysec"
  }

  # Timeout
  parameter {
    name  = "timeout"
    value = "300"
  }

  # TCP keepalive
  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  tags = var.tags
}

# Redis Replication Group (for Multi-AZ)
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "${var.name_prefix}-redis"
  description          = "Redis replication group for ${var.name_prefix}"

  node_type            = var.node_type
  num_cache_clusters   = var.num_cache_nodes
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = var.security_group_ids
  parameter_group_name = aws_elasticache_parameter_group.main.name

  # High availability
  automatic_failover_enabled = var.num_cache_nodes > 1 ? true : false
  multi_az_enabled          = var.num_cache_nodes > 1 ? true : false

  # Engine
  engine               = "redis"
  engine_version       = "7.0"

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Maintenance
  maintenance_window       = "mon:05:00-mon:06:00"
  snapshot_window         = "03:00-04:00"
  snapshot_retention_limit = 7

  # Notifications
  notification_topic_arn = null # Set if you have SNS topic

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Apply changes immediately (set to false for production)
  apply_immediately = false

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-redis"
  })

  lifecycle {
    ignore_changes = [num_cache_clusters]
  }
}

# CloudWatch Alarms for Redis
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.name_prefix}-redis-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "Redis CPU utilization is too high"

  dimensions = {
    CacheClusterId = "${var.name_prefix}-redis-001"
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${var.name_prefix}-redis-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Redis memory usage is too high"

  dimensions = {
    CacheClusterId = "${var.name_prefix}-redis-001"
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "redis_connections" {
  alarm_name          = "${var.name_prefix}-redis-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CurrConnections"
  namespace           = "AWS/ElastiCache"
  period              = 300
  statistic           = "Average"
  threshold           = 1000
  alarm_description   = "Redis connections are too high"

  dimensions = {
    CacheClusterId = "${var.name_prefix}-redis-001"
  }

  tags = var.tags
}

# Outputs
output "endpoint" {
  description = "Primary endpoint for Redis"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "reader_endpoint" {
  description = "Reader endpoint for Redis (read replicas)"
  value       = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "connection_string" {
  description = "Redis connection URL"
  value       = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:${aws_elasticache_replication_group.main.port}"
}

output "replication_group_id" {
  value = aws_elasticache_replication_group.main.id
}
