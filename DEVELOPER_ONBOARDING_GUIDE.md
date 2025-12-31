# SwipeSavvy Developer Onboarding Guide

**Purpose:** Enable new developers to set up their development environment, understand the platform architecture, and make their first contribution within 2 hours.

**Last Updated:** December 28, 2025  
**Version:** 1.0  
**Target Audience:** New developers, team members

---

## Quick Start (30 minutes)

### Prerequisites
- macOS, Linux, or Windows (WSL2)
- Git installed
- 20 GB free disk space
- Admin/sudo access

### Step 1: Clone Repository (2 minutes)

```bash
git clone https://github.com/swipesavvy/swipesavvy-mobile-app-v2.git
cd swipesavvy-mobile-app-v2
```

### Step 2: Install Version Managers (5 minutes)

**For macOS (using Homebrew):**
```bash
# Install Node Version Manager
brew install nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Install Python Version Manager
brew install pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
source ~/.zshrc
```

**For Linux (Ubuntu/Debian):**
```bash
# Install Node Version Manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Python Version Manager
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
eval "$(~/.pyenv/bin/pyenv init -)"
source ~/.bashrc
```

### Step 3: Install Required Versions (10 minutes)

```bash
# Install Node.js 20.13.0 (exact version required)
nvm install 20.13.0
nvm use 20.13.0
node --version  # Should print: v20.13.0

# Verify npm version
npm --version   # Should print: 10.8.2

# Install Python 3.11.8
pyenv install 3.11.8
pyenv local 3.11.8
python --version  # Should print: Python 3.11.8
```

### Step 4: Set Up Project Directories (8 minutes)

```bash
# Install dependencies for each project
cd swipesavvy-admin-portal
npm ci  # Use 'npm ci' NOT 'npm install' (ensures lock file compliance)
cd ..

cd swipesavvy-customer-website
npm ci
cd ..

cd swipesavvy-mobile-app
npm ci
cd ..

cd swipesavvy-ai-agents
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-pinned.txt
cd ..
```

### Step 5: Verify Installation (5 minutes)

```bash
# Run version checks
node --version    # v20.13.0
npm --version     # 10.8.2
python --version  # Python 3.11.8

# Run smoke tests in each project
cd swipesavvy-admin-portal && npm run build && cd ..
cd swipesavvy-wallet-web && npm run build && cd ..
cd swipesavvy-mobile-app && npm run build && cd ..
cd swipesavvy-ai-agents && python -m pytest tests/test_imports.py -v && cd ..
```

✅ **If all above commands succeed, you're ready to develop!**

---

## Development Environment Setup

### IDE Configuration

#### VS Code (Recommended)

1. **Install Extensions:**
   ```
   ESLint (dbaeumer.vscode-eslint)
   Prettier (esbenp.prettier-vscode)
   Python (ms-python.python)
   Pylance (ms-python.pylance)
   TypeScript Vue Plugin (Vue.volar)
   Docker (ms-vscode.docker)
   GitLens (eamodio.gitlens)
   ```

2. **Create `.vscode/settings.json` in project root:**
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "python.formatting.provider": "black",
     "python.linting.enabled": true,
     "python.linting.blackEnabled": true,
     "python.linting.flake8Enabled": true,
     "python.linting.mypyEnabled": true,
     "[python]": {
       "editor.defaultFormatter": "ms-python.python",
       "editor.formatOnSave": true
     }
   }
   ```

3. **Configure Line Length:**
   - ESLint/Prettier: 100 characters
   - Black: 88 characters (Python standard)
   - Flake8: 100 characters

#### IntelliJ IDEA / WebStorm

1. **Settings > Editor > Code Style:**
   - Set Line Length to 100
   - Enable ESLint
   - Enable Prettier

2. **Settings > Languages & Frameworks > Python:**
   - Set Python Interpreter to pyenv 3.11.8
   - Enable Black formatter
   - Enable MyPy type checker

### Git Configuration

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# Enable helpful features
git config --global pull.rebase true
git config --global core.autoCRLF input  # On Windows: input
git config --global core.editor "nano"  # or your preferred editor
```

### Environment Variables

**Node.js Projects:** Create `.env.local` in each Node project:
```bash
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

**Python Projects:** Create `.env` in project root:
```bash
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/swipesavvy_dev
REDIS_URL=redis://localhost:6379
DEBUG=true
```

---

## Project Structure Overview

### Repository Layout

```
swipesavvy-mobile-app-v2/
├── swipesavvy-admin-portal/        # Admin dashboard (React + TypeScript)
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
├── swipesavvy-customer-website/    # Customer-facing site (React + TypeScript)
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
├── swipesavvy-mobile-app/          # React Native mobile app
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── .nvmrc
├── swipesavvy-ai-agents/           # Python AI services
│   ├── app/
│   ├── tests/
│   ├── requirements-pinned.txt
│   ├── pytest.ini
│   └── .python-version
├── .github/workflows/              # CI/CD workflows
│   ├── ci-nodejs.yml
│   ├── ci-python.yml
│   ├── test-e2e.yml
│   ├── security-audit.yml
│   └── deploy-production.yml
├── shared/                         # Shared utilities and branding
└── README.md
```

### Key Files & Their Purposes

| File | Purpose | Who Changes It |
|------|---------|---|
| `.nvmrc` | Node.js version spec | Rarely (version updates) |
| `.python-version` | Python version spec | Rarely (version updates) |
| `package.json` | npm dependencies & scripts | Dev (feature work) |
| `package-lock.json` | npm lock file | Auto-generated (commit it) |
| `requirements-pinned.txt` | Python exact versions | Rarely (version updates) |
| `.eslintrc.json` | JavaScript/TypeScript linting | Dev (linting changes) |
| `tsconfig.json` | TypeScript config | Rarely (compiler settings) |
| `pytest.ini` | Python testing config | Dev (test changes) |
| `.github/workflows/*.yml` | CI/CD automation | DevOps (pipeline changes) |

---

## Common Development Workflows

### Creating a Feature Branch

```bash
# Always start from updated main
git checkout main
git pull origin main

# Create feature branch with semantic naming
git checkout -b feat/user-authentication
# Or for bug fix: git checkout -b fix/login-redirect
# Or for improvement: git checkout -b refactor/component-structure

# Link to issue (optional but recommended)
git branch --edit-description
# Add: "Fixes #123" in the description
```

### Making Your First Commit

```bash
# Stage your changes
git add src/MyComponent.tsx tests/MyComponent.test.tsx

# Commit with semantic message
git commit -m "feat: add user authentication modal

- Implements login form with validation
- Integrates with auth API endpoint
- Adds unit tests (95% coverage)

Fixes #123"

# Push to your branch
git push origin feat/user-authentication
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>

Types: feat, fix, docs, style, refactor, test, chore
Scope: component/module affected
Subject: concise description (50 chars max)
Body: explain what and why (not how)
Footer: reference issues (Fixes #123)
```

### Running Tests Locally

**Node.js Projects:**
```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run specific test file
npm test MyComponent.test.tsx

# Generate coverage report
npm test -- --coverage
```

**Python Projects:**
```bash
# Activate virtual environment
cd swipesavvy-ai-agents
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Generate coverage report
pytest --cov=app --cov-report=html
```

### Code Quality Checks

**Before committing, run quality checks:**

```bash
# JavaScript/TypeScript Projects
npm run lint        # Run ESLint
npm run format      # Run Prettier (fixes auto-fixable issues)
npm run type-check  # Run TypeScript compiler

# Python Projects
cd swipesavvy-ai-agents
black .            # Format all Python files
flake8 app/        # Check style
mypy app/          # Check types
```

### Building for Production

```bash
# Node.js Projects
cd swipesavvy-admin-portal
npm run build      # Creates optimized build in dist/
# Output: .vite/build stats showing bundle sizes

# Python Projects
cd swipesavvy-ai-agents
pip install -r requirements-pinned.txt
python -m pytest   # Verify all tests pass before build
```

---

## Pull Request Workflow

### Step 1: Create Pull Request

1. Push your branch: `git push origin feat/your-feature`
2. Go to GitHub and click "New Pull Request"
3. Fill in the PR template:

```markdown
## Description
Brief description of what this PR does

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (feature or fix causing existing code to break)

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines (ESLint/Black)
- [ ] Self-review of own code completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing locally
- [ ] CI/CD pipeline passing
```

### Step 2: Address CI/CD Pipeline

Your PR will automatically trigger CI checks:

- **ci-nodejs.yml**: Linting, type checking, building
- **ci-python.yml**: Linting, type checking, testing
- **test-e2e.yml**: End-to-end tests
- **security-audit.yml**: Dependency security scanning

✅ **All checks must pass before merging**

**If a check fails:** See [CI/CD Troubleshooting Guide](#cicd-troubleshooting-guide)

### Step 3: Code Review

1. At least one team member must review
2. Reviewer checks:
   - Code quality and readability
   - Test coverage
   - Documentation completeness
   - No security issues

3. Address review comments:
   ```bash
   # Make changes locally
   git add .
   git commit -m "refactor: address review feedback"
   git push origin feat/your-feature
   # PR updates automatically
   ```

### Step 4: Merge

Once approved and CI passes:

1. Click "Squash and merge" (preferred for cleaner history)
2. Ensure commit message follows semantic format
3. Delete branch after merging

---

## Debugging Tips

### Node.js Debugging

**In VS Code:**
1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/node_modules/.bin/vite",
      "console": "integratedTerminal"
    }
  ]
}
```

2. Set breakpoints and press F5 to debug

**Console Logging:**
```typescript
// Good
console.log('Processing user:', { id, email, role });

// Avoid
console.log('test');  // What test? Be specific!
console.log(user);    // Use object syntax instead
```

### Python Debugging

**Using pdb (Python Debugger):**
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Modern way (Python 3.7+)
breakpoint()

# Then in terminal
pytest tests/test_auth.py
# Debugger will pause at breakpoint
(Pdb) n  # next line
(Pdb) c  # continue
(Pdb) p var_name  # print variable
```

### Checking Logs

```bash
# View recent logs
tail -f /path/to/logfile.log

# Search logs for errors
grep ERROR /path/to/logfile.log

# Filter by timestamp
grep "2025-12-28" /path/to/logfile.log | grep ERROR
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `npm ERR! code ERESOLVE` | Delete `node_modules/` and `package-lock.json`, run `npm ci` |
| `Module not found` | Run `npm ci` or `npm install` to install dependencies |
| `TypeScript errors` | Run `npm run type-check` to see full error list |
| `ESLint errors` | Run `npm run lint` or `npm run format` to auto-fix |
| `Port already in use` | Kill process: `lsof -i :3000` then `kill -9 <PID>` |
| `Python venv not activated` | Run `source venv/bin/activate` each session |
| `pytest not found` | Activate venv: `source venv/bin/activate` |
| `Git merge conflict` | See Git Conflict Resolution below |

### Git Conflict Resolution

```bash
# When you have conflicts
git status
# Shows files with conflicts (marked with "both modified")

# Open conflicted file and look for:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

# Manually resolve, then:
git add resolved-file.tsx
git commit -m "resolve merge conflict"
git push
```

---

## Resources & Getting Help

### Documentation
- [Governance Policy](GOVERNANCE_POLICY.md) - What we do and why
- [Dependency Management Log](DEPENDENCY_MANAGEMENT_LOG.md) - Dependency status
- [Release Management Guide](RELEASE_MANAGEMENT_GUIDE.md) - How we release
- [Security Vulnerability Management](SECURITY_VULNERABILITY_MANAGEMENT.md) - Security procedures

### Quick Commands Reference

```bash
# Setup
nvm use 20.13.0
npm ci
python -m venv venv
source venv/bin/activate

# Development
npm run dev
npm test
npm run lint
npm run format
npm run type-check

# Building
npm run build

# Git workflow
git checkout -b feat/feature-name
git commit -m "feat: description"
git push origin feat/feature-name
# Create PR on GitHub

# Debugging
npm run dev -- --debug
pytest -v -s
```

### Getting Help

1. **Quick questions:** Check Slack #dev-support channel
2. **Documentation:** Search existing docs first
3. **Code examples:** Look at similar features in codebase
4. **PR review:** Ask reviewer during code review
5. **Stuck:** Create an issue or ask in team standup

### Key Contacts

| Role | Slack | Expertise |
|------|-------|-----------|
| Engineering Lead | @alex | Overall architecture |
| Frontend Lead | @sarah | React/TypeScript best practices |
| Backend Lead | @mike | Python/API design |
| DevOps Lead | @jen | CI/CD, deployment, infrastructure |
| QA Lead | @chris | Testing strategies, E2E tests |

---

## Onboarding Verification Checklist

Use this checklist to verify your setup is complete:

- [ ] Git configured with your name/email
- [ ] Node.js 20.13.0 installed and verified
- [ ] npm 10.8.2 installed and verified
- [ ] Python 3.11.8 installed and verified
- [ ] All 4 projects have dependencies installed
- [ ] swipesavvy-admin-portal builds successfully
- [ ] swipesavvy-customer-website builds successfully
- [ ] swipesavvy-mobile-app builds successfully
- [ ] swipesavvy-ai-agents tests pass
- [ ] VS Code extensions installed (if using VS Code)
- [ ] IDE configured with proper formatters
- [ ] Environment variables set up
- [ ] Created first feature branch
- [ ] Able to run tests locally
- [ ] Able to run linting/formatting
- [ ] Slack access and notifications working

✅ **Once all items checked, you're ready to start working!**

---

## Next Steps

1. **Choose your first task:** Ask your team lead for a "good first issue"
2. **Read relevant docs:** Review [Governance Policy](GOVERNANCE_POLICY.md)
3. **Run the code:** Follow development workflows above
4. **Submit PR:** Create your first pull request
5. **Get feedback:** Iterate based on code review
6. **Celebrate:** You're now a SwipeSavvy contributor!

---

**Need help? Reach out to your team lead or post in #dev-support**
