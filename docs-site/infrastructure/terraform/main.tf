terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment for remote state in production
  # backend "s3" {
  #   bucket         = "swipesavvy-terraform-state"
  #   key            = "docs-site/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "swipesavvy-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = "us-east-1" # CloudFront requires us-east-1 for ACM certs
}

locals {
  docs_domain = "${var.docs_subdomain}.${var.domain_name}"
  s3_bucket   = "swipesavvy-api-docs-${var.environment}"
}

# --- S3 Bucket for Static Site ---

resource "aws_s3_bucket" "docs" {
  bucket = local.s3_bucket
  tags   = merge(var.tags, { Name = "SwipeSavvy API Docs" })
}

resource "aws_s3_bucket_website_configuration" "docs" {
  bucket = aws_s3_bucket.docs.id

  index_document { suffix = "index.html" }
  error_document { key = "index.html" }
}

resource "aws_s3_bucket_public_access_block" "docs" {
  bucket = aws_s3_bucket.docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "docs" {
  bucket = aws_s3_bucket.docs.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "docs_encryption" {
  bucket = aws_s3_bucket.docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# --- CloudFront Origin Access Control ---

resource "aws_cloudfront_origin_access_control" "docs" {
  name                              = "${local.s3_bucket}-oac"
  description                       = "OAC for SwipeSavvy API Docs"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- S3 Bucket Policy for CloudFront ---

resource "aws_s3_bucket_policy" "docs" {
  bucket = aws_s3_bucket.docs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.docs.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.docs.arn
          }
        }
      }
    ]
  })
}

# --- CloudFront Distribution ---

resource "aws_cloudfront_distribution" "docs" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "SwipeSavvy API Documentation (${var.environment})"
  price_class         = "PriceClass_100" # US, Canada, Europe
  aliases             = [local.docs_domain]

  origin {
    domain_name              = aws_s3_bucket.docs.bucket_regional_domain_name
    origin_id                = "s3-docs"
    origin_access_control_id = aws_cloudfront_origin_access_control.docs.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-docs"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600    # 1 hour
    max_ttl                = 86400   # 24 hours
    compress               = true
  }

  # Cache YAML/JSON specs with shorter TTL for faster updates
  ordered_cache_behavior {
    path_pattern     = "*.yaml"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-docs"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300     # 5 minutes
    max_ttl                = 3600    # 1 hour
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "*.json"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-docs"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 3600
    compress               = true
  }

  # SPA fallback: serve index.html for 404s
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = merge(var.tags, { Name = "SwipeSavvy API Docs CDN" })
}

# --- Route 53 DNS Record ---

resource "aws_route53_record" "docs" {
  zone_id = var.route53_zone_id
  name    = local.docs_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.docs.domain_name
    zone_id                = aws_cloudfront_distribution.docs.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "docs_ipv6" {
  zone_id = var.route53_zone_id
  name    = local.docs_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.docs.domain_name
    zone_id                = aws_cloudfront_distribution.docs.hosted_zone_id
    evaluate_target_health = false
  }
}
