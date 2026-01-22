"""
Admin Chat Dashboard API Routes
Provides statistics, metrics, and management endpoints for the admin chat dashboard.
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import json
import asyncio
from datetime import datetime
from typing import Set, Dict

from app.database import get_db
from app.core.auth import verify_token_string
from app.services.chat_dashboard_service import ChatDashboardService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin/chat-dashboard", tags=["admin-chat-dashboard"])


# ============================================================================
# Request/Response Models
# ============================================================================

class DashboardOverviewResponse(BaseModel):
    """Dashboard overview with key metrics"""
    total_sessions: int
    active_sessions: int
    closed_sessions: int
    waiting_sessions: int
    total_messages: int
    avg_messages_per_session: float
    avg_response_time_seconds: float
    time_range_hours: int
    generated_at: str


class AgentPerformanceResponse(BaseModel):
    """Agent performance metrics"""
    agent_id: str
    sessions_handled: int
    total_messages: int
    avg_messages_per_session: float
    avg_response_time_seconds: float
    avg_customer_rating: float
    status: str


class ActiveSessionResponse(BaseModel):
    """Active chat session summary"""
    session_id: str
    status: str
    duration_seconds: int
    total_messages: int
    unread_count: int
    participant_count: int
    initiator_id: str
    assigned_agent_id: Optional[str]
    last_activity: str
    latest_message: Optional[Dict[str, Any]]


class WaitingSessionResponse(BaseModel):
    """Waiting session for agent assignment"""
    session_id: str
    wait_time_seconds: int
    initiator_id: str
    message_count: int
    created_at: str
    priority: str


class SatisfactionMetricsResponse(BaseModel):
    """Customer satisfaction metrics"""
    total_rated: int
    avg_rating: float
    rating_distribution: Dict[int, int]
    satisfaction_percentage: float
    time_range_hours: int


class MessageAnalyticsResponse(BaseModel):
    """Message statistics and analytics"""
    total_messages: int
    message_types: Dict[str, int]
    status_distribution: Dict[str, int]
    avg_message_length: int
    time_range_hours: int


class AssignSessionRequest(BaseModel):
    """Request to assign session to agent"""
    agent_id: UUID = Field(..., description="ID of agent to assign")


class TransferSessionRequest(BaseModel):
    """Request to transfer session between agents"""
    to_agent_id: UUID = Field(..., description="ID of agent to transfer to")
    reason: Optional[str] = Field(None, description="Reason for transfer")


class SessionTranscriptResponse(BaseModel):
    """Full session transcript"""
    session: Dict[str, Any]
    messages: List[Dict[str, Any]]


class DashboardResponse(BaseModel):
    """Standard response for dashboard endpoints"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


# ============================================================================
# Dashboard Overview Endpoints
# ============================================================================

@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    time_range_hours: int = Query(24, ge=1, le=720),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get dashboard overview with key metrics.
    
    Query parameters:
    - time_range_hours: Hours to look back (default 24, max 720/30 days)
    
    Returns:
        Dashboard overview with session and message statistics
    """
    try:
        stats = ChatDashboardService.get_session_stats(db, time_range_hours)
        
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        
        return stats
    
    except Exception as e:
        logger.error(f"Error getting dashboard overview: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get dashboard overview")


@router.get("/agent-performance", response_model=List[AgentPerformanceResponse])
async def get_agent_performance(
    agent_id: Optional[UUID] = Query(None, description="Optional specific agent ID"),
    time_range_hours: int = Query(24, ge=1, le=720),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get performance metrics for support agents.
    
    Query parameters:
    - agent_id: Optional specific agent to get metrics for
    - time_range_hours: Hours to look back (default 24)
    
    Returns:
        List of agent performance metrics
    """
    try:
        performance = ChatDashboardService.get_agent_performance(
            db, agent_id, time_range_hours
        )
        return performance
    
    except Exception as e:
        logger.error(f"Error getting agent performance: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get agent performance")


@router.get("/active-sessions", response_model=List[ActiveSessionResponse])
async def get_active_sessions(
    limit: int = Query(20, ge=1, le=100),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get list of currently active chat sessions.
    
    Query parameters:
    - limit: Maximum sessions to return (default 20, max 100)
    
    Returns:
        List of active session summaries
    """
    try:
        sessions = ChatDashboardService.get_active_sessions(db, limit)
        return sessions
    
    except Exception as e:
        logger.error(f"Error getting active sessions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get active sessions")


@router.get("/waiting-sessions", response_model=List[WaitingSessionResponse])
async def get_waiting_sessions(
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get list of sessions waiting for agent assignment.
    
    Returns:
        List of waiting session summaries ordered by wait time
    """
    try:
        sessions = ChatDashboardService.get_waiting_sessions(db)
        return sessions
    
    except Exception as e:
        logger.error(f"Error getting waiting sessions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get waiting sessions")


@router.get("/satisfaction", response_model=SatisfactionMetricsResponse)
async def get_satisfaction_metrics(
    time_range_hours: int = Query(24, ge=1, le=720),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get customer satisfaction metrics from session ratings.
    
    Query parameters:
    - time_range_hours: Hours to look back (default 24)
    
    Returns:
        Satisfaction metrics including average rating and distribution
    """
    try:
        metrics = ChatDashboardService.get_customer_satisfaction(db, time_range_hours)
        
        if "error" in metrics:
            raise HTTPException(status_code=500, detail=metrics["error"])
        
        return metrics
    
    except Exception as e:
        logger.error(f"Error getting satisfaction metrics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get satisfaction metrics")


@router.get("/message-analytics", response_model=MessageAnalyticsResponse)
async def get_message_analytics(
    time_range_hours: int = Query(24, ge=1, le=720),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get message statistics and analytics.
    
    Query parameters:
    - time_range_hours: Hours to look back (default 24)
    
    Returns:
        Message analytics including type breakdown and status distribution
    """
    try:
        analytics = ChatDashboardService.get_message_analytics(db, time_range_hours)
        
        if "error" in analytics:
            raise HTTPException(status_code=500, detail=analytics["error"])
        
        return analytics
    
    except Exception as e:
        logger.error(f"Error getting message analytics: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get message analytics")


# ============================================================================
# Session Management Endpoints
# ============================================================================

@router.post("/sessions/{session_id}/assign", response_model=DashboardResponse)
async def assign_session_to_agent(
    session_id: UUID,
    request: AssignSessionRequest,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Assign a waiting session to an agent.
    
    Args:
        session_id: ID of the session to assign
        request: Assignment request with agent ID
    
    Returns:
        Success response
    """
    try:
        success = ChatDashboardService.assign_session_to_agent(
            db, session_id, request.agent_id
        )
        db.commit()
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to assign session")
        
        return DashboardResponse(
            success=True,
            message=f"Session assigned to agent {request.agent_id}",
            data={"session_id": str(session_id), "agent_id": str(request.agent_id)}
        )
    
    except Exception as e:
        logger.error(f"Error assigning session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to assign session")


@router.post("/sessions/{session_id}/transfer", response_model=DashboardResponse)
async def transfer_session(
    session_id: UUID,
    request: TransferSessionRequest,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Transfer a session to a different agent.
    
    Args:
        session_id: ID of the session to transfer
        request: Transfer request with new agent ID and optional reason
    
    Returns:
        Success response
    """
    try:
        # TODO: Get current agent from session
        # This is a simplified example - in production, get from session.assigned_agent_id
        
        success = ChatDashboardService.transfer_session(
            db, 
            session_id, 
            current_user,  # Assume current user is the agent
            request.to_agent_id,
            request.reason
        )
        db.commit()
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to transfer session")
        
        return DashboardResponse(
            success=True,
            message=f"Session transferred to agent {request.to_agent_id}",
            data={
                "session_id": str(session_id),
                "from_agent": str(current_user),
                "to_agent": str(request.to_agent_id)
            }
        )
    
    except Exception as e:
        logger.error(f"Error transferring session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to transfer session")


@router.get("/sessions/{session_id}/transcript", response_model=SessionTranscriptResponse)
async def get_session_transcript(
    session_id: UUID,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Get full conversation transcript for a session.
    
    Args:
        session_id: ID of the session
    
    Returns:
        Full session transcript with all messages
    """
    try:
        transcript = ChatDashboardService.get_session_transcript(db, session_id)
        
        if "error" in transcript:
            raise HTTPException(status_code=404, detail=transcript["error"])
        
        return transcript
    
    except Exception as e:
        logger.error(f"Error getting transcript: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get transcript")


# ============================================================================
# WebSocket Connection Manager for Real-Time Dashboard Updates
# ============================================================================

class ConnectionManager:
    """Manages WebSocket connections for real-time dashboard updates"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}
        self.lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection and store it"""
        await websocket.accept()
        async with self.lock:
            self.active_connections[user_id] = websocket
            if user_id not in self.user_subscriptions:
                self.user_subscriptions[user_id] = set()
        logger.info(f"User {user_id} connected to dashboard WebSocket")
    
    async def disconnect(self, user_id: str):
        """Remove connection when user disconnects"""
        async with self.lock:
            if user_id in self.active_connections:
                del self.active_connections[user_id]
            if user_id in self.user_subscriptions:
                del self.user_subscriptions[user_id]
        logger.info(f"User {user_id} disconnected from dashboard WebSocket")
    
    async def send_personal_message(self, user_id: str, data: Dict):
        """Send message to specific user"""
        async with self.lock:
            if user_id in self.active_connections:
                websocket = self.active_connections[user_id]
        try:
            await websocket.send_json(data)
        except Exception as e:
            logger.error(f"Error sending message to {user_id}: {str(e)}")
            await self.disconnect(user_id)
    
    async def broadcast(self, data: Dict, exclude: str = None):
        """Broadcast message to all connected users"""
        async with self.lock:
            connections = list(self.active_connections.items())
        
        for user_id, websocket in connections:
            if exclude and user_id == exclude:
                continue
            try:
                await websocket.send_json(data)
            except Exception as e:
                logger.error(f"Error broadcasting to {user_id}: {str(e)}")
                await self.disconnect(user_id)
    
    async def subscribe(self, user_id: str, event_type: str):
        """Subscribe user to specific event type"""
        async with self.lock:
            if user_id in self.user_subscriptions:
                self.user_subscriptions[user_id].add(event_type)
    
    async def unsubscribe(self, user_id: str, event_type: str):
        """Unsubscribe user from event type"""
        async with self.lock:
            if user_id in self.user_subscriptions:
                self.user_subscriptions[user_id].discard(event_type)


# Global connection manager
dashboard_connections = ConnectionManager()


# ============================================================================
# WebSocket Endpoint for Real-Time Dashboard Updates
# ============================================================================

@router.websocket("/ws")
async def chat_dashboard_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for real-time admin dashboard updates.
    
    Authentication:
    - Send {type: 'auth', data: {token: 'JWT_TOKEN'}} as first message
    
    Message Types (Client -> Server):
    - auth: Authenticate with JWT token
    - heartbeat: Keep-alive ping
    - request_session_update: Request fresh session data
    - request_queue_update: Request fresh queue data
    - request_metrics_update: Request fresh metrics calculation
    
    Message Types (Server -> Client):
    - auth_success: Authentication successful
    - heartbeat: Pong response
    - session_update: Updated session data
    - queue_depth_changed: Queue depth changed
    - queue_updated: Queue items updated
    - metrics_updated: Dashboard metrics updated
    - agent_status_changed: Agent status changed
    - message_created: New message in session
    - typing_indicator: User is typing
    - error: Error message
    """
    
    await websocket.accept()
    user_id = None
    
    try:
        # Wait for authentication message
        auth_message = await asyncio.wait_for(websocket.receive_json(), timeout=5.0)
        
        if auth_message.get("type") != "auth":
            await websocket.send_json({
                "type": "error",
                "data": {"message": "First message must be authentication"},
                "timestamp": datetime.utcnow().isoformat()
            })
            await websocket.close(code=4001)
            return
        
        # Verify JWT token
        try:
            token = auth_message.get("data", {}).get("token")
            user_id = verify_token_string(token)
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            await websocket.send_json({
                "type": "error",
                "data": {"message": "Authentication failed"},
                "timestamp": datetime.utcnow().isoformat()
            })
            await websocket.close(code=4001)
            return
        
        # Register connection
        await dashboard_connections.connect(websocket, user_id)
        
        # Send auth success
        await websocket.send_json({
            "type": "auth_success",
            "data": {"user_id": user_id},
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Message processing loop
        while True:
            try:
                message = await asyncio.wait_for(websocket.receive_json(), timeout=300.0)
                message_type = message.get("type")
                
                if message_type == "heartbeat":
                    # Respond to heartbeat
                    await websocket.send_json({
                        "type": "heartbeat",
                        "data": {"timestamp": datetime.utcnow().isoformat()},
                        "timestamp": datetime.utcnow().isoformat()
                    })
                
                elif message_type == "request_session_update":
                    # Send active sessions
                    try:
                        # Create a database session for this request
                        from app.database import SessionLocal
                        db = SessionLocal()
                        try:
                            sessions = ChatDashboardService.get_active_sessions(db, 24, 100)
                            await websocket.send_json({
                                "type": "session_update",
                                "data": sessions,
                                "timestamp": datetime.utcnow().isoformat()
                            })
                        finally:
                            db.close()
                    except Exception as e:
                        logger.error(f"Error fetching sessions: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": "Failed to fetch sessions"},
                            "timestamp": datetime.utcnow().isoformat()
                        })
                
                elif message_type == "request_queue_update":
                    # Send waiting queue
                    try:
                        from app.database import SessionLocal
                        db = SessionLocal()
                        try:
                            queue = ChatDashboardService.get_waiting_sessions(db)
                            await websocket.send_json({
                                "type": "queue_updated",
                                "data": {"waiting_sessions": queue},
                                "timestamp": datetime.utcnow().isoformat()
                            })
                        finally:
                            db.close()
                    except Exception as e:
                        logger.error(f"Error fetching queue: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": "Failed to fetch queue"},
                            "timestamp": datetime.utcnow().isoformat()
                        })
                
                elif message_type == "request_metrics_update":
                    # Send dashboard metrics
                    try:
                        from app.database import SessionLocal
                        db = SessionLocal()
                        try:
                            overview = ChatDashboardService.get_dashboard_overview(db, 24)
                            satisfaction = ChatDashboardService.get_satisfaction_metrics(db, 24)
                            analytics = ChatDashboardService.get_message_analytics(db, 24)
                            
                            await websocket.send_json({
                                "type": "metrics_updated",
                                "data": {
                                    "overview": overview,
                                    "satisfactionMetrics": satisfaction,
                                    "messageAnalytics": analytics
                                },
                                "timestamp": datetime.utcnow().isoformat()
                            })
                        finally:
                            db.close()
                    except Exception as e:
                        logger.error(f"Error fetching metrics: {str(e)}")
                        await websocket.send_json({
                            "type": "error",
                            "data": {"message": "Failed to fetch metrics"},
                            "timestamp": datetime.utcnow().isoformat()
                        })
                
                else:
                    logger.warning(f"Unknown message type: {message_type}")
            
            except asyncio.TimeoutError:
                # Timeout after 5 minutes of no activity
                logger.info(f"WebSocket timeout for user {user_id}")
                break
            except WebSocketDisconnect:
                break
    
    except asyncio.TimeoutError:
        logger.warning("WebSocket auth timeout")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}", exc_info=True)
    finally:
        if user_id:
            await dashboard_connections.disconnect(user_id)


# ============================================================================
# Helper: Broadcast dashboard updates (called from background tasks)
# ============================================================================

async def broadcast_metrics_update(db: Session):
    """Broadcast metrics update to all connected dashboard users"""
    try:
        overview = ChatDashboardService.get_dashboard_overview(db, 24)
        satisfaction = ChatDashboardService.get_satisfaction_metrics(db, 24)
        analytics = ChatDashboardService.get_message_analytics(db, 24)
        
        await dashboard_connections.broadcast({
            "type": "metrics_updated",
            "data": {
                "overview": overview,
                "satisfactionMetrics": satisfaction,
                "messageAnalytics": analytics
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error broadcasting metrics: {str(e)}")


async def broadcast_queue_update(db: Session):
    """Broadcast queue update to all connected dashboard users"""
    try:
        queue = ChatDashboardService.get_waiting_sessions(db)
        await dashboard_connections.broadcast({
            "type": "queue_updated",
            "data": {"waiting_sessions": queue},
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error broadcasting queue update: {str(e)}")


async def broadcast_active_sessions_update(db: Session):
    """Broadcast active sessions update to all connected dashboard users"""
    try:
        sessions = ChatDashboardService.get_active_sessions(db, 24, 100)
        await dashboard_connections.broadcast({
            "type": "session_update",
            "data": sessions,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Error broadcasting sessions update: {str(e)}")


# ============================================================================
# Utility Endpoints
# ============================================================================


@router.get("/health")
async def dashboard_health_check():
    """Health check endpoint for dashboard service"""
    return {
        "status": "healthy",
        "service": "chat-dashboard",
        "timestamp": ""
    }
