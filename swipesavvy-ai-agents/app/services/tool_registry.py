"""
Tool Registry for Agentic AI

Manages tool definitions and execution for the SwipeSavvy AI assistant.
Tools are registered with their schemas, handlers, and permission requirements.
The registry filters available tools based on user role and permissions.
"""

import json
import logging
from dataclasses import dataclass, field
from typing import Dict, Any, Callable, List, Optional, Awaitable, Union

from app.config.ai_roles import get_role_config, check_tool_permission

logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    """Definition of an AI tool with its schema, handler, and access requirements."""

    name: str
    description: str
    parameters: Dict[str, Any]  # JSON Schema for parameters
    handler: Callable[..., Awaitable[Dict[str, Any]]]
    required_permissions: List[str] = field(default_factory=list)
    requires_approval: bool = False
    is_destructive: bool = False
    category: str = "general"


class ToolRegistry:
    """
    Registry for managing AI tools and their execution.

    Tools are registered with metadata about permissions and approval requirements.
    The registry provides OpenAI-compatible tool definitions for LLM function calling.
    """

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._pending_approvals: Dict[str, Dict[str, Any]] = {}

    def register(self, tool: ToolDefinition) -> None:
        """
        Register a tool in the registry.

        Args:
            tool: ToolDefinition to register
        """
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name} (category: {tool.category})")

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """Get a tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> List[str]:
        """List all registered tool names."""
        return list(self._tools.keys())

    def get_tools_for_role(
        self,
        role: str,
        permissions: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Get OpenAI-compatible tool definitions for a user's role.

        Args:
            role: User role (super_admin, admin, support, analyst)
            permissions: Optional list of specific permissions

        Returns:
            List of tool definitions in OpenAI function calling format
        """
        config = get_role_config(role)
        allowed = config.get("allowed_tools", [])

        tools = []
        for name, tool in self._tools.items():
            # Check if tool is allowed for this role
            if "*" not in allowed and name not in allowed:
                continue

            # Check specific permissions if provided
            if permissions and tool.required_permissions:
                has_permission = any(
                    perm in permissions for perm in tool.required_permissions
                )
                if not has_permission:
                    continue

            # Build OpenAI-compatible tool definition
            tools.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.parameters,
                }
            })

        logger.debug(f"Role {role} has access to {len(tools)} tools")
        return tools

    def get_tool_names_for_role(
        self,
        role: str,
        permissions: Optional[List[str]] = None
    ) -> List[str]:
        """Get just the names of tools available to a role."""
        tools = self.get_tools_for_role(role, permissions)
        return [t["function"]["name"] for t in tools]

    async def execute(
        self,
        tool_name: str,
        args: Dict[str, Any],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a tool with the given arguments.

        Args:
            tool_name: Name of the tool to execute
            args: Arguments for the tool
            context: Execution context (user_id, role, permissions, etc.)

        Returns:
            Tool execution result
        """
        tool = self._tools.get(tool_name)
        if not tool:
            logger.error(f"Unknown tool requested: {tool_name}")
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

        # Check role permission
        role = context.get("role", "analyst")
        permissions = context.get("permissions", [])

        if not check_tool_permission(role, tool_name, permissions):
            logger.warning(f"Permission denied for {role} to use {tool_name}")
            return {
                "success": False,
                "error": f"Permission denied: Your role ({role}) cannot use {tool_name}"
            }

        # Check if approval is required and pending
        if tool.requires_approval:
            approval_key = f"{context.get('user_id')}_{tool_name}"
            if approval_key not in self._pending_approvals:
                # Request approval
                return {
                    "success": False,
                    "requires_approval": True,
                    "approval_key": approval_key,
                    "tool": tool_name,
                    "args": args,
                    "message": f"Action '{tool_name}' requires approval. Please confirm to proceed."
                }

        try:
            # Execute the tool handler
            logger.info(f"Executing tool {tool_name} for user {context.get('user_id')}")
            result = await tool.handler(**args, context=context)

            # Log the action for audit
            logger.info(f"Tool {tool_name} executed successfully: {json.dumps(result)[:200]}")

            return result

        except Exception as e:
            logger.error(f"Tool {tool_name} execution failed: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

    def approve_action(self, approval_key: str) -> bool:
        """
        Approve a pending action.

        Args:
            approval_key: The approval key returned from execute

        Returns:
            True if approval was recorded
        """
        self._pending_approvals[approval_key] = {"approved": True}
        logger.info(f"Action approved: {approval_key}")
        return True

    def clear_approval(self, approval_key: str) -> None:
        """Clear a pending approval after execution."""
        self._pending_approvals.pop(approval_key, None)

    def get_tool_info(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a tool."""
        tool = self._tools.get(tool_name)
        if not tool:
            return None

        return {
            "name": tool.name,
            "description": tool.description,
            "category": tool.category,
            "requires_approval": tool.requires_approval,
            "is_destructive": tool.is_destructive,
            "required_permissions": tool.required_permissions,
            "parameters": tool.parameters,
        }


# Global tool registry instance
tool_registry = ToolRegistry()


def register_tool(
    name: str,
    description: str,
    parameters: Dict[str, Any],
    required_permissions: Optional[List[str]] = None,
    requires_approval: bool = False,
    is_destructive: bool = False,
    category: str = "general"
) -> Callable:
    """
    Decorator for registering a function as an AI tool.

    Usage:
        @register_tool(
            name="lookup_user",
            description="Look up user details by email or ID",
            parameters={...},
            required_permissions=["users:read"]
        )
        async def lookup_user_handler(email: str, context: dict) -> dict:
            ...
    """
    def decorator(func: Callable[..., Awaitable[Dict[str, Any]]]) -> Callable:
        tool = ToolDefinition(
            name=name,
            description=description,
            parameters=parameters,
            handler=func,
            required_permissions=required_permissions or [],
            requires_approval=requires_approval,
            is_destructive=is_destructive,
            category=category,
        )
        tool_registry.register(tool)
        return func

    return decorator
