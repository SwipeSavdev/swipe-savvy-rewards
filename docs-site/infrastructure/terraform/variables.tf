variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "swipesavvy.com"
}

variable "docs_subdomain" {
  description = "Subdomain for API documentation"
  type        = string
  default     = "docs"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for the domain"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for the docs subdomain (must be in us-east-1 for CloudFront)"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "SwipeSavvy"
    Component = "API-Docs"
    ManagedBy = "Terraform"
  }
}
