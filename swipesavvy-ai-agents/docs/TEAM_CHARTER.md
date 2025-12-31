# Team Charter - AI Agents Q1 2026 MVP

**Version:** 1.0  
**Created:** December 23, 2025  
**Status:** Active - Team Assigned

---

## Team Mission

Build and launch a production-ready AI Concierge agent for the SwipeSavvy mobile wallet platform by Q1 2026, delivering autonomous customer support with >60% resolution rate, <2s response time, and zero PII leakage incidents.

---

## Team Composition

### Core Team

| Role | Name | Responsibilities | Availability |
|------|------|------------------|--------------|
| **Product Manager** | Sarah Chen | Roadmap, prioritization, stakeholder management, user research | Full-time |
| **Tech Lead** | Marcus Rodriguez | Architecture, code reviews, deployment, technical decisions | Full-time |
| **AI Engineer** | Priya Patel | Agent development, prompt engineering, RAG, model selection | Full-time |
| **Conversation Designer** | Alex Kim | Use case mapping, conversation flows, tone, UX copy | Full-time |
| **QA Engineer** | Jordan Hayes | Evaluation, red teaming, testing, quality assurance | Full-time |
| **DevOps Engineer** | Taylor Brooks | Infrastructure, monitoring, CI/CD, deployments | Part-time |

### Extended Team & Stakeholders

| Role | Name | Involvement |
|------|------|-------------|
| **Chief Architect** | Dr. James Chen | Architecture review, technical guidance |
| **CISO** | Rachel Thompson | Security review, compliance approval |
| **Legal/Compliance** | David Miller | Regulatory review, policy approval |
| **Customer Support Lead** | Lisa Anderson | Handoff processes, training |
| **Backend Lead** | Kevin Nguyen | API integrations, tool function development |

---

## Working Agreements

### Communication

**Slack Channels:**
- `#ai-agents-dev` - Daily development discussions, questions, decisions
- `#ai-agents-incidents` - Production incidents, urgent escalations (oncall)
- `#ai-agents-evaluation` - Quality discussions, gold set reviews

**Meetings:**
- **Daily Standup** (Async in Slack, Mon-Fri)
  - What did I complete yesterday?
  - What am I working on today?
  - Any blockers?
  - Post by 10am PT

- **Weekly Sprint Planning** (Mondays, 1 hour, 10am PT)
  - Review last week's accomplishments
  - Plan current week's work
  - Assign tasks and ownership

- **Biweekly Design Review** (Wednesdays, 1 hour, 2pm PT)
  - Review conversation designs
  - Evaluate agent responses
  - Discuss prompt changes

- **Sprint Retro** (Fridays, 30 min, 4pm PT)
  - What went well?
  - What could be improved?
  - Action items for next week

**Response Time Expectations:**
- Slack messages: Within 4 hours during business hours
- Code review requests: Within 24 hours
- Incidents (P0): Immediate response
- Incidents (P1): Within 1 hour

### Decision Making

**Consensus Required:**
- Major architecture changes
- Model selection (Together.AI models, etc.)
- Launch decisions (pilot %, rollout timeline)
- Budget changes >$10k

**Tech Lead Decision:**
- Code structure and patterns
- Technology choices within approved stack
- Performance optimization approaches
- Deployment strategies

**PM Decision:**
- Feature prioritization
- Roadmap adjustments
- User research approach
- Stakeholder communication

**Escalation Path:**
1. Team discussion (Slack or next meeting)
2. Tech Lead + PM decision
3. Chief Architect / CISO (if needed)
4. CTO / CEO (critical decisions only)

### Code & Quality Standards

**Code Reviews:**
- All code requires 1 approval before merge
- Tech Lead must approve architecture changes
- Use PR template (see `.github/pull_request_template.md`)
- Max PR size: 500 lines (exceptions approved by Tech Lead)

**Testing Requirements:**
- Unit tests for all new functions
- Integration tests for new features
- Evaluation on gold set before merge
- No merge if tests fail

**Code Style:**
- Python: Black formatter, Flake8 linter, type hints
- Follow PEP 8
- Docstrings for all public functions
- Meaningful commit messages

### Work Hours & Flexibility

- **Core hours:** 10am - 3pm PT (overlap for collaboration)
- **Flexible start/end times:** Team members can choose
- **Async work encouraged:** Use Slack updates, documentation
- **Time off:** Notify team 48 hours in advance (1 week for >3 days)
- **Oncall rotation:** Shared among Tech Lead, AI Engineer, DevOps

---

## Roles & Responsibilities

### Product Manager

**Owns:**
- Product roadmap and prioritization
- User research and feedback
- Stakeholder communication
- Success metrics and reporting
- Launch planning and go-to-market

**Delivers:**
- Weekly stakeholder updates
- PRDs for new features
- User research insights
- Success metrics reports

### Tech Lead

**Owns:**
- System architecture and design
- Code quality and standards
- Deployment and releases
- Technical risk management
- Team technical mentorship

**Delivers:**
- Architecture decision records
- Code review and approval
- Production deployments
- Technical documentation

### AI Engineer

**Owns:**
- Agent development and prompt engineering
- RAG system implementation
- Model selection and evaluation
- Tool function integration
- Performance optimization

**Delivers:**
- Working agent code
- Prompt versions
- Evaluation reports
- Performance analysis

### Conversation Designer

**Owns:**
- Use case mapping
- Conversation flows
- Agent tone and personality
- Sample conversation creation
- UX copy and messaging

**Delivers:**
- Conversation flow diagrams
- Sample conversations (20+ per use case)
- Tone guidelines
- Agent personality definition

### QA Engineer

**Owns:**
- Test strategy and execution
- Gold set creation and maintenance
- Evaluation harness
- Red teaming sessions
- Bug tracking and triage

**Delivers:**
- Test plans
- Gold sets (200+ examples)
- Evaluation reports
- Bug reports and priorities

### DevOps Engineer

**Owns:**
- Infrastructure provisioning
- CI/CD pipelines
- Monitoring and alerting
- Deployment automation
- Incident response

**Delivers:**
- Infrastructure as code
- Monitoring dashboards
- Deployment runbooks
- Incident postmortems

---

## Workflows

### Feature Development

1. **Ideation** - PM creates PRD, team reviews
2. **Design** - Conversation Designer creates flows
3. **Estimation** - Team estimates effort (t-shirt sizes)
4. **Development** - AI Engineer implements
5. **Testing** - QA creates tests, runs evaluation
6. **Review** - Code review + design review
7. **Deployment** - DevOps deploys to staging
8. **Validation** - PM validates against requirements
9. **Launch** - Controlled rollout (5% → 100%)

### Incident Response

1. **Detection** - Alert fires or user reports
2. **Triage** - Oncall engineer assesses severity
3. **Escalation** - Page additional team if needed
4. **Investigation** - Gather logs, reproduce issue
5. **Fix** - Implement fix or rollback
6. **Validation** - Verify fix in production
7. **Postmortem** - Document incident and learnings

### Gold Set Updates

1. **Collection** - QA collects new examples from production
2. **Labeling** - Conversation Designer labels expected responses
3. **Review** - Team reviews and approves
4. **Merge** - Add to gold set repo
5. **Evaluation** - Run against current agent
6. **Iteration** - Fix any failures before next release

---

## Success Metrics

### Team Performance
- **Velocity:** Story points completed per week
- **Code quality:** Test coverage >80%, zero security vulnerabilities
- **Deployment frequency:** At least weekly to staging
- **Incident response:** MTTR (Mean Time To Recovery) <1 hour

### Product Metrics
- **Resolution rate:** >60% of conversations resolved without handoff
- **Accuracy:** >85% on gold set evaluation
- **Latency:** <2s p95 response time
- **User satisfaction:** NPS >70 from pilot users
- **Safety:** Zero PII leakage incidents

---

## Team Rituals

### Weekly Wins (Fridays)
Share one win from the week in `#ai-agents-dev`
- What are you proud of?
- What did the team accomplish?

### Monthly Learning (First Thursday)
30-min knowledge sharing session
- Team member presents on topic of interest
- Recent learnings, new tools, best practices

### Quarterly Retrospective
Deep dive on quarter's work
- What went well across all 3 months?
- What could improve?
- Team celebration 🎉

---

## Tools & Access

### Development
- GitHub: Code repository and PR reviews
- VS Code: Recommended IDE
- Python 3.11+: Programming language
- Docker: Local development environment

### Communication
- Slack: Primary communication
- Google Meet: Video calls
- Miro: Design collaboration
- Linear/Jira: Task tracking

### Monitoring & Operations
- Datadog: Application monitoring
- Sentry: Error tracking
- PagerDuty: Oncall rotation
- 1Password: Secret management

### AI Services
- Together.AI: Primary LLM provider (Llama 3.3 70B, DeepSeek, Qwen)
- OpenAI: Embeddings (optional)
- Pinecone/pgvector: Vector database

---

## Onboarding Checklist

New team members should complete:

- [ ] Access granted to GitHub, Slack, monitoring tools
- [ ] Read all documentation in `/docs/`
- [ ] Set up local development environment
- [ ] Run full test suite successfully
- [ ] Shadow oncall engineer for 1 shift
- [ ] Pair program with AI Engineer for 1 day
- [ ] Attend all recurring meetings for 1 week
- [ ] Complete first code contribution (small bug fix or test)

---

## Contact Information

### Emergency Contacts
- **Tech Lead:** [Phone/Email] - Architecture, deployment issues
- **CISO:** [Phone/Email] - Security incidents
- **CTO:** [Phone/Email] - Critical escalations

### Office Hours
- **AI Engineering Help:** Tuesdays 2-3pm PT (#ai-agents-dev)
- **Prompt Writing Workshop:** Thursdays 10-11am PT
- **Red Team Sessions:** First Friday of month, 1-3pm PT

---

## Amendments

This charter is a living document. Proposed changes should be:
1. Discussed in team meeting
2. Approved by consensus
3. Updated in this document
4. Communicated to stakeholders

**Last Updated:** December 23, 2025  
**Next Review:** January 23, 2026
