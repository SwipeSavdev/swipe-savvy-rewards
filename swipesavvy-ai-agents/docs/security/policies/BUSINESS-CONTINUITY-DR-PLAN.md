# Business Continuity and Disaster Recovery Plan

| Field              | Value                                              |
|--------------------|----------------------------------------------------|
| **Document Owner** | VP of Engineering                                  |
| **Last Updated**   | 2026-02-18                                         |
| **Review Cadence** | Annual (next review: 2027-02-18)                   |
| **Classification** | Internal -- Confidential                           |
| **Version**        | 1.0                                                |
| **Approval**       | CTO, CISO, VP of Engineering                       |

---

## 1. Purpose

This document defines the Business Continuity and Disaster Recovery (BC/DR) plan for the SwipeSavvy platform. It establishes recovery objectives, failover procedures, backup strategies, and communication protocols to ensure continuity of payment processing and mobile wallet services during disruptive events.

## 2. Scope

This plan covers all production systems within the SwipeSavvy platform:

- Backend API services (FastAPI/Python on AWS EC2 Auto Scaling Groups)
- Data stores (RDS PostgreSQL Multi-AZ, ElastiCache Redis)
- Load balancing and CDN (Application Load Balancer, CloudFront)
- Payment processing integrations (Authorize.Net, FIS Global Payment One)
- Push notification services (AWS SNS)
- Authentication and session management (JWT, OTP via email)
- Mobile applications (iOS/SwiftUI, Android/Kotlin Compose)

**AWS Account**: 858955002750 | **Primary Region**: us-east-1

## 3. Compliance References

| Framework       | Requirement                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| PCI DSS 4.0     | Req 12.10 -- Respond immediately to a suspected or confirmed security incident |
| PCI DSS 4.0     | Req 12.10.2 -- Review and test the incident response plan at least annually |
| SOC 2           | A1.1 -- Recovery objectives are defined and documented                     |
| SOC 2           | A1.2 -- System recovery is tested on a periodic basis                      |
| SOC 2           | A1.3 -- Recovery procedures include consideration of data integrity        |
| ISO 27001       | A.5.29 -- Information security during disruption                           |
| ISO 27001       | A.5.30 -- ICT readiness for business continuity                            |
| ISO 27001       | A.8.13 -- Information backup                                               |
| ISO 27001       | A.8.14 -- Redundancy of information processing facilities                  |

## 4. Recovery Objectives

### 4.1 Recovery Time Objective (RTO)

The maximum acceptable duration of a service outage before recovery must be achieved.

| Service                       | RTO        | Priority | Justification                              |
|-------------------------------|------------|----------|--------------------------------------------|
| Payment Processing API        | 1 hour     | P0       | Direct revenue and cardholder impact        |
| Card Transaction Authorization| 1 hour     | P0       | Real-time payment dependency                |
| Core API Services             | 4 hours    | P1       | User-facing mobile app functionality        |
| User Authentication           | 4 hours    | P1       | Required for app access                     |
| Push Notifications (SNS)      | 8 hours    | P2       | Non-blocking; queued delivery acceptable    |
| Rewards/Loyalty Engine        | 8 hours    | P2       | Deferred processing acceptable              |
| Admin Dashboard               | 24 hours   | P3       | Internal tooling; manual workarounds exist  |
| AI/ML Recommendation Engine   | 24 hours   | P3       | Graceful degradation to static recommendations |

### 4.2 Recovery Point Objective (RPO)

The maximum acceptable data loss measured in time.

| Data Store                    | RPO        | Backup Method                              |
|-------------------------------|------------|--------------------------------------------|
| RDS PostgreSQL (Primary)      | 1 hour     | Continuous replication (Multi-AZ) + automated backups |
| RDS PostgreSQL (Point-in-time)| 5 minutes  | Automated continuous backup with PITR      |
| ElastiCache Redis             | 1 hour     | Redis AOF persistence + daily snapshots    |
| S3 Objects                    | 0 (zero)   | Cross-region replication enabled           |
| Application Logs              | 4 hours    | CloudWatch Logs with 90-day retention      |

## 5. Infrastructure Redundancy

### 5.1 Current Architecture (us-east-1)

| Component          | Redundancy Configuration                                       |
|--------------------|----------------------------------------------------------------|
| EC2 Instances      | Auto Scaling Group across 3 AZs (us-east-1a, 1b, 1c)         |
| RDS PostgreSQL     | Multi-AZ deployment with synchronous standby replication       |
| ElastiCache Redis  | Cluster mode with replicas across 2 AZs                       |
| ALB                | Regional load balancer spanning 3 AZs                         |
| CloudFront         | Global edge locations with origin failover                     |
| S3                 | 99.999999999% durability; cross-region replication to us-west-2|

### 5.2 Secondary Region (us-west-2) -- Warm Standby

| Component          | Standby Configuration                                          |
|--------------------|----------------------------------------------------------------|
| EC2 AMI            | Latest AMI replicated to us-west-2 via automated pipeline      |
| RDS Read Replica   | Cross-region read replica with async replication               |
| S3                 | Cross-region replication from us-east-1                        |
| Route 53           | Health-checked DNS failover records configured                 |
| Terraform State    | Infrastructure-as-code ready for us-west-2 deployment          |

## 6. Disaster Recovery Procedures

### 6.1 Scenario 1: Single AZ Failure

- **Detection**: ALB health checks and CloudWatch alarms (< 2 minutes).
- **Automatic Response**: ASG launches replacement instances in healthy AZs.
- **RDS**: Multi-AZ standby promoted automatically if primary AZ is affected.
- **Expected Recovery**: < 15 minutes (automated).
- **Manual Action Required**: None. Verify via monitoring dashboards.

### 6.2 Scenario 2: Primary Region Degradation (Partial)

- **Detection**: CloudWatch composite alarms, Route 53 health checks.
- **Response Procedure**:
  1. Incident Commander declares partial region failure.
  2. Assess impacted services and determine if regional failover is necessary.
  3. If payment processing is impacted, initiate regional failover (Scenario 3).
  4. If non-payment services only, scale within remaining healthy AZs.
- **Expected Recovery**: 1 -- 4 hours depending on scope.

### 6.3 Scenario 3: Full Regional Failover (us-east-1 to us-west-2)

- **Trigger**: Complete us-east-1 outage or P0 service RTO breach imminent.
- **Procedure**:
  1. Incident Commander authorizes regional failover.
  2. Promote RDS cross-region read replica to primary in us-west-2 (`aws rds promote-read-replica`).
  3. Deploy EC2 instances in us-west-2 using Terraform and latest AMI.
  4. Update ALB target groups and verify health checks.
  5. Update Route 53 DNS records to point to us-west-2 endpoints.
  6. Validate payment processing connectivity with Authorize.Net and FIS Global.
  7. Notify mobile clients via CloudFront origin failover (automatic).
  8. Verify all services operational; declare recovery.
- **Expected Recovery**: 2 -- 4 hours.
- **Post-Failover**: Plan failback to us-east-1 within 72 hours once region stabilizes.

### 6.4 Scenario 4: Database Corruption

- **Detection**: Application error monitoring, data integrity checks.
- **Procedure**:
  1. Immediately halt write operations to affected tables.
  2. Identify corruption scope and timestamp.
  3. Restore from RDS point-in-time recovery (PITR) to the moment before corruption.
  4. Validate data integrity using checksums and application-level verification.
  5. Resume write operations after validation.
- **Expected Recovery**: 1 -- 2 hours.

## 7. Backup Strategy

### 7.1 Automated Backups

| Resource           | Frequency       | Retention   | Encryption          |
|--------------------|-----------------|-------------|---------------------|
| RDS Automated      | Daily (02:00 UTC)| 35 days    | AES-256 (KMS CMK)   |
| RDS PITR           | Continuous       | 35 days    | AES-256 (KMS CMK)   |
| ElastiCache Snapshot| Daily (03:00 UTC)| 7 days    | AES-256 (KMS CMK)   |
| S3 Versioning      | On every write   | 90 days    | SSE-KMS              |
| CloudWatch Logs    | Continuous       | 90 days    | SSE-KMS              |

### 7.2 Manual Backups

| Resource           | Frequency       | Retention   | Responsible Party    |
|--------------------|-----------------|-------------|----------------------|
| RDS Manual Snapshot| Weekly (Sun 04:00 UTC) | 90 days | Database Engineering |
| Terraform State    | On every apply   | Indefinite | Platform Engineering |
| Secrets Manager    | On every rotation| 12 months  | Platform Engineering |

### 7.3 Backup Validation

- Monthly automated restore test of RDS snapshot to a non-production instance.
- Quarterly manual validation of backup data integrity (checksum comparison).
- Annual full DR restore drill including application-level data verification.

## 8. Failover Testing Schedule

| Test Type                       | Frequency   | Scope                                   | Lead            |
|---------------------------------|-------------|-----------------------------------------|-----------------|
| AZ Failover Simulation          | Quarterly   | Terminate instances in one AZ; validate ASG recovery | SRE Team    |
| RDS Multi-AZ Failover           | Quarterly   | Force reboot with failover; measure downtime | Database Engineering |
| Regional Failover Tabletop      | Semi-annual | Walk through full regional failover procedure | VP of Engineering |
| Full Regional Failover Drill    | Annual      | Execute Scenario 3 in staging environment | All Engineering  |
| Backup Restore Validation       | Monthly     | Restore latest RDS snapshot; verify integrity | Database Engineering |
| Payment Processing Failover     | Quarterly   | Validate Authorize.Net and FIS Global connectivity post-failover | Payments Team |

## 9. Communication Plan During Outage

### 9.1 Internal Communication

| Audience             | Channel              | Frequency During Outage | Responsible        |
|----------------------|----------------------|-------------------------|--------------------|
| Engineering Team     | Slack #incident      | Real-time               | Incident Commander |
| Executive Leadership | Slack #exec-alerts   | Every 30 minutes        | Incident Commander |
| Customer Support     | Slack #cs-alerts     | Every 15 minutes        | Support Lead       |
| All Employees        | Email                | At incident start/end   | Communications     |

### 9.2 External Communication

| Audience             | Channel              | Frequency During Outage | Responsible        |
|----------------------|----------------------|-------------------------|--------------------|
| Customers            | In-app banner + push | At incident start/end   | Product Team       |
| Customers            | status.swipesavvy.com| Real-time updates       | SRE Team           |
| Partners (FIS, Auth.Net) | Email + phone   | As needed               | Payments Team      |
| Regulators           | Email                | Within 24 hours if data impacted | Compliance  |

### 9.3 Incident Roles

| Role                  | Responsibility                                            |
|-----------------------|-----------------------------------------------------------|
| Incident Commander    | Declares incident, coordinates response, authorizes failover |
| Technical Lead        | Directs engineering response, executes recovery procedures |
| Communications Lead   | Manages internal and external messaging                   |
| Scribe                | Documents timeline, decisions, and actions taken          |

## 10. Plan Maintenance

- This plan is reviewed and updated annually or after any significant infrastructure change.
- All failover test results are documented and findings incorporated into plan updates.
- Post-incident reviews (PIRs) within 72 hours of any production incident update this plan as needed.
- Changes to RTO/RPO targets require executive approval.

## 11. Document History

| Version | Date       | Author             | Description                     |
|---------|------------|--------------------|---------------------------------|
| 1.0     | 2026-02-18 | VP of Engineering  | Initial plan creation           |
