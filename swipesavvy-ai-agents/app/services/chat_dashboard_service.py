"""
Chat Dashboard Service Layer - Admin Analytics & Metrics
Provides statistics, performance tracking, and customer satisfaction metrics.
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_

from app.models.chat import (
    ChatSession, ChatMessage, ChatParticipant, ChatTypingIndicator,
    ChatNotificationPreference, ChatBlockedUser, ChatAuditLog,
    ChatMessageStatus, ChatSessionStatus, ChatParticipantRole
)

logger = logging.getLogger(__name__)


class ChatDashboardService:
    """
    Service layer for admin chat dashboard analytics and metrics.
    Provides session statistics, agent performance, customer satisfaction tracking.
    """
    
    @staticmethod
    def get_session_stats(db: Session, time_range_hours: int = 24) -> Dict[str, Any]:
        """
        Get overall session statistics for dashboard overview.
        
        Args:
            db: Database session
            time_range_hours: Hours to look back (default 24)
        
        Returns:
            Dictionary with session statistics
        """
        try:
            since = datetime.utcnow() - timedelta(hours=time_range_hours)
            
            # Total sessions
            total_sessions = db.query(func.count(ChatSession.id)).filter(
                ChatSession.created_at >= since
            ).scalar() or 0
            
            # Active sessions
            active_sessions = db.query(func.count(ChatSession.id)).filter(
                and_(
                    ChatSession.created_at >= since,
                    ChatSession.status == ChatSessionStatus.ACTIVE
                )
            ).scalar() or 0
            
            # Closed sessions
            closed_sessions = db.query(func.count(ChatSession.id)).filter(
                and_(
                    ChatSession.created_at >= since,
                    ChatSession.status == ChatSessionStatus.CLOSED
                )
            ).scalar() or 0
            
            # Waiting sessions
            waiting_sessions = db.query(func.count(ChatSession.id)).filter(
                and_(
                    ChatSession.created_at >= since,
                    ChatSession.status == ChatSessionStatus.WAITING
                )
            ).scalar() or 0
            
            # Average response time (first message after session creation)
            response_times = db.query(
                func.avg(ChatMessage.created_at - ChatSession.created_at)
            ).join(ChatSession).filter(
                ChatSession.created_at >= since
            ).scalar()
            
            avg_response_time_seconds = (
                response_times.total_seconds() if response_times else 0
            )
            
            # Total messages
            total_messages = db.query(func.count(ChatMessage.id)).filter(
                ChatMessage.created_at >= since
            ).scalar() or 0
            
            # Average messages per session
            avg_messages_per_session = (
                total_messages / total_sessions if total_sessions > 0 else 0
            )
            
            return {
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "closed_sessions": closed_sessions,
                "waiting_sessions": waiting_sessions,
                "total_messages": total_messages,
                "avg_messages_per_session": round(avg_messages_per_session, 2),
                "avg_response_time_seconds": round(avg_response_time_seconds, 1),
                "time_range_hours": time_range_hours,
                "generated_at": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error getting session stats: {str(e)}", exc_info=True)
            return {
                "error": str(e),
                "total_sessions": 0,
                "active_sessions": 0,
                "generated_at": datetime.utcnow().isoformat()
            }
    
    @staticmethod
    def get_agent_performance(
        db: Session,
        agent_id: Optional[UUID] = None,
        time_range_hours: int = 24
    ) -> List[Dict[str, Any]]:
        """
        Get performance metrics for agents.
        
        Args:
            db: Database session
            agent_id: Optional specific agent ID
            time_range_hours: Hours to look back
        
        Returns:
            List of agent performance metrics
        """
        try:
            since = datetime.utcnow() - timedelta(hours=time_range_hours)
            
            # Query assigned sessions
            query = db.query(
                ChatParticipant.user_id,
                func.count(ChatSession.id).label('sessions_handled'),
                func.sum(ChatSession.total_messages).label('total_messages'),
                func.avg(ChatSession.rating).label('avg_rating')
            ).join(ChatSession).filter(
                and_(
                    ChatParticipant.role == ChatParticipantRole.SUPPORT_AGENT,
                    ChatParticipant.joined_at >= since,
                    ChatSession.closed_at.isnot(None)
                )
            ).group_by(ChatParticipant.user_id)
            
            if agent_id:
                query = query.filter(ChatParticipant.user_id == agent_id)
            
            results = query.all()
            
            agents = []
            for agent_user_id, sessions, messages, rating in results:
                # Calculate average response time
                avg_response_time = db.query(
                    func.avg(ChatMessage.created_at - ChatSession.created_at)
                ).join(ChatSession).join(ChatParticipant).filter(
                    and_(
                        ChatParticipant.user_id == agent_user_id,
                        ChatParticipant.role == ChatParticipantRole.SUPPORT_AGENT,
                        ChatSession.created_at >= since
                    )
                ).scalar()
                
                response_time_seconds = (
                    avg_response_time.total_seconds() if avg_response_time else 0
                )
                
                agents.append({
                    "agent_id": str(agent_user_id),
                    "sessions_handled": sessions or 0,
                    "total_messages": messages or 0,
                    "avg_messages_per_session": (
                        (messages / sessions) if sessions and messages else 0
                    ),
                    "avg_response_time_seconds": round(response_time_seconds, 1),
                    "avg_customer_rating": round(float(rating) if rating else 0, 2),
                    "status": "active"  # TODO: Get from connection manager
                })
            
            return agents
        
        except Exception as e:
            logger.error(f"Error getting agent performance: {str(e)}", exc_info=True)
            return []
    
    @staticmethod
    def get_active_sessions(db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get list of active chat sessions for dashboard.
        
        Args:
            db: Database session
            limit: Maximum sessions to return
        
        Returns:
            List of active session details
        """
        try:
            sessions = db.query(ChatSession).filter(
                ChatSession.status.in_([
                    ChatSessionStatus.ACTIVE,
                    ChatSessionStatus.WAITING
                ])
            ).order_by(desc(ChatSession.last_activity_at)).limit(limit).all()
            
            active = []
            for session in sessions:
                # Get participants
                participants = db.query(ChatParticipant).filter(
                    ChatParticipant.chat_session_id == session.id
                ).all()
                
                # Get latest message
                latest_message = db.query(ChatMessage).filter(
                    ChatMessage.chat_session_id == session.id
                ).order_by(desc(ChatMessage.created_at)).first()
                
                # Calculate duration
                now = datetime.utcnow()
                duration = (now - session.created_at).total_seconds()
                
                active.append({
                    "session_id": str(session.id),
                    "status": session.status,
                    "duration_seconds": int(duration),
                    "total_messages": session.total_messages,
                    "unread_count": session.unread_count,
                    "participant_count": len(participants),
                    "initiator_id": str(session.initiator_id),
                    "assigned_agent_id": str(session.assigned_agent_id) if session.assigned_agent_id else None,
                    "last_activity": session.last_activity_at.isoformat(),
                    "latest_message": {
                        "content": latest_message.content[:100] if latest_message else None,
                        "timestamp": latest_message.created_at.isoformat() if latest_message else None,
                        "sender_id": str(latest_message.sender_id) if latest_message else None
                    } if latest_message else None
                })
            
            return active
        
        except Exception as e:
            logger.error(f"Error getting active sessions: {str(e)}", exc_info=True)
            return []
    
    @staticmethod
    def get_waiting_sessions(db: Session) -> List[Dict[str, Any]]:
        """
        Get list of waiting sessions needing agent assignment.
        
        Args:
            db: Database session
        
        Returns:
            List of waiting session details
        """
        try:
            sessions = db.query(ChatSession).filter(
                ChatSession.status == ChatSessionStatus.WAITING
            ).order_by(ChatSession.created_at).all()
            
            waiting = []
            for session in sessions:
                # Calculate wait time
                wait_time = (datetime.utcnow() - session.created_at).total_seconds()
                
                waiting.append({
                    "session_id": str(session.id),
                    "wait_time_seconds": int(wait_time),
                    "initiator_id": str(session.initiator_id),
                    "message_count": session.total_messages,
                    "created_at": session.created_at.isoformat(),
                    "priority": "high" if wait_time > 300 else "medium" if wait_time > 60 else "low"
                })
            
            return waiting
        
        except Exception as e:
            logger.error(f"Error getting waiting sessions: {str(e)}", exc_info=True)
            return []
    
    @staticmethod
    def get_customer_satisfaction(db: Session, time_range_hours: int = 24) -> Dict[str, Any]:
        """
        Get customer satisfaction metrics from session ratings.
        
        Args:
            db: Database session
            time_range_hours: Hours to look back
        
        Returns:
            Dictionary with satisfaction metrics
        """
        try:
            since = datetime.utcnow() - timedelta(hours=time_range_hours)
            
            # Sessions with ratings
            rated_sessions = db.query(ChatSession).filter(
                and_(
                    ChatSession.created_at >= since,
                    ChatSession.rating.isnot(None),
                    ChatSession.status == ChatSessionStatus.CLOSED
                )
            ).all()
            
            if not rated_sessions:
                return {
                    "total_rated": 0,
                    "avg_rating": 0,
                    "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
                    "satisfaction_percentage": 0
                }
            
            # Rating distribution
            rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            total_rating = 0
            
            for session in rated_sessions:
                rating_dist[session.rating] += 1
                total_rating += session.rating
            
            avg_rating = total_rating / len(rated_sessions)
            
            # Satisfaction: 4-5 stars are satisfied
            satisfied = rating_dist[4] + rating_dist[5]
            satisfaction_pct = (satisfied / len(rated_sessions) * 100) if rated_sessions else 0
            
            return {
                "total_rated": len(rated_sessions),
                "avg_rating": round(avg_rating, 2),
                "rating_distribution": rating_dist,
                "satisfaction_percentage": round(satisfaction_pct, 1),
                "time_range_hours": time_range_hours
            }
        
        except Exception as e:
            logger.error(f"Error getting customer satisfaction: {str(e)}", exc_info=True)
            return {"error": str(e), "total_rated": 0}
    
    @staticmethod
    def get_message_analytics(db: Session, time_range_hours: int = 24) -> Dict[str, Any]:
        """
        Get message statistics and analytics.
        
        Args:
            db: Database session
            time_range_hours: Hours to look back
        
        Returns:
            Dictionary with message analytics
        """
        try:
            since = datetime.utcnow() - timedelta(hours=time_range_hours)
            
            total_messages = db.query(func.count(ChatMessage.id)).filter(
                ChatMessage.created_at >= since
            ).scalar() or 0
            
            # Message type breakdown
            text_msgs = db.query(func.count(ChatMessage.id)).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.message_type == "text"
                )
            ).scalar() or 0
            
            file_msgs = db.query(func.count(ChatMessage.id)).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.message_type.in_(["file", "image"])
                )
            ).scalar() or 0
            
            # Message status distribution
            sent = db.query(func.count(ChatMessage.id)).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.status == ChatMessageStatus.SENT
                )
            ).scalar() or 0
            
            delivered = db.query(func.count(ChatMessage.id)).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.status == ChatMessageStatus.DELIVERED
                )
            ).scalar() or 0
            
            read = db.query(func.count(ChatMessage.id)).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.status == ChatMessageStatus.READ
                )
            ).scalar() or 0
            
            # Average message length
            avg_length = db.query(
                func.avg(func.length(ChatMessage.content))
            ).filter(
                and_(
                    ChatMessage.created_at >= since,
                    ChatMessage.content.isnot(None)
                )
            ).scalar() or 0
            
            return {
                "total_messages": total_messages,
                "message_types": {
                    "text": text_msgs,
                    "files": file_msgs
                },
                "status_distribution": {
                    "sent": sent,
                    "delivered": delivered,
                    "read": read
                },
                "avg_message_length": round(float(avg_length), 0),
                "time_range_hours": time_range_hours
            }
        
        except Exception as e:
            logger.error(f"Error getting message analytics: {str(e)}", exc_info=True)
            return {"error": str(e)}
    
    @staticmethod
    def assign_session_to_agent(
        db: Session,
        session_id: UUID,
        agent_id: UUID
    ) -> bool:
        """
        Assign a waiting session to an agent.
        
        Args:
            db: Database session
            session_id: ID of the session
            agent_id: ID of the agent to assign
        
        Returns:
            True if assigned successfully
        """
        try:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            
            if not session:
                return False
            
            # Update session assignment
            session.assigned_agent_id = agent_id
            session.status = ChatSessionStatus.ACTIVE
            session.started_at = datetime.utcnow()
            
            # Add agent as participant if not already
            from app.services.chat_service import ChatService
            ChatService.add_participant(
                db=db,
                session_id=session_id,
                user_id=agent_id,
                role=ChatParticipantRole.SUPPORT_AGENT
            )
            
            db.flush()
            logger.info(f"Session {session_id} assigned to agent {agent_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error assigning session: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def transfer_session(
        db: Session,
        session_id: UUID,
        from_agent_id: UUID,
        to_agent_id: UUID,
        reason: Optional[str] = None
    ) -> bool:
        """
        Transfer a session from one agent to another.
        
        Args:
            db: Database session
            session_id: ID of the session
            from_agent_id: Current agent ID
            to_agent_id: New agent ID
            reason: Optional reason for transfer
        
        Returns:
            True if transferred successfully
        """
        try:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            
            if not session or session.assigned_agent_id != from_agent_id:
                return False
            
            # Update assignment
            session.assigned_agent_id = to_agent_id
            
            # Add new agent as participant
            from app.services.chat_service import ChatService
            ChatService.add_participant(
                db=db,
                session_id=session_id,
                user_id=to_agent_id,
                role=ChatParticipantRole.SUPPORT_AGENT
            )
            
            db.flush()
            logger.info(
                f"Session {session_id} transferred from {from_agent_id} to {to_agent_id}. "
                f"Reason: {reason}"
            )
            return True
        
        except Exception as e:
            logger.error(f"Error transferring session: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def get_session_transcript(db: Session, session_id: UUID) -> Dict[str, Any]:
        """
        Get full conversation transcript for a session.
        
        Args:
            db: Database session
            session_id: ID of the session
        
        Returns:
            Dictionary with session and messages
        """
        try:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            
            if not session:
                return {"error": "Session not found"}
            
            # Get all messages
            messages = db.query(ChatMessage).filter(
                ChatMessage.chat_session_id == session_id
            ).order_by(ChatMessage.created_at).all()
            
            return {
                "session": {
                    "id": str(session.id),
                    "status": session.status,
                    "initiator_id": str(session.initiator_id),
                    "assigned_agent_id": str(session.assigned_agent_id) if session.assigned_agent_id else None,
                    "created_at": session.created_at.isoformat(),
                    "closed_at": session.closed_at.isoformat() if session.closed_at else None,
                    "total_messages": session.total_messages,
                    "rating": session.rating,
                    "feedback": session.feedback
                },
                "messages": [
                    {
                        "id": str(msg.id),
                        "sender_id": str(msg.sender_id),
                        "content": msg.content,
                        "message_type": msg.message_type,
                        "status": msg.status,
                        "created_at": msg.created_at.isoformat(),
                        "file_url": msg.file_url,
                        "file_name": msg.file_name
                    }
                    for msg in messages
                ]
            }
        
        except Exception as e:
            logger.error(f"Error getting transcript: {str(e)}", exc_info=True)
            return {"error": str(e)}
