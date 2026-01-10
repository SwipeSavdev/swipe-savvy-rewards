# RDS Module for SwipeSavvy
# PostgreSQL Multi-AZ with automated backups and encryption

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

variable "db_name" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_instance_class" {
  type    = string
  default = "db.t3.medium"
}

variable "db_allocated_storage" {
  type    = number
  default = 100
}

variable "multi_az" {
  type    = bool
  default = true
}

variable "backup_retention_period" {
  type    = number
  default = 7
}

variable "tags" {
  type    = map(string)
  default = {}
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name        = "${var.name_prefix}-db-subnet-group"
  description = "Database subnet group for ${var.name_prefix}"
  subnet_ids  = var.subnet_ids

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-db-subnet-group"
  })
}

# DB Parameter Group with optimized settings
resource "aws_db_parameter_group" "main" {
  name        = "${var.name_prefix}-db-params"
  family      = "postgres15"
  description = "Custom parameter group for ${var.name_prefix}"

  # Connection settings
  parameter {
    name  = "max_connections"
    value = "200"
  }

  # Logging
  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking > 1 second
  }

  # Performance
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/4096}" # 25% of memory
  }

  parameter {
    name  = "effective_cache_size"
    value = "{DBInstanceClassMemory*3/4096}" # 75% of memory
  }

  # SSL
  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = var.tags
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  # Engine configuration
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2 # Auto-scaling up to 2x
  storage_type         = "gp3"
  storage_encrypted    = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = var.security_group_ids
  publicly_accessible    = false

  # High availability
  multi_az = var.multi_az

  # Parameter and option groups
  parameter_group_name = aws_db_parameter_group.main.name

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00" # UTC
  maintenance_window     = "Mon:04:00-Mon:05:00"

  # Monitoring
  performance_insights_enabled          = true
  performance_insights_retention_period = 7
  monitoring_interval                   = 60
  monitoring_role_arn                   = aws_iam_role.rds_monitoring.arn
  enabled_cloudwatch_logs_exports       = ["postgresql", "upgrade"]

  # Deletion protection (enable in production)
  deletion_protection      = true
  skip_final_snapshot      = false
  final_snapshot_identifier = "${var.name_prefix}-final-snapshot"
  copy_tags_to_snapshot    = true

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-postgres"
  })

  lifecycle {
    prevent_destroy = true
  }
}

# IAM role for enhanced monitoring
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.name_prefix}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Outputs
output "endpoint" {
  value = aws_db_instance.main.address
}

output "port" {
  value = aws_db_instance.main.port
}

output "db_instance_id" {
  value = aws_db_instance.main.id
}

output "connection_string" {
  value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
  sensitive = true
}

output "arn" {
  value = aws_db_instance.main.arn
}
