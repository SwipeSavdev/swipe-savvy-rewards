# DNS Module for SwipeSavvy
# Route 53 Hosted Zone and DNS Records

variable "domain_name" {
  description = "Root domain name (e.g., swipesavvy.com)"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for alias records"
  type        = string
}

variable "alb_zone_id" {
  description = "ALB hosted zone ID for alias records"
  type        = string
}

variable "create_hosted_zone" {
  description = "Whether to create a new hosted zone or use existing"
  type        = bool
  default     = true
}

variable "existing_zone_id" {
  description = "Existing hosted zone ID (if create_hosted_zone = false)"
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}

# Create hosted zone (or use existing)
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0

  name    = var.domain_name
  comment = "SwipeSavvy production hosted zone"

  tags = merge(var.tags, {
    Name = var.domain_name
  })
}

locals {
  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : var.existing_zone_id

  # All subdomains that need A records pointing to ALB
  subdomains = [
    "",        # Root domain (swipesavvy.com)
    "www",     # Main website
    "api",     # API Gateway
    "admin",   # Admin Portal
    "wallet",  # Wallet Web App
    "app",     # Mobile PWA
  ]
}

# A Records (Alias to ALB) for all subdomains
resource "aws_route53_record" "alias" {
  for_each = toset(local.subdomains)

  zone_id = local.zone_id
  name    = each.value == "" ? var.domain_name : "${each.value}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# AAAA Records (IPv6 Alias to ALB) for all subdomains
resource "aws_route53_record" "alias_ipv6" {
  for_each = toset(local.subdomains)

  zone_id = local.zone_id
  name    = each.value == "" ? var.domain_name : "${each.value}.${var.domain_name}"
  type    = "AAAA"

  alias {
    name                   = var.alb_dns_name
    zone_id                = var.alb_zone_id
    evaluate_target_health = true
  }
}

# MX Records for email (if using external email service)
resource "aws_route53_record" "mx" {
  zone_id = local.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 3600

  records = [
    "10 mx1.sendgrid.net",
    "20 mx2.sendgrid.net",
  ]
}

# SPF Record for email authentication
resource "aws_route53_record" "spf" {
  zone_id = local.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 3600

  records = [
    "v=spf1 include:sendgrid.net ~all"
  ]
}

# DMARC Record for email security
resource "aws_route53_record" "dmarc" {
  zone_id = local.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 3600

  records = [
    "v=DMARC1; p=quarantine; rua=mailto:dmarc@${var.domain_name}; fo=1"
  ]
}

# Outputs
output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = local.zone_id
}

output "name_servers" {
  description = "Name servers for the hosted zone"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : []
}

output "domain_records" {
  description = "Map of created DNS records"
  value = {
    for subdomain in local.subdomains :
    subdomain == "" ? "root" : subdomain => aws_route53_record.alias[subdomain].fqdn
  }
}
