"""
Chat service layer for message persistence, history, and session management.
Handles all business logic for chat operations.
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_

from app.models.chat import (
    ChatMessage, ChatSession, ChatParticipant, ChatRoom, 
    ChatTypingIndicator, ChatNotificationPreference, ChatBlockedUser,
    ChatMessageStatus, ChatSessionStatus, ChatParticipantRole
)

logger = logging.getLogger(__name__)


class ChatService:
    """
    Service layer for chat operations.
    Manages messages, sessions, participants, and related logic.
    """
    
    @staticmethod
    def create_message(
        db: Session,
        chat_session_id: UUID,
        sender_id: UUID,
        message_type: str = "text",
        content: Optional[str] = None,
        file_url: Optional[str] = None,
        file_name: Optional[str] = None,
        file_size: Optional[int] = None,
        file_type: Optional[str] = None,
        reply_to_id: Optional[UUID] = None,
        mentions: Optional[List[UUID]] = None
    ) -> ChatMessage:
        """
        Create a new message in a chat session.
        
        Args:
            db: Database session
            chat_session_id: ID of the chat session
            sender_id: ID of the message sender
            message_type: Type of message (text, image, file, etc.)
            content: Message content
            file_url: Optional file URL
            file_name: Optional file name
            file_size: Optional file size
            file_type: Optional file MIME type
            reply_to_id: Optional ID of message being replied to
            mentions: Optional list of mentioned user IDs
        
        Returns:
            Created ChatMessage object
        """
        try:
            message = ChatMessage(
                chat_session_id=chat_session_id,
                sender_id=sender_id,
                message_type=message_type,
                content=content,
                file_url=file_url,
                file_name=file_name,
                file_size=file_size,
                file_type=file_type,
                reply_to_id=reply_to_id,
                mentions=mentions,
                status=ChatMessageStatus.SENT
            )
            
            db.add(message)
            db.flush()
            
            # Update session message count
            session = db.query(ChatSession).filter(
                ChatSession.id == chat_session_id
            ).first()
            if session:
                session.total_messages += 1
                session.last_activity_at = datetime.now(timezone.utc)
                db.flush()
            
            logger.info(
                f"Message {message.id} created in session {chat_session_id} "
                f"by user {sender_id}"
            )
            
            return message
        
        except Exception as e:
            logger.error(f"Error creating message: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def get_message(db: Session, message_id: UUID) -> Optional[ChatMessage]:
        """
        Get a message by ID.
        
        Args:
            db: Database session
            message_id: ID of the message
        
        Returns:
            ChatMessage object or None if not found
        """
        return db.query(ChatMessage).filter(
            ChatMessage.id == message_id
        ).first()
    
    @staticmethod
    def get_session_messages(
        db: Session,
        chat_session_id: UUID,
        limit: int = 50,
        offset: int = 0,
        exclude_deleted: bool = True
    ) -> List[ChatMessage]:
        """
        Get messages from a chat session with pagination.
        
        Args:
            db: Database session
            chat_session_id: ID of the chat session
            limit: Number of messages to retrieve
            offset: Offset for pagination
            exclude_deleted: Whether to exclude deleted messages
        
        Returns:
            List of ChatMessage objects
        """
        try:
            query = db.query(ChatMessage).filter(
                ChatMessage.chat_session_id == chat_session_id
            )
            
            if exclude_deleted:
                query = query.filter(ChatMessage.deleted_at.is_(None))
            
            messages = query.order_by(desc(ChatMessage.created_at)).limit(limit).offset(offset).all()
            return list(reversed(messages))  # Return in chronological order
        
        except Exception as e:
            logger.error(f"Error retrieving session messages: {str(e)}", exc_info=True)
            return []
    
    @staticmethod
    def update_message_status(
        db: Session,
        message_id: UUID,
        status: ChatMessageStatus
    ) -> bool:
        """
        Update message delivery status.
        
        Args:
            db: Database session
            message_id: ID of the message
            status: New status
        
        Returns:
            True if updated successfully
        """
        try:
            message = db.query(ChatMessage).filter(
                ChatMessage.id == message_id
            ).first()
            
            if not message:
                return False
            
            message.status = status
            
            if status == ChatMessageStatus.DELIVERED:
                message.delivered_at = datetime.now(timezone.utc)
            elif status == ChatMessageStatus.READ:
                message.read_by_count += 1
            
            db.flush()
            logger.info(f"Message {message_id} status updated to {status}")
            return True
        
        except Exception as e:
            logger.error(f"Error updating message status: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def delete_message(db: Session, message_id: UUID) -> bool:
        """
        Soft delete a message.
        
        Args:
            db: Database session
            message_id: ID of the message
        
        Returns:
            True if deleted successfully
        """
        try:
            message = db.query(ChatMessage).filter(
                ChatMessage.id == message_id
            ).first()
            
            if not message:
                return False
            
            message.deleted_at = datetime.now(timezone.utc)
            db.flush()
            logger.info(f"Message {message_id} deleted")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting message: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def create_session(
        db: Session,
        initiator_id: UUID,
        chat_room_id: Optional[UUID] = None,
        assigned_agent_id: Optional[UUID] = None,
        title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ChatSession:
        """
        Create a new chat session.
        
        Args:
            db: Database session
            initiator_id: ID of the user initiating the chat
            chat_room_id: Optional room ID if in a room
            assigned_agent_id: Optional agent ID if this is support
            title: Optional session title
            metadata: Optional metadata
        
        Returns:
            Created ChatSession object
        """
        try:
            session = ChatSession(
                initiator_id=initiator_id,
                chat_room_id=chat_room_id,
                assigned_agent_id=assigned_agent_id,
                title=title or f"Chat {datetime.now(timezone.utc).isoformat()}",
                metadata=metadata,
                status=ChatSessionStatus.WAITING if not assigned_agent_id else ChatSessionStatus.ACTIVE
            )
            
            db.add(session)
            db.flush()
            
            # Add initiator as participant
            participant = ChatParticipant(
                chat_session_id=session.id,
                user_id=initiator_id,
                role=ChatParticipantRole.USER
            )
            db.add(participant)
            
            if assigned_agent_id:
                agent_participant = ChatParticipant(
                    chat_session_id=session.id,
                    user_id=assigned_agent_id,
                    role=ChatParticipantRole.SUPPORT_AGENT
                )
                db.add(agent_participant)
            
            db.flush()
            logger.info(f"Chat session {session.id} created by user {initiator_id}")
            return session
        
        except Exception as e:
            logger.error(f"Error creating chat session: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def get_session(db: Session, session_id: UUID) -> Optional[ChatSession]:
        """
        Get a chat session by ID.
        
        Args:
            db: Database session
            session_id: ID of the chat session
        
        Returns:
            ChatSession object or None
        """
        return db.query(ChatSession).filter(
            ChatSession.id == session_id
        ).first()
    
    @staticmethod
    def close_session(
        db: Session,
        session_id: UUID,
        rating: Optional[int] = None,
        feedback: Optional[str] = None
    ) -> bool:
        """
        Close a chat session.
        
        Args:
            db: Database session
            session_id: ID of the chat session
            rating: Optional user rating (1-5)
            feedback: Optional user feedback
        
        Returns:
            True if closed successfully
        """
        try:
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            
            if not session:
                return False
            
            session.status = ChatSessionStatus.CLOSED
            session.closed_at = datetime.now(timezone.utc)
            if rating:
                session.rating = rating
            if feedback:
                session.feedback = feedback
            
            db.flush()
            logger.info(f"Chat session {session_id} closed")
            return True
        
        except Exception as e:
            logger.error(f"Error closing chat session: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def get_participant(
        db: Session,
        session_id: UUID,
        user_id: UUID
    ) -> Optional[ChatParticipant]:
        """
        Get a participant record.
        
        Args:
            db: Database session
            session_id: ID of the chat session
            user_id: ID of the user
        
        Returns:
            ChatParticipant object or None
        """
        return db.query(ChatParticipant).filter(
            and_(
                ChatParticipant.chat_session_id == session_id,
                ChatParticipant.user_id == user_id
            )
        ).first()
    
    @staticmethod
    def add_participant(
        db: Session,
        session_id: UUID,
        user_id: UUID,
        role: ChatParticipantRole = ChatParticipantRole.USER
    ) -> ChatParticipant:
        """
        Add a participant to a chat session.
        
        Args:
            db: Database session
            session_id: ID of the chat session
            user_id: ID of the user
            role: Role of the participant
        
        Returns:
            Created ChatParticipant object
        """
        try:
            # Check if already a participant
            existing = ChatService.get_participant(db, session_id, user_id)
            if existing:
                existing.is_active = True
                existing.left_at = None
                db.flush()
                return existing
            
            participant = ChatParticipant(
                chat_session_id=session_id,
                user_id=user_id,
                role=role
            )
            
            db.add(participant)
            db.flush()
            logger.info(f"User {user_id} added to session {session_id} as {role}")
            return participant
        
        except Exception as e:
            logger.error(f"Error adding participant: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def remove_participant(db: Session, session_id: UUID, user_id: UUID) -> bool:
        """
        Remove a participant from a chat session.
        
        Args:
            db: Database session
            session_id: ID of the chat session
            user_id: ID of the user
        
        Returns:
            True if removed successfully
        """
        try:
            participant = ChatService.get_participant(db, session_id, user_id)
            if not participant:
                return False
            
            participant.is_active = False
            participant.left_at = datetime.now(timezone.utc)
            db.flush()
            logger.info(f"User {user_id} removed from session {session_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error removing participant: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def get_session_participants(db: Session, session_id: UUID) -> List[ChatParticipant]:
        """
        Get all active participants in a session.
        
        Args:
            db: Database session
            session_id: ID of the chat session
        
        Returns:
            List of ChatParticipant objects
        """
        return db.query(ChatParticipant).filter(
            and_(
                ChatParticipant.chat_session_id == session_id,
                ChatParticipant.is_active == True
            )
        ).all()
    
    @staticmethod
    def mark_read(
        db: Session,
        session_id: UUID,
        user_id: UUID,
        up_to_message_id: UUID
    ) -> bool:
        """
        Mark messages as read up to a specific message.
        
        Args:
            db: Database session
            session_id: ID of the chat session
            user_id: ID of the user
            up_to_message_id: ID of the message to mark up to
        
        Returns:
            True if updated successfully
        """
        try:
            participant = ChatService.get_participant(db, session_id, user_id)
            if not participant:
                return False
            
            message = db.query(ChatMessage).filter(
                ChatMessage.id == up_to_message_id
            ).first()
            if not message:
                return False
            
            participant.last_read_message_id = message.id
            participant.last_read_at = datetime.now(timezone.utc)
            
            db.flush()
            logger.info(f"User {user_id} marked session {session_id} as read up to {message.id}")
            return True
        
        except Exception as e:
            logger.error(f"Error marking as read: {str(e)}", exc_info=True)
            return False
    
    @staticmethod
    def get_user_blocked(db: Session, user_id: UUID, blocked_user_id: UUID) -> bool:
        """
        Check if user has blocked another user.
        
        Args:
            db: Database session
            user_id: ID of the user doing the blocking
            blocked_user_id: ID of the user being blocked
        
        Returns:
            True if user_id has blocked blocked_user_id
        """
        block = db.query(ChatBlockedUser).filter(
            and_(
                ChatBlockedUser.user_id == user_id,
                ChatBlockedUser.blocked_user_id == blocked_user_id,
                ChatBlockedUser.unblocked_at.is_(None)
            )
        ).first()
        return block is not None
    
    @staticmethod
    def block_user(
        db: Session,
        user_id: UUID,
        blocked_user_id: UUID,
        reason: Optional[str] = None
    ) -> ChatBlockedUser:
        """
        Block a user from messaging.
        
        Args:
            db: Database session
            user_id: ID of the user doing the blocking
            blocked_user_id: ID of the user to block
            reason: Optional reason for blocking
        
        Returns:
            Created ChatBlockedUser object
        """
        try:
            # Check if already blocked
            existing = db.query(ChatBlockedUser).filter(
                and_(
                    ChatBlockedUser.user_id == user_id,
                    ChatBlockedUser.blocked_user_id == blocked_user_id,
                    ChatBlockedUser.unblocked_at.is_(None)
                )
            ).first()
            
            if existing:
                return existing
            
            blocked = ChatBlockedUser(
                user_id=user_id,
                blocked_user_id=blocked_user_id,
                reason=reason
            )
            
            db.add(blocked)
            db.flush()
            logger.info(f"User {user_id} blocked {blocked_user_id}")
            return blocked
        
        except Exception as e:
            logger.error(f"Error blocking user: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def unblock_user(db: Session, user_id: UUID, blocked_user_id: UUID) -> bool:
        """
        Unblock a user.
        
        Args:
            db: Database session
            user_id: ID of the user doing the unblocking
            blocked_user_id: ID of the user to unblock
        
        Returns:
            True if unblocked successfully
        """
        try:
            block = db.query(ChatBlockedUser).filter(
                and_(
                    ChatBlockedUser.user_id == user_id,
                    ChatBlockedUser.blocked_user_id == blocked_user_id,
                    ChatBlockedUser.unblocked_at.is_(None)
                )
            ).first()
            
            if not block:
                return False
            
            block.unblocked_at = datetime.now(timezone.utc)
            db.flush()
            logger.info(f"User {user_id} unblocked {blocked_user_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error unblocking user: {str(e)}", exc_info=True)
            return False
