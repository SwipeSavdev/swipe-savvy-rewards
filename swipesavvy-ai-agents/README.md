# SwipeSavvy AI Agents

**Version:** 1.0.0-alpha  
**Status:** Development (Phase 1, Week 1)  
**Target Launch:** Q1 2026

---

## Overview

This repository contains the AI-powered agentic chat agents for the SwipeSavvy Mobile Wallet platform, including:

- **AI Concierge** - Customer-facing agent in mobile wallet (MVP)
- **RAG Service** - Retrieval-augmented generation infrastructure
- **Guardrails Service** - PII detection, policy enforcement, safety controls
- **Evaluation Framework** - Gold sets, metrics, quality assurance
- **MCP Server** - Model Context Protocol for knowledge base access

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Together.AI API key

### Development Setup

```bash
# Clone repository
git clone https://github.com/swipesavvy/swipesavvy-ai-agents.git
cd swipesavvy-ai-agents

# Set up Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Run database migrations
python scripts/migrate.py

# Start services (development)
docker-compose up -d  # Redis, PostgreSQL
python services/concierge-agent/main.py
```

---

## Repository Structure

```
/swipesavvy-ai-agents
├── services/
│   ├── concierge-agent/      # AI Concierge service (Spring Boot/Python)
│   ├── rag-service/           # RAG infrastructure (Python)
│   └── guardrails-service/    # Safety and policy enforcement (Python)
├── tools/                     # Tool functions (API integrations)
│   ├── account/               # Account balance, info
│   ├── transactions/          # Transaction history, search
│   ├── identity/              # Identity verification
│   └── handoff/               # Human agent handoff
├── evaluation/                # Gold sets, test suites, metrics
│   ├── gold-sets/
│   ├── harness/
│   └── reports/
├── scripts/                   # Utilities, migrations, deployment
├── docs/                      # Service-specific documentation
├── tests/                     # Unit and integration tests
├── .github/                   # CI/CD workflows
├── docker-compose.yml         # Local development environment
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## Documentation

**Primary Documentation Repository:** [swipesavvy-documentation](https://github.com/swipesavvy/swipesavvy-documentation)

All architecture decisions, standards, and operational procedures are maintained in the documentation repository:

- [AI Agents README](https://github.com/swipesavvy/swipesavvy-documentation/tree/main/docs/12-AI-Agentic-Chat-Agents/README.md)
- [Reference Architecture](https://github.com/swipesavvy/swipesavvy-documentation/tree/main/docs/12-AI-Agentic-Chat-Agents/01-Agent-Reference-Architecture.md)
- [Implementation Plan Q1 2026](https://github.com/swipesavvy/swipesavvy-documentation/tree/main/docs/12-AI-Agentic-Chat-Agents/Implementation-Plan-Q1-2026.md)
- [Guardrails & Policy Pack](https://github.com/swipesavvy/swipesavvy-documentation/tree/main/docs/12-AI-Agentic-Chat-Agents/03-Guardrails-and-Policy-Pack.md)
- [Database Migrations Guide](MIGRATIONS_GUIDE.md) - Alembic setup and best practices

---

## Current Status: Phase 1, Week 1

### Objectives
- ✅ Repository structure created
- 🔄 Development environment setup
- ⏳ Team alignment and governance
- ⏳ Documentation review

**Next Steps:** See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed progress tracking.

---

## Development Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Testing
```bash
# Run unit tests
pytest tests/unit/

# Run integration tests
pytest tests/integration/

# Run evaluation on gold set
python evaluation/harness/evaluate.py --gold-set gold_set_v1.json
```

### Deployment
- **Development:** Auto-deploy from `develop` branch
- **Staging:** Manual deploy from `develop` branch
- **Production:** Manual deploy from `main` branch with approval

---

## Key Metrics (MVP Targets)

| Metric | Target | Status |
|--------|--------|--------|
| Resolution Rate | >60% | TBD |
| Evaluation Accuracy | >85% | TBD |
| Response Latency (p95) | <2s | TBD |
| User Satisfaction (NPS) | >70 | TBD |
| PII Leakage Incidents | 0 | TBD |
| Uptime | >99.5% | TBD |

---

## Team & Contacts

- **Product Manager:** TBD
- **Tech Lead:** TBD
- **AI Engineer:** TBD
- **Conversation Designer:** TBD
- **QA Engineer:** TBD

**Slack Channels:**
- `#ai-agents-dev` - Development discussions
- `#ai-agents-incidents` - Production incidents
- `#ai-agents-evaluation` - Quality and evaluation

---

## License

Proprietary - SwipeSavvy Inc. © 2025

---

**Let's build responsibly. 🚀**
