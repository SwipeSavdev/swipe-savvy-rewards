# Cryptographic Standards Policy

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| **Document Owner** | Chief Information Security Officer (CISO)          |
| **Last Updated**   | 2026-02-18                                         |
| **Review Cadence** | Annual (next review: 2027-02-18)                   |
| **Classification** | Internal -- Confidential                           |
| **Version**        | 1.0                                                |
| **Approval**       | VP of Engineering, CISO, Compliance Officer        |

---

## 1. Purpose

This policy establishes the cryptographic standards, approved algorithms, and key management procedures for all SwipeSavvy systems and services. It ensures that cardholder data, personally identifiable information (PII), and other sensitive assets are protected using industry-accepted cryptographic mechanisms in accordance with regulatory and compliance obligations.

## 2. Scope

This policy applies to all SwipeSavvy production and non-production environments, including:

- Backend API services (FastAPI/Python on AWS EC2)
- Data stores (RDS PostgreSQL, ElastiCache Redis)
- Mobile applications (iOS/SwiftUI, Android/Kotlin Compose)
- Data in transit across ALB, CloudFront, and inter-service communication
- Third-party integrations (Authorize.Net, FIS Global Payment One, AWS SNS)
- All encryption keys, certificates, and cryptographic tokens

## 3. Compliance References

| Framework       | Requirement                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| PCI DSS 4.0     | Req 3.5 -- Protect stored account data encryption keys                     |
| PCI DSS 4.0     | Req 3.6 -- Key management procedures for cryptographic keys                |
| PCI DSS 4.0     | Req 3.7 -- Operational procedures for protecting stored account data       |
| PCI DSS 4.0     | Req 4.2 -- Protect PAN with strong cryptography during transmission        |
| SOC 2           | CC6.1 -- Logical and physical access controls over encryption keys         |
| SOC 2           | CC6.7 -- Restriction on transmission of data to authorized parties         |
| ISO 27001       | A.8.24 -- Use of cryptography                                             |
| ISO 27001       | A.8.25 -- Development life cycle considerations for cryptography           |

## 4. Approved Cryptographic Algorithms

### 4.1 Symmetric Encryption

| Algorithm      | Key Length | Use Case                                    | Status   |
|----------------|------------|---------------------------------------------|----------|
| AES-256-GCM    | 256-bit    | Data-at-rest encryption (RDS, S3, EBS)      | Approved |
| AES-256-CBC    | 256-bit    | Legacy field-level encryption (migration)   | Approved |
| AES-128-GCM    | 128-bit    | ElastiCache Redis in-transit encryption      | Approved |

### 4.2 Asymmetric Encryption

| Algorithm      | Key Length   | Use Case                                   | Status   |
|----------------|--------------|--------------------------------------------|----------|
| RSA            | 2048-bit+    | TLS certificates, API partner key exchange | Approved |
| RSA            | 4096-bit     | Root CA and code signing certificates      | Approved |
| ECDSA          | P-256/P-384  | Mobile app certificate pinning             | Approved |

### 4.3 Hashing

| Algorithm      | Use Case                                           | Status   |
|----------------|----------------------------------------------------|----------|
| SHA-256        | Data integrity verification, digital signatures    | Approved |
| SHA-512        | High-security hash operations, audit log integrity | Approved |
| bcrypt (cost 12+) | User password storage                           | Approved |
| HMAC-SHA256    | Webhook signature verification (Authorize.Net)     | Approved |
| HMAC-SHA256    | JWT signing (HS256 -- see Section 6 for rotation)  | Approved |

### 4.4 Key Derivation

| Algorithm      | Use Case                                           | Status   |
|----------------|----------------------------------------------------|----------|
| PBKDF2         | Key derivation for encrypted exports               | Approved |
| HKDF-SHA256    | Session key derivation                             | Approved |

## 5. Prohibited Algorithms and Protocols

The following algorithms and protocols are **strictly prohibited** across all SwipeSavvy systems. Any discovery of these in use constitutes a critical security finding.

| Algorithm/Protocol | Reason for Prohibition                            |
|--------------------|---------------------------------------------------|
| MD5                | Collision vulnerabilities; not collision-resistant |
| SHA-1              | Demonstrated collision attacks since 2017         |
| DES                | 56-bit key length; brute-forceable                |
| 3DES               | Deprecated by NIST; Sweet32 vulnerability         |
| RC4                | Multiple biases; prohibited by RFC 7465           |
| SSLv2 / SSLv3      | POODLE and other critical vulnerabilities         |
| TLS 1.0            | Prohibited per PCI DSS 4.0                        |
| TLS 1.1            | Deprecated by IETF (RFC 8996)                     |
| Blowfish           | 64-bit block size; birthday attack susceptibility |

**Minimum TLS version**: TLS 1.2. TLS 1.3 is preferred for all new integrations.

## 6. Key Management

### 6.1 Key Hierarchy

SwipeSavvy employs a tiered key management architecture:

1. **Master Keys**: Managed exclusively within AWS KMS (CMK). Hardware-backed, never exported.
2. **Data Encryption Keys (DEKs)**: Generated by AWS KMS via `GenerateDataKey` API. Used for envelope encryption of data at rest.
3. **Application Keys**: JWT signing secrets, webhook HMAC keys, and API partner keys stored in AWS Secrets Manager, encrypted by KMS CMK.

### 6.2 Key Rotation Schedule

| Key Type                         | Rotation Frequency | Responsible Party     | Method                        |
|----------------------------------|--------------------|-----------------------|-------------------------------|
| AWS KMS Customer Master Key      | Annually           | Platform Engineering  | Automatic rotation via KMS    |
| JWT Signing Secret (HS256)       | Every 90 days      | Platform Engineering  | Secrets Manager rotation      |
| Database Encryption Key (RDS)    | Annually           | Database Engineering  | RDS re-encryption procedure   |
| Authorize.Net Webhook HMAC Key   | Every 180 days     | Payments Team         | Manual regeneration via portal |
| FIS Global API Credentials       | Every 90 days      | Payments Team         | Coordinated rotation with FIS |
| Redis AUTH Token                  | Every 90 days      | Platform Engineering  | ElastiCache parameter update  |
| Mobile Certificate Pinning Keys  | Annually           | Mobile Engineering    | App update with new pins      |

### 6.3 Key Rotation Procedure

1. Generate new key or secret in the target system (KMS, Secrets Manager).
2. Deploy application configuration to accept **both** old and new keys (dual-read period).
3. Validate all services are functioning correctly with the new key (minimum 24-hour observation).
4. Disable the old key and update all references.
5. Document the rotation in the key management audit log.
6. Archive the rotation record for a minimum of 12 months.

### 6.4 Key Compromise Response

In the event of suspected key compromise:

1. Immediately generate a replacement key.
2. Invoke the incident response procedure (see Incident Response Plan).
3. Revoke the compromised key within 1 hour of confirmed compromise.
4. Assess the blast radius and notify affected parties.
5. Conduct a post-incident review within 72 hours.

## 7. Certificate Lifecycle Management

### 7.1 TLS Certificates

| Certificate                     | Issuer                  | Renewal   | Pinning        |
|---------------------------------|-------------------------|-----------|----------------|
| *.swipesavvy.com (wildcard)     | AWS ACM                 | Auto-renew| CloudFront     |
| API endpoint (ALB)              | AWS ACM                 | Auto-renew| ALB termination|
| Mobile API pinning              | DigiCert / AWS ACM      | Annual    | HPKP backup    |

### 7.2 Certificate Pin Rotation Procedure

1. Generate new certificate or key pair 60 days before pin expiry.
2. Publish the new pin hash in a mobile app update as a **backup pin**.
3. Allow a 30-day rollout window for app store adoption (target: >90% adoption).
4. Activate the new certificate on the server side.
5. Retire the old pin in the subsequent app release cycle.
6. Maintain at least two valid pins at all times to prevent lockout.

### 7.3 Certificate Monitoring

- AWS ACM expiration alerts configured at 45, 30, and 14 days prior to expiry.
- CloudWatch alarm triggers PagerDuty escalation at 14 days remaining.
- Monthly certificate inventory audit performed by Platform Engineering.

## 8. Implementation Standards

### 8.1 Data at Rest

- RDS PostgreSQL: AES-256 encryption enabled via AWS-managed keys (KMS CMK `alias/swipesavvy-rds`).
- S3 Buckets: SSE-KMS with bucket-level default encryption enforced via bucket policy.
- EBS Volumes: Encrypted with KMS CMK at volume creation. Unencrypted volumes are prohibited.
- ElastiCache Redis: At-rest encryption enabled with KMS CMK.

### 8.2 Data in Transit

- All external traffic terminated at ALB or CloudFront with TLS 1.2+ (TLS 1.3 preferred).
- Internal VPC traffic between EC2 and RDS encrypted via RDS SSL/TLS enforcement (`rds.force_ssl = 1`).
- ElastiCache Redis in-transit encryption enabled.
- All third-party API calls (Authorize.Net, FIS Global) require TLS 1.2+.

### 8.3 Application-Layer Cryptography

- Passwords hashed with bcrypt (minimum cost factor 12).
- OTP codes generated using cryptographically secure random number generators (`secrets` module in Python).
- JWT tokens signed with HMAC-SHA256; 1-hour access token expiry, 30-day refresh token expiry.
- Webhook payloads from Authorize.Net verified via HMAC-SHA256 signature.

## 9. Audit and Compliance

- Quarterly cryptographic configuration scans using automated tooling.
- Annual review of this policy by CISO and Compliance Officer.
- All key rotation events logged to CloudWatch Logs and retained for 12 months.
- Key access events audited via AWS CloudTrail (KMS-specific trail enabled).
- Non-compliance findings escalated through the risk management process.

## 10. Exceptions

Exceptions to this policy require written approval from the CISO and must include:

- Business justification for the exception.
- Compensating controls implemented.
- Maximum duration of the exception (not to exceed 12 months).
- Documented risk acceptance signed by the data owner.

All exceptions are logged in the risk register and reviewed quarterly.

## 11. Document History

| Version | Date       | Author         | Description                     |
|---------|------------|----------------|---------------------------------|
| 1.0     | 2026-02-18 | CISO           | Initial policy creation         |
