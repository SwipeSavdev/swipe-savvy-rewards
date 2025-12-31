#!/usr/bin/env python3
"""
Mock Data Ingestion Script
Populates SwipeSavvy database with real merchant and transaction data
Data Source: /Users/macbookpro/Documents/Mock Data/

Tables Populated:
  - campaign_analytics_daily (daily metrics)
  - campaign_analytics_segments (segment analytics)
  - ab_tests (test configurations)
  - ab_test_assignments (user assignments)
  - user_merchant_affinity (preference scores)
  - user_optimal_send_times (send time optimization)
  - campaign_optimizations (recommendations)
"""

import csv
import json
import random
import logging
from datetime import datetime, timedelta
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MockDataIngester:
    """Ingest CSV mock data into SwipeSavvy database"""
    
    def __init__(self, db_host='localhost', db_port=5432, db_name='swipesavvy_agents',
                 db_user='postgres', db_password=''):
        """Initialize database connection"""
        self.db_host = db_host
        self.db_port = db_port
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                user=self.db_user,
                password=self.db_password
            )
            self.cursor = self.conn.cursor()
            logger.info(f"Connected to database {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
            logger.info("Disconnected from database")
    
    def parse_merchant_csv(self, filepath):
        """Parse merchant list CSV"""
        merchants = []
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                # Skip header rows
                f.readline()  # Skip "Merchant List - North"
                
                reader = csv.reader(f)
                for row in reader:
                    if len(row) < 5:
                        continue
                    
                    merchant = {
                        'merchant_id': row[0].strip('"'),
                        'name': row[1].strip('"'),
                        'city': row[14].strip('"') if len(row) > 14 else '',
                        'state': row[15].strip('"') if len(row) > 15 else '',
                        'mcc': row[11].strip('"') if len(row) > 11 else '5812',
                        'status': row[12].strip('"') if len(row) > 12 else 'ACTIVE'
                    }
                    if merchant['merchant_id']:
                        merchants.append(merchant)
            
            logger.info(f"Parsed {len(merchants)} merchants from {filepath}")
            return merchants
        except Exception as e:
            logger.error(f"Error parsing merchant CSV: {e}")
            return []
    
    def parse_payment_csv(self, filepath):
        """Parse payment summary CSV"""
        payments = []
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                # Skip header row
                f.readline()  # Skip "Payment Summary - North..."
                
                reader = csv.reader(f)
                for row in reader:
                    if len(row) < 6 or row[0].strip('"') == 'Report Total':
                        continue
                    
                    try:
                        deposits = row[2].strip('"').replace('$', '').replace(',', '')
                        deposits = float(deposits)
                        
                        payment = {
                            'business_id': row[0].strip('"'),
                            'num_deposits': int(row[1].strip('"').replace(',', '')),
                            'total_deposits': deposits,
                            'num_debits': int(row[3].strip('"').replace(',', '')),
                            'net_deposits': deposits  # Simplified
                        }
                        if payment['business_id']:
                            payments.append(payment)
                    except (ValueError, IndexError):
                        continue
            
            logger.info(f"Parsed payment data from {filepath}")
            return payments
        except Exception as e:
            logger.error(f"Error parsing payment CSV: {e}")
            return []
    
    def generate_campaign_analytics(self, merchants, start_date=None):
        """Generate daily campaign analytics from merchant data"""
        if start_date is None:
            start_date = datetime.now() - timedelta(days=90)
        
        analytics = []
        
        # Generate 90 days of daily metrics
        for day_offset in range(90):
            current_date = start_date + timedelta(days=day_offset)
            
            for idx, merchant in enumerate(merchants[:50]):  # Use first 50 merchants
                campaign_id = idx + 1
                
                # Generate realistic metrics
                base_impressions = random.randint(1000, 10000)
                clicks = int(base_impressions * random.uniform(0.02, 0.08))
                conversions = int(clicks * random.uniform(0.05, 0.20))
                revenue = conversions * random.uniform(25, 150)
                
                metric = {
                    'campaign_id': campaign_id,
                    'date': current_date.date(),
                    'impressions': base_impressions,
                    'clicks': clicks,
                    'conversions': conversions,
                    'revenue': round(revenue, 2),
                    'roi': round((revenue / base_impressions) * 100, 2) if base_impressions > 0 else 0,
                    'engagement_rate': round((clicks / base_impressions) * 100, 2),
                    'click_through_rate': round((clicks / base_impressions) * 100, 2),
                    'conversion_rate': round((conversions / clicks) * 100, 2) if clicks > 0 else 0,
                    'avg_order_value': round(revenue / conversions, 2) if conversions > 0 else 0,
                }
                analytics.append(metric)
        
        logger.info(f"Generated {len(analytics)} daily analytics records")
        return analytics
    
    def generate_segment_analytics(self, merchants, start_date=None):
        """Generate segment-level analytics"""
        if start_date is None:
            start_date = datetime.now() - timedelta(days=90)
        
        analytics = []
        segments = ['age_18_25', 'age_26_35', 'age_36_45', 'age_45plus', 'mobile', 'desktop']
        
        for day_offset in range(90):
            current_date = start_date + timedelta(days=day_offset)
            
            for idx, merchant in enumerate(merchants[:50]):
                campaign_id = idx + 1
                
                for segment in segments:
                    users = random.randint(100, 2000)
                    conversions = int(users * random.uniform(0.02, 0.15))
                    revenue = conversions * random.uniform(20, 120)
                    
                    metric = {
                        'campaign_id': campaign_id,
                        'segment_name': segment,
                        'date': current_date.date(),
                        'users_count': users,
                        'conversions': conversions,
                        'revenue': round(revenue, 2),
                        'retention_rate': round(random.uniform(0.5, 0.95) * 100, 2),
                    }
                    analytics.append(metric)
        
        logger.info(f"Generated {len(analytics)} segment analytics records")
        return analytics
    
    def generate_ab_tests(self, merchants):
        """Generate A/B test configurations"""
        tests = []
        
        for idx, merchant in enumerate(merchants[:20]):
            test = {
                'name': f"Test_{merchant['name'][:30]}_{idx}",
                'description': f"A/B test for {merchant['name']}",
                'campaign_id': idx + 1,
                'hypothesis': f"Testing conversion optimization for {merchant['city']}",
                'control_variant': 'control',
                'variant_a': 'variant_a',
                'variant_b': 'variant_b',
                'variant_c': None,
                'start_date': datetime.now() - timedelta(days=30),
                'end_date': datetime.now() + timedelta(days=30),
                'status': random.choice(['running', 'completed', 'paused']),
                'sample_size': random.randint(1000, 10000),
                'confidence_level': 0.95,
                'min_statistical_power': 0.80,
                'created_by': 'admin@swipesavvy.com',
                'updated_by': 'admin@swipesavvy.com',
            }
            tests.append(test)
        
        logger.info(f"Generated {len(tests)} A/B tests")
        return tests
    
    def generate_ab_assignments(self, tests, num_users=1000):
        """Generate user assignments for A/B tests"""
        assignments = []
        variants = ['control', 'variant_a', 'variant_b']
        
        for test_id, test in enumerate(tests, 1):
            for user_id in range(num_users):
                variant = random.choice(variants)
                assignment = {
                    'test_id': test_id,
                    'user_id': f"user_{user_id}",
                    'variant_assigned': variant,
                    'assigned_at': datetime.now() - timedelta(days=random.randint(0, 30))
                }
                assignments.append(assignment)
        
        logger.info(f"Generated {len(assignments)} A/B test assignments")
        return assignments
    
    def generate_user_affinity(self, merchants, num_users=500):
        """Generate user-merchant affinity scores"""
        affinity = []
        
        for user_id in range(num_users):
            for idx, merchant in enumerate(merchants[:30]):
                score = {
                    'user_id': f"user_{user_id}",
                    'merchant_id': idx + 1,
                    'affinity_score': round(random.uniform(0.0, 1.0), 3),
                    'interaction_count': random.randint(0, 50),
                    'last_interaction': datetime.now() - timedelta(days=random.randint(0, 60)),
                    'purchase_count': random.randint(0, 20),
                    'avg_transaction_value': round(random.uniform(10, 200), 2),
                }
                affinity.append(score)
        
        logger.info(f"Generated {len(affinity)} user affinity records")
        return affinity
    
    def generate_optimal_send_times(self, num_users=500):
        """Generate optimal send time predictions"""
        send_times = []
        
        for user_id in range(num_users):
            send_time = {
                'user_id': f"user_{user_id}",
                'optimal_hour': random.randint(9, 20),  # 9 AM to 8 PM
                'optimal_day_of_week': random.randint(0, 6),  # 0=Sunday, 6=Saturday
                'confidence_score': round(random.uniform(0.6, 0.99), 2),
                'last_calculated': datetime.now() - timedelta(days=random.randint(0, 7)),
                'open_rate_morning': round(random.uniform(0.15, 0.35), 2),
                'open_rate_afternoon': round(random.uniform(0.25, 0.45), 2),
                'open_rate_evening': round(random.uniform(0.20, 0.40), 2),
                'engagement_score': round(random.uniform(0.5, 0.95), 2),
            }
            send_times.append(send_time)
        
        logger.info(f"Generated {len(send_times)} optimal send time records")
        return send_times
    
    def generate_campaign_optimizations(self, merchants):
        """Generate optimization recommendations"""
        optimizations = []
        recommendation_types = ['offer', 'timing', 'audience', 'creative', 'channel']
        
        for idx, merchant in enumerate(merchants[:30]):
            for _ in range(random.randint(2, 5)):
                opt = {
                    'campaign_id': idx + 1,
                    'recommendation_type': random.choice(recommendation_types),
                    'recommendation_text': f"Optimization suggestion for {merchant['name']}",
                    'confidence_score': round(random.uniform(0.6, 0.99), 2),
                    'potential_uplift_percent': round(random.uniform(5, 50), 1),
                    'implementation_effort': random.choice(['low', 'medium', 'high']),
                    'priority': random.randint(1, 10),
                    'implemented': random.choice([True, False]),
                }
                optimizations.append(opt)
        
        logger.info(f"Generated {len(optimizations)} optimization recommendations")
        return optimizations
    
    def insert_campaign_analytics(self, analytics):
        """Insert campaign analytics into database"""
        if not analytics:
            return
        
        try:
            values = [
                (
                    a['campaign_id'],
                    a['date'],
                    a['impressions'],
                    a['clicks'],
                    a['conversions'],
                    a['revenue'],
                    a['roi'],
                    a['engagement_rate'],
                    a['click_through_rate'],
                    a['conversion_rate'],
                    a['avg_order_value'],
                    datetime.now(),
                )
                for a in analytics
            ]
            
            execute_values(
                self.cursor,
                """
                INSERT INTO campaign_analytics_daily 
                (campaign_id, date, impressions, clicks, conversions, revenue, roi, 
                 engagement_rate, click_through_rate, conversion_rate, avg_order_value, created_at)
                VALUES %s
                ON CONFLICT (campaign_id, date) DO UPDATE SET
                    impressions = EXCLUDED.impressions,
                    clicks = EXCLUDED.clicks,
                    conversions = EXCLUDED.conversions,
                    revenue = EXCLUDED.revenue,
                    roi = EXCLUDED.roi,
                    engagement_rate = EXCLUDED.engagement_rate,
                    click_through_rate = EXCLUDED.click_through_rate,
                    conversion_rate = EXCLUDED.conversion_rate,
                    avg_order_value = EXCLUDED.avg_order_value
                """,
                values
            )
            
            self.conn.commit()
            logger.info(f"Inserted {len(analytics)} campaign analytics records")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting campaign analytics: {e}")
    
    def insert_segment_analytics(self, analytics):
        """Insert segment analytics into database"""
        if not analytics:
            return
        
        try:
            values = [
                (
                    a['campaign_id'],
                    a['segment_name'],
                    a['date'],
                    a['users_count'],
                    a['conversions'],
                    a['revenue'],
                    a['retention_rate'],
                    datetime.now(),
                )
                for a in analytics
            ]
            
            execute_values(
                self.cursor,
                """
                INSERT INTO campaign_analytics_segments 
                (campaign_id, segment_name, date, users_count, conversions, revenue, retention_rate, created_at)
                VALUES %s
                """,
                values
            )
            
            self.conn.commit()
            logger.info(f"Inserted {len(analytics)} segment analytics records")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting segment analytics: {e}")
    
    def insert_ab_tests(self, tests):
        """Insert A/B test configurations"""
        if not tests:
            return
        
        try:
            values = [
                (
                    t['name'],
                    t['description'],
                    t['campaign_id'],
                    t['hypothesis'],
                    t['control_variant'],
                    t['variant_a'],
                    t['variant_b'],
                    t['variant_c'],
                    t['start_date'],
                    t['end_date'],
                    t['status'],
                    t['sample_size'],
                    t['confidence_level'],
                    t['min_statistical_power'],
                    datetime.now(),
                    datetime.now(),
                    t['created_by'],
                    t['updated_by'],
                )
                for t in tests
            ]
            
            execute_values(
                self.cursor,
                """
                INSERT INTO ab_tests 
                (name, description, campaign_id, hypothesis, control_variant, variant_a, 
                 variant_b, variant_c, start_date, end_date, status, sample_size, 
                 confidence_level, min_statistical_power, created_at, updated_at, created_by, updated_by)
                VALUES %s
                """,
                values
            )
            
            self.conn.commit()
            logger.info(f"Inserted {len(tests)} A/B tests")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting A/B tests: {e}")
    
    def insert_ab_assignments(self, assignments):
        """Insert A/B test user assignments"""
        if not assignments:
            return
        
        try:
            values = [
                (
                    a['test_id'],
                    a['user_id'],
                    a['variant_assigned'],
                    a['assigned_at'],
                )
                for a in assignments
            ]
            
            # Insert in batches to avoid constraint violations
            batch_size = 1000
            for i in range(0, len(values), batch_size):
                batch = values[i:i+batch_size]
                execute_values(
                    self.cursor,
                    """
                    INSERT INTO ab_test_assignments (test_id, user_id, variant_assigned, assigned_at)
                    VALUES %s
                    ON CONFLICT (test_id, user_id) DO NOTHING
                    """,
                    batch
                )
                self.conn.commit()
            
            logger.info(f"Inserted {len(assignments)} A/B test assignments")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting A/B assignments: {e}")
    
    def insert_user_affinity(self, affinity):
        """Insert user-merchant affinity scores"""
        if not affinity:
            return
        
        try:
            values = [
                (
                    a['user_id'],
                    a['merchant_id'],
                    a['affinity_score'],
                    a['interaction_count'],
                    a['last_interaction'],
                    a['purchase_count'],
                    a['avg_transaction_value'],
                    datetime.now(),
                )
                for a in affinity
            ]
            
            # Insert in batches
            batch_size = 1000
            for i in range(0, len(values), batch_size):
                batch = values[i:i+batch_size]
                execute_values(
                    self.cursor,
                    """
                    INSERT INTO user_merchant_affinity 
                    (user_id, merchant_id, affinity_score, interaction_count, last_interaction, 
                     purchase_count, avg_transaction_value, updated_at)
                    VALUES %s
                    ON CONFLICT (user_id, merchant_id) DO UPDATE SET
                        affinity_score = EXCLUDED.affinity_score,
                        interaction_count = EXCLUDED.interaction_count,
                        last_interaction = EXCLUDED.last_interaction,
                        purchase_count = EXCLUDED.purchase_count,
                        avg_transaction_value = EXCLUDED.avg_transaction_value
                    """,
                    batch
                )
                self.conn.commit()
            
            logger.info(f"Inserted {len(affinity)} user affinity records")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting user affinity: {e}")
    
    def insert_optimal_send_times(self, send_times):
        """Insert optimal send time predictions"""
        if not send_times:
            return
        
        try:
            values = [
                (
                    t['user_id'],
                    t['optimal_hour'],
                    t['optimal_day_of_week'],
                    t['confidence_score'],
                    t['last_calculated'],
                    t['open_rate_morning'],
                    t['open_rate_afternoon'],
                    t['open_rate_evening'],
                    t['engagement_score'],
                )
                for t in send_times
            ]
            
            execute_values(
                self.cursor,
                """
                INSERT INTO user_optimal_send_times 
                (user_id, optimal_hour, optimal_day_of_week, confidence_score, last_calculated,
                 open_rate_morning, open_rate_afternoon, open_rate_evening, engagement_score)
                VALUES %s
                ON CONFLICT (user_id) DO UPDATE SET
                    optimal_hour = EXCLUDED.optimal_hour,
                    optimal_day_of_week = EXCLUDED.optimal_day_of_week,
                    confidence_score = EXCLUDED.confidence_score,
                    last_calculated = EXCLUDED.last_calculated,
                    open_rate_morning = EXCLUDED.open_rate_morning,
                    open_rate_afternoon = EXCLUDED.open_rate_afternoon,
                    open_rate_evening = EXCLUDED.open_rate_evening,
                    engagement_score = EXCLUDED.engagement_score
                """,
                values
            )
            
            self.conn.commit()
            logger.info(f"Inserted {len(send_times)} optimal send time records")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting optimal send times: {e}")
    
    def insert_campaign_optimizations(self, optimizations):
        """Insert optimization recommendations"""
        if not optimizations:
            return
        
        try:
            values = [
                (
                    o['campaign_id'],
                    o['recommendation_type'],
                    o['recommendation_text'],
                    o['confidence_score'],
                    o['potential_uplift_percent'],
                    o['implementation_effort'],
                    o['priority'],
                    o['implemented'],
                    datetime.now(),
                    datetime.now(),
                )
                for o in optimizations
            ]
            
            execute_values(
                self.cursor,
                """
                INSERT INTO campaign_optimizations 
                (campaign_id, recommendation_type, recommendation_text, confidence_score, 
                 potential_uplift_percent, implementation_effort, priority, implemented, created_at, updated_at)
                VALUES %s
                """,
                values
            )
            
            self.conn.commit()
            logger.info(f"Inserted {len(optimizations)} optimization recommendations")
        except Exception as e:
            self.conn.rollback()
            logger.error(f"Error inserting optimizations: {e}")
    
    def run(self, merchant_csv, payment_csv):
        """Run the complete data ingestion process"""
        try:
            self.connect()
            
            # Parse CSVs
            logger.info("Parsing CSV files...")
            merchants = self.parse_merchant_csv(merchant_csv)
            payments = self.parse_payment_csv(payment_csv)
            
            if not merchants:
                logger.error("No merchants parsed from CSV")
                return False
            
            # Generate and insert data
            logger.info("Generating and inserting mock data...")
            
            # Campaign Analytics
            campaign_analytics = self.generate_campaign_analytics(merchants)
            self.insert_campaign_analytics(campaign_analytics)
            
            # Segment Analytics
            segment_analytics = self.generate_segment_analytics(merchants)
            self.insert_segment_analytics(segment_analytics)
            
            # A/B Tests
            ab_tests = self.generate_ab_tests(merchants)
            self.insert_ab_tests(ab_tests)
            
            # A/B Assignments
            ab_assignments = self.generate_ab_assignments(ab_tests)
            self.insert_ab_assignments(ab_assignments)
            
            # User Affinity
            user_affinity = self.generate_user_affinity(merchants)
            self.insert_user_affinity(user_affinity)
            
            # Optimal Send Times
            optimal_send_times = self.generate_optimal_send_times()
            self.insert_optimal_send_times(optimal_send_times)
            
            # Campaign Optimizations
            campaign_optimizations = self.generate_campaign_optimizations(merchants)
            self.insert_campaign_optimizations(campaign_optimizations)
            
            logger.info("Data ingestion completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Data ingestion failed: {e}")
            return False
        finally:
            self.disconnect()


def main():
    """Main entry point"""
    merchant_csv = Path("/Users/macbookpro/Documents/Mock Data/MerchantList-North.csv")
    payment_csv = Path("/Users/macbookpro/Documents/Mock Data/PaymentSummary-North(12_1_2020-12_25_2025).csv")
    
    if not merchant_csv.exists():
        logger.error(f"Merchant CSV not found: {merchant_csv}")
        return 1
    
    if not payment_csv.exists():
        logger.error(f"Payment CSV not found: {payment_csv}")
        return 1
    
    ingester = MockDataIngester()
    success = ingester.run(str(merchant_csv), str(payment_csv))
    
    return 0 if success else 1


if __name__ == '__main__':
    exit(main())
