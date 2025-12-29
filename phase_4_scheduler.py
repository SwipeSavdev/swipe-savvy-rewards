"""
Phase 4 Scheduler Integration
Purpose: APScheduler jobs for automated analytics, model training, and optimization
Tech: APScheduler, Python
Created: December 26, 2025
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from analytics_service import AnalyticsService
from ml_optimizer import MLOptimizationService

logger = logging.getLogger(__name__)

# ═════════════════════════════════════════════════════════════════════════════
# SCHEDULED JOBS
# ═════════════════════════════════════════════════════════════════════════════

class Phase4Scheduler:
    """Manages scheduled tasks for Phase 4 services"""
    
    def __init__(self, db: Session):
        self.db = db
        self.scheduler = BackgroundScheduler()
        self.analytics = AnalyticsService(db)
        self.ml_service = MLOptimizationService(db)
    
    # ─────────────────────────────────────────────────────────────────────────
    # DAILY ANALYTICS AGGREGATION
    # ─────────────────────────────────────────────────────────────────────────
    
    def aggregate_daily_analytics(self):
        """
        Aggregate campaign metrics for the previous day
        Runs daily at 2 AM UTC
        """
        try:
            logger.info("Starting daily analytics aggregation...")
            
            yesterday = (datetime.utcnow() - timedelta(days=1)).date()
            
            # Get all active campaigns
            campaigns = self.db.execute(
                "SELECT id, campaign_id FROM campaigns WHERE is_active = TRUE"
            ).fetchall()
            
            aggregated_count = 0
            for campaign in campaigns:
                try:
                    # Get metrics for the day
                    metrics = self.analytics.get_campaign_metrics(
                        campaign['campaign_id'],
                        start_date=datetime.combine(yesterday, datetime.min.time()),
                        end_date=datetime.combine(yesterday, datetime.max.time())
                    )
                    
                    # Store in campaign_analytics_daily
                    self.db.execute(
                        """
                        INSERT INTO campaign_analytics_daily (
                            campaign_id, date, impressions, views, conversions,
                            revenue, cost, view_rate, conversion_rate,
                            return_on_ad_spend, created_at
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (campaign_id, date) DO UPDATE SET
                            impressions = EXCLUDED.impressions,
                            views = EXCLUDED.views,
                            conversions = EXCLUDED.conversions,
                            revenue = EXCLUDED.revenue,
                            cost = EXCLUDED.cost,
                            view_rate = EXCLUDED.view_rate,
                            conversion_rate = EXCLUDED.conversion_rate,
                            return_on_ad_spend = EXCLUDED.return_on_ad_spend,
                            updated_at = NOW()
                        """,
                        (
                            campaign['campaign_id'],
                            yesterday,
                            metrics.impressions,
                            metrics.views,
                            metrics.conversions,
                            metrics.revenue,
                            metrics.cost,
                            metrics.view_rate,
                            metrics.conversion_rate,
                            metrics.return_on_ad_spend,
                            datetime.utcnow()
                        )
                    )
                    aggregated_count += 1
                except Exception as e:
                    logger.error(f"Failed to aggregate metrics for campaign {campaign['campaign_id']}: {e}")
                    continue
            
            self.db.commit()
            logger.info(f"✅ Daily analytics aggregation complete ({aggregated_count} campaigns)")
        
        except Exception as e:
            logger.error(f"Daily aggregation failed: {e}")
            self.db.rollback()
    
    # ─────────────────────────────────────────────────────────────────────────
    # WEEKLY MODEL RETRAINING
    # ─────────────────────────────────────────────────────────────────────────
    
    def retrain_ml_models(self):
        """
        Retrain ML models with latest data
        Runs weekly on Monday at 3 AM UTC
        """
        try:
            logger.info("Starting ML model retraining...")
            
            # Train conversion prediction model
            result = self.ml_service.train_conversion_model('conversion')
            
            if result['status'] == 'success':
                logger.info(f"✅ Model retraining complete: R² = {result['r2_score']}, MAE = {result['mae']}")
                
                # Log training result
                self.db.execute(
                    """
                    UPDATE ml_models SET trained_at = NOW()
                    WHERE model_name = 'conversion' AND is_active = TRUE
                    """
                )
                self.db.commit()
            else:
                logger.warning(f"Model training status: {result['status']}")
        
        except Exception as e:
            logger.error(f"Model retraining failed: {e}")
            self.db.rollback()
    
    # ─────────────────────────────────────────────────────────────────────────
    # HOURLY MERCHANT AFFINITY UPDATE
    # ─────────────────────────────────────────────────────────────────────────
    
    def update_merchant_affinity(self):
        """
        Update merchant affinity scores for active users
        Runs every 6 hours
        """
        try:
            logger.info("Starting merchant affinity update...")
            
            # Get recent active users
            active_users = self.db.execute(
                """
                SELECT DISTINCT u.id, u.user_id
                FROM users u
                WHERE u.last_active > NOW() - INTERVAL '24 hours'
                LIMIT 500
                """
            ).fetchall()
            
            updated_count = 0
            for user in active_users:
                try:
                    # Get user's merchant affinity
                    affinity_list = self.ml_service.get_merchant_affinity(user['user_id'], limit=20)
                    
                    # Update top 5 merchants
                    for rank, merchant_data in enumerate(affinity_list[:5], 1):
                        self.db.execute(
                            """
                            INSERT INTO user_merchant_affinity (
                                user_id, merchant_id, affinity_score,
                                rank_in_category, last_updated
                            )
                            VALUES (%s, %s, %s, %s, NOW())
                            ON CONFLICT (user_id, merchant_id) DO UPDATE SET
                                affinity_score = EXCLUDED.affinity_score,
                                rank_in_category = EXCLUDED.rank_in_category,
                                last_updated = NOW()
                            """,
                            (
                                user['user_id'],
                                merchant_data['merchant_id'],
                                merchant_data['affinity_score'],
                                rank
                            )
                        )
                    
                    updated_count += 1
                except Exception as e:
                    logger.error(f"Failed to update affinity for user {user['user_id']}: {e}")
                    continue
            
            self.db.commit()
            logger.info(f"✅ Merchant affinity update complete ({updated_count} users)")
        
        except Exception as e:
            logger.error(f"Affinity update failed: {e}")
            self.db.rollback()
    
    # ─────────────────────────────────────────────────────────────────────────
    # DAILY SEND TIME OPTIMIZATION
    # ─────────────────────────────────────────────────────────────────────────
    
    def update_optimal_send_times(self):
        """
        Calculate optimal send time for each user based on engagement
        Runs daily at 4 AM UTC
        """
        try:
            logger.info("Starting optimal send time update...")
            
            # Get all active users
            users = self.db.execute(
                """
                SELECT id, user_id FROM users
                WHERE last_active > NOW() - INTERVAL '30 days'
                LIMIT 1000
                """
            ).fetchall()
            
            updated_count = 0
            for user in users:
                try:
                    # Calculate optimal send time
                    send_time = self.ml_service.optimize_send_time(user['user_id'], 'LOCATION_DEAL')
                    
                    # Store in database
                    self.db.execute(
                        """
                        INSERT INTO user_optimal_send_times (
                            user_id, optimal_hour, optimal_day_of_week,
                            avg_conversion_rate, confidence_score,
                            last_analyzed
                        )
                        VALUES (%s, %s, %s, %s, %s, NOW())
                        ON CONFLICT (user_id) DO UPDATE SET
                            optimal_hour = EXCLUDED.optimal_hour,
                            avg_conversion_rate = EXCLUDED.avg_conversion_rate,
                            confidence_score = EXCLUDED.confidence_score,
                            last_analyzed = NOW()
                        """,
                        (
                            user['user_id'],
                            send_time['optimal_hour'],
                            0,  # Simplified, could calculate day of week
                            send_time['expected_conversion_rate'],
                            send_time['confidence']
                        )
                    )
                    
                    updated_count += 1
                except Exception as e:
                    logger.error(f"Failed to update send time for user {user['user_id']}: {e}")
                    continue
            
            self.db.commit()
            logger.info(f"✅ Optimal send time update complete ({updated_count} users)")
        
        except Exception as e:
            logger.error(f"Send time update failed: {e}")
            self.db.rollback()
    
    # ─────────────────────────────────────────────────────────────────────────
    # CAMPAIGN OPTIMIZATION JOBS
    # ─────────────────────────────────────────────────────────────────────────
    
    def generate_campaign_optimizations(self):
        """
        Generate optimization recommendations for all active campaigns
        Runs daily at 5 AM UTC
        """
        try:
            logger.info("Starting campaign optimization generation...")
            
            # Get all active campaigns
            campaigns = self.db.execute(
                "SELECT id, campaign_id FROM campaigns WHERE is_active = TRUE LIMIT 100"
            ).fetchall()
            
            optimized_count = 0
            for campaign in campaigns:
                try:
                    # Get recommendations
                    recommendations = self.ml_service.get_optimization_recommendations(
                        campaign['campaign_id']
                    )
                    
                    for rec in recommendations:
                        self.db.execute(
                            """
                            INSERT INTO campaign_optimizations (
                                campaign_id, recommendation_type,
                                current_value, recommended_value,
                                confidence_score, expected_improvement,
                                reason, created_at
                            )
                            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
                            """,
                            (
                                campaign['campaign_id'],
                                rec.recommendation_type,
                                str(rec.current_value),
                                str(rec.recommended_value),
                                rec.confidence_score,
                                rec.expected_improvement,
                                rec.reason
                            )
                        )
                    
                    optimized_count += 1
                except Exception as e:
                    logger.error(f"Failed to optimize campaign {campaign['campaign_id']}: {e}")
                    continue
            
            self.db.commit()
            logger.info(f"✅ Campaign optimization complete ({optimized_count} campaigns)")
        
        except Exception as e:
            logger.error(f"Campaign optimization failed: {e}")
            self.db.rollback()
    
    # ─────────────────────────────────────────────────────────────────────────
    # SCHEDULER MANAGEMENT
    # ─────────────────────────────────────────────────────────────────────────
    
    def start(self):
        """Start all scheduled jobs"""
        try:
            # Daily analytics aggregation (2 AM UTC)
            self.scheduler.add_job(
                self.aggregate_daily_analytics,
                CronTrigger(hour=2, minute=0),
                id='daily_analytics_aggregation',
                name='Daily Analytics Aggregation',
                replace_existing=True
            )
            
            # Weekly model retraining (Monday 3 AM UTC)
            self.scheduler.add_job(
                self.retrain_ml_models,
                CronTrigger(day_of_week=0, hour=3, minute=0),
                id='weekly_model_retraining',
                name='Weekly Model Retraining',
                replace_existing=True
            )
            
            # Hourly merchant affinity update (every 6 hours)
            self.scheduler.add_job(
                self.update_merchant_affinity,
                CronTrigger(hour='*/6', minute=0),
                id='affinity_update',
                name='Merchant Affinity Update',
                replace_existing=True
            )
            
            # Daily send time optimization (4 AM UTC)
            self.scheduler.add_job(
                self.update_optimal_send_times,
                CronTrigger(hour=4, minute=0),
                id='send_time_optimization',
                name='Optimal Send Time Update',
                replace_existing=True
            )
            
            # Daily campaign optimization (5 AM UTC)
            self.scheduler.add_job(
                self.generate_campaign_optimizations,
                CronTrigger(hour=5, minute=0),
                id='campaign_optimization',
                name='Campaign Optimization Generation',
                replace_existing=True
            )
            
            # Start scheduler
            self.scheduler.start()
            logger.info("✅ Phase 4 scheduler started with 5 jobs")
        
        except Exception as e:
            logger.error(f"Failed to start scheduler: {e}")
    
    def stop(self):
        """Stop scheduler"""
        try:
            self.scheduler.shutdown()
            logger.info("✅ Phase 4 scheduler stopped")
        except Exception as e:
            logger.error(f"Failed to stop scheduler: {e}")
    
    def get_jobs(self):
        """Get list of scheduled jobs"""
        return [
            {
                "id": job.id,
                "name": job.name,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
            }
            for job in self.scheduler.get_jobs()
        ]

# ═════════════════════════════════════════════════════════════════════════════
# INTEGRATION WITH FASTAPI
# ═════════════════════════════════════════════════════════════════════════════

scheduler_instance = None

def init_phase4_scheduler(db: Session):
    """
    Initialize Phase 4 scheduler
    
    Usage in main.py:
        from phase_4_scheduler import init_phase4_scheduler
        init_phase4_scheduler(get_db)
    """
    global scheduler_instance
    scheduler_instance = Phase4Scheduler(db)
    scheduler_instance.start()
    logger.info("Phase 4 scheduler initialized")

def stop_phase4_scheduler():
    """Stop scheduler gracefully"""
    global scheduler_instance
    if scheduler_instance:
        scheduler_instance.stop()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Phase 4 Scheduler module loaded")
