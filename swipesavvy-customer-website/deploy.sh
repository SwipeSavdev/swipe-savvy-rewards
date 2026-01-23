#!/bin/bash
# SwipeSavvy Customer Website Deployment Script
# Builds and deploys the static website to production

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="swipesavvy-customer-website"
IMAGE_TAG="${IMAGE_TAG:-latest}"
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REGISTRY="${ECR_REGISTRY:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SwipeSavvy Customer Website Deploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Parse arguments
COMMAND="${1:-build}"

case $COMMAND in
  build)
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} "$SCRIPT_DIR"
    echo -e "${GREEN}✓ Image built: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
    ;;

  run)
    echo -e "${YELLOW}Running container locally...${NC}"
    docker run -d --name ${IMAGE_NAME} -p 8080:8080 ${IMAGE_NAME}:${IMAGE_TAG}
    echo -e "${GREEN}✓ Container started${NC}"
    echo -e "  Access at: http://localhost:8080"
    ;;

  stop)
    echo -e "${YELLOW}Stopping container...${NC}"
    docker stop ${IMAGE_NAME} 2>/dev/null || true
    docker rm ${IMAGE_NAME} 2>/dev/null || true
    echo -e "${GREEN}✓ Container stopped${NC}"
    ;;

  test)
    echo -e "${YELLOW}Testing website...${NC}"

    # Build if needed
    if ! docker images | grep -q ${IMAGE_NAME}; then
      echo "Building image first..."
      docker build -t ${IMAGE_NAME}:${IMAGE_TAG} "$SCRIPT_DIR"
    fi

    # Run container
    docker run -d --name ${IMAGE_NAME}-test -p 8081:8080 ${IMAGE_NAME}:${IMAGE_TAG}

    sleep 3

    # Test endpoints
    echo "Testing health endpoint..."
    curl -sf http://localhost:8081/health && echo -e " ${GREEN}✓${NC}" || echo -e " ${RED}✗${NC}"

    echo "Testing homepage..."
    curl -sf http://localhost:8081/ > /dev/null && echo -e "Homepage: ${GREEN}✓${NC}" || echo -e "Homepage: ${RED}✗${NC}"

    echo "Testing platform page..."
    curl -sf http://localhost:8081/platform.html > /dev/null && echo -e "Platform: ${GREEN}✓${NC}" || echo -e "Platform: ${RED}✗${NC}"

    echo "Testing solutions page..."
    curl -sf http://localhost:8081/solutions/rewards-wallet.html > /dev/null && echo -e "Rewards Wallet: ${GREEN}✓${NC}" || echo -e "Rewards Wallet: ${RED}✗${NC}"

    echo "Testing industries page..."
    curl -sf http://localhost:8081/industries/retail.html > /dev/null && echo -e "Retail: ${GREEN}✓${NC}" || echo -e "Retail: ${RED}✗${NC}"

    # Cleanup
    docker stop ${IMAGE_NAME}-test 2>/dev/null || true
    docker rm ${IMAGE_NAME}-test 2>/dev/null || true

    echo -e "${GREEN}✓ All tests completed${NC}"
    ;;

  push)
    if [[ -z "$ECR_REGISTRY" ]]; then
      echo -e "${RED}Error: ECR_REGISTRY not set${NC}"
      echo "Usage: ECR_REGISTRY=123456789.dkr.ecr.us-east-1.amazonaws.com ./deploy.sh push"
      exit 1
    fi

    echo -e "${YELLOW}Pushing to ECR...${NC}"

    # Login to ECR
    aws ecr get-login-password --region ${AWS_REGION} | \
      docker login --username AWS --password-stdin ${ECR_REGISTRY}

    # Tag and push
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    docker push ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

    echo -e "${GREEN}✓ Pushed to ECR: ${ECR_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}${NC}"
    ;;

  deploy-ec2)
    EC2_HOST="${EC2_HOST:-}"
    EC2_KEY="${EC2_KEY:-}"

    if [[ -z "$EC2_HOST" ]] || [[ -z "$EC2_KEY" ]]; then
      echo -e "${RED}Error: EC2_HOST and EC2_KEY required${NC}"
      echo "Usage: EC2_HOST=ec2-user@1.2.3.4 EC2_KEY=~/.ssh/key.pem ./deploy.sh deploy-ec2"
      exit 1
    fi

    echo -e "${YELLOW}Deploying to EC2...${NC}"

    # Build locally
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} "$SCRIPT_DIR"

    # Save image
    docker save ${IMAGE_NAME}:${IMAGE_TAG} | gzip > /tmp/${IMAGE_NAME}.tar.gz

    # Copy to EC2
    scp -i ${EC2_KEY} /tmp/${IMAGE_NAME}.tar.gz ${EC2_HOST}:/tmp/

    # Load and run on EC2
    ssh -i ${EC2_KEY} ${EC2_HOST} << EOF
      docker load < /tmp/${IMAGE_NAME}.tar.gz
      docker stop ${IMAGE_NAME} 2>/dev/null || true
      docker rm ${IMAGE_NAME} 2>/dev/null || true
      docker run -d --name ${IMAGE_NAME} -p 8080:8080 --restart always ${IMAGE_NAME}:${IMAGE_TAG}
      rm /tmp/${IMAGE_NAME}.tar.gz
EOF

    rm /tmp/${IMAGE_NAME}.tar.gz

    echo -e "${GREEN}✓ Deployed to EC2${NC}"
    ;;

  compose)
    echo -e "${YELLOW}Starting with docker-compose...${NC}"
    docker-compose up -d website
    echo -e "${GREEN}✓ Started with docker-compose${NC}"
    echo -e "  Access at: http://localhost:8080"
    ;;

  compose-down)
    echo -e "${YELLOW}Stopping docker-compose...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Stopped${NC}"
    ;;

  *)
    echo "SwipeSavvy Customer Website Deployment"
    echo ""
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build        Build Docker image"
    echo "  run          Run container locally"
    echo "  stop         Stop local container"
    echo "  test         Build and test all endpoints"
    echo "  push         Push to ECR (requires ECR_REGISTRY)"
    echo "  deploy-ec2   Deploy directly to EC2 (requires EC2_HOST, EC2_KEY)"
    echo "  compose      Start with docker-compose"
    echo "  compose-down Stop docker-compose"
    echo ""
    echo "Environment variables:"
    echo "  IMAGE_TAG     Docker image tag (default: latest)"
    echo "  ECR_REGISTRY  ECR registry URL for push"
    echo "  EC2_HOST      EC2 SSH host (user@ip)"
    echo "  EC2_KEY       Path to EC2 SSH key"
    echo "  AWS_REGION    AWS region (default: us-east-1)"
    ;;
esac
