# Development Guide

## Local Development Setup

### Prerequisites

1. **Python 3.11+**
   ```bash
   python --version  # Should be 3.11 or higher
   ```

2. **Docker Desktop** (optional, for databases)
   - Download from https://www.docker.com/products/docker-desktop
   - Or install PostgreSQL and Redis separately

3. **Git**
   ```bash
   git --version
   ```

### First-Time Setup

1. **Clone repository** (if from remote)
   ```bash
   git clone https://github.com/swipesavvy/swipesavvy-ai-agents.git
   cd swipesavvy-ai-agents
   ```

2. **Create Python virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Download NLP models** (for PII detection)
   ```bash
   python -m spacy download en_core_web_lg
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

6. **Start databases** (if using Docker)
   ```bash
   docker compose up -d
   # Or: brew install postgresql redis (macOS)
   ```

7. **Run database migrations**
   ```bash
   # TODO: Create migration scripts in Week 2
   # python scripts/migrate.py
   ```

### Running Services Locally

Each service can be run independently:

```bash
# AI Concierge (port 8000)
cd services/concierge-agent
python main.py

# RAG Service (port 8001)
cd services/rag-service
python main.py

# Guardrails Service (port 8002)
cd services/guardrails-service
python main.py
```

**Access services:**
- AI Concierge: http://localhost:8000
- RAG Service: http://localhost:8001
- Guardrails Service: http://localhost:8002

**API Documentation:**
- AI Concierge: http://localhost:8000/docs
- RAG Service: http://localhost:8001/docs
- Guardrails Service: http://localhost:8002/docs

### Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_concierge.py

# Run with coverage
pytest --cov=services --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Code Quality

```bash
# Format code
black .

# Sort imports
isort .

# Lint
flake8 services/ tools/

# Type checking
mypy services/
```

### Database Access

**PostgreSQL:**
```bash
# Using Docker
docker exec -it swipesavvy-agents-postgres psql -U postgres -d swipesavvy_agents

# Using local installation
psql -U postgres -d swipesavvy_agents
```

**Redis:**
```bash
# Using Docker
docker exec -it swipesavvy-agents-redis redis-cli

# Using local installation
redis-cli
```

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/your-feature-name` - Feature branches

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

3. **Run tests**
   ```bash
   pytest
   black .
   flake8 .
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

## Troubleshooting

### Docker issues
```bash
# Stop all containers
docker compose down

# Remove volumes and restart
docker compose down -v
docker compose up -d
```

### Python environment issues
```bash
# Deactivate and recreate venv
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database connection issues
- Check `.env` file has correct credentials
- Verify databases are running: `docker compose ps`
- Check logs: `docker compose logs postgres`

## Phase 1 Development Notes

### Week 1 (Current)
- Focus: Project setup and infrastructure
- No code implementation yet
- Services are placeholders with health checks only

### Week 2 (Starting Jan 3)
- Implement RAG service
- Set up vector database
- Index knowledge base documents

### Week 3 (Starting Jan 10)
- Implement guardrails service
- PII detection and masking
- Policy enforcement

### Week 4-6 (Starting Jan 17)
- Implement AI Concierge agent
- Tool functions
- Conversation flows

## Resources

- [Implementation Plan](../swipesavvy-documentation/docs/12-AI-Agentic-Chat-Agents/Implementation-Plan-Q1-2026.md)
- [Week 1 Checklist](./WEEK_1_CHECKLIST.md)
- [Project Status](../PROJECT_STATUS.md)
- [AI Agents Documentation](../swipesavvy-documentation/docs/12-AI-Agentic-Chat-Agents/README.md)

## Getting Help

- Slack: #ai-agents-dev
- Documentation: See links above
- Team: Check TEAM_CHARTER.md (to be created)
