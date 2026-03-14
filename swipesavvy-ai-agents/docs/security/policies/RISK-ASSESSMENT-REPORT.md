# Risk Assessment Report

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| **Document Owner** | Chief Information Security Officer (CISO)          |
| **Last Updated**   | 2026-02-18                                         |
| **Review Cadence** | Annual (next review: 2027-02-18)                   |
| **Classification** | Internal -- Confidential                           |
| **Version**        | 1.0                                                |
| **Approval**       | CTO, CISO, VP of Engineering, Compliance Officer   |

---

## 1. Purpose

This report documents the results of SwipeSavvy's annual information security risk assessment. It identifies threats to the confidentiality, integrity, and availability of SwipeSavvy systems and data, evaluates the likelihood and impact of those threats, and establishes a risk treatment plan aligned with the organization's risk appetite.

## 2. Scope

This assessment covers all information assets within the SwipeSavvy production environment:

- Backend API services (FastAPI/Python on AWS EC2)
- Data stores (RDS PostgreSQL, ElastiCache Redis)
- Mobile applications (iOS/SwiftUI, Android/Kotlin Compose)
- Network infrastructure (VPC, ALB, CloudFront, Route 53)
- Third-party integrations (Authorize.Net, FIS Global Payment One, Plaid, Together.AI)
- Authentication and authorization systems (JWT HS256, OTP)
- AWS Account 858955002750, Region us-east-1

## 3. Compliance References

| Framework       | Requirement                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| PCI DSS 4.0     | Req 12.3.1 -- Perform a targeted risk analysis for each PCI DSS requirement |
| PCI DSS 4.0     | Req 6.3.1 -- Identify security vulnerabilities through a risk-based process |
| PCI DSS 4.0     | Req 12.3.2 -- Perform targeted risk analysis for customized approach        |
| SOC 2           | CC3.1 -- The entity specifies suitable objectives related to risk           |
| SOC 2           | CC3.2 -- The entity identifies risks to the achievement of its objectives   |
| SOC 2           | CC3.3 -- The entity considers the potential for fraud                       |
| SOC 2           | CC3.4 -- The entity identifies and assesses changes that could impact controls |
| ISO 27001       | 6.1.2 -- Information security risk assessment                              |
| ISO 27001       | 6.1.3 -- Information security risk treatment                               |
| ISO 27001       | 8.2 -- Information security risk assessment execution                      |
| ISO 27001       | 8.3 -- Information security risk treatment execution                       |

## 4. Methodology

### 4.1 Framework

This assessment follows the **NIST Special Publication 800-30 Revision 1** ("Guide for Conducting Risk Assessments") methodology, supplemented by the STRIDE threat modeling framework for application-layer threat analysis.

### 4.2 Risk Calculation

**Risk = Likelihood x Impact**

| Rating | Likelihood Definition                      | Impact Definition                              |
|--------|--------------------------------------------|------------------------------------------------|
| 1      | Rare -- unlikely to occur within 3 years   | Negligible -- minimal operational effect       |
| 2      | Unlikely -- may occur once in 3 years      | Minor -- limited disruption, no data loss      |
| 3      | Possible -- may occur once per year        | Moderate -- partial service outage, limited data exposure |
| 4      | Likely -- expected to occur multiple times per year | Major -- extended outage, significant data exposure |
| 5      | Almost Certain -- expected frequently      | Critical -- complete service loss, large-scale data breach |

### 4.3 Risk Rating Thresholds

| Composite Score | Risk Level | Treatment Requirement                             |
|-----------------|------------|---------------------------------------------------|
| 1 -- 4          | Low        | Accept with monitoring                            |
| 5 -- 9          | Medium     | Mitigate within 90 days                           |
| 10 -- 15        | High       | Mitigate within 30 days; executive notification   |
| 16 -- 25        | Critical   | Immediate action; executive escalation required   |

## 5. Asset Inventory

### 5.1 Critical Assets (Tier 1)

| Asset ID | Asset                        | Data Classification | Owner               |
|----------|------------------------------|---------------------|----------------------|
| A-001    | RDS PostgreSQL (Primary)     | Restricted          | Database Engineering |
| A-002    | Cardholder Data Environment  | Restricted          | Payments Team        |
| A-003    | JWT Signing Secrets          | Restricted          | Platform Engineering |
| A-004    | User PII (names, emails, SSN)| Restricted          | Backend Engineering  |
| A-005    | Payment Processor API Keys   | Restricted          | Payments Team        |

### 5.2 Important Assets (Tier 2)

| Asset ID | Asset                        | Data Classification | Owner               |
|----------|------------------------------|---------------------|----------------------|
| A-006    | EC2 Application Servers      | Confidential        | Platform Engineering |
| A-007    | ElastiCache Redis Cluster    | Confidential        | Platform Engineering |
| A-008    | CloudFront Distribution      | Internal            | Platform Engineering |
| A-009    | AWS IAM Credentials          | Restricted          | Platform Engineering |
| A-010    | Mobile App Binaries          | Internal            | Mobile Engineering   |

### 5.3 Supporting Assets (Tier 3)

| Asset ID | Asset                        | Data Classification | Owner               |
|----------|------------------------------|---------------------|----------------------|
| A-011    | CloudWatch Logs              | Confidential        | SRE Team             |
| A-012    | Terraform State Files        | Confidential        | Platform Engineering |
| A-013    | CI/CD Pipeline               | Confidential        | DevOps Team          |
| A-014    | Admin Dashboard              | Confidential        | Product Engineering  |

## 6. Threat Analysis (STRIDE Model)

| STRIDE Category       | Threat Description                                          | Affected Assets       |
|-----------------------|-------------------------------------------------------------|-----------------------|
| **S**poofing          | Credential theft via phishing targeting employees           | A-003, A-005, A-009   |
| **S**poofing          | JWT token forgery or replay attacks                         | A-003                 |
| **T**ampering         | Man-in-the-middle attack on API traffic                     | A-006, A-008          |
| **T**ampering         | Database record modification by compromised application     | A-001, A-004          |
| **R**epudiation       | Insufficient audit logging allowing deniable actions        | A-011                 |
| **I**nformation Disclosure | SQL injection exposing cardholder data or PII          | A-001, A-002, A-004   |
| **I**nformation Disclosure | Insecure API endpoint exposing sensitive data           | A-004, A-006          |
| **D**enial of Service | DDoS attack against API endpoints or CloudFront            | A-006, A-008          |
| **D**enial of Service | Resource exhaustion via malicious API calls                | A-006, A-007          |
| **E**levation of Privilege | Broken access control allowing unauthorized admin access | A-006, A-014         |

## 7. Risk Register

| ID   | Risk Description                                               | Likelihood | Impact | Score | Level    | Treatment  | Owner               |
|------|----------------------------------------------------------------|------------|--------|-------|----------|------------|----------------------|
| R-001| SQL injection attack against backend API endpoints             | 2          | 5      | 10    | High     | Mitigate   | Backend Engineering  |
| R-002| JWT signing secret compromise via Secrets Manager misconfiguration | 2       | 5      | 10    | High     | Mitigate   | Platform Engineering |
| R-003| DDoS attack exceeding CloudFront/ALB mitigation capacity       | 3          | 4      | 12    | High     | Mitigate   | SRE Team             |
| R-004| Phishing attack compromising employee AWS IAM credentials      | 3          | 5      | 15    | High     | Mitigate   | Security Team        |
| R-005| Third-party vendor breach (FIS Global, Authorize.Net)          | 2          | 5      | 10    | High     | Transfer   | Compliance           |
| R-006| RDS PostgreSQL data corruption or loss                         | 2          | 4      | 8     | Medium   | Mitigate   | Database Engineering |
| R-007| Mobile app reverse engineering exposing API keys               | 3          | 3      | 9     | Medium   | Mitigate   | Mobile Engineering   |
| R-008| Insecure direct object reference (IDOR) in API endpoints       | 3          | 4      | 12    | High     | Mitigate   | Backend Engineering  |
| R-009| ElastiCache Redis unauthorized access via misconfigured security group | 2   | 4      | 8     | Medium   | Mitigate   | Platform Engineering |
| R-010| Insufficient logging allowing undetected malicious activity    | 2          | 4      | 8     | Medium   | Mitigate   | SRE Team             |
| R-011| Insider threat -- malicious or negligent employee action       | 2          | 4      | 8     | Medium   | Mitigate   | Security Team        |
| R-012| Authorize.Net webhook spoofing due to HMAC validation bypass   | 2          | 4      | 8     | Medium   | Mitigate   | Payments Team        |
| R-013| AWS region-wide outage impacting all production services       | 1          | 5      | 5     | Medium   | Mitigate   | Platform Engineering |
| R-014| Non-compliance with PCI DSS 4.0 new requirements (March 2025 deadline) | 2  | 5      | 10    | High     | Mitigate   | Compliance           |

## 8. Vulnerability Assessment Summary

The following vulnerability categories were identified during the most recent assessment cycle:

| Category                          | Findings | Critical | High | Medium | Low |
|-----------------------------------|----------|----------|------|--------|-----|
| Web Application (DAST)            | 12       | 0        | 2    | 6      | 4   |
| Infrastructure (AWS Config)       | 8        | 0        | 1    | 4      | 3   |
| Dependency Scanning (SCA)         | 15       | 1        | 3    | 7      | 4   |
| Container/AMI Scanning            | 6        | 0        | 1    | 3      | 2   |
| Mobile Application (iOS/Android)  | 9        | 0        | 2    | 4      | 3   |
| **Total**                         | **50**   | **1**    | **9**| **24** | **16**|

**Critical Finding**: One critical dependency vulnerability (CVE pending) in a transitive Python dependency. Remediation in progress with expected patch deployment within 7 days.

## 9. Risk Treatment Plan

### 9.1 Treatment Strategies

| Strategy   | Application                                                     |
|------------|-----------------------------------------------------------------|
| **Mitigate** | Implement controls to reduce likelihood or impact of the risk |
| **Transfer** | Transfer risk through insurance or vendor contractual obligations |
| **Accept**   | Acknowledge the risk with executive approval; monitor ongoing  |
| **Avoid**    | Eliminate the risk by removing the risk source                 |

### 9.2 Treatment Actions for High-Rated Risks

| Risk ID | Treatment Action                                                              | Target Date | Status      |
|---------|-------------------------------------------------------------------------------|-------------|-------------|
| R-001   | Implement parameterized queries audit; deploy SQLAlchemy ORM enforcement      | 2026-03-15  | In Progress |
| R-002   | Enforce Secrets Manager resource policy; enable automatic rotation            | 2026-03-01  | In Progress |
| R-003   | Enable AWS Shield Advanced; configure CloudFront WAF rate limiting            | 2026-03-15  | Planned     |
| R-004   | Enforce MFA on all IAM users; deploy phishing-resistant FIDO2 keys           | 2026-04-01  | Planned     |
| R-005   | Negotiate enhanced breach notification SLAs; increase cyber insurance coverage| 2026-04-15  | Planned     |
| R-008   | Implement object-level authorization middleware; add IDOR-specific test suite | 2026-03-15  | In Progress |
| R-014   | Complete PCI DSS 4.0 gap analysis; remediate identified gaps                 | 2026-03-31  | In Progress |

## 10. Residual Risk Assessment

After implementation of all planned treatment actions, the following residual risk profile is projected:

| Risk ID | Inherent Score | Residual Likelihood | Residual Impact | Residual Score | Residual Level |
|---------|----------------|---------------------|-----------------|----------------|----------------|
| R-001   | 10             | 1                   | 5               | 5              | Medium         |
| R-002   | 10             | 1                   | 5               | 5              | Medium         |
| R-003   | 12             | 2                   | 3               | 6              | Medium         |
| R-004   | 15             | 1                   | 5               | 5              | Medium         |
| R-005   | 10             | 2                   | 4               | 8              | Medium         |
| R-006   | 8              | 1                   | 4               | 4              | Low            |
| R-007   | 9              | 2                   | 3               | 6              | Medium         |
| R-008   | 12             | 1                   | 4               | 4              | Low            |
| R-009   | 8              | 1                   | 4               | 4              | Low            |
| R-010   | 8              | 1                   | 4               | 4              | Low            |
| R-011   | 8              | 2                   | 3               | 6              | Medium         |
| R-012   | 8              | 1                   | 4               | 4              | Low            |
| R-013   | 5              | 1                   | 4               | 4              | Low            |
| R-014   | 10             | 1                   | 4               | 4              | Low            |

**Residual Risk Summary**: All risks are projected to be reduced to Medium or Low following treatment plan execution. No Critical or High residual risks remain. The overall risk posture is within the organization's defined risk appetite.

## 11. Risk Appetite Statement

SwipeSavvy accepts a **low to moderate** risk appetite for information security risks. The organization does not accept:

- Any Critical-rated residual risks.
- High-rated residual risks persisting beyond 30 days without an approved exception.
- Any risk that would result in unauthorized disclosure of cardholder data.
- Any risk that would cause non-compliance with PCI DSS, SOC 2, or ISO 27001 requirements.

## 12. Next Steps

1. Execute all treatment actions per the target dates in Section 9.2.
2. Conduct quarterly risk register reviews with the Security Steering Committee.
3. Perform targeted risk assessments for any new system integrations or significant architecture changes.
4. Schedule the next annual comprehensive risk assessment for Q1 2027.
5. Incorporate findings from upcoming PCI DSS 4.0 QSA assessment into the risk register.

## 13. Document History

| Version | Date       | Author         | Description                            |
|---------|------------|----------------|----------------------------------------|
| 1.0     | 2026-02-18 | CISO           | Initial annual risk assessment report  |
