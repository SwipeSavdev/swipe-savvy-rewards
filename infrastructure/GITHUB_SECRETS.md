# GitHub Secrets Configuration

Configure these secrets in your GitHub repository settings:
**Settings > Secrets and variables > Actions > New repository secret**

Repository: https://github.com/SwipeSavdev/swipe-savvy-rewards

---

## Required AWS Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS access key for CI/CD | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for CI/CD | `wJalrXUtnFEMI...` |
| `AWS_ACCOUNT_ID` | AWS account ID | `858955002750` |

---

## Database Secrets

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://swipesavvy_admin:YOUR_PASSWORD@swipesavvy-prod-postgres.c8x2qqc8o3ow.us-east-1.rds.amazonaws.com:5432/swipesavvy` |
| `REDIS_URL` | Redis connection string | `redis://master.swipesavvy-prod-redis.aytnt0.use1.cache.amazonaws.com:6379` |

---

## API Keys (Required for Production)

| Secret Name | Description | Where to Get |
|-------------|-------------|--------------|
| `TOGETHER_API_KEY` | Together.AI API key | https://together.ai/dashboard |
| `SENDGRID_API_KEY` | SendGrid email API key | https://sendgrid.com/settings/api_keys |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | https://console.twilio.com |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | https://console.twilio.com |

---

## Notification Secrets (Optional)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SLACK_WEBHOOK_URL` | Slack webhook for CI/CD notifications | `https://hooks.slack.com/services/T.../B.../...` |

---

## Infrastructure Values (Reference)

These are output from Terraform and used in the CI/CD pipeline:

```
ALB_DNS_NAME=swipesavvy-prod-alb-651707566.us-east-1.elb.amazonaws.com
VPC_ID=vpc-092d31710a754d78b
PUBLIC_SUBNETS=subnet-0fd74f7b546026c9a,subnet-0ead5c2d3b8543234
PRIVATE_SUBNETS=subnet-046ac91d6a97e39c7,subnet-04b3f240f15cb2233
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:858955002750:swipesavvy-prod-alerts
ASG_NAME=swipesavvy-prod-asg
```

---

## How to Add Secrets via GitHub CLI

If you have `gh` CLI authenticated:

```bash
# AWS Credentials
gh secret set AWS_ACCESS_KEY_ID --body "YOUR_ACCESS_KEY"
gh secret set AWS_SECRET_ACCESS_KEY --body "YOUR_SECRET_KEY"
gh secret set AWS_ACCOUNT_ID --body "858955002750"

# Database
gh secret set DATABASE_URL --body "postgresql://swipesavvy_admin:PASSWORD@swipesavvy-prod-postgres.c8x2qqc8o3ow.us-east-1.rds.amazonaws.com:5432/swipesavvy"
gh secret set REDIS_URL --body "redis://master.swipesavvy-prod-redis.aytnt0.use1.cache.amazonaws.com:6379"

# API Keys
gh secret set TOGETHER_API_KEY --body "YOUR_KEY"
gh secret set SENDGRID_API_KEY --body "YOUR_KEY"
gh secret set TWILIO_ACCOUNT_SID --body "YOUR_SID"
gh secret set TWILIO_AUTH_TOKEN --body "YOUR_TOKEN"

# Optional
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/..."
```

---

## IAM Policy for CI/CD User

The AWS user needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "autoscaling:UpdateAutoScalingGroup",
        "autoscaling:StartInstanceRefresh"
      ],
      "Resource": "*"
    }
  ]
}
```
