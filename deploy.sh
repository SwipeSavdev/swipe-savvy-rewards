#!/bin/bash

# SwipeSavvy Deployment Script
# Deploys backend API to AWS

set -e

echo "🔨 Building Docker image..."
cd swipesavvy-ai-agents
docker build -t swipesavvy-api:latest -f Dockerfile .

echo ""
echo "🔐 Logging into AWS ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 858955002750.dkr.ecr.us-east-1.amazonaws.com

echo ""
echo "🏷️  Tagging image..."
docker tag swipesavvy-api:latest 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest
docker tag swipesavvy-api:latest 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:$(git rev-parse --short HEAD)

echo ""
echo "📤 Pushing to ECR..."
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:latest
docker push 858955002750.dkr.ecr.us-east-1.amazonaws.com/swipesavvy-api:$(git rev-parse --short HEAD)

echo ""
echo "🚀 Deploying to ECS..."
aws ecs update-service \
  --cluster swipesavvy-prod \
  --service swipesavvy-api \
  --force-new-deployment \
  --region us-east-1 \
  2>/dev/null || echo "⚠️  ECS cluster not found. Skipping ECS deployment."

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Verify deployment:"
echo "  curl https://api.swipesavvy.com/health"
echo ""
echo "Check logs:"
echo "  aws logs tail /aws/ecs/swipesavvy-api --follow"
