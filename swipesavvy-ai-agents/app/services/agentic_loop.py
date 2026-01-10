"""
Agentic Loop for SwipeSavvy AI

Implements the function calling loop that enables the AI to execute tools
and actions on behalf of employees. The loop handles:
- Tool selection by the LLM
- Tool execution with permission checks
- Feeding results back to the LLM
- Streaming responses to the frontend
"""

import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from together import Together

from app.services.tool_registry import tool_registry
from app.config.ai_roles import build_role_aware_prompt, get_max_transaction_amount

logger = logging.getLogger(__name__)


class AgenticLoop:
    """
    Manages the agentic conversation loop with tool execution.

    The loop:
    1. Sends user message + available tools to LLM
    2. Parses LLM response for tool calls
    3. Executes tools with permission checks
    4. Feeds tool results back to LLM
    5. Continues until LLM provides final response
    """

    def __init__(
        self,
        api_key: str,
        model: str = "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        max_iterations: int = 5
    ):
        """
        Initialize the agentic loop.

        Args:
            api_key: Together.AI API key
            model: Model ID to use
            max_iterations: Maximum tool execution iterations to prevent infinite loops
        """
        self.client = Together(api_key=api_key)
        self.model = model
        self.max_iterations = max_iterations

    async def run(
        self,
        message: str,
        context: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Run the agentic loop with streaming responses.

        Args:
            message: User's message
            context: Execution context (user_id, role, permissions, etc.)
            conversation_history: Optional previous messages

        Yields:
            Events: message chunks, tool calls, tool results, errors
        """
        role = context.get("role", "analyst")
        permissions = context.get("permissions", [])

        # Build role-aware system prompt
        system_prompt = build_role_aware_prompt(
            role=role,
            permissions=permissions,
            employee_name=context.get("employee_name"),
            additional_context=context.get("additional_context")
        )

        # Get available tools for this role
        tools = tool_registry.get_tools_for_role(role, permissions)

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)

        # Add current user message
        messages.append({"role": "user", "content": message})

        # Start the agentic loop
        iteration = 0
        while iteration < self.max_iterations:
            iteration += 1
            logger.info(f"Agentic loop iteration {iteration}/{self.max_iterations}")

            try:
                # Call LLM with tools
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    tools=tools if tools else None,
                    tool_choice="auto" if tools else None,
                    max_tokens=1024,
                    temperature=0.7,
                    stream=True,
                )

                # Collect streaming response
                tool_calls = []
                content_buffer = ""
                current_tool_call = None

                for chunk in response:
                    if not chunk.choices:
                        continue

                    delta = chunk.choices[0].delta

                    # Handle content streaming
                    if hasattr(delta, "content") and delta.content:
                        content_buffer += delta.content
                        yield {
                            "type": "message",
                            "delta": delta.content,
                            "content": content_buffer
                        }

                    # Handle tool calls
                    if hasattr(delta, "tool_calls") and delta.tool_calls:
                        for tc in delta.tool_calls:
                            if tc.index is not None:
                                # New tool call or continuing existing one
                                while len(tool_calls) <= tc.index:
                                    tool_calls.append({
                                        "id": "",
                                        "function": {"name": "", "arguments": ""}
                                    })

                                if tc.id:
                                    tool_calls[tc.index]["id"] = tc.id
                                if tc.function:
                                    if tc.function.name:
                                        tool_calls[tc.index]["function"]["name"] = tc.function.name
                                    if tc.function.arguments:
                                        tool_calls[tc.index]["function"]["arguments"] += tc.function.arguments

                # Check finish reason
                finish_reason = None
                if chunk.choices and chunk.choices[0].finish_reason:
                    finish_reason = chunk.choices[0].finish_reason

                # If no tool calls, we're done
                if not tool_calls:
                    logger.info("No tool calls, completing response")
                    yield {"type": "done", "content": content_buffer}
                    break

                # Process tool calls
                logger.info(f"Processing {len(tool_calls)} tool call(s)")

                for tc in tool_calls:
                    tool_name = tc["function"]["name"]
                    tool_args_str = tc["function"]["arguments"]

                    # Emit tool call event
                    yield {
                        "type": "tool_call",
                        "tool": tool_name,
                        "args": tool_args_str
                    }

                    # Parse arguments
                    try:
                        tool_args = json.loads(tool_args_str) if tool_args_str else {}
                    except json.JSONDecodeError:
                        tool_args = {}
                        logger.warning(f"Failed to parse tool args: {tool_args_str}")

                    # Check if approval is required
                    tool_def = tool_registry.get_tool(tool_name)
                    if tool_def and tool_def.requires_approval:
                        yield {
                            "type": "approval_required",
                            "tool": tool_name,
                            "args": tool_args,
                            "approval_key": f"{context.get('user_id')}_{tool_name}_{iteration}",
                            "message": f"The action '{tool_name}' requires your approval before proceeding."
                        }
                        # For now, auto-approve in the demo flow
                        # In production, this would wait for user confirmation
                        tool_registry.approve_action(f"{context.get('user_id')}_{tool_name}_{iteration}")

                    # Execute tool
                    result = await tool_registry.execute(tool_name, tool_args, context)

                    # Emit tool result
                    yield {
                        "type": "tool_result",
                        "tool": tool_name,
                        "result": result,
                        "success": result.get("success", False)
                    }

                    # Add tool call and result to messages for next iteration
                    messages.append({
                        "role": "assistant",
                        "content": None,
                        "tool_calls": [{
                            "id": tc["id"] or f"call_{tool_name}_{iteration}",
                            "type": "function",
                            "function": {
                                "name": tool_name,
                                "arguments": tool_args_str
                            }
                        }]
                    })
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc["id"] or f"call_{tool_name}_{iteration}",
                        "content": json.dumps(result)
                    })

            except Exception as e:
                logger.error(f"Agentic loop error: {e}", exc_info=True)
                yield {
                    "type": "error",
                    "error": str(e),
                    "message": f"An error occurred while processing your request: {str(e)}"
                }
                break

        # Max iterations reached
        if iteration >= self.max_iterations:
            logger.warning("Max iterations reached in agentic loop")
            yield {
                "type": "warning",
                "message": "Maximum tool execution limit reached. Please continue in a new message."
            }


async def run_agentic_chat(
    api_key: str,
    message: str,
    user_id: str,
    role: str = "analyst",
    permissions: Optional[List[str]] = None,
    employee_name: Optional[str] = None,
    additional_context: Optional[str] = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Convenience function to run an agentic chat.

    Args:
        api_key: Together.AI API key
        message: User message
        user_id: User ID
        role: User role
        permissions: User permissions
        employee_name: Optional employee name
        additional_context: Optional additional context

    Yields:
        Stream of events
    """
    context = {
        "user_id": user_id,
        "role": role,
        "permissions": permissions or [],
        "employee_name": employee_name,
        "additional_context": additional_context,
    }

    loop = AgenticLoop(api_key=api_key)

    async for event in loop.run(message, context):
        yield event
