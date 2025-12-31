"""
Background tasks for real-time dashboard updates.
Broadcasts metrics, queue updates, and session changes to connected WebSocket clients.
"""

import logging
import asyncio
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.chat_dashboard_service import ChatDashboardService

logger = logging.getLogger(__name__)


class DashboardBroadcastTasks:
    """Manages background broadcast tasks for dashboard WebSocket updates"""
    
    _instance: Optional['DashboardBroadcastTasks'] = None
    _tasks = {}
    
    def __init__(self):
        """Initialize task manager"""
        self.tasks = {}
        self.running = False
    
    @classmethod
    def get_instance(cls) -> 'DashboardBroadcastTasks':
        """Get singleton instance"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def start_background_tasks(self):
        """Start all background broadcast tasks"""
        if self.running:
            logger.warning("Background tasks already running")
            return
        
        self.running = True
        logger.info("Starting dashboard broadcast background tasks")
        
        # Start metrics broadcast every 10 seconds
        self.tasks['metrics'] = asyncio.create_task(self._metrics_broadcast_loop())
        
        # Start queue update broadcast every 5 seconds
        self.tasks['queue'] = asyncio.create_task(self._queue_broadcast_loop())
        
        # Start session update broadcast every 10 seconds
        self.tasks['sessions'] = asyncio.create_task(self._sessions_broadcast_loop())
        
        logger.info("Background tasks started successfully")
    
    async def stop_background_tasks(self):
        """Stop all background broadcast tasks"""
        if not self.running:
            return
        
        self.running = False
        logger.info("Stopping dashboard broadcast background tasks")
        
        for task_name, task in self.tasks.items():
            try:
                task.cancel()
                await task
            except asyncio.CancelledError:
                logger.info(f"Task {task_name} cancelled")
                raise
            except Exception as e:
                logger.error(f"Error stopping task {task_name}: {str(e)}")
        
        self.tasks.clear()
        logger.info("Background tasks stopped")
    
    async def _metrics_broadcast_loop(self):
        """Periodically broadcast metrics updates"""
        while self.running:
            try:
                await asyncio.sleep(10)  # Update every 10 seconds
                
                db = SessionLocal()
                try:
                    # Use existing methods with correct signatures
                    stats = ChatDashboardService.get_session_stats(db, 24)
                    satisfaction = ChatDashboardService.get_customer_satisfaction(db, 24)
                    analytics = ChatDashboardService.get_message_analytics(db, 24)
                    
                    # Import here to avoid circular imports
                    try:
                        from app.routes.chat_dashboard import dashboard_connections
                        
                        await dashboard_connections.broadcast({
                            "type": "metrics_updated",
                            "data": {
                                "overview": stats,
                                "satisfactionMetrics": satisfaction,
                                "messageAnalytics": analytics
                            },
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                    except (ImportError, AttributeError):
                        # Broadcast manager may not be initialized
                        logger.debug("Dashboard connections not available, skipping broadcast")
                    
                    logger.debug("Metrics broadcast completed")
                
                finally:
                    db.close()
            
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error(f"Error in metrics broadcast loop: {str(e)}")
    
    async def _queue_broadcast_loop(self):
        """Periodically broadcast queue updates"""
        while self.running:
            try:
                await asyncio.sleep(5)  # Update every 5 seconds (queue is critical)
                
                db = SessionLocal()
                try:
                    queue = ChatDashboardService.get_waiting_sessions(db)
                    queue_depth = len(queue) if queue else 0
                    
                    from app.routes.chat_dashboard import dashboard_connections
                    
                    await dashboard_connections.broadcast({
                        "type": "queue_depth_changed",
                        "data": {"queue_depth": queue_depth},
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    
                    # Also send full queue data less frequently
                    await dashboard_connections.broadcast({
                        "type": "queue_updated",
                        "data": {"waiting_sessions": queue},
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    
                    logger.debug(f"Queue broadcast completed - depth: {queue_depth}")
                
                finally:
                    db.close()
            
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error(f"Error in queue broadcast loop: {str(e)}", exc_info=True)
    
    async def _sessions_broadcast_loop(self):
        """Periodically broadcast active sessions updates"""
        while self.running:
            try:
                await asyncio.sleep(10)  # Update every 10 seconds
                
                db = SessionLocal()
                try:
                    # Use correct method signature - get_active_sessions(db, limit)
                    sessions = ChatDashboardService.get_active_sessions(db, limit=20)
                    
                    try:
                        from app.routes.chat_dashboard import dashboard_connections
                        
                        await dashboard_connections.broadcast({
                            "type": "active_sessions_updated",
                            "data": sessions,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })
                    except (ImportError, AttributeError):
                        # Broadcast manager may not be initialized
                        logger.debug("Dashboard connections not available, skipping broadcast")
                    
                    logger.debug("Sessions broadcast completed")
                
                finally:
                    db.close()
            
            except asyncio.CancelledError:
                raise
            except Exception as e:
                logger.error(f"Error in sessions broadcast loop: {str(e)}")


# Get singleton instance
dashboard_tasks = DashboardBroadcastTasks.get_instance()
