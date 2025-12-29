# Mock Data Testing - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Load Mock Data
```bash
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
./load-mock-data.sh 100 50 true
```

✅ **Result**: 5,000 realistic transactions loaded

### 2. Verify Data
```bash
python3 mock-data-cli.py stats
```

✅ **Result**: See transaction statistics

### 3. Test Marketing AI
```bash
curl -X POST http://localhost:8000/api/marketing/analysis/run-now
```

✅ **Result**: AI analyzes data and generates campaigns

### 4. View Campaigns
```bash
curl http://localhost:8000/api/marketing/campaigns
```

✅ **Result**: See auto-generated marketing campaigns

---

## 📱 With Mobile App

### Start Backend
```bash
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
python3 app/main.py
```

### Load Mock Data (in new terminal)
```bash
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
./load-mock-data.sh 100 50 true
```

### Start Mobile App (in new terminal)
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app
npm start
```

### View in App
- Campaigns display on home screen
- Behavioral segments show user profile
- Conversion tracking works automatically

---

## 🎯 Available Commands

### Load Data
```bash
./load-mock-data.sh [users] [transactions] [clear]

# Examples:
./load-mock-data.sh 100 50 false  # Add to existing
./load-mock-data.sh 100 50 true   # Clear first
./load-mock-data.sh 500 100 true  # Large dataset
```

### CLI Management
```bash
python3 mock-data-cli.py [command] [options]

# Commands:
python3 mock-data-cli.py load --users 100 --transactions 50
python3 mock-data-cli.py stats          # Show statistics
python3 mock-data-cli.py validate       # Check data integrity
python3 mock-data-cli.py clear --yes    # Delete all
python3 mock-data-cli.py reset          # Clear and reload
```

---

## 📊 What Gets Generated

### Users
- 100 mock users (user_1 to user_100)
- Each shops at 3-5 different merchants

### Transactions
- 5,000 total transactions (100 users × 50 avg transactions)
- Realistic amounts ($10-$500)
- Random dates in last 90 days
- 10 different categories

### Categories
- Grocery, Restaurant, Retail
- Healthcare, Gas, Utilities
- Entertainment, Travel
- Technology, Clothing

---

## 🚀 Testing Scenarios

### Scenario 1: Quick Test
```bash
./load-mock-data.sh 50 25 true    # Quick load
curl http://localhost:8000/api/marketing/analysis/run-now
curl http://localhost:8000/api/marketing/campaigns
```

### Scenario 2: Full Integration Test
```bash
./load-mock-data.sh 100 50 true
npm start  # Mobile app
# View campaigns in app
```

### Scenario 3: Performance Testing
```bash
./load-mock-data.sh 1000 100 true  # Large dataset
python3 mock-data-cli.py stats
```

### Scenario 4: Continuous Testing
```bash
while true; do
  python3 mock-data-cli.py reset
  curl -X POST http://localhost:8000/api/marketing/analysis/run-now
  sleep 3600
done
```

---

## ✅ Verification

### Check Data Loaded
```bash
python3 mock-data-cli.py stats
```

### Validate Integrity
```bash
python3 mock-data-cli.py validate
```

### Test API
```bash
curl http://localhost:8000/api/marketing/segments
curl http://localhost:8000/api/marketing/analytics
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
pkill -f "expo|metro"
sleep 2
npm start
```

### Database Connection Error
```bash
# Check .env file
cat .env | grep DB_

# Test connection
psql -U postgres -d swipesavvy_agents -c "SELECT 1"
```

### No Campaigns Generated
```bash
# Verify data loaded
python3 mock-data-cli.py stats

# Check Analysis ran
curl http://localhost:8000/api/marketing/status
```

---

## 📚 More Information

- **MOCK_DATA_GUIDE.md** - Complete documentation
- **MOCK_DATA_COMPLETE.md** - Implementation details
- **MARKETING_AI_IMPLEMENTATION.md** - AI system guide

---

## 🎉 Done!

You now have realistic test data for developing and testing the Marketing AI system.

```
✅ Mock data loaded
✅ Transactions created
✅ Ready for testing
✅ Campaigns auto-generated
```

**Next**: Use this data to test campaigns, analytics, and mobile integration!
