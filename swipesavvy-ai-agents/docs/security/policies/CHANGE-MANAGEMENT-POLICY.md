# Change Management Policy

| Field              | Value                                      |
|--------------------|--------------------------------------------|
| **Document Owner** | Chief Information Security Officer (CISO)  |
| **Last Updated**   | 2026-02-18                                 |
| **Review Cadence** | Annual (next review: 2027-02-18)           |
| **Classification** | Internal                                   |
| **Version**        | 1.0                                        |
| **Approved By**    | Executive Leadership Team                  |

---

## 1. Purpose

This policy establishes the requirements for managing changes to SwipeSavvy's information systems, applications, and infrastructure. A structured change management process reduces the risk of service disruptions, security vulnerabilities, and unauthorized modifications while maintaining compliance with PCI DSS 4.0, SOC 2, and ISO 27001.

## 2. Scope

This policy applies to all changes affecting:

- Application code: FastAPI/Python backend, iOS (SwiftUI), and Android (Kotlin/Compose) mobile applications
- Infrastructure: AWS resources (EC2, RDS PostgreSQL, ElastiCache Redis, ALB, CloudFront, S3, KMS, SNS) in account 858955002750 (us-east-1)
- Configuration: Security groups, IAM policies, environment variables, Terraform infrastructure-as-code
- Third-party integrations: Authorize.Net, FIS Global Payment One, AWS SNS
- Database schemas and migrations
- CI/CD pipeline configurations (GitHub Actions)

## 3. Regulatory and Standards Alignment

| Requirement                  | Reference                                                        |
|------------------------------|------------------------------------------------------------------|
| PCI DSS 4.0                  | Req 6.5 -- Changes to all system components are managed securely |
| PCI DSS 4.0                  | Req 6.5.1 -- Change management procedures address all requirements |
| PCI DSS 4.0                  | Req 6.5.2 -- Significant changes are documented and confirmed    |
| SOC 2                        | CC8.1 (Change Management)                                       |
| SOC 2                        | CC7.1 (System Operations Monitoring)                             |
| ISO 27001:2022               | A.8.32 (Change Management)                                      |
| ISO 27001:2022               | A.8.9 (Configuration Management)                                |
| ISO 27001:2022               | A.8.25 (Secure Development Life Cycle)                          |

## 4. Change Classifications

All changes must be classified before initiation. Classification determines the approval path, testing requirements, and documentation level.

| Classification   | Description                                                      | Examples                                                     | Approval Required        |
|------------------|------------------------------------------------------------------|--------------------------------------------------------------|--------------------------|
| **Standard**     | Low-risk, routine changes with established procedures            | Dependency updates (non-security), copy/text changes, minor UI adjustments | Team Lead               |
| **Normal**       | Moderate-risk changes requiring review and testing               | New API endpoints, database migrations, feature releases, configuration changes | CAB approval            |
| **Significant**  | High-risk changes affecting security, payment processing, or infrastructure | Changes to authentication logic, payment flow, encryption config, IAM policies, network architecture | CAB + CISO approval     |
| **Emergency**    | Urgent changes required to resolve critical incidents or vulnerabilities | Critical security patches, production outage remediation, zero-day vulnerability mitigation | CISO (retroactive CAB)  |

> **PCI DSS 4.0 Ref**: Requirement 6.5.2 -- Upon completion of a significant change, all applicable PCI DSS requirements are confirmed to be in place.

## 5. Change Advisory Board (CAB)

### 5.1 Composition

| Role                          | Responsibility                                                    |
|-------------------------------|-------------------------------------------------------------------|
| CISO (Chair)                  | Final approval authority, security impact assessment              |
| VP of Engineering             | Technical feasibility, resource allocation                        |
| Lead Backend Engineer         | Backend architecture and API impact assessment                    |
| Lead Mobile Engineer          | iOS/Android impact assessment                                     |
| DevOps/Infrastructure Lead    | AWS infrastructure and deployment impact assessment               |
| QA Lead                       | Testing adequacy assessment                                       |
| Compliance Officer            | Regulatory impact assessment                                      |

### 5.2 Meeting Cadence

- **Scheduled meetings**: Weekly (every Tuesday), reviewing all pending Normal and Significant changes.
- **Ad-hoc meetings**: Convened within 2 hours for Emergency changes requiring retroactive review.
- **Quorum**: Minimum 4 members including the CISO or designated delegate and at least one engineering representative.

## 6. Code Review Requirements

### 6.1 Standard Review Process

All code changes must undergo peer review before merging to any protected branch (main, staging, production).

| Change Type                    | Minimum Reviewers | Additional Requirements                                     |
|--------------------------------|--------------------|-------------------------------------------------------------|
| Standard changes               | 1 reviewer         | Automated tests must pass                                   |
| Normal changes                 | 1 reviewer         | Automated tests must pass, QA sign-off for user-facing changes |
| Security-sensitive changes     | 2 reviewers        | At least one reviewer must be from the security team or a designated security champion |
| Payment processing changes     | 2 reviewers        | At least one reviewer must have PCI DSS training; CISO notification required |
| Infrastructure changes (Terraform) | 2 reviewers    | `terraform plan` output reviewed; no manual AWS console changes in production |
| Database migrations            | 2 reviewers        | Rollback script required; DBA review for schema changes     |

### 6.2 Security-Sensitive Change Scope

The following areas are classified as security-sensitive and require 2 reviewers:

- Authentication and authorization logic (JWT handling, OTP, session management)
- Encryption implementation or configuration (KMS, TLS, AES-256)
- IAM policies and security group modifications
- API rate limiting and input validation
- Payment processing flows (Authorize.Net, FIS Global integrations)
- Personally identifiable information (PII) handling
- Logging configurations that may capture sensitive data

> **PCI DSS 4.0 Ref**: Requirement 6.5.1 -- Procedures for changes include documentation of impact, approval by authorized parties, and testing.
> **ISO 27001 Ref**: A.8.25 -- Secure development life cycle.

## 7. Deployment Procedures

### 7.1 CI/CD Pipeline (GitHub Actions)

All deployments follow an automated CI/CD pipeline managed through GitHub Actions. Manual deployments to production are prohibited except under the Emergency Change process.

**Pipeline Stages:**

```
Code Push --> Automated Tests --> Static Analysis --> Security Scan -->
Build --> Deploy to Staging --> Staging Validation --> Production Approval Gate -->
Deploy to Production --> Post-Deployment Verification
```

### 7.2 Stage Progression

| Stage                | Environment        | Actions                                                       |
|----------------------|--------------------|---------------------------------------------------------------|
| 1. Build and Test    | CI Runner          | Unit tests, integration tests, linting, type checking         |
| 2. Security Scan     | CI Runner          | Dependency vulnerability scan (Snyk/Dependabot), SAST analysis|
| 3. Staging Deploy    | Staging (us-east-1)| Automated deployment, smoke tests, API contract tests         |
| 4. Staging Validation| Staging            | QA regression testing, performance baseline verification      |
| 5. Production Gate   | N/A                | Manual approval by authorized deployer (Team Lead or above)   |
| 6. Production Deploy | Production (us-east-1) | Blue/green or rolling deployment via ALB target groups    |
| 7. Post-Deploy Check | Production         | Health checks, error rate monitoring, synthetic transactions  |

### 7.3 Deployment Windows

- **Standard deployments**: Tuesday through Thursday, 10:00-16:00 ET. No deployments on Fridays, weekends, or company holidays.
- **Emergency deployments**: Any time, following the Emergency Change process (Section 9).

### 7.4 Mobile Application Deployments

iOS (App Store) and Android (Google Play) releases follow additional requirements:

- App store submissions require QA Lead sign-off and a 24-hour staged rollout (10% --> 50% --> 100%).
- Critical hotfixes may use expedited review processes available from Apple and Google.
- Mobile releases must be backward-compatible with the current production API version.

> **SOC 2 Ref**: CC8.1 -- The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.

## 8. Rollback Plans

### 8.1 Requirements

Every Normal and Significant change must include a documented rollback plan before CAB approval. The rollback plan must specify:

- **Trigger criteria**: Conditions that warrant rollback (e.g., error rate exceeds 1%, latency exceeds 2x baseline, payment processing failure rate exceeds 0.1%).
- **Rollback procedure**: Step-by-step instructions for reverting the change.
- **Rollback owner**: The individual authorized and responsible for executing the rollback.
- **Maximum rollback time**: Target time to complete rollback (must not exceed 30 minutes for backend, 24 hours for mobile via staged rollout halt).

### 8.2 Rollback Methods

| Component                      | Rollback Method                                                  |
|--------------------------------|------------------------------------------------------------------|
| Backend application (EC2)      | Redeploy previous container/AMI version via ALB target group switch |
| Database migration             | Execute pre-approved rollback migration script                   |
| Infrastructure (Terraform)     | `terraform apply` with previous state; manual intervention if state is corrupted |
| Mobile applications            | Halt staged rollout; submit hotfix build or revert to previous version |
| Configuration changes          | Restore previous parameter values from versioned configuration store |

### 8.3 Post-Rollback Actions

After any rollback:
1. A post-incident review is conducted within 48 hours.
2. Root cause analysis is documented.
3. The original change is revised and re-submitted through the standard change process.

## 9. Emergency Change Process

Emergency changes bypass the standard CAB review process but must still maintain accountability and documentation.

### 9.1 Criteria for Emergency Changes

An emergency change is justified only when:
- A critical security vulnerability is actively being exploited or is imminent (CVSS 9.0+).
- A production outage is affecting customer transactions or payment processing.
- A regulatory or legal deadline requires immediate action.

### 9.2 Emergency Change Procedure

| Step | Action                                                                           | Timeline          |
|------|----------------------------------------------------------------------------------|--------------------|
| 1    | Engineer identifies emergency and notifies the on-call CISO or delegate          | Immediate          |
| 2    | CISO or delegate verbally approves the emergency change                          | Within 30 minutes  |
| 3    | Minimum 1 peer review of the change (may be performed concurrently with testing) | Within 1 hour      |
| 4    | Change is deployed to production with monitoring                                  | As needed          |
| 5    | Post-deployment verification confirms the issue is resolved                       | Within 30 minutes  |
| 6    | Full documentation (change record, impact assessment, test results) is completed  | Within 24 hours    |
| 7    | Retroactive CAB review at the next scheduled or ad-hoc meeting                   | Within 5 business days |

> **PCI DSS 4.0 Ref**: Requirement 6.5.1 -- All changes must be documented, including emergency changes retroactively.

## 10. Documentation Requirements

All changes (except Standard) must be documented in the change management system with the following information:

| Field                         | Required For                                                      |
|-------------------------------|-------------------------------------------------------------------|
| Change ID                     | All changes                                                       |
| Description and justification | All changes                                                       |
| Risk assessment               | Normal, Significant, Emergency                                    |
| Impact analysis               | Normal, Significant, Emergency                                    |
| Rollback plan                 | Normal, Significant                                               |
| Test results                  | All changes                                                       |
| Approvals (with timestamps)   | All changes                                                       |
| Deployment date and time      | All changes                                                       |
| Post-deployment verification  | Normal, Significant, Emergency                                    |

> **ISO 27001 Ref**: A.8.32 -- Change management.

## 11. Responsibilities

| Role                           | Responsibility                                                   |
|--------------------------------|------------------------------------------------------------------|
| Change Requestor               | Submits change request with required documentation               |
| CAB                            | Reviews, approves, or rejects Normal and Significant changes     |
| CISO                           | Approves Significant and Emergency changes; chairs CAB           |
| Deployer                       | Executes the approved deployment and monitors results            |
| QA Lead                        | Validates testing adequacy before production deployment          |

## 12. Related Documents

| Document                              | Location                                                      |
|---------------------------------------|---------------------------------------------------------------|
| Information Security Policy           | `docs/security/policies/INFORMATION-SECURITY-POLICY.md`      |
| Access Control Policy                 | `docs/security/policies/ACCESS-CONTROL-POLICY.md`            |
| Data Retention and Disposal Policy    | `docs/security/policies/DATA-RETENTION-DISPOSAL-POLICY.md`   |
| Incident Response Plan                | `docs/security/INCIDENT-RESPONSE-PLAN.md`                    |

## 13. Revision History

| Version | Date       | Author        | Description              |
|---------|------------|---------------|--------------------------|
| 1.0     | 2026-02-18 | CISO Office   | Initial policy release   |
