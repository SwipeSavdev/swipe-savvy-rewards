# Access Control Policy

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

This policy defines the access control requirements for all SwipeSavvy information systems. It establishes the framework for granting, reviewing, modifying, and revoking access to ensure that only authorized individuals can access systems and data commensurate with their job responsibilities. Effective access control is critical to protecting cardholder data, personally identifiable information, and the integrity of SwipeSavvy's payment infrastructure.

## 2. Scope

This policy applies to all access to SwipeSavvy systems, including:

- FastAPI/Python backend application and APIs
- iOS (SwiftUI) and Android (Kotlin/Compose) mobile application administrative functions
- AWS infrastructure (EC2, RDS PostgreSQL, ElastiCache Redis, ALB, CloudFront, S3, KMS, IAM) in account 858955002750 (us-east-1)
- Third-party integrations: Authorize.Net merchant portal, FIS Global Payment One administrative console
- CI/CD systems (GitHub, GitHub Actions)
- Monitoring and logging systems (CloudWatch, CloudTrail)
- Internal communication and collaboration tools

This policy applies to all employees, contractors, and third-party personnel who access SwipeSavvy systems.

## 3. Regulatory and Standards Alignment

| Requirement                  | Reference                                                        |
|------------------------------|------------------------------------------------------------------|
| PCI DSS 4.0                  | Req 7.1 -- Processes and mechanisms for restricting access are defined and understood |
| PCI DSS 4.0                  | Req 7.2 -- Access to system components and data is appropriately defined and assigned |
| PCI DSS 4.0                  | Req 7.3 -- Access to system components and data is managed via an access control system |
| PCI DSS 4.0                  | Req 8.1 -- Processes and mechanisms for user identification and authentication are defined |
| PCI DSS 4.0                  | Req 8.2 -- User identification and related accounts are strictly managed |
| PCI DSS 4.0                  | Req 8.3 -- Strong authentication for users and administrators is established and managed |
| PCI DSS 4.0                  | Req 8.4 -- Multi-factor authentication is implemented for access into the CDE |
| PCI DSS 4.0                  | Req 8.5 -- Multi-factor authentication systems are configured to prevent misuse |
| SOC 2                        | CC6.1 (Logical and Physical Access Controls)                     |
| SOC 2                        | CC6.2 (Prior to Issuing Credentials, Registration and Authorization) |
| SOC 2                        | CC6.3 (Revocation and Modification of Access Credentials)        |
| ISO 27001:2022               | A.5.15 (Access Control)                                         |
| ISO 27001:2022               | A.5.16 (Identity Management)                                    |
| ISO 27001:2022               | A.5.17 (Authentication Information)                              |
| ISO 27001:2022               | A.5.18 (Access Rights)                                          |
| ISO 27001:2022               | A.8.2 (Privileged Access Rights)                                 |
| ISO 27001:2022               | A.8.5 (Secure Authentication)                                    |

## 4. Principle of Least Privilege

All access to SwipeSavvy systems is governed by the principle of least privilege. This means:

- Users are granted only the minimum level of access necessary to perform their assigned duties.
- Default access for new accounts is no access; permissions are explicitly granted based on role assignment.
- Access rights are not inherited from other users or roles unless formally defined in the RBAC model.
- Elevated privileges are temporary and time-bound whenever possible.
- Access to the cardholder data environment (CDE) is restricted to personnel with a documented business need.

> **PCI DSS 4.0 Ref**: Requirement 7.2.1 -- An access control model is defined that includes granting access based on individual personnel's job classification and function.

## 5. Role-Based Access Control (RBAC) Structure

### 5.1 Application Roles

| Role              | Description                                      | Access Scope                                                     |
|-------------------|--------------------------------------------------|------------------------------------------------------------------|
| **User**          | Standard end-user of the SwipeSavvy mobile app   | Own account data, transaction history, payment methods, rewards. No access to other users' data or administrative functions. |
| **Admin**         | Internal support and operations personnel        | Read access to user accounts for support purposes. Ability to perform account actions (lock/unlock, reset OTP). Read access to transaction logs. No access to modify system configuration or security settings. |
| **Super Admin**   | Senior engineering and security personnel         | Full administrative access including system configuration, IAM policy management, security settings, KMS key operations, and database administration. All actions are logged and require MFA. |

### 5.2 AWS IAM Roles

| IAM Role                      | Purpose                                          | Assigned To                                   |
|-------------------------------|--------------------------------------------------|-----------------------------------------------|
| `swipesavvy-app-role`         | EC2 instance role for application runtime        | Production EC2 instances (automated)          |
| `swipesavvy-deploy-role`      | CI/CD deployment permissions                     | GitHub Actions (OIDC federation)              |
| `swipesavvy-admin-role`       | Infrastructure administration                    | Super Admin personnel (MFA required)          |
| `swipesavvy-readonly-role`    | Read-only access for monitoring and auditing     | Admin personnel, compliance auditors          |
| `swipesavvy-dba-role`         | Database administration (RDS)                    | Database administrators (MFA required)        |
| `swipesavvy-security-audit`   | CloudTrail, GuardDuty, SecurityHub read access   | CISO, security team                           |

All IAM roles follow AWS best practices: no inline policies, no wildcard (`*`) resource permissions in production, and all policies are version-controlled in Terraform.

> **ISO 27001 Ref**: A.8.2 -- Privileged access rights.

## 6. Authentication Requirements

### 6.1 End-User Authentication

| Control                          | Standard                                                     |
|----------------------------------|--------------------------------------------------------------|
| Primary authentication           | Email + password                                             |
| Access token format              | JWT (HS256), 1-hour expiration                               |
| Refresh token                    | 30-day expiration, single-use, rotated on each use           |
| Token storage (iOS)              | Secure Keychain with `kSecAttrAccessibleWhenUnlocked`        |
| Token storage (Android)          | EncryptedSharedPreferences backed by Android Keystore        |
| Account lockout                  | 5 failed attempts triggers 30-minute lockout                 |
| OTP verification                 | Required for new device registration, password reset, and sensitive account changes |
| OTP delivery                     | Email via AWS SES/SNS, 6-digit code, 15-minute expiration    |

### 6.2 Administrative Authentication

| Control                          | Standard                                                     |
|----------------------------------|--------------------------------------------------------------|
| Primary authentication           | Email + password (12+ characters, complexity enforced)       |
| Multi-factor authentication      | **Required** for all Admin and Super Admin access            |
| MFA method                       | Time-based OTP (TOTP) via authenticator app, or hardware key (FIDO2/WebAuthn) |
| Session timeout                  | 1-hour inactivity timeout for administrative sessions        |
| AWS Console access               | MFA required; enforced via IAM policy condition `aws:MultiFactorAuthPresent` |
| SSH/SSM access to EC2            | AWS Systems Manager Session Manager only (no direct SSH); Super Admin role required |
| Database access (RDS)            | IAM database authentication or password via Secrets Manager; Super Admin or DBA role required |

> **PCI DSS 4.0 Ref**: Requirement 8.4.1 -- MFA is implemented for all non-console access into the CDE for personnel with administrative access.
> **PCI DSS 4.0 Ref**: Requirement 8.4.2 -- MFA is implemented for all access into the CDE.

## 7. Session Management

| Control                          | Application               | Standard                                       |
|----------------------------------|---------------------------|-------------------------------------------------|
| Access token lifetime            | Mobile app, API           | 1 hour (3,600 seconds)                          |
| Refresh token lifetime           | Mobile app                | 30 days                                         |
| Admin session timeout            | Admin portal              | 1 hour inactivity, 8 hours absolute maximum     |
| AWS Console session              | AWS IAM                   | 1 hour (configurable up to 12 hours for role assumption; 1 hour enforced for CDE access) |
| Concurrent session limit         | Admin portal              | 1 active session per admin user                 |
| Session termination on logout    | All applications          | Token revoked server-side, refresh token invalidated |
| Session termination on password change | All applications    | All existing sessions invalidated               |

### 7.1 Token Revocation

- A server-side token revocation list is maintained in ElastiCache Redis with TTL matching the access token expiration.
- Upon logout, password change, account lockout, or administrative action, the user's active tokens are added to the revocation list.
- API middleware validates each request against the revocation list before processing.

> **SOC 2 Ref**: CC6.1 -- The entity implements logical access security software, infrastructure, and architectures over protected information assets.

## 8. Privileged Access Management (PAM)

### 8.1 Requirements

- All privileged accounts (Super Admin, DBA, AWS root) are inventoried and tracked in the access management system.
- The AWS root account is secured with MFA (hardware token) and is not used for routine operations. Root account credentials are stored in a physical safe accessible only to the CEO and CISO.
- Privileged access is granted through formal request and approval by the CISO or VP of Engineering.
- Privileged sessions are logged in their entirety via AWS CloudTrail and application audit logs.

### 8.2 Privileged Access Restrictions

| Restriction                    | Requirement                                                      |
|--------------------------------|------------------------------------------------------------------|
| Shared accounts                | **Prohibited.** All access must use individual, uniquely identifiable accounts. |
| Generic/service accounts       | Permitted only for automated processes (e.g., CI/CD). Must not be used interactively. Credentials stored in AWS Secrets Manager with 90-day rotation. |
| Vendor/contractor access       | Time-bound, documented, and revoked upon contract termination. MFA required. |
| Emergency/break-glass access   | Available for critical incidents only. Requires CISO approval. Usage is automatically alerted and logged. Access is revoked within 24 hours of incident resolution. |

> **PCI DSS 4.0 Ref**: Requirement 8.2.1 -- All users are assigned a unique ID before being allowed to access system components or cardholder data.
> **PCI DSS 4.0 Ref**: Requirement 8.2.2 -- Group, shared, or generic accounts are not used.

## 9. Access Reviews

### 9.1 Quarterly Access Reviews

Access reviews are conducted quarterly to verify that all access rights remain appropriate and aligned with current job responsibilities.

| Review Area                    | Reviewer                 | Frequency  | Documentation Required            |
|--------------------------------|--------------------------|------------|-----------------------------------|
| Application roles (User, Admin, Super Admin) | CISO or delegate | Quarterly  | Review log with findings and actions |
| AWS IAM users and roles        | DevOps Lead + CISO       | Quarterly  | IAM credential report analysis    |
| Database access (RDS)          | DBA Lead + CISO          | Quarterly  | Active user list comparison       |
| Third-party integrations       | Compliance Officer       | Quarterly  | Vendor access inventory           |
| GitHub repository access       | VP of Engineering        | Quarterly  | Collaborator and team audit       |
| Authorize.Net merchant portal  | Finance Lead + CISO      | Quarterly  | Active user list review           |
| FIS Global admin console       | Operations Lead + CISO   | Quarterly  | Active user list review           |

### 9.2 Review Process

1. The access management system generates a report of all current access rights.
2. The designated reviewer compares current access against approved role assignments and job functions.
3. Discrepancies are documented and remediated within 10 business days.
4. Access for terminated or transferred employees is verified as revoked.
5. Review results and remediation actions are retained for 3 years for audit purposes.

> **PCI DSS 4.0 Ref**: Requirement 7.2.4 -- All user accounts and related access privileges are reviewed at least once every six months. (SwipeSavvy exceeds this with quarterly reviews.)
> **ISO 27001 Ref**: A.5.18 -- Access rights.

## 10. Access Provisioning and Deprovisioning

### 10.1 Provisioning (Onboarding)

| Step | Action                                                                | Timeline           |
|------|-----------------------------------------------------------------------|---------------------|
| 1    | Manager submits access request specifying role and business justification | Before start date  |
| 2    | CISO or delegate approves the access request                          | Within 2 business days |
| 3    | IT provisions accounts with the approved role and minimum required access | Day 1 of employment |
| 4    | User completes security awareness training                            | Within 30 days      |
| 5    | MFA enrollment (for Admin/Super Admin roles)                          | Day 1               |

### 10.2 Deprovisioning (Offboarding)

| Step | Action                                                                | Timeline           |
|------|-----------------------------------------------------------------------|---------------------|
| 1    | HR notifies IT of employment termination or contract end              | Same day as termination |
| 2    | All application access is revoked (tokens invalidated, passwords disabled) | Within 1 hour of notification |
| 3    | AWS IAM credentials are deactivated and access keys deleted           | Within 1 hour       |
| 4    | VPN and remote access credentials are revoked                         | Within 1 hour       |
| 5    | GitHub access is removed                                              | Within 1 hour       |
| 6    | Third-party integration access is revoked (Authorize.Net, FIS Global) | Within 24 hours     |
| 7    | Manager confirms complete deprovisioning                              | Within 2 business days |

For involuntary terminations, all access revocation occurs simultaneously with the termination meeting.

> **SOC 2 Ref**: CC6.2 -- Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.
> **SOC 2 Ref**: CC6.3 -- The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets.

## 11. Remote Access

- Remote access to production systems is permitted only through AWS Systems Manager Session Manager or VPN with MFA.
- Direct SSH access to production EC2 instances is disabled; all remote sessions route through Session Manager.
- Remote access sessions are logged and monitored.
- Public-facing administrative interfaces are prohibited; admin access is restricted to internal network or VPN.

> **PCI DSS 4.0 Ref**: Requirement 8.4.3 -- MFA is implemented for all remote network access originating from outside the entity's network.

## 12. Responsibilities

| Role                           | Responsibility                                                   |
|--------------------------------|------------------------------------------------------------------|
| CISO                           | Policy ownership, access review oversight, privileged access approval |
| VP of Engineering              | Technical implementation of access controls                      |
| HR                             | Timely notification of onboarding/offboarding events             |
| Managers                       | Submitting access requests, validating access during reviews     |
| IT Operations                  | Provisioning, deprovisioning, and access control system maintenance |
| All Users                      | Protecting credentials, reporting unauthorized access, complying with this policy |

## 13. Policy Violations

Violations of this policy may result in immediate access revocation, disciplinary action up to and including termination, and potential legal action. Violations involving unauthorized access to cardholder data must be escalated to the CISO and may trigger regulatory notification obligations under PCI DSS.

## 14. Related Documents

| Document                              | Location                                                      |
|---------------------------------------|---------------------------------------------------------------|
| Information Security Policy           | `docs/security/policies/INFORMATION-SECURITY-POLICY.md`      |
| Data Retention and Disposal Policy    | `docs/security/policies/DATA-RETENTION-DISPOSAL-POLICY.md`   |
| Change Management Policy              | `docs/security/policies/CHANGE-MANAGEMENT-POLICY.md`         |
| Incident Response Plan                | `docs/security/INCIDENT-RESPONSE-PLAN.md`                    |

## 15. Revision History

| Version | Date       | Author        | Description              |
|---------|------------|---------------|--------------------------|
| 1.0     | 2026-02-18 | CISO Office   | Initial policy release   |
