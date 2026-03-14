output "docs_url" {
  description = "URL of the API documentation site"
  value       = "https://${local.docs_domain}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.docs.id
}

output "cloudfront_domain" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.docs.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for docs site"
  value       = aws_s3_bucket.docs.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.docs.arn
}
