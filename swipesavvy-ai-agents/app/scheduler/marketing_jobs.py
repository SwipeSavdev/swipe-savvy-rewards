"""
Marketing AI Scheduler Jobs

Handles scheduled execution of marketing AI analysis cycles
"""

import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import os

from app.services.marketing_ai import get_marketing_ai_service

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None


def run_marketing_analysis():
    """Job: Run marketing AI analysis cycle"""
    try:
        logger.info("=" * 80)
        logger.info("🤖 MARKETING AI ANALYSIS CYCLE STARTED")
        logger.info("=" * 80)
        
        service = get_marketing_ai_service()
        result = service.run_analysis_cycle()
        
        logger.info("=" * 80)
        logger.info(f"📊 ANALYSIS COMPLETE: {result}")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error(f"❌ Error in marketing analysis job: {str(e)}", exc_info=True)


def run_campaign_cleanup():
    """Job: Clean up expired campaigns"""
    try:
        logger.info("🧹 Running campaign cleanup...")
        
        service = get_marketing_ai_service()
        cursor = service.conn.cursor()
        
        # Mark expired campaigns as inactive
        query = """
        UPDATE ai_campaigns
        SET status = 'expired'
        WHERE status = 'active'
        AND created_at + (duration_days || ' days')::INTERVAL < NOW()
        """
        
        cursor.execute(query)
        service.conn.commit()
        
        rows_affected = cursor.rowcount
        logger.info(f"✅ Cleaned up {rows_affected} expired campaigns")
        
    except Exception as e:
        logger.error(f"❌ Error in campaign cleanup: {str(e)}")


def initialize_scheduler():
    """Initialize and start the scheduler"""
    global scheduler
    
    try:
        scheduler = BackgroundScheduler()
        
        # Marketing analysis job
        # By default: Every day at 2 AM
        marketing_hour = int(os.getenv("MARKETING_ANALYSIS_HOUR", 2))
        marketing_minute = int(os.getenv("MARKETING_ANALYSIS_MINUTE", 0))
        
        scheduler.add_job(
            run_marketing_analysis,
            CronTrigger(hour=marketing_hour, minute=marketing_minute),
            id='marketing_analysis',
            name='Marketing AI Analysis',
            replace_existing=True
        )
        
        logger.info(f"✅ Scheduled marketing analysis daily at {marketing_hour:02d}:{marketing_minute:02d}")
        
        # Campaign cleanup job
        # By default: Every day at 3 AM
        cleanup_hour = int(os.getenv("CAMPAIGN_CLEANUP_HOUR", 3))
        cleanup_minute = int(os.getenv("CAMPAIGN_CLEANUP_MINUTE", 0))
        
        scheduler.add_job(
            run_campaign_cleanup,
            CronTrigger(hour=cleanup_hour, minute=cleanup_minute),
            id='campaign_cleanup',
            name='Campaign Cleanup',
            replace_existing=True
        )
        
        logger.info(f"✅ Scheduled campaign cleanup daily at {cleanup_hour:02d}:{cleanup_minute:02d}")
        
        # Start scheduler
        scheduler.start()
        logger.info("✅ APScheduler started successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize scheduler: {str(e)}")
        raise


def get_scheduler():
    """Get scheduler instance"""
    return scheduler


def schedule_marketing_analysis_now():
    """Execute marketing analysis immediately"""
    try:
        logger.info("⚡ Triggering immediate marketing analysis...")
        run_marketing_analysis()
        return {"status": "success", "message": "Marketing analysis completed"}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"status": "error", "message": str(e)}


def schedule_campaign_cleanup_now():
    """Execute campaign cleanup immediately"""
    try:
        logger.info("⚡ Triggering immediate campaign cleanup...")
        run_campaign_cleanup()
        return {"status": "success", "message": "Campaign cleanup completed"}
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {"status": "error", "message": str(e)}
