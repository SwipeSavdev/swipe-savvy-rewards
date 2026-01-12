# ACM Module for SwipeSavvy
# SSL/TLS Certificate with DNS validation

variable "domain_name" {
  description = "Root domain name (e.g., swipesavvy.com)"
  type        = string
}

variable "zone_id" {
  description = "Route 53 hosted zone ID for DNS validation"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}

# Request wildcard certificate
resource "aws_acm_certificate" "main" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  # Include wildcard and specific subdomains
  subject_alternative_names = [
    "*.${var.domain_name}",
    "www.${var.domain_name}",
    "api.${var.domain_name}",
    "admin.${var.domain_name}",
    "wallet.${var.domain_name}",
    "app.${var.domain_name}",
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.tags, {
    Name = "${var.domain_name}-certificate"
  })
}

# DNS validation records
resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.main.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.zone_id
}

# Wait for certificate validation
resource "aws_acm_certificate_validation" "main" {
  certificate_arn         = aws_acm_certificate.main.arn
  validation_record_fqdns = [for record in aws_route53_record.validation : record.fqdn]

  timeouts {
    create = "30m"
  }
}

# Outputs
output "certificate_arn" {
  description = "ARN of the validated ACM certificate"
  value       = aws_acm_certificate_validation.main.certificate_arn
}

output "certificate_domain_name" {
  description = "Domain name of the certificate"
  value       = aws_acm_certificate.main.domain_name
}

output "certificate_status" {
  description = "Status of the certificate"
  value       = aws_acm_certificate.main.status
}

output "validation_domains" {
  description = "Domains validated by the certificate"
  value       = aws_acm_certificate.main.subject_alternative_names
}
