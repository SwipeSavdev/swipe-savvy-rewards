# Information Security Policy

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

This policy establishes the information security requirements for SwipeSavvy, a mobile wallet fintech platform. It defines the controls, standards, and responsibilities necessary to protect the confidentiality, integrity, and availability of SwipeSavvy's information assets, customer data, and payment infrastructure.

## 2. Scope

This policy applies to:

- All SwipeSavvy employees, contractors, and third-party service providers
- All information systems, including the FastAPI/Python backend, iOS (SwiftUI) and Android (Kotlin/Compose) mobile applications, and supporting AWS infrastructure (EC2, RDS PostgreSQL, ElastiCache Redis, ALB, CloudFront)
- All payment processing integrations with Authorize.Net and FIS Global Payment One
- All environments: development, staging, and production (AWS Account 858955002750, us-east-1)

## 3. Regulatory and Standards Alignment

| Requirement                  | Reference                                           |
|------------------------------|-----------------------------------------------------|
| PCI DSS 4.0                  | Requirements 1-12 (all applicable)                  |
| SOC 2                        | CC6.1 (Logical and Physical Access Controls)        |
| SOC 2                        | CC6.6 (Security Measures Against Threats)           |
| SOC 2                        | CC6.7 (Transmission Security)                       |
| ISO 27001:2022               | A.5.1 (Policies for Information Security)           |
| ISO 27001:2022               | A.8.1 (User Endpoint Devices)                       |
| ISO 27001:2022               | A.8.24 (Use of Cryptography)                        |

## 4. Data Classification

All information assets must be classified according to the following scheme. Classification determines handling, storage, encryption, and access requirements.

| Classification  | Description                                                                 | Examples                                                    | Handling Requirements                             |
|-----------------|-----------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------|
| **Restricted**  | Highest sensitivity. Unauthorized disclosure causes severe harm.            | Cardholder data (CHD), encryption keys, API secrets         | Encrypted at rest and in transit, access logged, need-to-know only |
| **Confidential**| Sensitive business or personal data. Disclosure causes significant harm.    | PII (name, email, SSN), financial records, audit logs       | Encrypted at rest and in transit, role-based access |
| **Internal**    | Non-public information intended for internal use.                           | Architecture docs, internal policies, meeting notes         | Access restricted to employees, no public sharing |
| **Public**      | Information approved for external distribution.                             | Marketing content, public API documentation, press releases | No restrictions on distribution                   |

Data owners are responsible for assigning classifications at the time of creation. The default classification for unclassified data is **Internal**.

> **PCI DSS 4.0 Ref**: Requirement 3.2 -- Do not store sensitive authentication data after authorization.
> **ISO 27001 Ref**: A.5.12 -- Classification of information.

## 5. Acceptable Use

### 5.1 General Requirements

- Company information systems shall be used for authorized business purposes only.
- Users must not attempt to bypass security controls, access unauthorized systems, or share credentials.
- Personal devices used for business must comply with the mobile device management (MDM) policy.

### 5.2 Prohibited Activities

- Storage of cardholder data (CHD) in unencrypted form on any endpoint or local system.
- Transmission of Restricted or Confidential data over unencrypted channels.
- Installation of unauthorized software on production or staging systems.
- Use of production credentials in development or testing environments.
- Sharing of JWT tokens, API keys, or OTP codes with unauthorized individuals.

> **SOC 2 Ref**: CC6.8 -- Controls to prevent or detect unauthorized or malicious software.

## 6. Access Control

### 6.1 Principles

All access to SwipeSavvy systems is governed by the principle of least privilege. Users are granted only the minimum access necessary to perform their job functions.

### 6.2 Authentication Standards

| Control                          | Standard                                                              |
|----------------------------------|-----------------------------------------------------------------------|
| Access tokens                    | JWT (HS256), 1-hour expiration                                        |
| Refresh tokens                   | 30-day expiration, single-use, stored in HttpOnly secure cookies      |
| Multi-factor authentication      | Required for all administrative access (OTP via email)                |
| Service-to-service authentication| API keys rotated every 90 days, stored in AWS Secrets Manager         |

### 6.3 Role-Based Access Control

Access is managed through three defined roles: User, Admin, and Super Admin. Role assignments require managerial approval and are subject to quarterly access reviews.

> **PCI DSS 4.0 Ref**: Requirement 7.1 -- Restrict access to system components and cardholder data by business need to know.
> **ISO 27001 Ref**: A.5.15 -- Access control.

## 7. Encryption Standards

### 7.1 Data at Rest

| Asset                            | Encryption Standard                                                   |
|----------------------------------|-----------------------------------------------------------------------|
| RDS PostgreSQL databases         | AES-256 via AWS KMS (Customer Managed Key)                            |
| ElastiCache Redis                | AES-256 encryption at rest enabled                                    |
| S3 buckets                       | AES-256 (SSE-S3 or SSE-KMS)                                          |
| EBS volumes                      | AES-256 via AWS KMS                                                   |
| Mobile app local storage         | iOS Keychain (AES-256-GCM) / Android Keystore (AES-256-GCM)          |

### 7.2 Data in Transit

| Channel                         | Encryption Standard                                                    |
|----------------------------------|------------------------------------------------------------------------|
| Client to ALB/CloudFront         | TLS 1.2 minimum (TLS 1.3 preferred)                                   |
| ALB to EC2 backend               | TLS 1.2 minimum                                                       |
| Backend to RDS PostgreSQL        | TLS 1.2 with certificate verification                                  |
| Backend to ElastiCache Redis     | TLS 1.2 in-transit encryption                                          |
| Backend to Authorize.Net         | TLS 1.2 minimum (PCI DSS compliant)                                   |
| Backend to FIS Global            | TLS 1.2 minimum with mutual TLS (mTLS) where supported                |
| AWS SNS push notifications       | TLS 1.2 to APNs/FCM                                                   |

### 7.3 Key Management

- Encryption keys are managed via AWS Key Management Service (KMS).
- Key rotation is enabled with automatic annual rotation for KMS Customer Managed Keys.
- Access to key management operations is restricted to the Super Admin role and logged via AWS CloudTrail.

> **PCI DSS 4.0 Ref**: Requirement 3.5 -- Protect stored account data. Requirement 4.2 -- Protect PAN with strong cryptography during transmission.
> **ISO 27001 Ref**: A.8.24 -- Use of cryptography.

## 8. Password Policy

| Control                          | Standard                                                              |
|----------------------------------|-----------------------------------------------------------------------|
| Minimum length                   | 12 characters                                                         |
| Complexity                       | Uppercase, lowercase, numeric, and special character required         |
| Password history                 | Last 12 passwords may not be reused                                   |
| Lockout threshold                | 5 failed attempts triggers 30-minute lockout                          |
| Admin password rotation          | Every 90 days                                                         |
| User password rotation           | Every 180 days (encouraged, not enforced)                             |
| Service account credentials      | Rotated every 90 days, stored in AWS Secrets Manager                  |

> **PCI DSS 4.0 Ref**: Requirement 8.3 -- Establish and manage identity and authentication for users and administrators.
> **SOC 2 Ref**: CC6.1 -- Logical and physical access controls.

## 9. Network Security

- Production VPC is segmented with public subnets (ALB), private subnets (EC2, ElastiCache), and isolated subnets (RDS).
- Security groups enforce least-privilege network access between tiers.
- AWS WAF is deployed on CloudFront and ALB to filter malicious traffic.
- All ingress and egress traffic is logged via VPC Flow Logs and retained per the Data Retention and Disposal Policy.

> **PCI DSS 4.0 Ref**: Requirement 1.2 -- Network security controls are configured and maintained.

## 10. Vulnerability Management

- Automated vulnerability scanning is performed weekly on all production systems.
- Critical vulnerabilities (CVSS 9.0+) must be remediated within 24 hours.
- High vulnerabilities (CVSS 7.0-8.9) must be remediated within 7 days.
- Medium vulnerabilities (CVSS 4.0-6.9) must be remediated within 30 days.
- Dependency scanning (Dependabot, Snyk) runs on every pull request.

> **PCI DSS 4.0 Ref**: Requirement 6.3 -- Security vulnerabilities are identified and addressed.
> **ISO 27001 Ref**: A.8.8 -- Management of technical vulnerabilities.

## 11. Incident Response

All security incidents must be handled in accordance with the SwipeSavvy Incident Response Plan (see `docs/security/INCIDENT-RESPONSE-PLAN.md`). Incidents involving cardholder data must be escalated to the CISO and reported to the payment brands within the timeframes prescribed by PCI DSS.

> **PCI DSS 4.0 Ref**: Requirement 12.10 -- Security incidents are responded to immediately.

## 12. Training and Awareness

- All employees must complete security awareness training within 30 days of onboarding and annually thereafter.
- Developers must complete secure coding training covering OWASP Top 10 annually.
- Personnel with access to cardholder data must complete PCI DSS-specific training annually.

> **PCI DSS 4.0 Ref**: Requirement 12.6 -- Security awareness education.
> **ISO 27001 Ref**: A.6.3 -- Information security awareness, education, and training.

## 13. Policy Violations

Violations of this policy may result in disciplinary action up to and including termination of employment or contract. Violations involving cardholder data may also trigger regulatory reporting obligations.

## 14. Related Documents

| Document                              | Location                                                      |
|---------------------------------------|---------------------------------------------------------------|
| Incident Response Plan                | `docs/security/INCIDENT-RESPONSE-PLAN.md`                    |
| Access Control Policy                 | `docs/security/policies/ACCESS-CONTROL-POLICY.md`            |
| Data Retention and Disposal Policy    | `docs/security/policies/DATA-RETENTION-DISPOSAL-POLICY.md`   |
| Change Management Policy              | `docs/security/policies/CHANGE-MANAGEMENT-POLICY.md`         |

## 15. Revision History

| Version | Date       | Author        | Description              |
|---------|------------|---------------|--------------------------|
| 1.0     | 2026-02-18 | CISO Office   | Initial policy release   |
