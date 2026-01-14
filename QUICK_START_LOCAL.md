# SwipeSavvy Local Development Quick Start

Complete guide to run the entire SwipeSavvy platform locally.

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **Python** 3.11+ (check: `python3 --version`)
- **PostgreSQL** 14+ (check: `psql --version`)
- **Expo CLI** (install: `npm install -g expo-cli`)

## Directory Structure

```
swipesavvy-mobile-app-v2/
├── main.py                    # Main backend API server
├── swipesavvy-ai-agents/      # AI agents microservice
├── swipesavvy-admin-portal/   # Admin dashboard (React/Vite)
├── swipesavvy-wallet-web/     # Customer wallet portal
├── swipesavvy-customer-website-nextjs/  # Public website
├── src/                       # Mobile app source (Expo/React Native)
└── tools/backend/services/    # Backend service modules
```

---

## Step 1: Database Setup

### Option A: Fresh Local Database

```bash
# Start PostgreSQL (macOS)
brew services start postgresql@14

# Create database
createdb swipesavvy_agents

# Load schema
psql -d swipesavvy_agents -f schema.sql
psql -d swipesavvy_agents -f seed_data.sql
```

### Option B: Sync from AWS (Recommended)

See [DATABASE_SYNC.md](./DATABASE_SYNC.md) for syncing with production data.

---

## Step 2: Environment Configuration

### 2.1 Root `.env`

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Database
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=your_local_password

# API URLs (for mobile app)
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 2.2 Admin Portal `.env`

```bash
cp swipesavvy-admin-portal/.env.deploy.example swipesavvy-admin-portal/.env
```

Edit `swipesavvy-admin-portal/.env`:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 2.3 AI Agents `.env`

```bash
cp swipesavvy-ai-agents/.env.example swipesavvy-ai-agents/.env
```

Edit `swipesavvy-ai-agents/.env`:
```bash
# Database (same as root)
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=your_local_password

# AI API Key (required for AI features)
TOGETHER_API_KEY=your_together_ai_key
```

---

## Step 3: Install Dependencies

Run all installations in parallel:

```bash
# Root (mobile app)
npm install

# Admin Portal
cd swipesavvy-admin-portal && npm install && cd ..

# Wallet Web
cd swipesavvy-wallet-web && npm install && cd ..

# Customer Website
cd swipesavvy-customer-website-nextjs && npm install && cd ..

# Python backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# AI Agents
cd swipesavvy-ai-agents
pip install -r requirements.txt
cd ..
```

---

## Step 4: Start All Services

### Terminal 1: Main Backend API (Port 8000)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
source .venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: AI Agents Service (Port 8001)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source ../.venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Terminal 3: Admin Portal (Port 5173)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-admin-portal
npm run dev
```

### Terminal 4: Wallet Web (Port 3001)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-wallet-web
npm run dev
```

### Terminal 5: Mobile App (Expo)

```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2
npx expo start
```

---

## Quick Start Script

Save time with a single command:

```bash
# Create start script
cat > start-local.sh << 'EOF'
#!/bin/bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2

# Start backend in background
source .venv/bin/activate
nohup python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
echo "Backend API started on port 8000"

# Start AI agents in background
cd swipesavvy-ai-agents
nohup python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 > ai-agents.log 2>&1 &
echo "AI Agents started on port 8001"
cd ..

# Start admin portal in background
cd swipesavvy-admin-portal
nohup npm run dev > admin.log 2>&1 &
echo "Admin Portal started on port 5173"
cd ..

# Start wallet web in background
cd swipesavvy-wallet-web
nohup npm run dev > wallet.log 2>&1 &
echo "Wallet Web started on port 3001"
cd ..

echo ""
echo "All services starting. Wait 10 seconds then access:"
echo "  - Backend API:   http://localhost:8000"
echo "  - API Docs:      http://localhost:8000/docs"
echo "  - Admin Portal:  http://localhost:5173"
echo "  - Wallet Portal: http://localhost:3001"
echo ""
echo "To start mobile app: npx expo start"
EOF

chmod +x start-local.sh
```

---

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | Main API server |
| API Docs | http://localhost:8000/docs | Swagger/OpenAPI |
| Admin Portal | http://localhost:5173 | Admin dashboard |
| Wallet Portal | http://localhost:3001 | Customer wallet |
| AI Agents | http://localhost:8001 | AI services |
| Mobile App | Expo Go / Simulator | React Native app |

---

## Test Credentials

### Admin Portal Login
- **Super Admin**: `admin@swipesavvy.com` / `admin123`
- **Support**: `support@swipesavvy.com` / `support123`
- **Analyst**: `analyst@swipesavvy.com` / `analyst123`

### Mobile App Login (Mock Mode)
- Any email/password works in development
- OTP: Any 6-digit code (e.g., `123456`)

---

## Health Checks

```bash
# Backend API
curl http://localhost:8000/health

# AI Agents
curl http://localhost:8001/health

# Admin Portal
curl http://localhost:5173

# Database connection
psql -d swipesavvy_agents -c "SELECT 1"
```

---

## Troubleshooting

### Backend won't start
```bash
# Check if port is in use
lsof -i :8000

# Kill existing process
kill -9 $(lsof -t -i:8000)

# Check logs
tail -f backend.log
```

### Database connection failed
```bash
# Verify PostgreSQL is running
brew services list | grep postgresql

# Start if not running
brew services start postgresql@14

# Test connection
psql -d swipesavvy_agents -c "\dt"
```

### Mobile app can't connect to backend
```bash
# For iOS Simulator: localhost works
# For Android Emulator: use 10.0.2.2:8000
# For Physical Device: use your machine's IP address

# Find your local IP
ipconfig getifaddr en0
```

### Clear all caches
```bash
# Expo cache
npx expo start --clear

# Node modules
rm -rf node_modules && npm install

# Vite cache
rm -rf swipesavvy-admin-portal/node_modules/.vite
```

---

## Stop All Services

```bash
# Kill all Node processes
pkill -f "node"

# Kill Python processes
pkill -f "uvicorn"

# Or kill specific ports
kill -9 $(lsof -t -i:8000) 2>/dev/null
kill -9 $(lsof -t -i:8001) 2>/dev/null
kill -9 $(lsof -t -i:5173) 2>/dev/null
kill -9 $(lsof -t -i:3001) 2>/dev/null
```

---

## Next Steps

1. [DATABASE_SYNC.md](./DATABASE_SYNC.md) - Sync local database with AWS
2. [QUICK_START_AWS.md](./QUICK_START_AWS.md) - Deploy to AWS
3. [PLATFORM_DOCUMENTATION.md](./PLATFORM_DOCUMENTATION.md) - Full platform docs
