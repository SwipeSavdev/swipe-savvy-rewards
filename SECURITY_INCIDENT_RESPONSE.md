# 🚨 SECURITY INCIDENT: Exposed API Keys — Response Plan

**Date**: 2026-01-06
**Severity**: CRITICAL
**Status**: IN PROGRESS
**Incident Type**: API Keys committed to git repository

---

## Executive Summary

During a comprehensive production readiness audit, **3 Together.AI API keys** were discovered committed to the `.env` file in the git repository. The keys have been exposed in 4 commits over an unknown period.

**Exposed Keys**:
1. `TOGETHER_API_KEY` (Primary - Support/Concierge)
2. `TOGETHER_API_KEY_GENERAL` (General Purpose)
3. `TOGETHER_API_KEY_MARKETING` (AI Marketing)

**Potential Impact**:
- Unauthorized API usage (cost: $10,000-$50,000 if exploited)
- Service disruption (rate limits exhausted)
- Data exfiltration (if keys have access to sensitive data)
- Compliance violations (SOC2, PCI-DSS)

---

## Immediate Actions Taken

### ✅ 1. Updated .gitignore
**File**: `.gitignore`
**Changes**:
- Added `.env` and all environment variable patterns
- Added secrets directory exclusions

### ✅ 2. Created .env.example Templates
**Files Created**:
- `.env.example` — Development template with placeholder values
- `.env.production.example` — Production template with secrets manager references

### ✅ 3. Updated CI/CD Configuration
**File**: `.gitlab-ci.yml`
**Changes**:
- Updated Node version from 18 to 20.13.0
- Updated Python version from 3.9 to 3.11
- Updated npm version requirement

---

## CRITICAL ACTIONS REQUIRED (Must Complete Today)

### 🔴 ACTION #1: Rotate ALL Together.AI API Keys

**Who**: Platform administrator with Together.AI account access
**When**: IMMEDIATELY (within 1 hour)
**How**:

1. **Login to Together.AI Dashboard**
   ```
   URL: https://api.together.xyz/settings/api-keys
   ```

2. **Rotate Primary Key** (Support/Concierge)
   - Click "Create new API key"
   - Name: "SwipeSavvy Support Service (Production)"
   - Copy new key to secure location (1Password, AWS Secrets Manager)
   - Delete old key: `tgp_v1_CiR5vpdhsL3ldr9lCZ1G4hl0NI2KJ0y3zRuu09DV8dQ`

3. **Rotate General Key**
   - Create new key: "SwipeSavvy General AI Service (Production)"
   - Copy new key to secure location
   - Delete old key: `tgp_v1_tQpBdcqfgcRh_35VBkzg9ACY3kafI7knXI5vjt1stlQ`

4. **Rotate Marketing Key**
   - Create new key: "SwipeSavvy Marketing AI Service (Production)"
   - Copy new key to secure location
   - Delete old key: `tgp_v1_DJ_EOH64PwAZzmAnfIttzGr79A-PQZ3oN8P2h3EfhB8`

5. **Verify Rotation**
   ```bash
   # Test new keys work
   curl -H "Authorization: Bearer YOUR_NEW_KEY" \
        https://api.together.xyz/v1/models
   ```

### 🔴 ACTION #2: Remove .env from Git History

**Who**: Developer with git access
**When**: IMMEDIATELY (after key rotation)
**How**:

```bash
# Navigate to repository
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Remove .env from all commits in history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.local .env.database" \
  --prune-empty --tag-name-filter cat -- --all

# Verify removal
git log --all --full-history -- .env
# Should return empty

# Force push to remote (CAUTION: coordinate with team)
git push origin --force --all
git push origin --force --tags
```

⚠️ **WARNING**: This rewrites git history. Coordinate with all team members before force pushing.

**Alternative (Safer)**: Use BFG Repo-Cleaner
```bash
# Install BFG
brew install bfg

# Remove .env from history
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

### 🔴 ACTION #3: Audit API Usage for Anomalies

**Who**: Platform administrator
**When**: Within 2 hours
**How**:

1. **Check Together.AI Dashboard**
   - Review API usage for last 30 days
   - Look for unusual spikes or patterns
   - Check for requests from unexpected IP addresses
   - Export usage logs

2. **Document Findings**
   - Record total API calls made
   - Calculate costs incurred
   - Identify any suspicious activity
   - Save logs for compliance/audit

3. **If Abuse Detected**
   - Contact Together.AI support immediately
   - Request refund for fraudulent usage
   - Consider legal action if significant

### 🔴 ACTION #4: Update Production Secrets

**Who**: DevOps engineer
**When**: Within 4 hours
**How**:

1. **AWS Secrets Manager** (Recommended)
   ```bash
   # Create secrets in AWS
   aws secretsmanager create-secret \
     --name swipesavvy/production/together-api-key \
     --secret-string "YOUR_NEW_PRIMARY_KEY"

   aws secretsmanager create-secret \
     --name swipesavvy/production/together-api-key-general \
     --secret-string "YOUR_NEW_GENERAL_KEY"

   aws secretsmanager create-secret \
     --name swipesavvy/production/together-api-key-marketing \
     --secret-string "YOUR_NEW_MARKETING_KEY"
   ```

2. **Update Application to Read from Secrets Manager**
   ```python
   # swipesavvy-ai-agents/app/core/config.py
   import boto3

   def get_secret(secret_name):
       client = boto3.client('secretsmanager', region_name='us-east-1')
       response = client.get_secret_value(SecretId=secret_name)
       return response['SecretString']

   TOGETHER_API_KEY = get_secret('swipesavvy/production/together-api-key')
   ```

3. **Alternative: Environment Variables Only** (Less secure)
   - Store in CI/CD environment variables (GitLab CI Variables, GitHub Secrets)
   - Ensure "Protected" and "Masked" flags are enabled
   - Never echo or log these values

### 🔴 ACTION #5: Notify Stakeholders

**Who**: Engineering manager / CTO
**When**: Within 2 hours
**Who to Notify**:
- Engineering team (all developers)
- Security team
- Compliance team (if applicable)
- Legal team (if significant exposure)
- Finance team (potential unauthorized charges)

**Notification Template**:
```
Subject: SECURITY INCIDENT: API Keys Exposed in Git Repository

Team,

We have identified a security incident where three Together.AI API keys
were committed to our git repository. We have taken immediate action:

✅ Updated .gitignore to prevent future commits
✅ Created secure .env templates
✅ Updated CI/CD configuration

REQUIRED ACTIONS:
1. All API keys have been rotated (or will be by [TIME])
2. Git history will be cleaned (coordinate before pulling)
3. All developers must delete local .env files and use .env.example

DEVELOPER ACTION REQUIRED:
1. Pull latest changes from main branch
2. Delete your local .env file
3. Copy .env.example to .env
4. Request new API keys from [CONTACT]
5. Never commit .env files (now blocked by .gitignore)

Questions: Contact [SECURITY LEAD]

Status updates: [SLACK CHANNEL]
```

---

## Medium-Term Actions (This Week)

### 📋 1. Implement Pre-Commit Hooks

**File**: `.pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
      - id: detect-private-key
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
```

**Install**:
```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

### 📋 2. Secret Scanning in CI/CD

**Add to `.gitlab-ci.yml`**:
```yaml
secret-scanning:
  stage: security
  image: python:3.11-alpine
  script:
    - pip install detect-secrets
    - detect-secrets scan --all-files --force-use-all-plugins
  allow_failure: false
```

### 📋 3. Implement Key Rotation Schedule

**Create**: `SECURITY_POLICY.md`
- Rotate all API keys every 90 days
- Automate rotation with AWS Secrets Manager rotation
- Test rotation in staging before production

### 📋 4. Security Training

**Required for All Developers**:
- Git secrets management best practices
- How to use .env.example files
- When to use secrets managers vs environment variables
- How to identify exposed secrets in PRs

---

## Long-Term Prevention (This Month)

### 🔒 1. Implement Secrets Management Platform

**Options**:
- **AWS Secrets Manager** (Recommended for AWS deployments)
- **HashiCorp Vault** (Multi-cloud, enterprise-grade)
- **Doppler** (Developer-friendly SaaS)

### 🔒 2. Automated Secret Detection

**GitHub**: Enable secret scanning
**GitLab**: Enable Secret Detection (Ultimate tier)
**Third-party**: GitGuardian, TruffleHog

### 🔒 3. Least Privilege Access

- Create separate API keys for dev/staging/production
- Limit key permissions to minimum required scope
- Rotate keys on employee offboarding

### 🔒 4. Monitoring & Alerting

- Set up alerts for unusual API usage
- Monitor for new secrets in commits
- Alert on failed authentication attempts
- Track key usage patterns

---

## Compliance & Documentation

### Required Documentation

1. **Incident Report** (This document)
2. **Timeline of Actions** (below)
3. **Impact Assessment**
4. **Remediation Plan**
5. **Lessons Learned**

### Timeline

| Time | Action | Status |
|------|--------|--------|
| 2026-01-06 14:00 | Audit discovered exposed keys | ✅ COMPLETE |
| 2026-01-06 14:15 | Updated .gitignore | ✅ COMPLETE |
| 2026-01-06 14:20 | Created .env templates | ✅ COMPLETE |
| 2026-01-06 14:25 | Updated CI/CD config | ✅ COMPLETE |
| 2026-01-06 14:30 | Created incident response plan | ✅ COMPLETE |
| 2026-01-06 [TBD] | **Rotate API keys** | 🔴 PENDING |
| 2026-01-06 [TBD] | **Clean git history** | 🔴 PENDING |
| 2026-01-06 [TBD] | Audit API usage | 🔴 PENDING |
| 2026-01-06 [TBD] | Update production secrets | 🔴 PENDING |
| 2026-01-06 [TBD] | Notify stakeholders | 🔴 PENDING |

---

## Verification Checklist

### Before Closing Incident

- [ ] All 3 Together.AI API keys rotated and old keys deleted
- [ ] `.env` file removed from git history (verified with `git log`)
- [ ] New keys stored in secure secrets manager (AWS/Vault/1Password)
- [ ] Production deployments updated with new keys
- [ ] API usage audited for anomalies
- [ ] Stakeholders notified
- [ ] Pre-commit hooks installed and tested
- [ ] Secret scanning added to CI/CD
- [ ] Developer training completed
- [ ] Post-incident review conducted
- [ ] Remediation plan documented
- [ ] Lessons learned shared with team

---

## Contact Information

**Security Incidents**: [security@swipesavvy.com]
**On-Call Engineer**: [oncall@swipesavvy.com]
**Together.AI Support**: https://together.ai/support
**AWS Support**: Case ID [TBD]

---

## Lessons Learned (Post-Incident)

*To be filled after incident closure:*

1. **What went well?**
   - Quick detection during audit
   - Comprehensive remediation plan

2. **What went wrong?**
   - Keys committed to git (preventable)
   - No pre-commit hooks to catch secrets
   - No secret scanning in CI/CD

3. **What will we change?**
   - Implement pre-commit hooks
   - Add secret scanning to CI/CD
   - Mandatory security training
   - Quarterly key rotation schedule

---

**Status**: Incident response plan created. Awaiting execution of critical actions.

**Next Update**: After API keys are rotated (Target: within 1 hour)
