# Remote State Backend Configuration (SOC 2 CC8.1)
#
# IMPORTANT: Before enabling, create the S3 bucket and DynamoDB table:
#
# aws s3api create-bucket \
#   --bucket swipesavvy-terraform-state \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket swipesavvy-terraform-state \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket swipesavvy-terraform-state \
#   --server-side-encryption-configuration '{
#     "Rules": [{
#       "ApplyServerSideEncryptionByDefault": {
#         "SSEAlgorithm": "aws:kms"
#       }
#     }]
#   }'
#
# aws s3api put-public-access-block \
#   --bucket swipesavvy-terraform-state \
#   --public-access-block-configuration \
#     BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
#
# aws dynamodb create-table \
#   --table-name swipesavvy-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1
#
# Then run: terraform init -migrate-state

terraform {
  backend "s3" {
    bucket         = "swipesavvy-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "swipesavvy-terraform-locks"
  }
}
