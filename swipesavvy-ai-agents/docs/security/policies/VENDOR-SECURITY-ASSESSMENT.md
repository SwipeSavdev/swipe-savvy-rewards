# Vendor Security Assessment Policy

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| **Document Owner** | Chief Information Security Officer (CISO)          |
| **Last Updated**   | 2026-02-18                                         |
| **Review Cadence** | Annual (next review: 2027-02-18)                   |
| **Classification** | Internal -- Confidential                           |
| **Version**        | 1.0                                                |
| **Approval**       | VP of Engineering, CISO, General Counsel           |

---

## 1. Purpose

This policy defines the security assessment requirements, risk scoring methodology, and ongoing monitoring obligations for all third-party vendors that process, store, or transmit SwipeSavvy data. It ensures that vendor relationships do not introduce unacceptable risk to the cardholder data environment (CDE) or the broader SwipeSavvy platform.

## 2. Scope

This policy applies to all third-party vendors, service providers, and subprocessors that:

- Access, process, or store SwipeSavvy customer data, including cardholder data and PII.
- Provide infrastructure, platform, or software services critical to SwipeSavvy operations.
- Integrate with SwipeSavvy systems via API, SDK, or data feed.

## 3. Compliance References

| Framework       | Requirement                                                                  |
|-----------------|------------------------------------------------------------------------------|
| PCI DSS 4.0     | Req 12.8 -- Manage service providers with whom account data is shared        |
| PCI DSS 4.0     | Req 12.8.2 -- Maintain written agreements with service providers             |
| PCI DSS 4.0     | Req 12.8.4 -- Monitor service providers' PCI DSS compliance status           |
| PCI DSS 4.0     | Req 12.8.5 -- Maintain information about PCI DSS requirements managed by each provider |
| SOC 2           | CC2.3 -- Communication with external parties                                |
| SOC 2           | CC3.2 -- Risk assessment includes identification of vendor risks             |
| SOC 2           | CC9.2 -- Risk mitigation through vendor management                           |
| ISO 27001       | A.5.19 -- Information security in supplier relationships                     |
| ISO 27001       | A.5.20 -- Addressing information security within supplier agreements         |
| ISO 27001       | A.5.21 -- Managing information security in the ICT supply chain              |
| ISO 27001       | A.5.22 -- Monitoring, review, and change management of supplier services     |

## 4. Vendor Inventory

### 4.1 Critical Vendors

| Vendor              | Service Category       | Data Access Level | PCI Scope | Risk Tier |
|---------------------|------------------------|-------------------|-----------|-----------|
| AWS                 | Cloud Infrastructure   | Full platform      | Yes       | Tier 1    |
| FIS Global          | Card Issuing (Payment One) | Cardholder data | Yes       | Tier 1    |
| Authorize.Net       | Payment Processing     | Transaction data   | Yes       | Tier 1    |
| Plaid               | Bank Account Linking   | Financial account data | No   | Tier 1    |
| Together.AI         | AI/ML Inference        | Anonymized user data | No     | Tier 2    |

### 4.2 Vendor Risk Tiers

| Tier   | Criteria                                                        | Assessment Frequency |
|--------|-----------------------------------------------------------------|----------------------|
| Tier 1 | Processes cardholder data, PII, or provides critical infrastructure | Annually + continuous monitoring |
| Tier 2 | Accesses non-sensitive operational data or provides non-critical services | Annually             |
| Tier 3 | No data access; provides ancillary tools or services            | Biennial             |

## 5. Vendor Risk Scoring Matrix

Each vendor is evaluated across five domains, scored 1 (low risk) to 5 (critical risk):

| Domain                        | Weight | Scoring Criteria                                              |
|-------------------------------|--------|---------------------------------------------------------------|
| Data Sensitivity              | 30%    | Type and volume of SwipeSavvy data accessed                   |
| Security Posture              | 25%    | SOC 2/ISO 27001 status, pentest results, vulnerability management |
| Operational Dependency        | 20%    | Impact of vendor outage on SwipeSavvy services                |
| Regulatory Compliance         | 15%    | PCI DSS attestation, GDPR compliance, state privacy laws     |
| Financial Stability           | 10%    | Credit rating, revenue trends, M&A risk                      |

**Composite Risk Score Calculation**: `Sum(Domain Score x Weight)` rounded to one decimal.

| Composite Score | Risk Rating | Action Required                                             |
|-----------------|-------------|-------------------------------------------------------------|
| 1.0 -- 2.0     | Low         | Standard monitoring; annual review                          |
| 2.1 -- 3.0     | Moderate    | Enhanced monitoring; semi-annual review                     |
| 3.1 -- 4.0     | High        | Quarterly review; compensating controls required            |
| 4.1 -- 5.0     | Critical    | Executive escalation; remediation plan within 30 days       |

## 6. Assessment Requirements by Vendor

### 6.1 AWS (Cloud Infrastructure -- Tier 1)

- **Required Artifacts**: SOC 2 Type II report, SOC 3 public report, PCI DSS AOC (Level 1 Service Provider), ISO 27001 certificate.
- **Shared Responsibility Model**: Document SwipeSavvy responsibilities for IAM, network security, encryption, and logging within the AWS shared responsibility model.
- **Review Focus**: Verify encryption at rest (KMS CMK), VPC segmentation, CloudTrail logging, GuardDuty findings.
- **Fourth-Party Risk**: Review AWS sub-processor list annually via the AWS Data Privacy FAQ.

### 6.2 FIS Global -- Payment One (Card Issuing -- Tier 1)

- **Required Artifacts**: PCI DSS AOC (Level 1 Service Provider), SOC 2 Type II report, penetration test executive summary.
- **Review Focus**: Cardholder data handling procedures, tokenization implementation, incident notification SLA (must be < 24 hours).
- **Data Processing Agreement**: Must include data retention limits, breach notification within 24 hours, and right to audit.
- **Fourth-Party Risk**: Identify and assess any sub-processors handling card data on behalf of FIS Global.

### 6.3 Authorize.Net (Payment Processing -- Tier 1)

- **Required Artifacts**: PCI DSS AOC (Level 1 Service Provider), SOC 2 Type II report.
- **Review Focus**: Transaction data encryption, webhook HMAC signature verification, fraud detection capabilities.
- **Integration Security**: Validate that no raw card numbers traverse SwipeSavvy servers. Note: SwipeSavvy does not process in-app payments.
- **Fourth-Party Risk**: Assess Visa/Mastercard network dependencies and Authorize.Net's parent company (Visa) policies.

### 6.4 Connect Financial (IDV, Sanctions Screening, Bank Linking -- Tier 1)

- **Required Artifacts**: SOC 2 Type II report, penetration test executive summary, data handling addendum.
- **Review Focus**: IDV data security, sanctions screening accuracy, bank linking token management.
- **Data Processing Agreement**: Must specify that Connect Financial does not use SwipeSavvy customer data for secondary purposes.
- **Status**: Awaiting API access and security documentation from program manager.

### 6.5 Together.AI (AI/ML Inference -- Tier 2)

- **Required Artifacts**: SOC 2 Type II report (or SOC 2 Type I if Type II unavailable), privacy policy, data processing addendum.
- **Review Focus**: Data anonymization verification, model input/output logging policies, data residency (US-only).
- **Data Processing Agreement**: Must include prohibition on training models with SwipeSavvy data, data deletion upon contract termination.
- **Compensating Control**: All data sent to Together.AI must be stripped of PII and cardholder data prior to transmission.

## 7. SOC 2 Report Collection and Review

### 7.1 Collection Requirements

- SOC 2 Type II reports collected annually from all Tier 1 and Tier 2 vendors.
- Reports must cover a minimum 6-month observation period.
- Reports must be issued by an AICPA-accredited CPA firm.
- Bridge letters required if the report period ends more than 9 months before SwipeSavvy's review date.

### 7.2 Review Procedure

1. Verify the report scope covers the services provided to SwipeSavvy.
2. Review the auditor's opinion for any qualifications or exceptions.
3. Examine all noted exceptions and evaluate the vendor's remediation plans.
4. Document any complementary user entity controls (CUECs) SwipeSavvy must implement.
5. Escalate any unresolved exceptions rated as high or critical to CISO.

### 7.3 Report Retention

- SOC 2 reports retained for a minimum of 3 years in the compliance document repository.
- Access restricted to Compliance, Legal, and Security team members.

## 8. Data Processing Agreements

All Tier 1 and Tier 2 vendors must execute a Data Processing Agreement (DPA) that includes:

| Clause                              | Requirement                                                  |
|-------------------------------------|--------------------------------------------------------------|
| Data categories and purpose         | Explicit enumeration of data types and processing purposes   |
| Breach notification                 | Written notification within 24 hours of confirmed breach     |
| Data retention and deletion         | Defined retention periods; deletion/return upon termination  |
| Sub-processor management            | Prior written notice of new sub-processors; right to object  |
| Right to audit                      | SwipeSavvy retains the right to audit or request audit evidence |
| Data residency                      | Data processed and stored within the United States           |
| Security requirements               | Minimum encryption standards, access controls, logging       |
| Liability and indemnification       | Defined liability caps and indemnification for data breaches |

## 9. Fourth-Party Risk Management

- All Tier 1 vendors must disclose sub-processors who access SwipeSavvy data.
- Sub-processor changes require 30-day advance written notice to SwipeSavvy.
- SwipeSavvy reserves the right to object to new sub-processors and terminate if objections are not resolved.
- Fourth-party risk is factored into the vendor's composite risk score.

## 10. Annual Review Process

| Month       | Activity                                                          |
|-------------|-------------------------------------------------------------------|
| January     | Distribute vendor security questionnaires to all Tier 1/2 vendors |
| February    | Collect SOC 2 Type II reports, PCI DSS AOCs, and ISO certificates |
| March       | Complete risk scoring and vendor assessment reports                |
| April       | Present findings to CISO and executive leadership                 |
| May         | Execute remediation plans for any high/critical findings          |
| Ongoing     | Continuous monitoring via vendor security news feeds and alerts    |

## 11. Vendor Offboarding

Upon termination of a vendor relationship:

1. Revoke all API keys, credentials, and access tokens within 24 hours.
2. Confirm data deletion or return per the DPA within 30 days.
3. Obtain written certification of data destruction from the vendor.
4. Update the vendor inventory and risk register.
5. Archive all vendor assessment records for a minimum of 3 years.

## 12. Exceptions

Exceptions to vendor security requirements require written approval from the CISO and General Counsel. Exceptions are logged in the risk register with compensating controls and a maximum duration of 6 months.

## 13. Document History

| Version | Date       | Author         | Description                     |
|---------|------------|----------------|---------------------------------|
| 1.0     | 2026-02-18 | CISO           | Initial policy creation         |
