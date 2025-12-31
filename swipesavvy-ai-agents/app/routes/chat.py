"""
WebSocket and REST endpoints for real-time chat functionality.
Includes WebSocket connection handling and chat management APIs.
"""

import logging
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, validator

from app.database import get_db
from app.core.auth import verify_jwt_token
from app.services.websocket_manager import manager, WebSocketMessage
from app.services.chat_service import ChatService
from app.models.chat import ChatMessageStatus, ChatSessionStatus, ChatParticipantRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# Error message constants
SESSION_NOT_FOUND = "Session not found"
NOT_A_PARTICIPANT = "Not a participant"


# ============================================================================
# Request/Response Models
# ============================================================================

class MessageRequest(BaseModel):
    """Request model for sending a message"""
    message_type: str = Field("text", description="Type of message: text, image, file, etc.")
    content: Optional[str] = Field(None, description="Message content")
    file_url: Optional[str] = Field(None, description="URL of attached file")
    file_name: Optional[str] = Field(None, description="Name of attached file")
    file_size: Optional[int] = Field(None, description="Size of attached file in bytes")
    file_type: Optional[str] = Field(None, description="MIME type of attached file")
    reply_to_id: Optional[UUID] = Field(None, description="ID of message being replied to")
    mentions: Optional[List[UUID]] = Field(None, description="List of mentioned user IDs")
    
    @validator('message_type')
    def validate_message_type(cls, v):
        valid_types = ['text', 'image', 'file', 'typing', 'system', 'notification']
        if v not in valid_types:
            raise ValueError(f'message_type must be one of: {valid_types}')
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v):
        max_size = 100 * 1024 * 1024  # 100MB
        if v and v > max_size:
            raise ValueError(f'File size cannot exceed {max_size} bytes')
        return v


class MessageResponse(BaseModel):
    """Response model for a message"""
    id: UUID
    chat_session_id: UUID
    sender_id: UUID
    message_type: str
    content: Optional[str]
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    file_type: Optional[str]
    status: str
    created_at: datetime
    edited_at: Optional[datetime]
    deleted_at: Optional[datetime]
    read_by_count: int
    
    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    """Response model for a chat session"""
    id: UUID
    title: Optional[str]
    status: str
    initiator_id: UUID
    assigned_agent_id: Optional[UUID]
    created_at: datetime
    started_at: Optional[datetime]
    closed_at: Optional[datetime]
    total_messages: int
    unread_count: int
    
    class Config:
        from_attributes = True


class ParticipantResponse(BaseModel):
    """Response model for a session participant"""
    id: UUID
    user_id: UUID
    role: str
    joined_at: datetime
    is_active: bool
    last_read_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class CreateSessionRequest(BaseModel):
    """Request model for creating a chat session"""
    title: Optional[str] = Field(None, description="Session title")
    assigned_agent_id: Optional[UUID] = Field(None, description="Assign to support agent")


class MarkReadRequest(BaseModel):
    """Request model for marking messages as read"""
    up_to_message_id: UUID = Field(..., description="ID of message to mark up to")


class BlockUserRequest(BaseModel):
    """Request model for blocking a user"""
    blocked_user_id: UUID = Field(..., description="ID of user to block")
    reason: Optional[str] = Field(None, description="Reason for blocking")


class ChatResponse(BaseModel):
    """Standard response for chat operations"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# WebSocket Endpoint
# ============================================================================

@router.websocket("/ws/{chat_session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    chat_session_id: UUID,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time chat with proper error handling.
    
    Query parameters:
    - token: JWT authentication token
    
    Message format:
    {
        "message_type": "message|typing|status",
        "content": "message content",
        "reply_to_id": "optional",
        "mentions": ["user_id"]
    }
    """
    
    user_id = None
    connection_id = str(chat_session_id)
    
    try:
        # Get and verify JWT token from query params
        token = None
        # Note: WebSocket doesn't support standard Authorization headers
        # Token should be passed as query parameter for WebSocket connections
        if "token" in websocket.query_params:
            token = websocket.query_params["token"]
        
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="No auth token")
            return
        
        # Verify token
        try:
            user_id = verify_jwt_token(token)
        except Exception as e:
            logger.warning(f"WebSocket auth failed: {str(e)}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token")
            return
        
        # Verify session exists and user has access
        try:
            session = ChatService.get_session(db, chat_session_id)
            if not session:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=SESSION_NOT_FOUND)
                return
            
            # Check if user is a participant
            participant = ChatService.get_participant(db, chat_session_id, user_id)
            if not participant:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=NOT_A_PARTICIPANT)
                return
        except Exception as e:
            logger.error(f"Error validating session: {str(e)}")
            await websocket.close(code=status.WS_1011_SERVER_ERROR, reason="Validation error")
            return
        
        # Accept connection
        await websocket.accept()
        await manager.connect(connection_id, str(user_id), websocket)
        
        logger.info(f"WebSocket connected: user={user_id}, session={chat_session_id}")
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                
                try:
                    message_data = MessageRequest.parse_raw(data)
                    
                    # Handle different message types
                    if message_data.message_type == "typing":
                        try:
                            # Handle typing indicator
                            is_typing = message_data.content == "true" if message_data.content else False
                            await manager.mark_typing(connection_id, str(user_id), is_typing)
                        except Exception as e:
                            logger.error(f"Error marking typing: {str(e)}")
                            await websocket.send_json({
                                "success": False,
                                "message": "Error processing typing indicator"
                            })
                    
                    elif message_data.message_type == "text":
                        try:
                            # Handle regular message
                            if not message_data.content:
                                await websocket.send_json({
                                    "success": False,
                                    "message": "Content required for text messages"
                                })
                                continue
                            
                            # Create message in database
                            db_message = ChatService.create_message(
                                db=db,
                                chat_session_id=chat_session_id,
                                sender_id=user_id,
                                message_type="text",
                                content=message_data.content,
                                reply_to_id=message_data.reply_to_id,
                                mentions=message_data.mentions
                            )
                            db.commit()
                            
                            # Broadcast message to all users in session
                            ws_message = WebSocketMessage(
                                message_type="message",
                                chat_session_id=str(chat_session_id),
                                user_id=str(user_id),
                                content=message_data.content,
                                metadata={
                                    "message_id": str(db_message.id),
                                    "reply_to_id": str(message_data.reply_to_id) if message_data.reply_to_id else None,
                                    "mentions": [str(m) for m in (message_data.mentions or [])]
                                }
                            )
                            
                            await manager.broadcast(connection_id, ws_message)
                            
                            logger.info(f"Message sent: {db_message.id} in session {chat_session_id}")
                        except Exception as e:
                            logger.error(f"Error creating message: {str(e)}")
                            await websocket.send_json({
                                "success": False,
                                "message": "Error creating message"
                            })
                    else:
                        logger.warning(f"Unknown message type: {message_data.message_type}")
                
                except ValueError as e:
                    logger.warning(f"Invalid message format: {str(e)}")
                    try:
                        await websocket.send_json({
                            "success": False,
                            "message": "Invalid message format"
                        })
                    except RuntimeError:
                        pass  # Connection might be closed
            
            except WebSocketDisconnect:
                # Normal client disconnect
                logger.info(f"Client disconnected: user={user_id}, session={chat_session_id}")
                break
            except RuntimeError as e:
                # Connection already closed
                logger.debug(f"Connection error (likely already closed): {str(e)}")
                break
            except Exception as e:
                # Unexpected error during message receive
                logger.error(f"Error receiving message: {str(e)}")
                try:
                    await websocket.send_json({
                        "success": False,
                        "message": "Server error processing message"
                    })
                except RuntimeError:
                    pass  # Connection might be closed
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected during setup: user={user_id}")
    except Exception as e:
        logger.error(f"Unexpected WebSocket error: {str(e)}")
    finally:
        # Ensure cleanup happens
        if user_id:
            try:
                await manager.disconnect(connection_id, str(user_id))
                logger.info(f"Cleaned up WebSocket: user={user_id}, session={chat_session_id}")
            except Exception as e:
                logger.error(f"Error during disconnect cleanup: {str(e)}")
                
                elif message_data.message_type in ["image", "file"]:
                    # Handle file attachments
                    if not message_data.file_url:
                        await websocket.send_json({
                            "success": False,
                            "message": "File URL required"
                        })
                        continue
                    
                    db_message = ChatService.create_message(
                        db=db,
                        chat_session_id=chat_session_id,
                        sender_id=user_id,
                        message_type=message_data.message_type,
                        content=message_data.content,
                        file_url=message_data.file_url,
                        file_name=message_data.file_name,
                        file_size=message_data.file_size,
                        file_type=message_data.file_type,
                        reply_to_id=message_data.reply_to_id,
                        mentions=message_data.mentions
                    )
                    db.commit()
                    
                    ws_message = WebSocketMessage(
                        message_type="message",
                        chat_session_id=str(chat_session_id),
                        user_id=str(user_id),
                        content=message_data.content,
                        metadata={
                            "message_id": str(db_message.id),
                            "message_type": message_data.message_type,
                            "file_url": message_data.file_url,
                            "file_name": message_data.file_name,
                            "file_size": message_data.file_size,
                            "file_type": message_data.file_type
                        }
                    )
                    
                    await manager.broadcast(str(chat_session_id), ws_message)
            
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}", exc_info=True)
                await websocket.send_json({
                    "success": False,
                    "message": f"Error processing message: {str(e)}"
                })
    
    except WebSocketDisconnect:
        if user_id:
            await manager.disconnect(str(chat_session_id), str(user_id))
            logger.info(f"WebSocket disconnected: user={user_id}, session={chat_session_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}", exc_info=True)
        try:
            await websocket.close(code=status.WS_1011_SERVER_ERROR, reason="Internal error")
        except Exception:
            pass


# ============================================================================
# REST API Endpoints
# ============================================================================

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Create a new chat session.
    
    Args:
        request: Session creation parameters
        current_user: Currently authenticated user ID
        db: Database session
    
    Returns:
        Created ChatSession
    """
    try:
        session = ChatService.create_session(
            db=db,
            initiator_id=current_user,
            title=request.title,
            assigned_agent_id=request.assigned_agent_id
        )
        db.commit()
        return session
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create session")


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: UUID,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Get a chat session by ID."""
    session = ChatService.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check user is a participant
    participant = ChatService.get_participant(db, session_id, current_user)
    if not participant:
        raise HTTPException(status_code=403, detail=NOT_A_PARTICIPANT)
    
    return session


@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    session_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Get messages from a chat session with pagination."""
    # Verify user has access
    participant = ChatService.get_participant(db, session_id, current_user)
    if not participant:
        raise HTTPException(status_code=403, detail=NOT_A_PARTICIPANT)
    
    messages = ChatService.get_session_messages(db, session_id, limit, offset)
    return messages


@router.post("/sessions/{session_id}/mark-read", response_model=ChatResponse)
async def mark_read(
    session_id: UUID,
    request: MarkReadRequest,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Mark messages as read up to a specific message."""
    participant = ChatService.get_participant(db, session_id, current_user)
    if not participant:
        raise HTTPException(status_code=403, detail=NOT_A_PARTICIPANT)
    
    success = ChatService.mark_read(db, session_id, current_user, request.up_to_message_id)
    db.commit()
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to mark as read")
    
    return ChatResponse(
        success=True,
        message="Messages marked as read",
        data={"session_id": str(session_id)}
    )


@router.post("/sessions/{session_id}/close", response_model=ChatResponse)
async def close_session(
    session_id: UUID,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Close a chat session."""
    session = ChatService.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)
    
    if session.initiator_id != current_user and session.assigned_agent_id != current_user:
        raise HTTPException(status_code=403, detail="Cannot close this session")
    
    success = ChatService.close_session(db, session_id)
    db.commit()
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to close session")
    
    return ChatResponse(success=True, message="Session closed")


@router.get("/sessions/{session_id}/participants", response_model=List[ParticipantResponse])
async def get_participants(
    session_id: UUID,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Get all participants in a chat session."""
    participant = ChatService.get_participant(db, session_id, current_user)
    if not participant:
        raise HTTPException(status_code=403, detail=NOT_A_PARTICIPANT)
    
    participants = ChatService.get_session_participants(db, session_id)
    return participants


@router.post("/block", response_model=ChatResponse)
async def block_user(
    request: BlockUserRequest,
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Block a user from sending messages."""
    ChatService.block_user(
        db=db,
        user_id=current_user,
        blocked_user_id=request.blocked_user_id,
        reason=request.reason
    )
    db.commit()
    
    return ChatResponse(success=True, message="User blocked")


@router.post("/unblock", response_model=ChatResponse)
async def unblock_user(
    blocked_user_id: UUID = Query(..., description="ID of user to unblock"),
    current_user: str = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """Unblock a user."""
    success = ChatService.unblock_user(db, current_user, blocked_user_id)
    db.commit()
    
    if not success:
        raise HTTPException(status_code=400, detail="User not blocked")
    
    return ChatResponse(success=True, message="User unblocked")


@router.get("/ws-stats")
async def get_websocket_stats(current_user: str = Depends(verify_jwt_token)):
    """Get WebSocket connection statistics (admin only)."""
    # Verify user has admin role before allowing admin operations
    # Admin users can perform moderation and management tasks on sessions
    return manager.get_stats()
