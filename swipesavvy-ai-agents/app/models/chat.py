"""
Database models for Phase 10 Task 3: WebSocket Chat Integration
Supports real-time messaging, session management, and chat history.
"""

from sqlalchemy import Column, String, UUID, Boolean, DateTime, Text, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.database import Base

# Foreign key constants
CHAT_SESSIONS_ID = "chat_sessions.id"


class ChatMessageStatus(str, enum.Enum):
    """Message delivery status"""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class ChatSessionStatus(str, enum.Enum):
    """Chat session status"""
    ACTIVE = "active"
    CLOSED = "closed"
    ARCHIVED = "archived"
    WAITING = "waiting"


class ChatParticipantRole(str, enum.Enum):
    """User role in chat"""
    USER = "user"
    SUPPORT_AGENT = "support_agent"
    ADMIN = "admin"


class ChatRoom(Base):
    """
    Chat rooms for group messaging.
    Can be used for customer support channels, team chat, etc.
    """
    __tablename__ = "chat_rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Room metadata
    name = Column(String(255), nullable=False, unique=False)
    description = Column(Text, nullable=True)
    room_type = Column(String(50), nullable=False)  # support, team, general, private
    
    # Settings
    is_active = Column(Boolean, default=True, index=True)
    is_private = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=False)
    
    # Moderation
    allow_users = Column(Boolean, default=True)
    allow_files = Column(Boolean, default=True)
    allow_voice = Column(Boolean, default=False)
    allow_video = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    archived_at = Column(DateTime, nullable=True)
    
    # Statistics
    total_messages = Column(Integer, default=0)
    active_participants = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<ChatRoom(name={self.name}, type={self.room_type})>"


class ChatSession(Base):
    """
    Individual chat sessions between users/agents.
    Each conversation thread is a session.
    """
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_room_id = Column(UUID(as_uuid=True), ForeignKey("chat_rooms.id"), nullable=True)
    
    # Session info
    title = Column(String(255), nullable=True)
    status = Column(String(50), default=ChatSessionStatus.ACTIVE, index=True)
    
    # Participants (initial)
    initiator_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    assigned_agent_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Meta data (renamed from metadata to avoid SQLAlchemy reserved attribute)
    meta_data = Column(JSONB, nullable=True)  # Custom data, tags, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    started_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    archived_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Statistics
    total_messages = Column(Integer, default=0)
    unread_count = Column(Integer, default=0)
    
    # Rating/Feedback
    rating = Column(Integer, nullable=True)  # 1-5
    feedback = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<ChatSession(id={self.id}, status={self.status})>"


class ChatParticipant(Base):
    """
    Tracks users participating in a chat session.
    Supports multiple participants per session.
    """
    __tablename__ = "chat_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey(CHAT_SESSIONS_ID), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Role
    role = Column(String(50), default=ChatParticipantRole.USER, nullable=False)
    
    # Participation
    is_active = Column(Boolean, default=True, index=True)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    left_at = Column(DateTime, nullable=True)
    
    # Read status
    last_read_message_id = Column(UUID(as_uuid=True), nullable=True)
    last_read_at = Column(DateTime, nullable=True)
    
    # Notifications
    muted = Column(Boolean, default=False)
    archived = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<ChatParticipant(user_id={self.user_id}, role={self.role})>"


class ChatMessage(Base):
    """
    Individual messages in a chat session.
    Tracks content, status, and metadata.
    """
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey(CHAT_SESSIONS_ID), nullable=False, index=True)
    sender_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Content
    message_type = Column(String(50), default="text")  # text, image, file, typing, system
    content = Column(Text, nullable=True)
    
    # Files/Attachments
    file_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(100), nullable=True)
    
    # Message status
    status = Column(String(50), default=ChatMessageStatus.SENT, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    edited_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    
    # Delivery tracking
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_by_count = Column(Integer, default=0)
    
    # Reactions
    reactions = Column(JSONB, nullable=True)  # {emoji: [user_ids]}
    
    # Reply to (thread)
    reply_to_id = Column(UUID(as_uuid=True), ForeignKey("chat_messages.id"), nullable=True)
    
    # Mentions
    mentions = Column(JSONB, nullable=True)  # List of user IDs mentioned
    
    def __repr__(self):
        return f"<ChatMessage(id={self.id}, type={self.message_type}, status={self.status})>"


class ChatTypingIndicator(Base):
    """
    Track who is currently typing in a chat session.
    Used for real-time typing notifications.
    """
    __tablename__ = "chat_typing_indicators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey(CHAT_SESSIONS_ID), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Typing state
    is_typing = Column(Boolean, default=True, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChatTypingIndicator(user_id={self.user_id}, is_typing={self.is_typing})>"


class ChatNotificationPreference(Base):
    """
    Per-user notification preferences for chat messages.
    Controls how users receive chat notifications.
    """
    __tablename__ = "chat_notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    
    # Notification settings
    push_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=False)
    sound_enabled = Column(Boolean, default=True)
    
    # Frequency
    notify_all = Column(Boolean, default=True)
    notify_mentions_only = Column(Boolean, default=False)
    
    # Do not disturb
    dnd_enabled = Column(Boolean, default=False)
    dnd_start = Column(String(5), nullable=True)  # HH:MM
    dnd_end = Column(String(5), nullable=True)    # HH:MM
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChatNotificationPreference(user_id={self.user_id})>"


class ChatBlockedUser(Base):
    """
    Track blocked users for privacy and safety.
    Prevents blocked users from messaging.
    """
    __tablename__ = "chat_blocked_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    blocked_user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Block info
    reason = Column(Text, nullable=True)
    blocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    unblocked_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<ChatBlockedUser(user_id={self.user_id}, blocked_user_id={self.blocked_user_id})>"


class ChatAuditLog(Base):
    """
    Audit trail for chat actions for compliance and monitoring.
    """
    __tablename__ = "chat_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey(CHAT_SESSIONS_ID), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Action
    action = Column(String(100), nullable=False, index=True)  # message_sent, session_started, etc.
    resource = Column(String(50), nullable=False)  # message, session, room, user
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Details
    details = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f"<ChatAuditLog(action={self.action}, resource={self.resource})>"
