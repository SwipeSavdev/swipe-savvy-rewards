# Data Retention and Disposal Policy

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

This policy defines the requirements for retaining, archiving, and securely disposing of data processed by SwipeSavvy. It ensures compliance with applicable regulatory requirements, including PCI DSS 4.0 cardholder data retention limits, financial record-keeping laws, and privacy obligations. Proper data retention minimizes risk exposure while meeting legal and business needs.

## 2. Scope

This policy applies to all data created, received, processed, or stored by SwipeSavvy systems, including:

- Production databases (RDS PostgreSQL)
- Cache stores (ElastiCache Redis)
- Application and infrastructure logs (CloudWatch, VPC Flow Logs)
- Object storage (S3 buckets)
- Backup and archive storage
- Mobile application local storage on iOS and Android devices
- Third-party data shared with or received from Authorize.Net and FIS Global Payment One

## 3. Regulatory and Standards Alignment

| Requirement                  | Reference                                                       |
|------------------------------|-----------------------------------------------------------------|
| PCI DSS 4.0                  | Req 3.1 -- Processes and mechanisms for protecting stored account data are defined and understood |
| PCI DSS 4.0                  | Req 3.2 -- Storage of account data is kept to a minimum        |
| PCI DSS 4.0                  | Req 3.3 -- Sensitive authentication data is not stored after authorization |
| PCI DSS 4.0                  | Req 3.4 -- Access to displays of full PAN and ability to copy PAN is restricted |
| SOC 2                        | CC6.5 (Disposal of Confidential Information)                   |
| SOC 2                        | CC7.4 (Incident Containment and Remediation)                   |
| ISO 27001:2022               | A.5.33 (Protection of Records)                                 |
| ISO 27001:2022               | A.8.10 (Information Deletion)                                  |
| ISO 27001:2022               | A.8.14 (Redundancy of Information Processing Facilities)       |

## 4. Data Retention Schedule

### 4.1 Retention Periods by Data Category

| Data Category                  | Retention Period                        | Justification                                    | Storage Location         |
|--------------------------------|-----------------------------------------|--------------------------------------------------|--------------------------|
| Transaction logs               | 7 years from transaction date           | Financial regulatory requirements, IRS guidelines| RDS PostgreSQL, S3 archive |
| Authentication and access logs | 1 year from event date                  | Security monitoring and forensic analysis        | CloudWatch Logs, S3      |
| PII (name, email, phone, address) | Account lifetime + 5 years after closure | Regulatory and dispute resolution obligations  | RDS PostgreSQL           |
| Cardholder data (PAN, if stored) | Minimum necessary; purged when no longer needed for business/legal purposes | PCI DSS Req 3.1, 3.2 | RDS PostgreSQL (tokenized) |
| Sensitive authentication data  | **Never stored post-authorization**     | PCI DSS Req 3.3 (CVV, full track data, PINs)    | N/A                      |
| Application error logs         | 90 days                                 | Debugging and operational monitoring             | CloudWatch Logs          |
| Infrastructure logs (VPC Flow) | 1 year                                  | Security monitoring, compliance                  | CloudWatch Logs, S3      |
| AWS CloudTrail audit logs      | 7 years                                 | Compliance audit trail                           | S3 (Glacier after 1 year)|
| Backup snapshots (RDS)         | 35 days (automated), 1 year (manual)    | Business continuity and disaster recovery        | AWS RDS Snapshots, S3    |
| Mobile app local cache         | Session duration only                   | Performance; no persistent sensitive storage     | Device Keychain/Keystore |
| Email/OTP verification codes   | 15 minutes from generation              | Single-use authentication                        | ElastiCache Redis (TTL)  |
| Marketing and analytics data   | 3 years                                 | Business intelligence                            | S3, RDS PostgreSQL       |

### 4.2 Cardholder Data Specific Requirements

SwipeSavvy does not store full PAN in its own databases. All cardholder data processing is delegated to Authorize.Net (payment processing) and FIS Global Payment One (card issuance). SwipeSavvy retains only:

- **Tokenized references**: Tokens issued by Authorize.Net that map to stored payment methods. These tokens contain no recoverable cardholder data and are retained for the lifetime of the associated payment method.
- **Truncated PAN**: Last four digits only, stored for display and customer support purposes. Retained per the PII schedule (account lifetime + 5 years).
- **Transaction metadata**: Amount, date, merchant name, status, and authorization codes. Retained for 7 years.

The following data is **never stored** by SwipeSavvy systems:

- Full PAN (primary account number)
- CVV/CVC/CAV2 security codes
- Full magnetic stripe or chip data
- PIN or encrypted PIN blocks

> **PCI DSS 4.0 Ref**: Requirement 3.3 -- Sensitive authentication data is not stored after authorization, even if encrypted.

### 4.3 Quarterly Data Review

A quarterly review shall be conducted to identify stored data that has exceeded its retention period. The review shall be documented and any data past its retention period must be disposed of within 30 days of identification.

> **PCI DSS 4.0 Ref**: Requirement 3.2.1 -- Data retention and disposal policies, procedures, and processes are in place.

## 5. Data Disposal Procedures

### 5.1 Electronic Data Disposal

| Media Type                     | Disposal Method                                                  | Standard                   |
|--------------------------------|------------------------------------------------------------------|----------------------------|
| RDS PostgreSQL databases       | Cryptographic erasure via AWS KMS key deletion/rotation          | NIST SP 800-88 Rev. 1     |
| S3 objects                     | Object deletion with bucket versioning purge; KMS key retirement | NIST SP 800-88 Rev. 1     |
| ElastiCache Redis              | Automatic TTL-based expiration; cluster termination for decommission | NIST SP 800-88 Rev. 1  |
| EBS volumes                    | Encrypted volume deletion (AWS handles underlying media sanitization) | NIST SP 800-88 Rev. 1 |
| CloudWatch Logs                | Retention policy enforcement (automatic deletion after configured period) | AWS managed          |
| RDS snapshots                  | Snapshot deletion via AWS API; encrypted snapshots become irrecoverable upon KMS key deletion | NIST SP 800-88 Rev. 1 |
| Mobile app local data          | Programmatic secure deletion on account logout/closure; OS-level encryption ensures secure wipe on device reset | Platform-native |

**Cryptographic Erasure Process**: For data encrypted with AWS KMS Customer Managed Keys, disposal is achieved by scheduling the KMS key for deletion (minimum 7-day waiting period). Once the key is deleted, all data encrypted with that key becomes permanently irrecoverable. This method satisfies NIST SP 800-88 guidelines for cryptographic erasure.

### 5.2 Physical Media Disposal

| Media Type                     | Disposal Method                                                  | Standard                   |
|--------------------------------|------------------------------------------------------------------|----------------------------|
| Hard drives (HDD)              | DOD 5220.22-M three-pass overwrite, followed by physical destruction | DOD 5220.22-M          |
| Solid-state drives (SSD)       | Manufacturer-specific secure erase command, followed by physical destruction | NIST SP 800-88 Rev. 1 |
| Paper documents                | Cross-cut shredding (DIN 66399 Level P-4 minimum)               | DIN 66399                  |
| Optical media (CD/DVD)         | Physical destruction (shredding)                                 | NIST SP 800-88 Rev. 1     |

All physical media disposal must be performed by an approved, certified vendor. Certificates of destruction must be retained for 3 years.

> **SOC 2 Ref**: CC6.5 -- The entity disposes of confidential information to meet the entity's objectives related to confidentiality.

### 5.3 Disposal Verification

- All disposal actions must be logged in the Data Disposal Register, including: data type, volume, disposal method, date, and the responsible individual.
- A random sample of disposal records shall be audited quarterly by the Information Security team.
- Disposal of Restricted data requires sign-off from the CISO or designated delegate.

## 6. Legal Hold Requirements

### 6.1 Definition

A legal hold is a directive to preserve all forms of relevant data when litigation, regulatory investigation, or audit is reasonably anticipated or pending.

### 6.2 Procedures

1. **Initiation**: Legal counsel issues a written legal hold notice specifying the scope of data to be preserved.
2. **Notification**: The CISO and IT Operations team are notified within 24 hours.
3. **Suspension of Disposal**: All automated and manual disposal processes for in-scope data are immediately suspended. This includes:
   - RDS snapshot deletion
   - S3 lifecycle policies
   - CloudWatch log retention policies
   - Any scheduled KMS key deletions
4. **Preservation Tagging**: Affected data is tagged with a legal hold identifier in the asset management system.
5. **Monitoring**: The Legal and Compliance team monitors hold status monthly.
6. **Release**: Legal counsel issues a written release when the hold is no longer required. Normal retention and disposal schedules resume for the affected data.

### 6.3 Non-Compliance

Failure to comply with a legal hold directive may result in spoliation sanctions, adverse inference rulings, regulatory penalties, and disciplinary action.

> **ISO 27001 Ref**: A.5.33 -- Protection of records.

## 7. Responsibilities

| Role                           | Responsibility                                                   |
|--------------------------------|------------------------------------------------------------------|
| CISO                           | Policy ownership, oversight of disposal verification             |
| Data Owners                    | Classification and retention period assignment for their data    |
| IT Operations                  | Implementation of automated retention and disposal controls      |
| Legal and Compliance           | Legal hold management, regulatory interpretation                 |
| All Employees                  | Adherence to classification and retention requirements           |

## 8. Exceptions

Exceptions to this policy must be submitted in writing to the CISO and approved by the Change Advisory Board (CAB). Approved exceptions are documented, time-bound (maximum 12 months), and reviewed upon expiration.

## 9. Related Documents

| Document                              | Location                                                      |
|---------------------------------------|---------------------------------------------------------------|
| Information Security Policy           | `docs/security/policies/INFORMATION-SECURITY-POLICY.md`      |
| Access Control Policy                 | `docs/security/policies/ACCESS-CONTROL-POLICY.md`            |
| Change Management Policy              | `docs/security/policies/CHANGE-MANAGEMENT-POLICY.md`         |
| Incident Response Plan                | `docs/security/INCIDENT-RESPONSE-PLAN.md`                    |

## 10. Revision History

| Version | Date       | Author        | Description              |
|---------|------------|---------------|--------------------------|
| 1.0     | 2026-02-18 | CISO Office   | Initial policy release   |
