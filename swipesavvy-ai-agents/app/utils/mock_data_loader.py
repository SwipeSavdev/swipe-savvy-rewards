"""
Mock Data Loader for Testing

Loads CSV data from merchant and payment files and seeds the database
with realistic transaction data for testing the Marketing AI system.
"""

import csv
import psycopg2
from psycopg2.extras import execute_batch
import logging
from datetime import datetime, timedelta
import random
from typing import List, Dict, Tuple
import os
from pathlib import Path

logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "swipesavvy_agents"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "password"),
}


class MerchantList:
    """Parses and manages merchant data from CSV"""

    def __init__(self, csv_path: str):
        self.csv_path = csv_path
        self.merchants = []
        self.load()

    def load(self):
        """Load merchants from CSV file"""
        try:
            with open(self.csv_path, 'r', encoding='utf-8', errors='ignore') as f:
                # Skip header
                next(f)
                
                for line in f:
                    # Handle quoted fields that span multiple lines
                    if not line.strip():
                        continue
                    
                    try:
                        # Simple CSV parsing
                        parts = [p.strip('"').strip() for p in line.split('","')]
                        
                        if len(parts) >= 13:
                            merchant = {
                                'merchant_id': parts[0],
                                'merchant_name': parts[1][:100],
                                'store_number': parts[2] if parts[2] else '',
                                'corporate_name': parts[3][:100],
                                'mcc_code': parts[10][:4] if len(parts) > 10 else '5999',
                                'city': parts[13][:50] if len(parts) > 13 else 'Unknown',
                                'state': parts[14][:2] if len(parts) > 14 else 'FL',
                                'zip': parts[15][:10] if len(parts) > 15 else '00000',
                            }
                            
                            self.merchants.append(merchant)
                    except Exception as e:
                        continue
            
            logger.info(f"Loaded {len(self.merchants)} merchants")
            
        except Exception as e:
            logger.error(f"Error loading merchants: {str(e)}")

    def get_merchants(self) -> List[Dict]:
        """Get all loaded merchants"""
        return self.merchants

    def get_random_merchant(self) -> Dict:
        """Get a random merchant"""
        return random.choice(self.merchants) if self.merchants else None


class MockTransactionGenerator:
    """Generates realistic mock transaction data based on merchant info"""

    CATEGORIES = [
        'grocery',
        'restaurant',
        'retail',
        'healthcare',
        'gas',
        'utilities',
        'entertainment',
        'travel',
        'technology',
        'clothing',
    ]

    @staticmethod
    def generate_transactions(
        user_id: str,
        merchant: Dict,
        num_transactions: int = 50,
        days_back: int = 90
    ) -> List[Dict]:
        """Generate realistic transactions for a user at a merchant"""
        transactions = []
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)

        for i in range(num_transactions):
            # Random date within range
            days_offset = random.randint(0, days_back)
            transaction_date = end_date - timedelta(days=days_offset)

            # Realistic amount based on category
            amount = round(random.uniform(10, 500), 2)

            transaction = {
                'transaction_id': f"{user_id}_{merchant['merchant_id']}_{i}_{int(transaction_date.timestamp())}",
                'user_id': user_id,
                'merchant_id': merchant['merchant_id'],
                'merchant_name': merchant['merchant_name'],
                'merchant_location': f"{merchant['city']}, {merchant['state']}",
                'category': random.choice(MockTransactionGenerator.CATEGORIES),
                'amount': amount,
                'transaction_date': transaction_date,
                'mcc_code': merchant['mcc_code'],
            }

            transactions.append(transaction)

        return transactions


class MockDataLoader:
    """Loads mock data into the database"""

    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect(self):
        """Connect to database"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cursor = self.conn.cursor()
            logger.info("✅ Connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise

    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

    def create_tables(self):
        """Create necessary tables if they don't exist"""
        try:
            # Create transactions table
            create_transactions = """
            CREATE TABLE IF NOT EXISTS transactions (
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
            
            CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
            CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
            """

            self.cursor.execute(create_transactions)
            self.conn.commit()
            logger.info("✅ Tables created/verified")

        except Exception as e:
            logger.error(f"Error creating tables: {str(e)}")
            self.conn.rollback()
            raise

    def insert_transactions(self, transactions: List[Dict], batch_size: int = 1000):
        """Insert transactions into database"""
        try:
            query = """
            INSERT INTO transactions 
            (transaction_id, user_id, merchant_id, merchant_name, merchant_location, 
             category, amount, transaction_date, mcc_code)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (transaction_id) DO NOTHING
            """

            # Prepare data tuples
            data = [
                (
                    t['transaction_id'],
                    t['user_id'],
                    t['merchant_id'],
                    t['merchant_name'],
                    t['merchant_location'],
                    t['category'],
                    t['amount'],
                    t['transaction_date'],
                    t['mcc_code'],
                )
                for t in transactions
            ]

            # Insert in batches
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                execute_batch(self.cursor, query, batch)
                self.conn.commit()
                logger.info(f"Inserted {min(batch_size, len(batch))} transactions")

            logger.info(f"✅ Total {len(transactions)} transactions inserted")

        except Exception as e:
            logger.error(f"Error inserting transactions: {str(e)}")
            self.conn.rollback()
            raise

    def clear_transactions(self):
        """Clear all transactions (for testing)"""
        try:
            self.cursor.execute("DELETE FROM transactions")
            self.conn.commit()
            logger.info("✅ Cleared all transactions")
        except Exception as e:
            logger.error(f"Error clearing transactions: {str(e)}")
            self.conn.rollback()

    def load_mock_data(
        self,
        merchant_csv: str,
        num_users: int = 100,
        transactions_per_user: int = 50,
        clear_existing: bool = False
    ):
        """
        Load complete mock dataset
        
        Args:
            merchant_csv: Path to merchant list CSV
            num_users: Number of mock users to create
            transactions_per_user: Transactions per user
            clear_existing: Clear existing data first
        """
        try:
            self.connect()
            self.create_tables()

            if clear_existing:
                self.clear_transactions()

            # Load merchants
            logger.info(f"📖 Loading merchants from {merchant_csv}...")
            merchant_loader = MerchantList(merchant_csv)
            merchants = merchant_loader.get_merchants()

            if not merchants:
                logger.error("No merchants loaded!")
                return False

            logger.info(f"🏪 Loaded {len(merchants)} merchants")

            # Generate mock users and transactions
            all_transactions = []
            generator = MockTransactionGenerator()

            logger.info(f"👥 Generating {num_users} mock users...")
            for user_num in range(1, num_users + 1):
                user_id = f"user_{user_num}"

                # Each user shops at 3-5 different merchants
                num_merchants = random.randint(3, 5)
                selected_merchants = random.sample(merchants, min(num_merchants, len(merchants)))

                for merchant in selected_merchants:
                    # Generate transactions for this user at this merchant
                    transactions = generator.generate_transactions(
                        user_id,
                        merchant,
                        num_transactions=transactions_per_user,
                        days_back=90
                    )
                    all_transactions.extend(transactions)

                if user_num % 10 == 0:
                    logger.info(f"  Generated data for {user_num} users ({len(all_transactions)} transactions)")

            logger.info(f"📊 Total transactions generated: {len(all_transactions)}")

            # Insert into database
            logger.info("💾 Inserting into database...")
            self.insert_transactions(all_transactions)

            logger.info("✅ Mock data loading complete!")
            return True

        except Exception as e:
            logger.error(f"Error loading mock data: {str(e)}")
            return False

        finally:
            self.disconnect()

    def get_statistics(self) -> Dict:
        """Get statistics about loaded data"""
        try:
            self.connect()

            stats = {}

            # Total transactions
            self.cursor.execute("SELECT COUNT(*) FROM transactions")
            stats['total_transactions'] = self.cursor.fetchone()[0]

            # Unique users
            self.cursor.execute("SELECT COUNT(DISTINCT user_id) FROM transactions")
            stats['unique_users'] = self.cursor.fetchone()[0]

            # Unique merchants
            self.cursor.execute("SELECT COUNT(DISTINCT merchant_id) FROM transactions")
            stats['unique_merchants'] = self.cursor.fetchone()[0]

            # Total volume
            self.cursor.execute("SELECT SUM(amount) FROM transactions")
            result = self.cursor.fetchone()
            stats['total_volume'] = float(result[0]) if result[0] else 0

            # Date range
            self.cursor.execute("SELECT MIN(transaction_date), MAX(transaction_date) FROM transactions")
            min_date, max_date = self.cursor.fetchone()
            stats['date_range'] = f"{min_date} to {max_date}"

            # By category
            self.cursor.execute("""
                SELECT category, COUNT(*), SUM(amount)
                FROM transactions
                GROUP BY category
                ORDER BY COUNT(*) DESC
            """)
            stats['by_category'] = {
                row[0]: {'count': row[1], 'total': float(row[2])}
                for row in self.cursor.fetchall()
            }

            self.disconnect()
            return stats

        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {}


def main():
    """Main entry point for loading mock data"""
    import sys

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    # Find the merchant CSV file
    possible_paths = [
        "/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv",
        "./Mock Data/MerchantList-North.csv",
        "Mock Data/MerchantList-North.csv",
    ]

    merchant_csv = None
    for path in possible_paths:
        if os.path.exists(path):
            merchant_csv = path
            break

    if not merchant_csv:
        logger.error("❌ MerchantList-North.csv not found!")
        logger.info("Please ensure the file is in: /Users/macbookpro/Documents/Mock Data/")
        sys.exit(1)

    logger.info(f"Found merchant file: {merchant_csv}")

    # Load mock data
    loader = MockDataLoader()

    num_users = int(os.getenv("MOCK_USERS", "100"))
    transactions_per_user = int(os.getenv("MOCK_TRANSACTIONS", "50"))
    clear_first = os.getenv("MOCK_CLEAR", "false").lower() == "true"

    success = loader.load_mock_data(
        merchant_csv=merchant_csv,
        num_users=num_users,
        transactions_per_user=transactions_per_user,
        clear_existing=clear_first
    )

    if success:
        # Print statistics
        logger.info("\n" + "=" * 60)
        logger.info("📊 MOCK DATA STATISTICS")
        logger.info("=" * 60)
        
        stats = loader.get_statistics()
        
        logger.info(f"Total Transactions: {stats.get('total_transactions', 0):,}")
        logger.info(f"Unique Users: {stats.get('unique_users', 0):,}")
        logger.info(f"Unique Merchants: {stats.get('unique_merchants', 0):,}")
        logger.info(f"Total Volume: ${stats.get('total_volume', 0):,.2f}")
        logger.info(f"Date Range: {stats.get('date_range', 'N/A')}")
        
        logger.info("\nTransactions by Category:")
        for category, data in stats.get('by_category', {}).items():
            logger.info(f"  {category}: {data['count']:,} transactions (${data['total']:,.2f})")
        
        logger.info("=" * 60)
        logger.info("✅ Mock data loaded successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Failed to load mock data")
        sys.exit(1)


if __name__ == "__main__":
    main()
