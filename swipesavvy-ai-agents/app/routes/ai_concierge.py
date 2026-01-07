"""
AI Concierge Service - Chat endpoint for AI-powered support
Provides streaming responses using Together.AI LLM
"""

import json
import logging
import os
import time
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from together import Together

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ai-concierge", tags=["ai-concierge"])


class AIConciergeRequest(BaseModel):
    """Request model for AI Concierge chat"""
    message: str = Field(..., description="User's message/question")
    user_id: str = Field(..., description="Unique user ID")
    session_id: Optional[str] = Field(None, description="Optional session ID for context")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional context data")


@router.post("")
async def ai_concierge_chat(request: AIConciergeRequest):
    """
    AI Concierge chat endpoint with streaming response.
    
    Streams AI responses from Together.AI using Server-Sent Events (SSE).
    The frontend should parse SSE formatted responses where each line is:
    `data: {"type": "message", "content": "..."}`
    
    Args:
        request: AIConciergeRequest with message and user info
        
    Returns:
        StreamingResponse with text/event-stream content type
    """
    
    session_id = request.session_id or f"session_{request.user_id}_{int(time.time())}"
    logger.info(f"AI Concierge chat from user {request.user_id}, session {session_id}")
    logger.info(f"Message: {request.message[:50]}...")
    
    api_key = os.getenv("TOGETHER_API_KEY", "")
    if not api_key:
        logger.error("TOGETHER_API_KEY environment variable not set")
        raise HTTPException(
            status_code=500,
            detail="AI service not configured. Please contact support."
        )
    
    async def generate_response_stream():
        """Generator function for streaming SSE responses"""
        try:
            # Initialize Together.AI client
            client = Together(api_key=api_key)
            
            # System prompt for AI Concierge
            system_prompt = """You are SwipeSavvy AI Concierge, a helpful financial assistant for the SwipeSavvy mobile wallet platform.
You help users with:
- Account questions and support
- Transaction history and disputes
- Rewards and loyalty programs
- Payment methods and wallets
- General wallet features and usage

Be professional, helpful, and concise. If you don't know something, offer to escalate to human support."""
            
            logger.info(f"Calling Together.AI with model: meta-llama/Llama-3.3-70B-Instruct-Turbo")
            
            # Call Together.AI with streaming
            response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": request.message}
                ],
                max_tokens=1024,
                temperature=0.7,
                stream=True,
            )
            
            # Stream the response back to frontend
            full_response = ""
            for chunk in response:
                # Check if chunk has content
                if (hasattr(chunk, 'choices') and 
                    chunk.choices and 
                    hasattr(chunk.choices[0], 'delta') and
                    hasattr(chunk.choices[0].delta, 'content') and
                    chunk.choices[0].delta.content):
                    
                    content = chunk.choices[0].delta.content
                    full_response += content
                    
                    # Send SSE formatted response
                    sse_line = f"data: {json.dumps({'type': 'message', 'content': content})}\n\n"
                    yield sse_line
            
            logger.info(f"Completed streaming response. Total length: {len(full_response)}")
            
            # Send completion marker
            yield f"data: {json.dumps({'type': 'message_complete', 'full_response': full_response})}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Error in AI Concierge: {str(e)}", exc_info=True)
            error_msg = str(e)
            yield f"data: {json.dumps({'type': 'error', 'content': f'Error: {error_msg}'})}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_response_stream(),
        media_type="text/event-stream"
    )
