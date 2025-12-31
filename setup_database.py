#!/usr/bin/env python3
"""
PostgreSQL Database Setup for Production
Purpose: Create and configure PostgreSQL database for SwipeSavvy Production
Created: December 28, 2025 - Phase 8 Production Deployment
"""

import os
import sys
import logging
import psycopg2
from psycopg2 import sql, Error

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '5432'))
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'swipesavvy_agents')

class DatabaseSetup:
    """Handles PostgreSQL database setup for production"""
    
    def __init__(self):
        """Initialize database connection parameters"""
        self.host = DB_HOST
        self.port = DB_PORT
        self.user = DB_USER
        self.password = DB_PASSWORD
        self.database = DB_NAME
        self.conn = None
        self.cursor = None
    
    def connect(self) -> bool:
        """Connect to PostgreSQL database"""
        try:
            logger.info(f"Connecting to PostgreSQL at {self.host}:{self.port}...")
            
            self.conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database='postgres'  # Connect to default postgres database first
            )
            self.cursor = self.conn.cursor()
            
            logger.info("✅ Connected to PostgreSQL")
            return True
            
        except Error as e:
            logger.error(f"❌ Failed to connect to PostgreSQL: {str(e)}")
            return False
    
    def create_database(self) -> bool:
        """Create the SwipeSavvy database if it doesn't exist"""
        try:
            # Check if database exists
            self.cursor.execute(
                sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"),
                [self.database]
            )
            
            if self.cursor.fetchone():
                logger.info(f"✅ Database '{self.database}' already exists")
                return True
            
            # Create database
            logger.info(f"Creating database '{self.database}'...")
            self.cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(self.database)
            ))
            self.conn.commit()
            
            logger.info(f"✅ Database '{self.database}' created successfully")
            return True
            
        except Error as e:
            logger.error(f"❌ Error creating database: {str(e)}")
            self.conn.rollback()
            return False
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("Database connection closed")
    
    def connect_to_app_database(self) -> bool:
        """Connect to the application database"""
        try:
            # Close existing connection
            self.close()
            
            # Connect to app database
            logger.info(f"Connecting to application database '{self.database}'...")
            
            self.conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )
            self.cursor = self.conn.cursor()
            
            logger.info(f"✅ Connected to '{self.database}'")
            return True
            
        except Error as e:
            logger.error(f"❌ Failed to connect to app database: {str(e)}")
            return False
    
    def create_tables(self) -> bool:
        """Create production tables"""
        try:
            logger.info("Creating production tables...")
            
            # Analytics tables
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS campaign_analytics_daily (
                    id SERIAL PRIMARY KEY,
                    campaign_id INTEGER NOT NULL,
                    date DATE NOT NULL,
                    impressions INTEGER DEFAULT 0,
                    clicks INTEGER DEFAULT 0,
                    conversions INTEGER DEFAULT 0,
                    revenue DECIMAL(10, 2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(campaign_id, date)
                );
            """)
            
            # AB Tests table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS ab_tests (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    variant_a_id INTEGER,
                    variant_b_id INTEGER,
                    start_date TIMESTAMP,
                    end_date TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # User Merchant Affinity table
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_merchant_affinity (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    merchant_id INTEGER NOT NULL,
                    affinity_score DECIMAL(5, 4) DEFAULT 0,
                    transaction_count INTEGER DEFAULT 0,
                    total_spent DECIMAL(10, 2) DEFAULT 0,
                    last_transaction_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, merchant_id)
                );
            """)
            
            # Create indices for performance
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_campaign_daily_date 
                ON campaign_analytics_daily(date);
            """)
            
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_affinity_user 
                ON user_merchant_affinity(user_id);
            """)
            
            self.cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_affinity_merchant 
                ON user_merchant_affinity(merchant_id);
            """)
            
            self.conn.commit()
            logger.info("✅ Production tables created successfully")
            return True
            
        except Error as e:
            logger.error(f"❌ Error creating tables: {str(e)}")
            self.conn.rollback()
            return False
    
    def seed_test_data(self) -> bool:
        """Seed minimal test data for production validation"""
        try:
            logger.info("Seeding production test data...")
            
            # Check if data already exists
            self.cursor.execute("SELECT COUNT(*) FROM campaign_analytics_daily LIMIT 1")
            if self.cursor.fetchone()[0] > 0:
                logger.info("⚠️  Test data already exists, skipping seed")
                return True
            
            # Insert sample analytics data
            self.cursor.execute("""
                INSERT INTO campaign_analytics_daily 
                (campaign_id, date, impressions, clicks, conversions, revenue)
                VALUES 
                (1, CURRENT_DATE, 1000, 50, 5, 250.00),
                (2, CURRENT_DATE, 1500, 75, 8, 400.00),
                (3, CURRENT_DATE, 2000, 100, 12, 600.00)
                ON CONFLICT (campaign_id, date) DO NOTHING;
            """)
            
            # Insert sample affinity data
            self.cursor.execute("""
                INSERT INTO user_merchant_affinity 
                (user_id, merchant_id, affinity_score, transaction_count, total_spent)
                VALUES 
                (1, 1, 0.9500, 15, 450.00),
                (2, 2, 0.8750, 10, 350.00),
                (3, 3, 0.7500, 8, 250.00),
                (4, 1, 0.6250, 5, 150.00),
                (5, 2, 0.8000, 12, 400.00)
                ON CONFLICT (user_id, merchant_id) DO NOTHING;
            """)
            
            self.conn.commit()
            logger.info("✅ Production test data seeded successfully")
            return True
            
        except Error as e:
            logger.error(f"❌ Error seeding data: {str(e)}")
            self.conn.rollback()
            return False
    
    def verify_setup(self) -> bool:
        """Verify database setup is complete"""
        try:
            logger.info("Verifying database setup...")
            
            # Check tables exist
            self.cursor.execute("""
                SELECT COUNT(*) FROM information_schema.tables 
                WHERE table_name IN ('campaign_analytics_daily', 'ab_tests', 'user_merchant_affinity')
            """)
            table_count = self.cursor.fetchone()[0]
            
            if table_count != 3:
                logger.error(f"❌ Expected 3 tables, found {table_count}")
                return False
            
            logger.info("✅ All required tables exist")
            
            # Check indices exist
            self.cursor.execute("""
                SELECT COUNT(*) FROM pg_indexes 
                WHERE tablename IN ('campaign_analytics_daily', 'user_merchant_affinity')
                AND indexname LIKE 'idx_%'
            """)
            index_count = self.cursor.fetchone()[0]
            
            logger.info(f"✅ Found {index_count} indices for query optimization")
            
            # Check test data
            self.cursor.execute("SELECT COUNT(*) FROM campaign_analytics_daily")
            data_count = self.cursor.fetchone()[0]
            
            logger.info(f"✅ Database contains {data_count} analytics records")
            
            return True
            
        except Error as e:
            logger.error(f"❌ Verification failed: {str(e)}")
            return False
    
    def run_setup(self) -> bool:
        """Run complete database setup"""
        logger.info("=" * 80)
        logger.info("SwipeSavvy Production Database Setup")
        logger.info("=" * 80)
        
        # Step 1: Connect to PostgreSQL
        if not self.connect():
            return False
        
        # Step 2: Create database
        if not self.create_database():
            self.close()
            return False
        
        # Step 3: Connect to app database
        if not self.connect_to_app_database():
            return False
        
        # Step 4: Create tables
        if not self.create_tables():
            self.close()
            return False
        
        # Step 5: Seed test data
        if not self.seed_test_data():
            self.close()
            return False
        
        # Step 6: Verify setup
        if not self.verify_setup():
            self.close()
            return False
        
        # Cleanup
        self.close()
        
        logger.info("=" * 80)
        logger.info("✅ Production database setup completed successfully!")
        logger.info("=" * 80)
        
        return True


def main():
    """Main entry point"""
    setup = DatabaseSetup()
    
    success = setup.run_setup()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
