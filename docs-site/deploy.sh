#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# SwipeSavvy API Docs - Deployment Script
# ──────────────────────────────────────────────
#
# Prerequisites:
#   - AWS CLI v2 configured with appropriate credentials
#   - Terraform >= 1.5 (for infrastructure provisioning)
#
# Usage:
#   ./deploy.sh                     # Deploy docs to S3 + invalidate CloudFront
#   ./deploy.sh --init              # First-time: provision infrastructure with Terraform
#   ./deploy.sh --generate-spec     # Extract fresh spec from running API first
#   ./deploy.sh --env staging       # Deploy to staging environment
#
# ──────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENVIRONMENT="${ENV:-production}"
S3_BUCKET="swipesavvy-api-docs-${ENVIRONMENT}"
GENERATE_SPEC=false
INIT_INFRA=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      S3_BUCKET="swipesavvy-api-docs-${ENVIRONMENT}"
      shift 2
      ;;
    --generate-spec)
      GENERATE_SPEC=true
      shift
      ;;
    --init)
      INIT_INFRA=true
      shift
      ;;
    --help|-h)
      echo "Usage: ./deploy.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --env ENV          Target environment (production|staging|development)"
      echo "  --generate-spec    Extract fresh OpenAPI spec from running API"
      echo "  --init             Provision AWS infrastructure with Terraform"
      echo "  -h, --help         Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "╔══════════════════════════════════════════╗"
echo "║  SwipeSavvy API Docs Deployment          ║"
echo "║  Environment: ${ENVIRONMENT}                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Step 1: Provision infrastructure (first-time only)
if [ "$INIT_INFRA" = true ]; then
  echo "▸ Provisioning AWS infrastructure..."
  cd "${SCRIPT_DIR}/infrastructure/terraform"
  terraform init
  terraform plan -var="environment=${ENVIRONMENT}" -out=tfplan
  echo ""
  echo "Review the plan above. Apply? (y/n)"
  read -r CONFIRM
  if [ "$CONFIRM" = "y" ]; then
    terraform apply tfplan
    echo "✓ Infrastructure provisioned"
  else
    echo "✗ Aborted"
    exit 1
  fi
  cd "${SCRIPT_DIR}"
  echo ""
fi

# Step 2: Generate fresh spec from running API (optional)
if [ "$GENERATE_SPEC" = true ]; then
  echo "▸ Generating OpenAPI spec from running API..."
  API_URL="${API_URL:-http://localhost:8000}"
  python3 "${SCRIPT_DIR}/generate-spec.py" \
    --url "${API_URL}" \
    --output "${SCRIPT_DIR}/openapi.yaml" \
    --format yaml
  echo "✓ Spec generated"
  echo ""
fi

# Step 3: Verify required files exist
echo "▸ Checking required files..."
REQUIRED_FILES=("index.html" "openapi.yaml")
for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "${SCRIPT_DIR}/${file}" ]; then
    echo "✗ Missing required file: ${file}"
    exit 1
  fi
  echo "  ✓ ${file}"
done
echo ""

# Step 4: Upload to S3
echo "▸ Uploading to S3 (${S3_BUCKET})..."

# Upload HTML with correct content type
aws s3 cp "${SCRIPT_DIR}/index.html" "s3://${S3_BUCKET}/index.html" \
  --content-type "text/html" \
  --cache-control "public, max-age=3600"

# Upload OpenAPI spec
aws s3 cp "${SCRIPT_DIR}/openapi.yaml" "s3://${S3_BUCKET}/openapi.yaml" \
  --content-type "application/x-yaml" \
  --cache-control "public, max-age=300"

# Upload any JSON specs if they exist
if [ -f "${SCRIPT_DIR}/openapi.json" ]; then
  aws s3 cp "${SCRIPT_DIR}/openapi.json" "s3://${S3_BUCKET}/openapi.json" \
    --content-type "application/json" \
    --cache-control "public, max-age=300"
fi

echo "✓ Files uploaded"
echo ""

# Step 5: Invalidate CloudFront cache
echo "▸ Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(cd "${SCRIPT_DIR}/infrastructure/terraform" && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text
  echo "✓ Cache invalidation initiated"
else
  echo "⚠ No CloudFront distribution ID found. Skipping invalidation."
  echo "  Run with --init first, or set DISTRIBUTION_ID manually."
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Deployment complete!                    ║"
echo "║  https://docs.swipesavvy.com             ║"
echo "╚══════════════════════════════════════════╝"
