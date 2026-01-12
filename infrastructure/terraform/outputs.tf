# SwipeSavvy Infrastructure Outputs

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.dns_name
}

output "alb_zone_id" {
  description = "ALB Zone ID for Route 53 alias"
  value       = module.alb.zone_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = module.elasticache.endpoint
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = module.elasticache.port
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = module.ec2.asg_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

# Connection strings for application (do not expose in logs)
output "database_url" {
  description = "Full database connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${module.rds.endpoint}:${module.rds.port}/${var.db_name}"
  sensitive   = true
}

output "redis_url" {
  description = "Full Redis connection URL"
  value       = "redis://${module.elasticache.endpoint}:${module.elasticache.port}"
  sensitive   = true
}

# DNS Outputs
output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = var.domain_name != "" && var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : var.existing_zone_id
}

output "route53_name_servers" {
  description = "Route 53 name servers (update your domain registrar with these)"
  value       = var.domain_name != "" && var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : []
}

output "acm_certificate_arn_output" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" && var.create_acm_certificate ? module.acm[0].certificate_arn : var.acm_certificate_arn
}

# Production URLs
output "production_urls" {
  description = "Production URLs for all SwipeSavvy services"
  value = var.domain_name != "" ? {
    api     = "https://api.${var.domain_name}"
    admin   = "https://admin.${var.domain_name}"
    wallet  = "https://wallet.${var.domain_name}"
    app     = "https://app.${var.domain_name}"
    website = "https://www.${var.domain_name}"
  } : {}
}
