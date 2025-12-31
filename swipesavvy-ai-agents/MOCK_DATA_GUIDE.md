# Mock Data Loader - Setup & Usage Guide

## 📋 Overview

The Mock Data Loader populates the database with realistic transactional data from the provided CSV files. This enables testing of the Marketing AI system with real-world data patterns.

## 📁 Input Files

### MerchantList-North.csv
Contains merchant information:
- Merchant ID
- Merchant Name
- Corporate Name
- City, State, ZIP
- MCC Code (Merchant Category Code)
- Contact information

### PaymentSummary-North.csv
Contains aggregate payment data (used for validation):
- Number of deposits
- Total deposit amounts
- Number of debits
- Total debit amounts
- Net deposits

## 🚀 Quick Start

### 1. Prepare Files
Ensure CSV files are in:
```
/Users/macbookpro/Documents/Mock Data/
├── MerchantList-North.csv
└── PaymentSummary-North(12_1_2020-12_25_2025).csv
```

### 2. Run the Script
```bash
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
chmod +x load-mock-data.sh
./load-mock-data.sh [num_users] [transactions_per_user] [clear_first]
```

### 3. Examples

**Load 100 users with 50 transactions each:**
```bash
./load-mock-data.sh 100 50 false
```

**Load 500 users, clear existing data first:**
```bash
./load-mock-data.sh 500 50 true
```

**Load with environment variables:**
```bash
export MOCK_USERS=200
export MOCK_TRANSACTIONS=75
export MOCK_CLEAR=true
./load-mock-data.sh
```

**Load directly with Python:**
```bash
python3 -c "
from app.utils.mock_data_loader import MockDataLoader
loader = MockDataLoader()
loader.load_mock_data(
    merchant_csv='/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv',
    num_users=100,
    transactions_per_user=50,
    clear_existing=False
)
"
```

## 📊 Data Generated

### Transaction Structure
```json
{
  "transaction_id": "user_1_498324516885_0_1703516800",
  "user_id": "user_1",
  "merchant_id": "498324516885",
  "merchant_name": "MID ATLANTIC MEDICAL SER",
  "merchant_location": "PALM BEACH GARDENS, FL",
  "category": "healthcare",
  "amount": 125.50,
  "transaction_date": "2025-12-23T14:30:00",
  "mcc_code": "5969"
}
```

### Default Configuration
- **Users Generated**: 100
- **Transactions per User**: 50
- **Total Transactions**: 5,000+
- **Date Range**: Last 90 days
- **Merchants per User**: 3-5 (random)

### Categories
- Grocery
- Restaurant
- Retail
- Healthcare
- Gas
- Utilities
- Entertainment
- Travel
- Technology
- Clothing

### Amount Distribution
- Random between $10-$500
- Realistic for category

### Time Distribution
- Random dates within 90-day lookback
- Realistic transaction patterns

## 📈 Generated Statistics

After loading, you'll see:
```
Total Transactions: 5,000
Unique Users: 100
Unique Merchants: 85
Total Volume: $1,234,567.89
Date Range: 2025-09-25 to 2025-12-25

Transactions by Category:
  restaurant: 1,250 transactions ($125,000.00)
  retail: 1,100 transactions ($110,000.00)
  grocery: 800 transactions ($80,000.00)
  ...
```

## 🔍 Database Schema

### transactions Table
```sql
CREATE TABLE transactions (
    transaction_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    merchant_id VARCHAR(255),
    merchant_name VARCHAR(255),
    merchant_location VARCHAR(255),
    category VARCHAR(100),
    amount DECIMAL(10,2),
    transaction_date TIMESTAMP,
    mcc_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes Created
- user_id
- merchant_id
- transaction_date
- category

## 🧪 Testing with Mock Data

### 1. Load Mock Data
```bash
./load-mock-data.sh 100 50 true
```

### 2. Verify Data Loaded
```bash
curl http://localhost:8000/api/marketing/segments
```

Expected response showing 7 behavioral segments.

### 3. Run Analysis
```bash
curl -X POST http://localhost:8000/api/marketing/analysis/run-now
```

Should generate campaigns from the mock data.

### 4. Check Results
```bash
curl http://localhost:8000/api/marketing/campaigns
```

Should show auto-generated campaigns based on user behaviors.

## 🛠 Advanced Options

### Custom Merchant File
```python
from app.utils.mock_data_loader import MockDataLoader

loader = MockDataLoader()
loader.load_mock_data(
    merchant_csv='/path/to/custom/merchants.csv',
    num_users=500
)
```

### Clear Existing Data
```python
loader.clear_transactions()
```

### Get Statistics
```python
stats = loader.get_statistics()
print(f"Total transactions: {stats['total_transactions']}")
print(f"Total volume: ${stats['total_volume']}")
```

### Batch Processing
Control batch size for large datasets:
```python
loader.insert_transactions(transactions, batch_size=5000)
```

## 🔧 Environment Variables

```bash
# Database connection
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=swipesavvy_agents
DB_USER=postgres
DB_PASSWORD=password

# Mock data parameters
MOCK_USERS=100
MOCK_TRANSACTIONS=50
MOCK_CLEAR=false
```

## 📝 Using in Tests

### Setup Test Data
```python
import pytest
from app.utils.mock_data_loader import MockDataLoader

@pytest.fixture(scope="session")
def mock_data():
    loader = MockDataLoader()
    loader.load_mock_data(
        merchant_csv='Mock Data/MerchantList-North.csv',
        num_users=50,
        transactions_per_user=30,
        clear_existing=True
    )
    yield
    # Cleanup
    loader.connect()
    loader.clear_transactions()
    loader.disconnect()

def test_marketing_ai(mock_data):
    # Test with mock data
    response = requests.post('http://localhost:8000/api/marketing/analysis/run-now')
    assert response.status_code == 200
```

## 🐛 Troubleshooting

### Issue: "Merchant file not found"
**Solution**: Ensure CSV file exists at `/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv`

### Issue: Database connection fails
**Solution**: Verify database credentials in `.env` file:
```bash
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
```

### Issue: Duplicate transaction errors
**Solution**: Use `MOCK_CLEAR=true` to clear existing data first:
```bash
./load-mock-data.sh 100 50 true
```

### Issue: Very slow loading
**Solution**: Use smaller batch size:
```bash
# In mock_data_loader.py, line ~200:
self.insert_transactions(all_transactions, batch_size=500)
```

### Issue: Out of memory
**Solution**: Load fewer users:
```bash
./load-mock-data.sh 50 25 true
```

## 📊 Data Validation

### Verify Transactions Loaded
```sql
SELECT COUNT(*) FROM transactions;
SELECT COUNT(DISTINCT user_id) FROM transactions;
SELECT COUNT(DISTINCT merchant_id) FROM transactions;
```

### Check Date Range
```sql
SELECT MIN(transaction_date), MAX(transaction_date) FROM transactions;
```

### Verify Categories
```sql
SELECT DISTINCT category FROM transactions ORDER BY category;
```

### Check Amount Statistics
```sql
SELECT category, COUNT(*), AVG(amount), MIN(amount), MAX(amount)
FROM transactions
GROUP BY category;
```

## 🎯 Use Cases

### 1. Test Marketing AI Analysis
```bash
./load-mock-data.sh 100 50 true
curl -X POST http://localhost:8000/api/marketing/analysis/run-now
curl http://localhost:8000/api/marketing/campaigns
```

### 2. Test User Segmentation
```bash
curl http://localhost:8000/api/marketing/segments
curl http://localhost:8000/api/marketing/segments/high_spender
```

### 3. Load Test with Large Dataset
```bash
./load-mock-data.sh 1000 100 true
```

### 4. Continuous Testing
```bash
while true; do
  ./load-mock-data.sh 100 50 true
  curl -X POST http://localhost:8000/api/marketing/analysis/run-now
  sleep 3600
done
```

## 📚 Integration with CI/CD

### GitHub Actions Example
```yaml
name: Test with Mock Data

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: swipesavvy_agents
          POSTGRES_PASSWORD: password
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Copy mock data
        run: cp -r Mock\ Data /tmp/
      
      - name: Load mock data
        env:
          DB_HOST: localhost
          MOCK_USERS: 50
          MOCK_CLEAR: true
        run: |
          cd app
          python3 -c "from utils.mock_data_loader import main; main()"
      
      - name: Run tests
        run: pytest tests/
```

## 🔐 Security Notes

- Mock data contains realistic but synthetic merchant information
- User IDs are generated as `user_1`, `user_2`, etc. (not real data)
- Transaction amounts are randomized
- Safe for development and testing only
- Never use in production

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify CSV file format
3. Check database logs
4. Ensure PostgreSQL is running
5. Verify environment variables

## 📖 Related Documentation

- [MARKETING_AI_IMPLEMENTATION.md](./MARKETING_AI_IMPLEMENTATION.md) - Main AI system
- [MARKETING_AI_QUICK_REFERENCE.md](./MARKETING_AI_QUICK_REFERENCE.md) - API reference
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - Database setup

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production Ready
