"""
Handoff Manager
Detects when to escalate conversations to human agents
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass
import re

@dataclass
class HandoffTrigger:
    """Represents a reason for handoff"""
    reason: str
    confidence: float
    triggered_at: str
    metadata: Dict[str, Any]

class HandoffManager:
    """Manages conversation handoff to human agents"""
    
    # Keywords that indicate user wants human help
    HUMAN_REQUEST_KEYWORDS = [
        "speak to human", "talk to person", "real person", "human agent",
        "representative", "customer service", "support agent", "live agent",
        "talk to someone", "speak to someone"
    ]
    
    # Keywords for sensitive/complex topics
    COMPLEX_KEYWORDS = [
        "fraud", "dispute", "stolen", "unauthorized", "hack", "scam",
        "refund", "chargeback", "complaint", "legal", "lawsuit",
        "close account", "delete account", "cancel"
    ]
    
    # Frustration indicators
    FRUSTRATION_KEYWORDS = [
        "this doesn't help", "not helpful", "useless", "waste of time",
        "frustrated", "annoyed", "angry", "upset", "terrible",
        "worst", "horrible", "pathetic"
    ]
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {
            "confidence_threshold": 0.7,
            "max_failed_attempts": 3,
            "high_value_threshold": 100000,  # $1,000 in cents
            "enable_sentiment_analysis": False
        }
        self._handoff_history: List[HandoffTrigger] = []
    
    def should_handoff(
        self,
        user_message: str,
        conversation_history: List[Dict[str, Any]],
        session_context: Dict[str, Any],
        agent_confidence: Optional[float] = None
    ) -> Optional[HandoffTrigger]:
        """
        Determine if conversation should be handed off to human
        
        Returns HandoffTrigger if handoff needed, None otherwise
        """
        
        # Check 1: User explicitly requests human
        if self._detect_human_request(user_message):
            return HandoffTrigger(
                reason="user_requested",
                confidence=1.0,
                triggered_at=datetime.now().isoformat(),
                metadata={"message": user_message}
            )
        
        # Check 2: User shows frustration
        if self._detect_frustration(user_message):
            return HandoffTrigger(
                reason="user_frustrated",
                confidence=0.9,
                triggered_at=datetime.now().isoformat(),
                metadata={"message": user_message}
            )
        
        # Check 3: Complex/sensitive topic
        if self._detect_complex_topic(user_message):
            return HandoffTrigger(
                reason="complex_topic",
                confidence=0.85,
                triggered_at=datetime.now().isoformat(),
                metadata={
                    "message": user_message,
                    "detected_keywords": self._find_complex_keywords(user_message)
                }
            )
        
        # Check 4: Low agent confidence
        if agent_confidence is not None and agent_confidence < self.config["confidence_threshold"]:
            return HandoffTrigger(
                reason="low_confidence",
                confidence=agent_confidence,
                triggered_at=datetime.now().isoformat(),
                metadata={"agent_confidence": agent_confidence}
            )
        
        # Check 5: Too many failed attempts
        failed_attempts = session_context.get("failed_resolution_attempts", 0)
        if failed_attempts >= self.config["max_failed_attempts"]:
            return HandoffTrigger(
                reason="max_attempts_exceeded",
                confidence=0.95,
                triggered_at=datetime.now().isoformat(),
                metadata={"failed_attempts": failed_attempts}
            )
        
        # Check 6: High value transaction request
        if self._detect_high_value_transaction(user_message, session_context):
            return HandoffTrigger(
                reason="high_value_transaction",
                confidence=0.8,
                triggered_at=datetime.now().isoformat(),
                metadata={"context": session_context}
            )
        
        return None
    
    def _detect_human_request(self, message: str) -> bool:
        """Check if user is asking for a human agent"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.HUMAN_REQUEST_KEYWORDS)
    
    def _detect_frustration(self, message: str) -> bool:
        """Detect user frustration in message"""
        message_lower = message.lower()
        
        # Check for frustration keywords
        if any(keyword in message_lower for keyword in self.FRUSTRATION_KEYWORDS):
            return True
        
        # Check for excessive punctuation (!!!, ???)
        if re.search(r'[!?]{3,}', message):
            return True
        
        # Check for ALL CAPS (anger indicator)
        words = message.split()
        caps_words = [w for w in words if w.isupper() and len(w) > 2]
        if len(caps_words) > 2:
            return True
        
        return False
    
    def _detect_complex_topic(self, message: str) -> bool:
        """Check if message contains complex/sensitive topics"""
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in self.COMPLEX_KEYWORDS)
    
    def _find_complex_keywords(self, message: str) -> List[str]:
        """Find which complex keywords were detected"""
        message_lower = message.lower()
        return [kw for kw in self.COMPLEX_KEYWORDS if kw in message_lower]
    
    def _detect_high_value_transaction(self, message: str, context: Dict[str, Any]) -> bool:
        """Check if request involves high-value transaction"""
        # Extract amounts from message
        amounts = re.findall(r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)', message)
        
        for amount_str in amounts:
            amount = float(amount_str.replace(',', ''))
            amount_cents = int(amount * 100)
            
            if amount_cents >= self.config["high_value_threshold"]:
                return True
        
        # Check last tool calls for high amounts
        if context.get("last_transaction_amount"):
            if context["last_transaction_amount"] >= self.config["high_value_threshold"]:
                return True
        
        return False
    
    def generate_handoff_message(self, trigger: HandoffTrigger) -> str:
        """Generate appropriate handoff message based on trigger reason"""
        
        messages = {
            "user_requested": "I'll connect you with a member of our support team right away. They'll be able to assist you further.",
            
            "user_frustrated": "I apologize that I haven't been able to help you satisfactorily. Let me connect you with a support specialist who can better assist you.",
            
            "complex_topic": "This matter requires specialized assistance. I'm connecting you with a support specialist who can help resolve this for you.",
            
            "low_confidence": "To make sure you get the most accurate help, I'd like to connect you with a support specialist.",
            
            "max_attempts_exceeded": "I want to make sure you get the help you need. Let me connect you with a support specialist who can assist you further.",
            
            "high_value_transaction": "For your security, transactions of this amount require assistance from our support team. I'm connecting you now."
        }
        
        return messages.get(trigger.reason, "Let me connect you with a support specialist who can help you.")
    
    def create_handoff_context(
        self,
        trigger: HandoffTrigger,
        session_summary: Dict[str, Any],
        conversation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create context package for human agent"""
        
        return {
            "handoff_trigger": {
                "reason": trigger.reason,
                "confidence": trigger.confidence,
                "triggered_at": trigger.triggered_at,
                "metadata": trigger.metadata
            },
            "session_summary": session_summary,
            "recent_messages": conversation_history[-10:],  # Last 10 messages
            "tools_used": [
                msg.get("metadata", {}).get("tool_name")
                for msg in conversation_history
                if msg.get("metadata", {}).get("tool_name")
            ],
            "handoff_created_at": datetime.now().isoformat()
        }
    
    def log_handoff(self, trigger: HandoffTrigger):
        """Log handoff event for analytics"""
        self._handoff_history.append(trigger)
    
    def get_handoff_stats(self) -> Dict[str, Any]:
        """Get handoff statistics"""
        if not self._handoff_history:
            return {"total_handoffs": 0}
        
        reasons = {}
        for trigger in self._handoff_history:
            reasons[trigger.reason] = reasons.get(trigger.reason, 0) + 1
        
        return {
            "total_handoffs": len(self._handoff_history),
            "reasons_breakdown": reasons,
            "avg_confidence": sum(t.confidence for t in self._handoff_history) / len(self._handoff_history)
        }


# Global instance
_handoff_manager = None

def get_handoff_manager() -> HandoffManager:
    """Get or create handoff manager instance"""
    global _handoff_manager
    if _handoff_manager is None:
        _handoff_manager = HandoffManager()
    return _handoff_manager
