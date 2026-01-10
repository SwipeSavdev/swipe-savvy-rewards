"""
Action Tools for SwipeSavvy AI Assistant

Defines tools that the AI can use to take actions on behalf of employees.
Each tool has:
- JSON Schema parameters for LLM function calling
- Permission requirements based on role
- Approval requirements for destructive actions
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import uuid4

from app.services.tool_registry import tool_registry, ToolDefinition
from app.config.ai_roles import get_max_transaction_amount

logger = logging.getLogger(__name__)


# ============================================================================
# LOOKUP TOOLS (Read Operations)
# ============================================================================

async def lookup_user_handler(
    email: Optional[str] = None,
    user_id: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Look up user details by email or ID."""
    try:
        # In production, this would query the database
        # For now, return mock data to demonstrate the flow
        if not email and not user_id:
            return {"success": False, "error": "Provide either email or user_id"}

        search_term = email or user_id
        logger.info(f"Looking up user: {search_term}")

        # Mock user data
        return {
            "success": True,
            "user": {
                "id": user_id or f"usr_{uuid4().hex[:8]}",
                "email": email or "user@example.com",
                "name": "John Doe",
                "status": "active",
                "created_at": "2024-01-15T10:30:00Z",
                "account_tier": "premium",
                "total_transactions": 156,
                "total_spent": 4523.50,
            }
        }
    except Exception as e:
        logger.error(f"User lookup failed: {e}")
        return {"success": False, "error": str(e)}


async def lookup_transaction_handler(
    transaction_id: Optional[str] = None,
    user_email: Optional[str] = None,
    limit: int = 10,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Look up transaction details or history."""
    try:
        if transaction_id:
            logger.info(f"Looking up transaction: {transaction_id}")
            # Mock single transaction
            return {
                "success": True,
                "transaction": {
                    "id": transaction_id,
                    "user_id": "usr_abc123",
                    "merchant": "Coffee Shop",
                    "amount": 5.75,
                    "currency": "USD",
                    "status": "completed",
                    "created_at": "2024-12-01T14:30:00Z",
                    "rewards_earned": 0.12,
                    "category": "food_and_drink",
                }
            }
        elif user_email:
            logger.info(f"Looking up transactions for: {user_email}")
            # Mock transaction history
            return {
                "success": True,
                "transactions": [
                    {
                        "id": f"txn_{i}",
                        "amount": 10.00 + i * 5,
                        "merchant": f"Merchant {i}",
                        "status": "completed",
                        "date": f"2024-12-{i:02d}",
                    }
                    for i in range(1, min(limit + 1, 11))
                ],
                "total_count": limit,
            }
        else:
            return {"success": False, "error": "Provide transaction_id or user_email"}
    except Exception as e:
        logger.error(f"Transaction lookup failed: {e}")
        return {"success": False, "error": str(e)}


async def lookup_merchant_handler(
    merchant_id: Optional[str] = None,
    merchant_name: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Look up merchant details."""
    try:
        search = merchant_id or merchant_name
        if not search:
            return {"success": False, "error": "Provide merchant_id or merchant_name"}

        logger.info(f"Looking up merchant: {search}")

        return {
            "success": True,
            "merchant": {
                "id": merchant_id or f"mrc_{uuid4().hex[:8]}",
                "name": merchant_name or "Sample Merchant",
                "status": "active",
                "category": "retail",
                "location": "San Francisco, CA",
                "total_transactions": 5420,
                "total_revenue": 125000.00,
                "rewards_rate": 2.0,
                "joined_at": "2024-03-15",
            }
        }
    except Exception as e:
        logger.error(f"Merchant lookup failed: {e}")
        return {"success": False, "error": str(e)}


# ============================================================================
# SUPPORT TOOLS
# ============================================================================

async def create_support_ticket_handler(
    subject: str,
    customer_email: str,
    priority: str = "medium",
    description: Optional[str] = None,
    category: str = "general",
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a new support ticket."""
    try:
        ticket_id = f"TKT-{uuid4().hex[:8].upper()}"
        created_by = context.get("user_id") if context else "unknown"

        logger.info(f"Creating support ticket {ticket_id} for {customer_email}")

        # In production, this would create a database record
        return {
            "success": True,
            "ticket_id": ticket_id,
            "subject": subject,
            "customer_email": customer_email,
            "priority": priority,
            "category": category,
            "status": "open",
            "created_by": created_by,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Support ticket {ticket_id} created successfully with {priority} priority.",
        }
    except Exception as e:
        logger.error(f"Failed to create ticket: {e}")
        return {"success": False, "error": str(e)}


async def update_support_ticket_handler(
    ticket_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Update an existing support ticket."""
    try:
        logger.info(f"Updating ticket {ticket_id}")

        updates = {}
        if status:
            updates["status"] = status
        if priority:
            updates["priority"] = priority
        if assigned_to:
            updates["assigned_to"] = assigned_to

        return {
            "success": True,
            "ticket_id": ticket_id,
            "updates": updates,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Ticket {ticket_id} updated: {', '.join(f'{k}={v}' for k, v in updates.items())}",
        }
    except Exception as e:
        logger.error(f"Failed to update ticket: {e}")
        return {"success": False, "error": str(e)}


async def add_ticket_note_handler(
    ticket_id: str,
    note: str,
    internal: bool = True,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Add a note to a support ticket."""
    try:
        added_by = context.get("user_id") if context else "unknown"
        logger.info(f"Adding note to ticket {ticket_id}")

        return {
            "success": True,
            "ticket_id": ticket_id,
            "note_id": f"NOTE-{uuid4().hex[:6].upper()}",
            "note": note,
            "internal": internal,
            "added_by": added_by,
            "added_at": datetime.now(timezone.utc).isoformat(),
            "message": f"{'Internal note' if internal else 'Public note'} added to ticket {ticket_id}.",
        }
    except Exception as e:
        logger.error(f"Failed to add note: {e}")
        return {"success": False, "error": str(e)}


# ============================================================================
# FINANCIAL TOOLS
# ============================================================================

async def process_refund_handler(
    transaction_id: str,
    amount: float,
    reason: str,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Process a refund for a transaction with role-based limits."""
    try:
        # Get role limits
        role = context.get("role", "support") if context else "support"
        max_amount = get_max_transaction_amount(role)

        # Check amount limit
        if max_amount is not None and amount > max_amount:
            return {
                "success": False,
                "error": f"Refund amount ${amount:.2f} exceeds your limit of ${max_amount:.2f}. "
                         f"Please escalate to a supervisor or admin for larger refunds.",
                "limit_exceeded": True,
                "max_allowed": max_amount,
            }

        refund_id = f"REF-{uuid4().hex[:8].upper()}"
        logger.info(f"Processing refund {refund_id}: ${amount} for {transaction_id}")

        return {
            "success": True,
            "refund_id": refund_id,
            "transaction_id": transaction_id,
            "amount": amount,
            "reason": reason,
            "status": "processed",
            "processed_by": context.get("user_id") if context else "unknown",
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Refund of ${amount:.2f} processed successfully. Refund ID: {refund_id}",
        }
    except Exception as e:
        logger.error(f"Refund processing failed: {e}")
        return {"success": False, "error": str(e)}


# ============================================================================
# ANALYTICS TOOLS
# ============================================================================

async def get_analytics_handler(
    metric: str = "overview",
    time_range: str = "7d",
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Get analytics data."""
    try:
        logger.info(f"Fetching analytics: {metric} for {time_range}")

        # Mock analytics data
        return {
            "success": True,
            "metric": metric,
            "time_range": time_range,
            "data": {
                "total_transactions": 15420,
                "total_revenue": 485000.00,
                "active_users": 8500,
                "new_users": 340,
                "avg_transaction": 31.45,
                "rewards_distributed": 12500.00,
                "trending": "up",
                "change_percent": 12.5,
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Analytics fetch failed: {e}")
        return {"success": False, "error": str(e)}


async def get_merchant_analytics_handler(
    merchant_id: Optional[str] = None,
    time_range: str = "30d",
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Get merchant-specific analytics."""
    try:
        logger.info(f"Fetching merchant analytics: {merchant_id or 'all'}")

        return {
            "success": True,
            "merchant_id": merchant_id,
            "time_range": time_range,
            "data": {
                "total_transactions": 2450,
                "total_revenue": 78500.00,
                "avg_transaction": 32.04,
                "customer_count": 1200,
                "repeat_rate": 45.2,
                "top_category": "food_and_drink",
            },
        }
    except Exception as e:
        logger.error(f"Merchant analytics failed: {e}")
        return {"success": False, "error": str(e)}


# ============================================================================
# FEATURE FLAG TOOLS
# ============================================================================

async def toggle_feature_flag_handler(
    flag_key: str,
    enabled: bool,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Toggle a feature flag on or off."""
    try:
        logger.info(f"Toggling feature flag {flag_key} to {enabled}")

        return {
            "success": True,
            "flag_key": flag_key,
            "enabled": enabled,
            "previous_state": not enabled,  # Mock previous state
            "toggled_by": context.get("user_id") if context else "unknown",
            "toggled_at": datetime.now(timezone.utc).isoformat(),
            "message": f"Feature flag '{flag_key}' is now {'ENABLED' if enabled else 'DISABLED'}.",
        }
    except Exception as e:
        logger.error(f"Feature flag toggle failed: {e}")
        return {"success": False, "error": str(e)}


# ============================================================================
# TOOL REGISTRATION
# ============================================================================

def register_all_tools() -> None:
    """Register all tools with the tool registry."""

    # Lookup User
    tool_registry.register(ToolDefinition(
        name="lookup_user",
        description="Look up user/customer details by email address or user ID. Returns account information, status, and transaction summary.",
        parameters={
            "type": "object",
            "properties": {
                "email": {
                    "type": "string",
                    "description": "User's email address to search for"
                },
                "user_id": {
                    "type": "string",
                    "description": "User's unique ID"
                },
            },
            "required": [],
        },
        handler=lookup_user_handler,
        required_permissions=["users:read"],
        category="lookup",
    ))

    # Lookup Transaction
    tool_registry.register(ToolDefinition(
        name="lookup_transaction",
        description="Look up transaction details by ID, or get transaction history for a user by email.",
        parameters={
            "type": "object",
            "properties": {
                "transaction_id": {
                    "type": "string",
                    "description": "Transaction ID to look up"
                },
                "user_email": {
                    "type": "string",
                    "description": "User email to get transaction history"
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of transactions to return (default: 10)",
                    "default": 10,
                },
            },
            "required": [],
        },
        handler=lookup_transaction_handler,
        required_permissions=["transactions:read"],
        category="lookup",
    ))

    # Lookup Merchant
    tool_registry.register(ToolDefinition(
        name="lookup_merchant",
        description="Look up merchant details by ID or name.",
        parameters={
            "type": "object",
            "properties": {
                "merchant_id": {
                    "type": "string",
                    "description": "Merchant ID"
                },
                "merchant_name": {
                    "type": "string",
                    "description": "Merchant name to search"
                },
            },
            "required": [],
        },
        handler=lookup_merchant_handler,
        required_permissions=["merchants:read"],
        category="lookup",
    ))

    # Create Support Ticket
    tool_registry.register(ToolDefinition(
        name="create_support_ticket",
        description="Create a new support ticket for a customer issue.",
        parameters={
            "type": "object",
            "properties": {
                "subject": {
                    "type": "string",
                    "description": "Ticket subject/title"
                },
                "customer_email": {
                    "type": "string",
                    "description": "Customer's email address"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"],
                    "description": "Ticket priority level"
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of the issue"
                },
                "category": {
                    "type": "string",
                    "enum": ["billing", "technical", "account", "transaction", "rewards", "general"],
                    "description": "Issue category"
                },
            },
            "required": ["subject", "customer_email"],
        },
        handler=create_support_ticket_handler,
        required_permissions=["support:write"],
        category="support",
    ))

    # Update Support Ticket
    tool_registry.register(ToolDefinition(
        name="update_support_ticket",
        description="Update an existing support ticket's status, priority, or assignment.",
        parameters={
            "type": "object",
            "properties": {
                "ticket_id": {
                    "type": "string",
                    "description": "The ticket ID to update"
                },
                "status": {
                    "type": "string",
                    "enum": ["open", "in_progress", "waiting", "resolved", "closed"],
                    "description": "New status"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "critical"],
                    "description": "New priority"
                },
                "assigned_to": {
                    "type": "string",
                    "description": "User ID to assign ticket to"
                },
            },
            "required": ["ticket_id"],
        },
        handler=update_support_ticket_handler,
        required_permissions=["support:write"],
        category="support",
    ))

    # Add Ticket Note
    tool_registry.register(ToolDefinition(
        name="add_ticket_note",
        description="Add a note to an existing support ticket.",
        parameters={
            "type": "object",
            "properties": {
                "ticket_id": {
                    "type": "string",
                    "description": "The ticket ID"
                },
                "note": {
                    "type": "string",
                    "description": "Note content to add"
                },
                "internal": {
                    "type": "boolean",
                    "description": "True for internal notes (not visible to customer)",
                    "default": True,
                },
            },
            "required": ["ticket_id", "note"],
        },
        handler=add_ticket_note_handler,
        required_permissions=["support:write"],
        category="support",
    ))

    # Process Refund
    tool_registry.register(ToolDefinition(
        name="process_refund",
        description="Process a refund for a transaction. Amount limits apply based on your role.",
        parameters={
            "type": "object",
            "properties": {
                "transaction_id": {
                    "type": "string",
                    "description": "The transaction ID to refund"
                },
                "amount": {
                    "type": "number",
                    "description": "Refund amount in dollars"
                },
                "reason": {
                    "type": "string",
                    "description": "Reason for the refund"
                },
            },
            "required": ["transaction_id", "amount", "reason"],
        },
        handler=process_refund_handler,
        required_permissions=["transactions:refund"],
        requires_approval=True,
        is_destructive=True,
        category="financial",
    ))

    # Get Analytics
    tool_registry.register(ToolDefinition(
        name="get_analytics",
        description="Get analytics and metrics data.",
        parameters={
            "type": "object",
            "properties": {
                "metric": {
                    "type": "string",
                    "enum": ["overview", "transactions", "users", "revenue", "rewards"],
                    "description": "Type of metrics to retrieve"
                },
                "time_range": {
                    "type": "string",
                    "enum": ["24h", "7d", "30d", "90d", "1y"],
                    "description": "Time range for the data"
                },
            },
            "required": [],
        },
        handler=get_analytics_handler,
        required_permissions=["analytics:read"],
        category="analytics",
    ))

    # Get Merchant Analytics
    tool_registry.register(ToolDefinition(
        name="get_merchant_analytics",
        description="Get analytics for a specific merchant or all merchants.",
        parameters={
            "type": "object",
            "properties": {
                "merchant_id": {
                    "type": "string",
                    "description": "Merchant ID (optional, omit for all merchants)"
                },
                "time_range": {
                    "type": "string",
                    "enum": ["7d", "30d", "90d", "1y"],
                    "description": "Time range"
                },
            },
            "required": [],
        },
        handler=get_merchant_analytics_handler,
        required_permissions=["analytics:read", "merchants:read"],
        category="analytics",
    ))

    # Toggle Feature Flag
    tool_registry.register(ToolDefinition(
        name="toggle_feature_flag",
        description="Enable or disable a feature flag.",
        parameters={
            "type": "object",
            "properties": {
                "flag_key": {
                    "type": "string",
                    "description": "The feature flag key/identifier"
                },
                "enabled": {
                    "type": "boolean",
                    "description": "True to enable, False to disable"
                },
            },
            "required": ["flag_key", "enabled"],
        },
        handler=toggle_feature_flag_handler,
        required_permissions=["feature_flags:write"],
        requires_approval=True,
        category="admin",
    ))

    logger.info(f"Registered {len(tool_registry.list_tools())} tools with the registry")
