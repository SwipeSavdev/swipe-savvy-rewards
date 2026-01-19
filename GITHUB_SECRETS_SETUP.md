# GitHub Secrets Configuration Guide

## Required Secrets for CI/CD

To enable automated deployments via GitHub Actions, you need to configure the following secrets.

---

## How to Add Secrets

1. Go to your repository settings:
   ```
   https://github.com/SwipeSavdev/swipe-savvy-rewards/settings/secrets/actions
   ```

2. Click **"New repository secret"**

3. Add each secret below

---

## Required Secrets

### 1. AWS_ACCESS_KEY_ID

**Name**: `AWS_ACCESS_KEY_ID`  
**Value**: Your AWS IAM access key ID

**How to get it**:
```bash
# View your current credentials
aws configure list

# Or create new IAM user with these permissions:
# - AmazonEC2ContainerRegistryFullAccess
# - AmazonECS_FullAccess
```

**Current Value** (for reference):
- Account: `858955002750`
- User: `github.user@swipesavvyrewards.com`

---

### 2. AWS_SECRET_ACCESS_KEY

**Name**: `AWS_SECRET_ACCESS_KEY`  
**Value**: Your AWS IAM secret access key

**⚠️ Security Note**: This is sensitive! Never commit to git or share publicly.

---

## Verification

After adding secrets, test the workflow:

### Option 1: Push to Main
```bash
git push origin main
# Workflow triggers automatically
```

### Option 2: Manual Trigger
1. Go to: https://github.com/SwipeSavdev/swipe-savvy-rewards/actions/workflows/deploy-simple.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Click "Run workflow"

### Check Status
View workflow execution:
```
https://github.com/SwipeSavdev/swipe-savvy-rewards/actions
```

---

## What the Workflow Does

Once secrets are configured, on every push to `main`:

1. ✅ Checks out code
2. ✅ Configures AWS credentials
3. ✅ Builds Docker image
4. ✅ Auto-detects AWS account ID
5. ✅ Logs into ECR
6. ✅ Tags image with `latest` and commit SHA
7. ✅ Pushes to ECR
8. ✅ Deploys to ECS (force new deployment)
9. ✅ Reports success

---

## Troubleshooting

### Error: "AWS credentials not configured"
- **Fix**: Add both `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` secrets

### Error: "No such host"
- **Fix**: Check your AWS credentials have correct permissions

### Error: "repository does not exist"
- **Fix**: ECR repository already created (should work now)

### Error: "ECS service not found"
- **Fix**: The workflow handles this gracefully with `|| echo`

---

## Current Setup Status

✅ **Workflow File**: `.github/workflows/deploy-simple.yml`  
✅ **ECR Repository**: `swipesavvy-api` (created)  
✅ **ECS Cluster**: `swipe-savvy-prod` (exists)  
✅ **ECS Service**: `swipe-savvy-api-blue` (exists)  
⚠️ **Secrets**: Need to be added to GitHub

---

## Security Best Practices

1. **Use IAM User**: Don't use root credentials
2. **Least Privilege**: Grant only necessary permissions
3. **Rotate Keys**: Change credentials periodically
4. **Monitor Access**: Check CloudTrail logs for API calls
5. **Enable MFA**: Protect IAM user with multi-factor auth

---

## Alternative: Use OIDC (Recommended)

For better security, consider using AWS OIDC instead of static credentials:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::858955002750:role/GitHubActionsRole
    aws-region: us-east-1
```

This requires setting up an IAM role with GitHub OIDC provider.

---

## Summary

**To enable automated CI/CD**, add these 2 secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**That's it!** The workflow will automatically deploy on every push to `main`.
