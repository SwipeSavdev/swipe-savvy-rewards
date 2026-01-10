# Remote State Backend Configuration
# Uncomment and configure for production use
#
# First, create the S3 bucket and DynamoDB table manually:
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
# aws dynamodb create-table \
#   --table-name swipesavvy-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

# terraform {
#   backend "s3" {
#     bucket         = "swipesavvy-terraform-state"
#     key            = "prod/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "swipesavvy-terraform-locks"
#   }
# }
