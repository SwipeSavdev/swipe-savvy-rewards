"""
Conversation History Manager
Handles session persistence and multi-turn conversation tracking
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import json

@dataclass
class Message:
    """Single message in conversation"""
    role: str  # 'user', 'assistant', 'system', 'tool'
    content: str
    timestamp: str
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        return asdict(self)

@dataclass
class ConversationSession:
    """Conversation session with history"""
    session_id: str
    user_id: str
    started_at: str
    last_message_at: str
    messages: List[Message]
    context: Dict[str, Any]
    status: str = "active"
    
    def to_dict(self):
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "started_at": self.started_at,
            "last_message_at": self.last_message_at,
            "messages": [m.to_dict() for m in self.messages],
            "context": self.context,
            "status": self.status
        }


class ConversationManager:
    """Manages conversation sessions and history"""
    
    def __init__(self):
        self._sessions: Dict[str, ConversationSession] = {}
    
    def create_session(self, user_id: str, session_id: Optional[str] = None) -> ConversationSession:
        """Create new conversation session"""
        if not session_id:
            session_id = f"session_{user_id}_{datetime.now().timestamp()}"
        
        session = ConversationSession(
            session_id=session_id,
            user_id=user_id,
            started_at=datetime.now().isoformat(),
            last_message_at=datetime.now().isoformat(),
            messages=[],
            context={}
        )
        
        self._sessions[session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Get existing session"""
        return self._sessions.get(session_id)
    
    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Add message to session history"""
        session = self.get_session(session_id)
        if not session:
            return False
        
        message = Message(
            role=role,
            content=content,
            timestamp=datetime.now().isoformat(),
            metadata=metadata or {}
        )
        
        session.messages.append(message)
        session.last_message_at = datetime.now().isoformat()
        return True
    
    def get_history(
        self,
        session_id: str,
        limit: Optional[int] = None,
        include_system: bool = False
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a session"""
        session = self.get_session(session_id)
        if not session:
            return []
        
        messages = session.messages
        
        # Filter out system messages if requested
        if not include_system:
            messages = [m for m in messages if m.role != 'system']
        
        # Apply limit
        if limit:
            messages = messages[-limit:]
        
        return [m.to_dict() for m in messages]
    
    def get_context(self, session_id: str) -> Dict[str, Any]:
        """Get session context (preferences, previous actions, etc)"""
        session = self.get_session(session_id)
        if not session:
            return {}
        return session.context
    
    def update_context(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update session context"""
        session = self.get_session(session_id)
        if not session:
            return False
        
        session.context.update(updates)
        return True
    
    def end_session(self, session_id: str) -> bool:
        """Mark session as ended"""
        session = self.get_session(session_id)
        if not session:
            return False
        
        session.status = "ended"
        return True
    
    def get_recent_tool_calls(self, session_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent tool calls from conversation"""
        session = self.get_session(session_id)
        if not session:
            return []
        
        tool_calls = []
        for msg in reversed(session.messages):
            if msg.metadata and msg.metadata.get("tool_name"):
                tool_calls.append({
                    "tool": msg.metadata["tool_name"],
                    "timestamp": msg.timestamp,
                    "result": msg.metadata.get("tool_result")
                })
                if len(tool_calls) >= limit:
                    break
        
        return tool_calls
    
    def get_summary(self, session_id: str) -> Dict[str, Any]:
        """Get session summary statistics"""
        session = self.get_session(session_id)
        if not session:
            return {}
        
        user_messages = [m for m in session.messages if m.role == "user"]
        assistant_messages = [m for m in session.messages if m.role == "assistant"]
        tool_messages = [m for m in session.messages if m.role == "tool"]
        
        return {
            "session_id": session.session_id,
            "user_id": session.user_id,
            "status": session.status,
            "started_at": session.started_at,
            "duration_seconds": (
                datetime.fromisoformat(session.last_message_at) -
                datetime.fromisoformat(session.started_at)
            ).total_seconds(),
            "message_count": len(session.messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "tool_calls": len(tool_messages),
            "last_activity": session.last_message_at
        }


# Global instance
_conversation_manager = None

def get_conversation_manager() -> ConversationManager:
    """Get or create conversation manager instance"""
    global _conversation_manager
    if _conversation_manager is None:
        _conversation_manager = ConversationManager()
    return _conversation_manager
