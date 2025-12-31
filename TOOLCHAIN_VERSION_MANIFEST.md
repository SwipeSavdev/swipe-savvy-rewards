# Toolchain Version Manifest
**Generated:** December 28, 2025  
**Purpose:** Standardized runtime versions and toolchain specifications for SwipeSavvy platform  
**Audience:** DevOps, Backend Engineers, Frontend Engineers, QA

---

## Executive Summary

This document specifies the exact versions of all runtimes, package managers, and development tools required for the SwipeSavvy platform. **All team members must use these versions** to ensure reproducible builds and deployments.

| Component | Specified Version | Type | OS Support |
|-----------|---|---|---|
| **Node.js** | 20.13.0 LTS | Runtime | macOS, Linux, Windows |
| **npm** | 10.8.2 | Package Manager | (bundled with Node) |
| **Python** | 3.11.8 LTS | Runtime | macOS, Linux, Windows |
| **pip** | 24.0+ | Package Manager | (bundled with Python) |
| **Docker Desktop** | 4.26.0+ | Containerization | macOS, Windows |
| **Docker Engine** | 24.0.0+ | Container Runtime | Linux |
| **Docker Compose** | 2.24.0+ | Orchestration | Bundled in Desktop |
| **PostgreSQL** | 16 (pgvector) | Database | Docker container |
| **Redis** | 7.x | Cache/Queue | Docker container |
| **Git** | 2.40+ | VCS | macOS, Linux, Windows |

---

## Part 1: Node.js & npm

### Node.js 20.13.0 LTS

**Release Date:** November 15, 2024  
**LTS Support Until:** October 18, 2026  
**Why This Version:**
- ✅ Current LTS (long-term support)
- ✅ Stable for React, Vite, Expo
- ✅ Latest npm 10.x included
- ✅ Excellent performance improvements
- ✅ Security patches guaranteed for 24 months

### npm 10.8.2

**Release Date:** December 2024  
**Included With:** Node.js 20.13.0  
**Features:**
- ✅ Workspace support (if needed)
- ✅ Robust lock file handling
- ✅ Security audit built-in
- ✅ Better dependency resolution

### Installation Methods

#### Option 1: nvm (Node Version Manager) — Recommended for Development

**macOS:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add to ~/.zshrc or ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node 20.13.0
nvm install 20.13.0
nvm use 20.13.0

# Set as default
nvm alias default 20.13.0

# Verify
node --version  # v20.13.0
npm --version   # 10.8.2
```

**Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Then same as macOS above
```

#### Option 2: Homebrew (macOS)

```bash
brew install node@20
node --version  # v20.13.0
npm --version   # 10.8.2
```

#### Option 3: fnm (Fast Node Manager)

```bash
brew install fnm
fnm use 20.13.0
fnm default 20.13.0
```

#### Option 4: Docker (Recommended for CI/CD)

```dockerfile
FROM node:20.13.0-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
```

### Verification Checklist

```bash
# Check versions
node --version    # Expected: v20.13.0
npm --version     # Expected: 10.8.2
npm -g list npm   # Verify npm is latest in node

# Verify package-lock.json format
npm list --depth=0

# Verify no global modules conflict
npm ls -g --depth=0
```

### .nvmrc File (for automatic version switching)

Create `.nvmrc` in each Node.js repo:

```
20.13.0
```

Then users can:
```bash
nvm use  # Automatically switches to 20.13.0
```

---

## Part 2: Python & pip

### Python 3.11.8 LTS

**Release Date:** December 2023  
**LTS Support Until:** October 2027  
**Why This Version:**
- ✅ Long-term support until Oct 2027
- ✅ Stable for FastAPI, SQLAlchemy, PyTorch
- ✅ Performance improvements over 3.10
- ✅ Excellent type hints support
- ✅ Widely available across platforms

### pip 24.0+

**Included With:** Python 3.11.8  
**Features:**
- ✅ PEP 517 build backend support
- ✅ Dependency resolver improvements
- ✅ Security vulnerability scanning
- ✅ Better error messages

### Installation Methods

#### Option 1: pyenv (Python Version Manager) — Recommended for Development

**macOS:**
```bash
# Install pyenv
brew install pyenv pyenv-virtualenv

# Add to ~/.zshrc or ~/.bash_profile
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

# Install Python 3.11.8
pyenv install 3.11.8
pyenv global 3.11.8

# Verify
python --version  # Python 3.11.8
pip --version     # pip 24.0+
```

**Linux:**
```bash
# Install dependencies first
sudo apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev wget curl llvm libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

# Then
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
cd ~/.pyenv && src/configure && make -C src
# Add to ~/.bashrc
eval "$(~/.pyenv/bin/pyenv init -)"

# Install Python
pyenv install 3.11.8
pyenv global 3.11.8
```

#### Option 2: Homebrew (macOS)

```bash
brew install python@3.11
python3 --version  # Python 3.11.8
pip3 --version     # pip 24.0+
```

#### Option 3: python.org Official Installer

```bash
# Download from https://www.python.org/downloads/
# Run installer
python3 --version  # Verify 3.11.8
pip3 --version     # Verify 24.0+
```

#### Option 4: Docker (Recommended for CI/CD)

```dockerfile
FROM python:3.11.8-slim

WORKDIR /app
COPY requirements-pinned.txt .
RUN pip install --no-cache-dir -r requirements-pinned.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### Virtual Environment Setup

**Required:** Each project must use a virtual environment (no system Python)

```bash
# Create virtual environment
python3.11 -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Verify
which python  # Should show venv/bin/python
python --version  # Should be 3.11.8

# Install requirements
pip install -r requirements-pinned.txt

# Check installed versions
pip list
```

### .python-version File (for automatic version switching with pyenv)

Create `.python-version` in swipesavvy-ai-agents:

```
3.11.8
```

Then users with pyenv installed can:
```bash
cd swipesavvy-ai-agents
python --version  # Automatically switches to 3.11.8
```

### pyproject.toml Configuration (Optional but Recommended)

```toml
[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "swipesavvy-ai-agents"
version = "1.0.0"
requires-python = ">=3.11.8,<4.0.0"
dependencies = [
    "fastapi>=0.104.1",
    "sqlalchemy>=2.0.23",
    # ... etc
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.3",
    "black>=23.12.1",
    # ... etc
]
```

---

## Part 3: Docker & Container Runtime

### Docker Desktop (macOS & Windows)

**Version:** 4.26.0+ (stable channel)  
**Install:** https://www.docker.com/products/docker-desktop

**Verification:**
```bash
docker --version    # Docker version 24.0.0+
docker-compose --version  # Docker Compose 2.24.0+
docker run hello-world  # Should print "Hello from Docker!"
```

### Docker Engine (Linux)

**Version:** 24.0.0+  
**Installation:** https://docs.docker.com/engine/install/

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker run hello-world
```

### Docker Compose (included in Desktop, but can be installed separately)

**Version:** 2.24.0+

```bash
# Docker Desktop users: Automatically included ✅

# Linux users (manual install):
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Docker Image Versions (for Services)

Use these **exact versions** in docker-compose.yml:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16  # ✅ PostgreSQL 16 with pgvector
  
  redis:
    image: redis:7.0-alpine        # ✅ Redis 7.0 (lightweight)
  
  mobile-app:
    build:
      context: ./swipesavvy-mobile-app
      dockerfile: Dockerfile
    # Uses Node 20.13.0 in image
```

---

## Part 4: Database Runtimes

### PostgreSQL 16 with pgvector

**Image:** `pgvector/pgvector:pg16`  
**Use Case:** AI agents vector storage, primary application database  
**Features:**
- ✅ pgvector extension for embeddings
- ✅ Modern PostgreSQL 16 features
- ✅ JSONB support
- ✅ Advanced indexing (BRIN, GiST)

**Docker Compose Entry:**
```yaml
postgres:
  image: pgvector/pgvector:pg16
  container_name: swipesavvy-postgres
  environment:
    POSTGRES_DB: swipesavvy_ai
    POSTGRES_USER: swipesavvy
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Use env var in prod
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U swipesavvy"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Redis 7.0

**Image:** `redis:7.0-alpine`  
**Use Case:** Caching, session storage, rate limiting  
**Why Alpine:** Lightweight image (~50 MB vs 200 MB full)

**Docker Compose Entry:**
```yaml
redis:
  image: redis:7.0-alpine
  container_name: swipesavvy-redis
  ports:
    - "6379:6379"
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 5
```

---

## Part 5: Development Tools

### Git

**Version:** 2.40+  
**Installation:**
```bash
# macOS
brew install git

# Linux
sudo apt-get install git

# Windows
https://git-scm.com/download/win

# Verify
git --version  # Should be 2.40+
```

### Code Editor: VS Code

**Version:** Latest stable (auto-update)  
**Extensions for SwipeSavvy:**
- Eslint
- Python
- Pylance
- Docker
- REST Client
- Thunder Client (or Postman)

### Linting & Formatting

#### JavaScript/TypeScript

- **ESLint:** Already in package.json (^8.56.0+)
- **Prettier:** Already in package.json (^3.2.4+)

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

#### Python

- **Black:** `black>=23.12.1` (code formatter)
- **flake8:** `flake8>=6.1.0` (linter)
- **isort:** `isort>=5.13.2` (import organizer)
- **mypy:** `mypy>=1.7.1` (type checker)

```bash
# Format Python code
black .

# Check linting
flake8 .

# Organize imports
isort .

# Type checking
mypy .
```

### Testing Frameworks

#### Node.js Testing

- **Jest:** Testing framework (^29.7.0)
- **Playwright:** E2E testing (@1.57.0+)
- **Cypress:** E2E testing (^15.8.1+)

```bash
npm test              # Run Jest
npm run test:watch   # Jest watch mode
npx playwright test  # Run Playwright
npx cypress open    # Cypress UI
```

#### Python Testing

- **pytest:** Testing framework (>=7.4.3)
- **pytest-asyncio:** Async test support (>=0.21.1)
- **pytest-cov:** Coverage reporting (>=4.1.0)

```bash
pytest                          # Run all tests
pytest -v                      # Verbose
pytest --cov=app --cov-report=html  # Coverage report
pytest -k "test_function_name" # Run specific test
```

---

## Part 6: Environment Variables Configuration

### Standard Environment Files

Each repository should have:

```
.env.example          # Template (commit to git)
.env.local            # Local development (git-ignored)
.env.development      # Dev environment config
.env.staging          # Staging config
.env.production       # Production config (NEVER commit secrets)
```

### Node.js Environment Setup

Create `.env.local` in each Node project:

```bash
# swipesavvy-admin-portal/.env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_DEBUG_MODE=true

# swipesavvy-mobile-app/.env.local
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_DEBUG_MODE=true

# swipesavvy-wallet-web/.env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_DEBUG_MODE=true
```

### Python Environment Setup

Create `.env.local` in swipesavvy-ai-agents:

```bash
# Database
DATABASE_URL=postgresql://swipesavvy:dev_password@localhost:5432/swipesavvy_ai
REDIS_URL=redis://localhost:6379/0

# API Keys (use actual keys in .env.local, NEVER in repo)
TOGETHER_API_KEY=sk-...
OPENAI_API_KEY=sk-...

# Configuration
AGENT_MODEL=meta-llama/Llama-3.3-70B-Instruct-Turbo
DEBUG=true
LOG_LEVEL=DEBUG
```

### Docker Compose Environment

```yaml
# docker-compose.yml
environment:
  # Use env vars from .env file
  POSTGRES_DB: ${POSTGRES_DB:-swipesavvy_ai}
  POSTGRES_USER: ${POSTGRES_USER:-swipesavvy}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-dev_password}
  DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
  REDIS_URL: redis://redis:6379/0
```

---

## Part 7: Build & Deployment Commands

### Node.js Projects

```bash
# Install dependencies (using lock file)
npm ci

# Development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### Python Projects

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements-pinned.txt

# Install dev dependencies
pip install -r requirements-pinned-dev.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Type checking
mypy .

# Code formatting
black .

# Linting
flake8 .

# Import organization
isort .

# Testing
pytest
pytest -v
pytest --cov=app --cov-report=html

# Generate pinned requirements
pip freeze > requirements-pinned.txt
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Run specific service
docker-compose up -d postgres

# Execute command in container
docker-compose exec api python -m pytest

# View service health
docker-compose ps
```

---

## Part 8: Verification Matrix

### Pre-Development Checklist

Before starting work, **every developer** must verify:

```bash
# Node.js
[ ] node --version shows v20.13.0
[ ] npm --version shows 10.8.2
[ ] npm ci succeeds (test in each Node repo)
[ ] npm list --depth=0 shows correct versions

# Python
[ ] python3 --version shows 3.11.8
[ ] pip --version shows 24.0+
[ ] python -m venv venv succeeds
[ ] pip install -r requirements-pinned.txt succeeds

# Docker
[ ] docker --version shows 24.0.0+
[ ] docker-compose --version shows 2.24.0+
[ ] docker ps shows no errors
[ ] docker run hello-world works

# Git
[ ] git --version shows 2.40+
[ ] git clone works
[ ] .git/config shows correct remote

# Development Tools
[ ] VS Code is installed with extensions
[ ] ESLint/Prettier installed in Node projects
[ ] Black/flake8/isort available in Python path
```

### CI/CD Verification

All CI/CD pipelines must verify:

```bash
[ ] Node version is 20.13.0
[ ] npm version is 10.8.2
[ ] Python version is 3.11.8
[ ] pip version is 24.0+
[ ] npm ci succeeds without errors
[ ] npm audit shows 0 critical vulnerabilities
[ ] pip install succeeds
[ ] pip audit shows 0 critical vulnerabilities
[ ] All tests pass
[ ] Type checking passes (tsc, mypy)
[ ] Docker image builds successfully
[ ] Docker image runs without errors
```

---

## Part 9: Troubleshooting

### Node.js Version Issues

**Problem:** `npm ci fails with "peer dep missing"`

```bash
# Solution: Ensure you have exact version
node --version  # Verify v20.13.0
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem:** `nvm: command not found`

```bash
# Solution: Add nvm to shell
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc
nvm use 20.13.0
```

### Python Version Issues

**Problem:** `python --version shows wrong version`

```bash
# Solution: Use specific python3.11
python3.11 --version
python3.11 -m venv venv
source venv/bin/activate
```

**Problem:** `pip install fails with "No matching distribution"`

```bash
# Solution: Ensure Python 3.11.8
pip --version  # Should be 24.0+
pip install --upgrade pip setuptools wheel
pip install -r requirements-pinned.txt
```

### Docker Issues

**Problem:** `docker: permission denied`

```bash
# Solution: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
docker ps  # Should work now
```

**Problem:** `docker-compose up fails with "Cannot find module"`

```bash
# Solution: Rebuild with no cache
docker-compose build --no-cache
docker-compose up -d
```

---

## Part 10: Version Update Policy

### Quarterly Security Updates

Every **3 months**, review:
- `npm audit` for critical vulnerabilities
- `pip audit` for critical vulnerabilities
- Node.js LTS release notes
- Python security advisories

### Major Version Upgrades

Only after:
1. ✅ Full test suite passes on current version
2. ✅ Breaking changes documented
3. ✅ Staging environment tested with new version
4. ✅ Rollback plan documented
5. ✅ Team approval obtained

### Blocked Versions

These versions are **NOT ALLOWED**:
- Node < 20.0.0 (too old)
- Node > 21.x (next major, wait for LTS)
- Python < 3.11.0 (too old)
- Python > 3.12.x (evaluate before adoption)
- React < 18.0.0 in stable projects
- React 19.x (wait for 19.2.0+ before production)
- React Native < 0.73.0 (not tested)
- React Native > 0.81.x (too new)

---

## Conclusion

**This manifest is the source of truth** for all toolchain versions. 

**Enforce this document by:**
1. Adding `.nvmrc` to all Node.js repos ✅
2. Adding `.python-version` to Python repos ✅
3. Adding version checks to CI/CD pipelines ✅
4. Including in onboarding checklist ✅
5. Reviewing quarterly ✅

**Violations will be caught by:**
- CI/CD pipeline version checks
- Pre-commit hooks (if configured)
- Peer review in PRs
- Automated dependency audits

**Success = All developers use identical toolchains = No "works on my machine" problems**
