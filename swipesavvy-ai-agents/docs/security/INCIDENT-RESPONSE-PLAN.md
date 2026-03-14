# SwipeSavvy Incident Response Plan

**Document Owner:** Security Team
**Last Updated:** 2026-02-18
**Review Cadence:** Quarterly
**Classification:** Internal — Confidential
**Compliance:** PCI DSS 4.0 (Req. 12.10), SOC 2 (CC7.3, CC7.4), ISO 27001 (A.16.1)

---

## 1. Purpose & Scope

This plan establishes procedures for detecting, responding to, containing, and recovering from security incidents affecting the SwipeSavvy platform, including:

- Backend API (`api.swipesavvy.com`)
- iOS and Android mobile applications
- Web wallet portal (`wallet.swipesavvy.com`)
- Admin portal (`admin.swipesavvy.com`)
- AWS infrastructure (VPC, RDS, S3, CloudFront, ALB)
- Third-party integrations (FIS Global, Authorize.Net, Plaid, Together.AI)

---

## 2. Incident Response Team (IRT)

| Role | Responsibility | Contact |
| ---- | -------------- | ------- |
| **Incident Commander (IC)** | Overall coordination, communication, decision authority | TBD — CTO or designated lead |
| **Security Lead** | Technical investigation, forensics, containment | security@swipesavvy.com |
| **Engineering Lead** | Code-level remediation, hotfix deployment | TBD |
| **Infrastructure Lead** | AWS infrastructure, network isolation, log collection | TBD |
| **Communications Lead** | Internal/external comms, regulatory notifications | TBD |
| **Legal/Compliance** | Regulatory obligations, breach notification law | TBD |

### Escalation Chain

1. **First responder** detects/receives alert → notifies Security Lead
2. **Security Lead** assesses severity → activates IRT if Severity 1-2
3. **Incident Commander** takes over coordination for Severity 1
4. **Executive notification** within 1 hour for Severity 1

---

## 3. Incident Classification

### Severity Levels

| Severity | Description | Response Time | Examples |
| -------- | ----------- | ------------- | -------- |
| **SEV-1 (Critical)** | Active breach, data exfiltration, complete service outage | 15 minutes | Cardholder data breach, RCE exploitation, database compromise |
| **SEV-2 (High)** | Confirmed vulnerability being exploited, partial outage | 1 hour | Auth bypass in production, FIS webhook forgery, SQL injection |
| **SEV-3 (Medium)** | Confirmed vulnerability not yet exploited, suspicious activity | 4 hours | Brute force attempts, unusual API patterns, failed signature checks |
| **SEV-4 (Low)** | Minor security finding, policy violation | 24 hours | Missing security header, excessive log verbosity, weak cipher suite |

### Incident Categories

| Category | Description |
| -------- | ----------- |
| **Data Breach** | Unauthorized access to PII, PAN, CVV, SSN, or other sensitive data |
| **Account Compromise** | Unauthorized access to user or admin accounts |
| **Service Disruption** | DDoS, infrastructure failure, or application crash affecting availability |
| **Malware/Ransomware** | Malicious code execution on servers or endpoints |
| **Insider Threat** | Unauthorized data access by employees or contractors |
| **Third-Party Breach** | Security incident at FIS Global, Authorize.Net, Plaid, or other vendor |
| **Fraud** | Unauthorized card transactions, identity theft, or payment fraud |
| **Policy Violation** | Deviation from security policies, accidental exposure |

---

## 4. Incident Response Phases

### Phase 1: Detection & Identification

**Sources of detection:**
- AWS CloudWatch alarms (5xx spikes, latency, CPU)
- AWS GuardDuty findings
- Application logs (failed auth attempts, signature rejections, card ownership violations)
- VPC Flow Logs anomalies
- FIS Global fraud alerts (webhook events)
- User-reported issues
- External security researcher reports (SECURITY.md)
- Automated vulnerability scans (ASV quarterly)

**Initial triage checklist:**
- [ ] What systems are affected?
- [ ] Is there evidence of data exfiltration?
- [ ] Is cardholder data (PAN, CVV, track data) involved?
- [ ] Is the incident ongoing or historical?
- [ ] Assign severity level
- [ ] Activate IRT if SEV-1 or SEV-2

### Phase 2: Containment

**Immediate containment (SEV-1, within 15 minutes):**
- [ ] Isolate compromised systems (security group changes, NACL updates)
- [ ] Revoke compromised credentials/tokens (token blacklist)
- [ ] Block attacker IP addresses (WAF rules, security groups)
- [ ] Disable compromised user accounts
- [ ] Rotate affected API keys (FIS, Authorize.Net, JWT secrets)

**Short-term containment:**
- [ ] Enable enhanced logging on affected systems
- [ ] Create forensic snapshots of affected EC2 instances / RDS
- [ ] Preserve CloudWatch, VPC Flow, and ALB access logs
- [ ] Isolate affected database schemas if needed
- [ ] Notify FIS Global if card data may be compromised

**Card-specific containment (PCI DSS):**
- [ ] If PAN/CVV may be exposed: notify FIS Global for card reissuance
- [ ] Freeze affected card accounts via FIS API
- [ ] Preserve transaction logs for forensic analysis
- [ ] Engage PCI Forensic Investigator (PFI) if required

### Phase 3: Eradication

- [ ] Identify root cause (code vulnerability, misconfiguration, credential compromise)
- [ ] Develop and test remediation patch
- [ ] Deploy hotfix through standard CI/CD with expedited review
- [ ] Verify remediation — confirm vulnerability is resolved
- [ ] Scan for indicators of compromise (IOCs) across other systems
- [ ] Verify no backdoors, persistence mechanisms, or lateral movement

### Phase 4: Recovery

- [ ] Restore systems from clean backups if necessary
- [ ] Re-enable services incrementally with enhanced monitoring
- [ ] Force password resets for affected users (if account compromise)
- [ ] Reissue JWTs (rotate JWT_SECRET if token signing key was compromised)
- [ ] Validate system integrity before returning to normal operations
- [ ] Monitor for reoccurrence (enhanced alerting for 30 days minimum)

### Phase 5: Post-Incident Review

**Timing:** Within 5 business days of incident resolution

**Post-mortem document must include:**
- Timeline of events (detection → containment → recovery)
- Root cause analysis
- Impact assessment (users affected, data exposed, financial impact)
- What went well
- What could be improved
- Action items with owners and deadlines
- Updated risk register entries

**Distribution:** IRT members, executive leadership, compliance/legal

---

## 5. Communication Plan

### Internal Communication

| Audience | Channel | Timing |
| -------- | ------- | ------ |
| IRT | Dedicated Slack channel (#incident-response) | Immediately |
| Engineering | Engineering Slack | Within 1 hour (SEV-1/2) |
| Executive team | Direct message/call | Within 1 hour (SEV-1) |
| All staff | Company-wide email | After containment confirmed |

### External Communication

| Audience | Channel | Timing | Trigger |
| -------- | ------- | ------ | ------- |
| Affected users | Email + in-app notification | Within 72 hours | PII/financial data confirmed compromised |
| Card networks (via FIS) | FIS incident notification | Immediately | PAN/CVV exposure confirmed |
| State regulators | As required by breach notification laws | Per state law (typically 30-60 days) | PII breach confirmed |
| PCI SSC / QSA | Written notification | Within 24 hours | Cardholder data breach confirmed |

### Regulatory Notification Requirements

| Regulation | Notification Timeline | Authority |
| ---------- | --------------------- | --------- |
| PCI DSS 4.0 | Immediately to acquirer/payment brands | Card brands via FIS Global |
| State breach laws | Varies (30-60 days for most states) | State Attorney General |
| GDPR (if applicable) | 72 hours | Supervisory authority |

---

## 6. Evidence Preservation

All incident evidence must be preserved with chain of custody:

- **Log retention:** Minimum 1 year (PCI DSS 10.7)
- **Forensic images:** Preserved for duration of investigation + 1 year
- **Communication records:** Slack threads, emails, call notes — archived
- **AWS artifacts:** CloudTrail, VPC Flow Logs, GuardDuty findings, WAF logs

**Chain of custody requirements:**
- Document who collected evidence, when, and how
- Store forensic images in dedicated, access-controlled S3 bucket
- Use write-once storage (S3 Object Lock) for critical evidence
- Hash all forensic images (SHA256) at time of collection

---

## 7. Testing & Maintenance

### Tabletop Exercises
- **Frequency:** Quarterly
- **Scenarios:** Rotate through data breach, DDoS, insider threat, third-party breach
- **Participants:** Full IRT

### Plan Review
- **Frequency:** Quarterly, or after any SEV-1/SEV-2 incident
- **Owner:** Security Lead
- **Approval:** CTO

### Contact List Updates
- **Frequency:** Monthly
- **Owner:** Security Lead
- Verify all IRT members' contact info is current
- Verify escalation chain is accurate

---

## 8. Tools & Resources

| Tool | Purpose |
| ---- | ------- |
| AWS CloudWatch | Monitoring, alerting |
| AWS GuardDuty | Threat detection |
| AWS CloudTrail | API audit trail |
| VPC Flow Logs | Network traffic analysis |
| Application logs | Auth failures, card access violations, webhook rejections |
| GitHub Actions | CI/CD for emergency deployments |
| FIS Global API | Card freeze, reissuance |

---

## 9. Appendices

### A. Incident Report Template

```
INCIDENT REPORT
===============
Incident ID:     INC-YYYY-NNN
Severity:        SEV-1 / SEV-2 / SEV-3 / SEV-4
Status:          Open / Contained / Resolved / Closed
Date Detected:   YYYY-MM-DD HH:MM UTC
Date Resolved:   YYYY-MM-DD HH:MM UTC
Incident Commander:

SUMMARY
-------
[Brief description of what happened]

TIMELINE
--------
[Chronological list of events with timestamps]

ROOT CAUSE
----------
[Technical root cause analysis]

IMPACT
------
- Users affected:
- Data exposed:
- Financial impact:
- Service downtime:

REMEDIATION
-----------
[Actions taken to resolve]

LESSONS LEARNED
---------------
[What went well, what needs improvement]

ACTION ITEMS
------------
| # | Action | Owner | Due Date | Status |
|---|--------|-------|----------|--------|
```

### B. Emergency Contact Numbers

| Role | Primary | Backup |
| ---- | ------- | ------ |
| Incident Commander | TBD | TBD |
| Security Lead | TBD | TBD |
| AWS Support | AWS Premium Support | - |
| FIS Global | FIS Technical Support Line | - |
| Legal Counsel | TBD | TBD |

### C. Key AWS Resources

| Resource | Identifier |
| -------- | ---------- |
| AWS Account | 858955002750 |
| Primary Region | us-east-1 |
| VPC | See Terraform state |
| RDS Instance | See Terraform state |
| CloudFront (API) | See ALB/CloudFront config |
| S3 (Docs) | swipesavvy-api-docs-production |
