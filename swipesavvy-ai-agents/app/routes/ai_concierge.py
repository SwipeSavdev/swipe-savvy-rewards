"""
AI Concierge Service - Chat endpoint for AI-powered support
Provides streaming responses using Together.AI LLM

Role-Aware: The AI adapts its capabilities and responses based on the signed-in
employee's role (super_admin, admin, support, analyst) and permissions.

Agentic: The AI can execute tools/actions on behalf of employees within their
permission boundaries.
"""

import json
import logging
import os
import time
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from together import Together

from app.config.ai_roles import (
    build_role_aware_prompt,
    get_max_transaction_amount,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ai-concierge", tags=["ai-concierge"])

# SSE stream terminator
SSE_DONE = "data: [DONE]\n\n"


class AIConciergeRequest(BaseModel):
    """Request model for AI Concierge chat - Role-Aware for Employee Support"""
    message: str = Field(..., description="User's message/question")
    user_id: str = Field(..., description="Unique user ID")
    session_id: Optional[str] = Field(None, description="Optional session ID for context")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional context data")
    # Role-aware fields
    role: Optional[str] = Field(
        "analyst",
        description="User role: super_admin, admin, support, analyst"
    )
    permissions: Optional[List[str]] = Field(
        None,
        description="List of user permissions for fine-grained access control"
    )
    employee_name: Optional[str] = Field(
        None,
        description="Employee name for personalized responses"
    )


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

            # Build role-aware system prompt based on employee's role
            role = request.role or "analyst"
            permissions = request.permissions or []

            # Build contextual information
            additional_context = None
            if request.context:
                context_parts = []
                if request.context.get("current_page"):
                    context_parts.append(f"Employee is currently on: {request.context['current_page']}")
                if request.context.get("selected_item"):
                    context_parts.append(f"Employee has selected: {request.context['selected_item']}")
                if context_parts:
                    additional_context = "\n".join(context_parts)

            system_prompt = build_role_aware_prompt(
                role=role,
                permissions=permissions,
                employee_name=request.employee_name,
                additional_context=additional_context
            )

            # Log role information
            max_amount = get_max_transaction_amount(role)
            logger.info(f"AI Concierge chat for {role} (max txn: ${max_amount if max_amount else 'unlimited'})")
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
            yield SSE_DONE
            
        except Exception as e:
            logger.error(f"Error in AI Concierge: {str(e)}", exc_info=True)
            error_msg = str(e)
            yield f"data: {json.dumps({'type': 'error', 'content': f'Error: {error_msg}'})}\n\n"
            yield SSE_DONE
    
    return StreamingResponse(
        generate_response_stream(),
        media_type="text/event-stream"
    )


class AgenticChatRequest(BaseModel):
    """Request model for Agentic AI chat with tool execution"""
    message: str = Field(..., description="User's message/question")
    user_id: str = Field(..., description="Unique user ID")
    session_id: Optional[str] = Field(None, description="Optional session ID")
    role: str = Field("analyst", description="User role: super_admin, admin, support, analyst")
    permissions: List[str] = Field(default_factory=list, description="User permissions")
    employee_name: Optional[str] = Field(None, description="Employee name")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")


@router.post("/agentic")
async def agentic_concierge_chat(request: AgenticChatRequest):
    """
    Agentic AI Concierge endpoint with tool execution capabilities.

    This endpoint enables the AI to execute tools and actions on behalf of employees.
    The AI can look up users, create tickets, process refunds (within role limits), etc.

    Events streamed:
    - {"type": "message", "delta": "...", "content": "..."} - Text response chunks
    - {"type": "tool_call", "tool": "...", "args": "..."} - Tool being called
    - {"type": "approval_required", ...} - Action needs user approval
    - {"type": "tool_result", "tool": "...", "result": {...}} - Tool execution result
    - {"type": "done", "content": "..."} - Final response
    - {"type": "error", "error": "..."} - Error occurred
    """
    from app.services.agentic_loop import AgenticLoop
    from app.services.tools import register_all_tools

    # Ensure tools are registered
    register_all_tools()

    session_id = request.session_id or f"agentic_{request.user_id}_{int(time.time())}"
    logger.info(f"Agentic chat from {request.role} user {request.user_id}, session {session_id}")

    api_key = os.getenv("TOGETHER_API_KEY", "")
    if not api_key:
        logger.error("TOGETHER_API_KEY environment variable not set")
        raise HTTPException(
            status_code=500,
            detail="AI service not configured. Please contact support."
        )

    async def generate_agentic_stream():
        """Generator for agentic SSE responses with tool execution"""
        try:
            # Build execution context
            additional_context = None
            if request.context:
                context_parts = []
                if request.context.get("current_page"):
                    context_parts.append(f"Employee is on: {request.context['current_page']}")
                if request.context.get("selected_item"):
                    context_parts.append(f"Selected: {request.context['selected_item']}")
                if context_parts:
                    additional_context = "\n".join(context_parts)

            context = {
                "user_id": request.user_id,
                "session_id": session_id,
                "role": request.role,
                "permissions": request.permissions,
                "employee_name": request.employee_name,
                "additional_context": additional_context,
            }

            # Run agentic loop
            loop = AgenticLoop(api_key=api_key)

            async for event in loop.run(request.message, context):
                sse_line = f"data: {json.dumps(event)}\n\n"
                yield sse_line

            yield SSE_DONE

        except Exception as e:
            logger.error(f"Agentic chat error: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
            yield SSE_DONE

    return StreamingResponse(
        generate_agentic_stream(),
        media_type="text/event-stream"
    )


@router.post("/approve/{approval_key}")
async def approve_action(approval_key: str):
    """
    Approve a pending action that requires user confirmation.

    Args:
        approval_key: The approval key from the approval_required event

    Returns:
        Success status
    """
    from app.services.tool_registry import tool_registry

    try:
        tool_registry.approve_action(approval_key)
        return {"success": True, "message": f"Action approved: {approval_key}"}
    except Exception as e:
        logger.error(f"Approval failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
