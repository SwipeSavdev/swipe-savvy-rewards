"""
WebSocket connection manager for real-time chat.
Handles connection lifecycle, message broadcasting, and connection pool management.
"""

import logging
import json
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from uuid import UUID

logger = logging.getLogger(__name__)


@dataclass
class WebSocketMessage:
    """
    Standard WebSocket message format.
    All messages follow this structure for consistency.
    """
    message_type: str  # connect, disconnect, message, typing, status, error
    chat_session_id: str
    user_id: str
    content: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_json(self) -> str:
        """Convert to JSON string"""
        data = asdict(self)
        return json.dumps(data)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'WebSocketMessage':
        """Create from JSON string"""
        data = json.loads(json_str)
        return cls(**data)


@dataclass
class ConnectionUser:
    """
    Represents a connected user with metadata.
    """
    user_id: str
    chat_session_id: str
    connection: Any  # WebSocket connection
    connected_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    typing: bool = False
    
    def to_dict(self) -> dict:
        """Convert to dictionary (without connection object)"""
        return {
            "user_id": self.user_id,
            "chat_session_id": self.chat_session_id,
            "connected_at": self.connected_at.isoformat(),
            "is_active": self.is_active,
            "typing": self.typing
        }


class ChatConnectionManager:
    """
    Manages WebSocket connections for chat.
    Handles connection lifecycle, message routing, and broadcasting.
    
    Architecture:
    - Maintains connection pool organized by chat_session_id
    - Routes messages to specific users or broadcasts to all
    - Tracks connection state (active, typing, etc.)
    - Provides graceful disconnect handling
    """
    
    def __init__(self):
        # {chat_session_id: {user_id: ConnectionUser}}
        self.active_connections: Dict[str, Dict[str, ConnectionUser]] = {}
        self.lock = None  # Will use asyncio.Lock in async context
        
        logger.info("ChatConnectionManager initialized")
    
    async def connect(self, chat_session_id: str, user_id: str, websocket: Any) -> None:
        """
        Register a new WebSocket connection.
        
        Args:
            chat_session_id: ID of the chat session
            user_id: ID of the connected user
            websocket: WebSocket connection object
        """
        try:
            # Initialize session if not exists
            if chat_session_id not in self.active_connections:
                self.active_connections[chat_session_id] = {}
            
            # Create connection user
            connection_user = ConnectionUser(
                user_id=user_id,
                chat_session_id=chat_session_id,
                connection=websocket
            )
            
            # Store connection
            self.active_connections[chat_session_id][user_id] = connection_user
            
            logger.info(
                f"User {user_id} connected to session {chat_session_id}. "
                f"Active connections in session: {len(self.active_connections[chat_session_id])}"
            )
            
            # Broadcast user joined
            await self.broadcast_status(
                chat_session_id=chat_session_id,
                message_type="user_joined",
                user_id=user_id,
                metadata={"total_users": len(self.active_connections[chat_session_id])}
            )
            
        except Exception as e:
            logger.error(f"Error connecting user {user_id}: {str(e)}", exc_info=True)
            raise
    
    async def disconnect(self, chat_session_id: str, user_id: str) -> None:
        """
        Unregister a WebSocket connection.
        
        Args:
            chat_session_id: ID of the chat session
            user_id: ID of the disconnecting user
        """
        try:
            if chat_session_id in self.active_connections:
                if user_id in self.active_connections[chat_session_id]:
                    del self.active_connections[chat_session_id][user_id]
                    
                    logger.info(
                        f"User {user_id} disconnected from session {chat_session_id}. "
                        f"Active connections in session: {len(self.active_connections[chat_session_id])}"
                    )
                    
                    # Broadcast user left
                    await self.broadcast_status(
                        chat_session_id=chat_session_id,
                        message_type="user_left",
                        user_id=user_id,
                        metadata={"total_users": len(self.active_connections[chat_session_id])}
                    )
                    
                    # Clean up empty sessions
                    if not self.active_connections[chat_session_id]:
                        del self.active_connections[chat_session_id]
                        logger.info(f"Chat session {chat_session_id} removed (no active connections)")
        
        except Exception as e:
            logger.error(f"Error disconnecting user {user_id}: {str(e)}", exc_info=True)
    
    async def send_to_user(
        self,
        chat_session_id: str,
        user_id: str,
        message: WebSocketMessage
    ) -> bool:
        """
        Send message to specific user.
        
        Args:
            chat_session_id: ID of the chat session
            user_id: ID of the recipient
            message: Message to send
        
        Returns:
            True if sent successfully, False if user not connected
        """
        try:
            if chat_session_id not in self.active_connections:
                logger.warning(f"Chat session {chat_session_id} not found")
                return False
            
            if user_id not in self.active_connections[chat_session_id]:
                logger.warning(f"User {user_id} not connected to session {chat_session_id}")
                return False
            
            connection_user = self.active_connections[chat_session_id][user_id]
            await connection_user.connection.send_text(message.to_json())
            
            logger.debug(f"Message sent to user {user_id} in session {chat_session_id}")
            return True
        
        except Exception as e:
            logger.error(
                f"Error sending message to user {user_id} in session {chat_session_id}: {str(e)}",
                exc_info=True
            )
            # Remove failed connection
            await self.disconnect(chat_session_id, user_id)
            return False
    
    async def broadcast(
        self,
        chat_session_id: str,
        message: WebSocketMessage,
        exclude_user_id: Optional[str] = None
    ) -> Dict[str, bool]:
        """
        Broadcast message to all users in a session.
        
        Args:
            chat_session_id: ID of the chat session
            message: Message to broadcast
            exclude_user_id: Optional user ID to exclude from broadcast
        
        Returns:
            Dict mapping user_id to success status
        """
        results = {}
        
        if chat_session_id not in self.active_connections:
            logger.warning(f"Chat session {chat_session_id} not found")
            return results
        
        for user_id in self.active_connections[chat_session_id].keys():
            if exclude_user_id and user_id == exclude_user_id:
                continue
            
            success = await self.send_to_user(chat_session_id, user_id, message)
            results[user_id] = success
        
        logger.debug(
            f"Broadcast in session {chat_session_id}: {sum(results.values())}/{len(results)} sent"
        )
        return results
    
    async def broadcast_status(
        self,
        chat_session_id: str,
        message_type: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Broadcast status message (user joined, left, typing, etc.).
        
        Args:
            chat_session_id: ID of the chat session
            message_type: Type of status message
            user_id: ID of the user triggering the status
            metadata: Additional metadata
        """
        status_message = WebSocketMessage(
            message_type=message_type,
            chat_session_id=chat_session_id,
            user_id=user_id,
            metadata=metadata or {}
        )
        
        await self.broadcast(chat_session_id, status_message)
    
    def get_session_users(self, chat_session_id: str) -> List[Dict[str, Any]]:
        """
        Get list of all users connected to a session.
        
        Args:
            chat_session_id: ID of the chat session
        
        Returns:
            List of user dictionaries with connection info
        """
        if chat_session_id not in self.active_connections:
            return []
        
        return [
            user.to_dict()
            for user in self.active_connections[chat_session_id].values()
        ]
    
    def get_user_sessions(self, user_id: str) -> List[str]:
        """
        Get all sessions a user is connected to.
        
        Args:
            user_id: ID of the user
        
        Returns:
            List of chat session IDs
        """
        sessions = []
        for session_id, users in self.active_connections.items():
            if user_id in users:
                sessions.append(session_id)
        return sessions
    
    def get_connection_count(self, chat_session_id: Optional[str] = None) -> int:
        """
        Get count of active connections.
        
        Args:
            chat_session_id: Optional session ID to get count for. If not provided, returns total.
        
        Returns:
            Number of active connections
        """
        if chat_session_id:
            return len(self.active_connections.get(chat_session_id, {}))
        
        total = 0
        for users in self.active_connections.values():
            total += len(users)
        return total
    
    async def mark_typing(self, chat_session_id: str, user_id: str, is_typing: bool) -> None:
        """
        Mark user as typing/not typing.
        
        Args:
            chat_session_id: ID of the chat session
            user_id: ID of the user
            is_typing: True if user is typing, False otherwise
        """
        try:
            if chat_session_id in self.active_connections:
                if user_id in self.active_connections[chat_session_id]:
                    self.active_connections[chat_session_id][user_id].typing = is_typing
                    
                    # Broadcast typing indicator
                    await self.broadcast_status(
                        chat_session_id=chat_session_id,
                        message_type="typing_indicator",
                        user_id=user_id,
                        metadata={"is_typing": is_typing}
                    )
        except Exception as e:
            logger.error(f"Error marking typing for user {user_id}: {str(e)}", exc_info=True)
    
    def get_typing_users(self, chat_session_id: str) -> List[str]:
        """
        Get list of users currently typing in a session.
        
        Args:
            chat_session_id: ID of the chat session
        
        Returns:
            List of user IDs
        """
        if chat_session_id not in self.active_connections:
            return []
        
        return [
            user_id
            for user_id, user in self.active_connections[chat_session_id].items()
            if user.typing
        ]
    
    def is_user_online(self, chat_session_id: str, user_id: str) -> bool:
        """
        Check if user is connected to a session.
        
        Args:
            chat_session_id: ID of the chat session
            user_id: ID of the user
        
        Returns:
            True if user is connected, False otherwise
        """
        return (
            chat_session_id in self.active_connections and
            user_id in self.active_connections[chat_session_id] and
            self.active_connections[chat_session_id][user_id].is_active
        )
    
    async def cleanup_inactive_connections(self, timeout_seconds: int = 300) -> int:
        """
        Remove connections that have been inactive for too long.
        
        Args:
            timeout_seconds: Timeout in seconds (default 5 minutes)
        
        Returns:
            Number of connections removed
        """
        removed_count = 0
        now = datetime.now(timezone.utc)
        
        for session_id in self.active_connections.keys():
            for user_id in self.active_connections[session_id].keys():
                connection_user = self.active_connections[session_id][user_id]
                inactive_duration = (now - connection_user.connected_at).total_seconds()
                
                if inactive_duration > timeout_seconds:
                    await self.disconnect(session_id, user_id)
                    removed_count += 1
        
        if removed_count > 0:
            logger.info(f"Cleaned up {removed_count} inactive connections")
        
        return removed_count
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get connection statistics.
        
        Returns:
            Dictionary with connection stats
        """
        total_sessions = len(self.active_connections)
        total_connections = sum(
            len(users) for users in self.active_connections.values()
        )
        
        return {
            "total_sessions": total_sessions,
            "total_connections": total_connections,
            "average_users_per_session": (
                total_connections / total_sessions if total_sessions > 0 else 0
            ),
            "sessions": {
                session_id: {
                    "user_count": len(users),
                    "typing_count": sum(1 for u in users.values() if u.typing)
                }
                for session_id, users in self.active_connections.items()
            }
        }


# Global connection manager instance
manager = ChatConnectionManager()
