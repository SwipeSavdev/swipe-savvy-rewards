# Team Directory - AI Agents Q1 2026 MVP

**Last Updated:** December 23, 2025  
**Status:** Active

---

## Core Team

### Sarah Chen - Product Manager
- **Email:** sarah.chen@swipesavvy.com
- **Slack:** @sarah.chen
- **Timezone:** PT (Pacific Time)
- **Availability:** Mon-Fri, 9am-6pm PT
- **Focus Areas:**
  - Product roadmap and prioritization
  - Stakeholder communication
  - User research and feedback
  - Requirements gathering
  - Sprint planning and tracking

**Key Responsibilities:**
- Define and maintain product backlog
- Coordinate with stakeholders across org
- Track OKRs and success metrics
- Conduct user interviews and research
- Make go/no-go decisions for features

---

### Marcus Rodriguez - Tech Lead
- **Email:** marcus.rodriguez@swipesavvy.com
- **Slack:** @marcus.rodriguez
- **Timezone:** ET (Eastern Time)
- **Availability:** Mon-Fri, 8am-5pm ET
- **Focus Areas:**
  - System architecture and design
  - Code reviews and quality
  - Technical decision-making
  - Deployment and releases
  - Performance optimization

**Key Responsibilities:**
- Own technical architecture decisions
- Review all PRs and approve merges
- Mentor team on best practices
- Lead technical spike investigations
- Coordinate with backend/platform teams

---

### Priya Patel - AI Engineer
- **Email:** priya.patel@swipesavvy.com
- **Slack:** @priya.patel
- **Timezone:** CT (Central Time)
- **Availability:** Mon-Fri, 9am-6pm CT
- **Focus Areas:**
  - Agent development and prompt engineering
  - RAG system implementation
  - Model selection and optimization
  - Tool function development
  - LLM API integration (Together.AI)

**Key Responsibilities:**
- Develop AI Concierge agent logic
- Design and optimize prompts
- Implement RAG retrieval system
- Evaluate model performance
- Integrate Together.AI APIs

---

### Alex Kim - Conversation Designer
- **Email:** alex.kim@swipesavvy.com
- **Slack:** @alex.kim
- **Timezone:** PT (Pacific Time)
- **Availability:** Mon-Fri, 10am-6pm PT
- **Focus Areas:**
  - Conversation flow design
  - Tone and personality definition
  - User experience copy
  - Use case mapping
  - Agent persona development

**Key Responsibilities:**
- Design conversation flows for all use cases
- Define agent tone and personality guidelines
- Create UX copy for agent responses
- Map user journeys through agent interactions
- Conduct usability testing of conversations

---

### Jordan Hayes - QA Engineer
- **Email:** jordan.hayes@swipesavvy.com
- **Slack:** @jordan.hayes
- **Timezone:** MT (Mountain Time)
- **Availability:** Mon-Fri, 9am-5pm MT
- **Focus Areas:**
  - Agent evaluation and testing
  - Red teaming and adversarial testing
  - Quality metrics tracking
  - Gold set curation
  - Regression testing

**Key Responsibilities:**
- Create and maintain evaluation gold sets
- Run weekly agent evaluation reports
- Conduct red team testing for safety
- Track quality metrics (accuracy, hallucination rate)
- Automate regression test suites

---

### Taylor Brooks - DevOps Engineer
- **Email:** taylor.brooks@swipesavvy.com
- **Slack:** @taylor.brooks
- **Timezone:** PT (Pacific Time)
- **Availability:** Mon-Fri, 10am-4pm PT (Part-time: 25 hrs/week)
- **Focus Areas:**
  - Infrastructure provisioning
  - CI/CD pipeline management
  - Monitoring and alerting
  - Deployment automation
  - Database management

**Key Responsibilities:**
- Set up and maintain AWS/GCP infrastructure
- Configure CI/CD with GitHub Actions
- Implement monitoring (Datadog/Grafana)
- Manage database migrations and backups
- Handle production deployments

---

## Extended Team & Stakeholders

### Dr. James Chen - Chief Architect
- **Email:** james.chen@swipesavvy.com
- **Slack:** @james.chen
- **Involvement:** Architecture reviews (biweekly)
- **Escalation:** For major architectural decisions

### Rachel Thompson - CISO
- **Email:** rachel.thompson@swipesavvy.com
- **Slack:** @rachel.thompson
- **Involvement:** Security reviews (as needed)
- **Escalation:** For PII/security incidents

### David Miller - Legal/Compliance
- **Email:** david.miller@swipesavvy.com
- **Slack:** @david.miller
- **Involvement:** Regulatory review (monthly)
- **Escalation:** For compliance concerns

### Lisa Anderson - Customer Support Lead
- **Email:** lisa.anderson@swipesavvy.com
- **Slack:** @lisa.anderson
- **Involvement:** Handoff process design
- **Escalation:** For customer escalations

### Kevin Nguyen - Backend Lead
- **Email:** kevin.nguyen@swipesavvy.com
- **Slack:** @kevin.nguyen
- **Involvement:** API integration support
- **Escalation:** For backend API issues

---

## Communication Channels

### Slack Channels
- **#ai-agents-dev** - Daily development discussions
- **#ai-agents-incidents** - Production incidents (oncall)
- **#ai-agents-evaluation** - Quality discussions
- **#ai-agents-general** - General updates and announcements

### Meetings
- **Daily Standup** (Async in Slack) - Mon-Fri, 10am PT
- **Weekly Sprint Planning** - Mondays, 1pm PT
- **Biweekly Design Review** - Wednesdays, 2pm PT
- **Sprint Retro** - Fridays, 4pm PT

### Documentation
- **Codebase:** https://github.com/swipesavvy/swipesavvy-ai-agents
- **Design Docs:** https://swipesavvy.atlassian.net/wiki/ai-agents
- **Roadmap:** [PROJECT_STATUS.md](../PROJECT_STATUS.md)

---

## Oncall Rotation (Production Support)

**Schedule:** 24/7 coverage, 1-week rotations

| Week | Primary | Backup |
|------|---------|--------|
| Week 1-2 (Dec 23 - Jan 5) | Marcus Rodriguez | Priya Patel |
| Week 3-4 (Jan 6 - Jan 19) | Priya Patel | Taylor Brooks |
| Week 5-6 (Jan 20 - Feb 2) | Taylor Brooks | Marcus Rodriguez |

**Escalation Path:**
1. On-call engineer responds within 15 min (P0) or 1 hour (P1)
2. If unresolved after 30 min, escalate to Tech Lead (Marcus)
3. If still unresolved, escalate to Chief Architect (Dr. Chen)
4. For security incidents, immediately notify CISO (Rachel)

**Oncall Tools:**
- PagerDuty for alerts
- Datadog for monitoring dashboards
- Runbooks: [docs/runbooks/](../docs/runbooks/)

---

## Time Zones Reference

| Team Member | Timezone | Current Time (Example) |
|-------------|----------|------------------------|
| Sarah Chen | PT | 9:00 AM |
| Marcus Rodriguez | ET | 12:00 PM |
| Priya Patel | CT | 11:00 AM |
| Alex Kim | PT | 9:00 AM |
| Jordan Hayes | MT | 10:00 AM |
| Taylor Brooks | PT | 9:00 AM |

**Best Meeting Times:** 12pm PT / 3pm ET (overlap for all timezones)

---

## Working Agreements

- **Response Time:** Slack messages within 4 hours during business hours
- **Code Reviews:** Within 24 hours of PR submission
- **Incident Response:** Immediate for P0, within 1 hour for P1
- **Documentation:** Update docs in same PR as code changes
- **Testing:** All PRs must include tests, 80% coverage minimum
- **Deployment:** Tech Lead approval required for production deploys

---

## Contact for Emergencies

**Production Down (P0):**
1. Post in #ai-agents-incidents
2. Tag @oncall
3. If no response in 15 min, call Tech Lead directly

**Security Incident:**
1. Post in #security-incidents
2. Tag @rachel.thompson (CISO)
3. Do NOT discuss details in public channels

**Legal/Compliance Issue:**
1. Email david.miller@swipesavvy.com
2. CC sarah.chen@swipesavvy.com (PM)
3. Mark email as CONFIDENTIAL
