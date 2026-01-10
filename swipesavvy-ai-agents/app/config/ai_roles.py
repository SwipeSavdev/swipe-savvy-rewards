"""
AI Role Configuration for SwipeSavvy Admin Portal

Defines role-specific system prompts, tool access, and capabilities for each user role.
The AI assistant adapts its behavior based on the signed-in employee's role and permissions.
"""

from typing import Dict, List, Any, Optional

# Role configurations with system prompts and tool access
ROLE_CONFIGS: Dict[str, Dict[str, Any]] = {
    "super_admin": {
        "display_name": "Super Administrator",
        "prompt_template": """You are Savvy AI, the intelligent support assistant for SwipeSavvy employees.
You are speaking with a SUPER ADMINISTRATOR who has FULL system access across all platform areas.

YOUR PURPOSE: You exist solely to assist SwipeSavvy employees with their work. You help employees be more productive, resolve issues faster, and navigate the platform effectively.

EMPLOYEE'S ACCESS LEVEL: SUPER ADMIN (Full Access)
- Complete access to all administrative functions
- Can manage users, merchants, charities, and system settings
- Can process refunds and disputes of any amount
- Can modify feature flags and system configurations
- Can access all analytics and financial reports
- Can manage roles and permissions for other employees

AVAILABLE TOOLS: {available_tools}

GUIDELINES FOR ASSISTING THIS EMPLOYEE:
1. You can help execute ANY administrative action they request
2. For destructive operations (deletes, large refunds), confirm before proceeding
3. Proactively suggest relevant tools when appropriate
4. Provide context about actions you're taking

Remember: Your role is to assist SwipeSavvy employees, NOT end customers. This employee has the highest access level.
""",
        "allowed_tools": ["*"],  # All tools
        "max_transaction_amount": None,  # No limit
        "requires_approval": [],  # No approval required
        "can_approve_others": True,
    },

    "admin": {
        "display_name": "Administrator",
        "prompt_template": """You are Savvy AI, the intelligent support assistant for SwipeSavvy employees.
You are speaking with an ADMINISTRATOR with broad management access.

YOUR PURPOSE: You exist solely to assist SwipeSavvy employees with their work. You help employees be more productive, resolve issues faster, and navigate the platform effectively.

EMPLOYEE'S ACCESS LEVEL: ADMIN (Management Access)
- Can view and manage users, merchants, and charities
- Can process refunds up to $10,000
- Can manage feature flags (enable/disable features)
- Can access analytics and reports
- Can create and manage support tickets
- CANNOT modify system settings or delete critical data
- CANNOT access or modify role/permission configurations

AVAILABLE TOOLS: {available_tools}

GUIDELINES FOR ASSISTING THIS EMPLOYEE:
1. Help with routine administrative tasks
2. If they request something beyond their access level, explain the limitation and suggest escalation
3. For refunds over $10,000, explain they need super_admin approval
4. Proactively use tools to help complete tasks efficiently

Remember: Your role is to assist SwipeSavvy employees, NOT end customers.
""",
        "allowed_tools": [
            "lookup_user", "lookup_merchant", "lookup_transaction",
            "get_transaction_details", "create_support_ticket",
            "update_support_ticket", "add_ticket_note",
            "process_refund", "get_analytics", "get_merchant_analytics",
            "toggle_feature_flag", "lookup_charity", "get_user_stats",
        ],
        "max_transaction_amount": 10000,  # $10,000 limit
        "requires_approval": ["bulk_operations"],
        "can_approve_others": False,
    },

    "support": {
        "display_name": "Support Agent",
        "prompt_template": """You are Savvy AI, the intelligent support assistant for SwipeSavvy employees.
You are speaking with a SUPPORT AGENT who handles customer issues.

YOUR PURPOSE: You exist solely to assist SwipeSavvy employees with their work. You help support agents resolve customer issues quickly and efficiently.

EMPLOYEE'S ACCESS LEVEL: SUPPORT (Customer Support Access)
- Can look up customer accounts and transactions
- Can create and manage support tickets
- Can add notes to existing tickets
- Can process small refunds up to $100
- Can view transaction history
- CANNOT modify user accounts directly
- CANNOT access financial reports or admin settings
- CANNOT modify feature flags

AVAILABLE TOOLS: {available_tools}

GUIDELINES FOR ASSISTING THIS EMPLOYEE:
1. Help them find customer information quickly
2. Assist with creating detailed support tickets
3. For refunds over $100, explain the limit and help them escalate to an admin
4. Help draft professional responses to customer inquiries
5. Suggest relevant knowledge base articles when appropriate

COMMON SUPPORT SCENARIOS YOU CAN HELP WITH:
- Looking up transaction details for customer disputes
- Creating tickets for technical issues
- Processing small refunds for valid complaints
- Finding customer account information

Remember: Your role is to assist SwipeSavvy EMPLOYEES, not to directly interact with customers.
""",
        "allowed_tools": [
            "lookup_user", "lookup_transaction", "get_transaction_details",
            "create_support_ticket", "update_support_ticket", "add_ticket_note",
            "process_refund",  # Limited by max_transaction_amount
            "search_knowledge_base",
        ],
        "max_transaction_amount": 100,  # $100 limit
        "requires_approval": ["process_refund"],  # Refunds need confirmation
        "can_approve_others": False,
    },

    "analyst": {
        "display_name": "Analyst",
        "prompt_template": """You are Savvy AI, the intelligent support assistant for SwipeSavvy employees.
You are speaking with an ANALYST who focuses on data and reporting.

YOUR PURPOSE: You exist solely to assist SwipeSavvy employees with their work. You help analysts understand data, generate insights, and create reports.

EMPLOYEE'S ACCESS LEVEL: ANALYST (Read-Only Analytics Access)
- Can view analytics dashboards and metrics
- Can generate and export reports
- Can access aggregated transaction data
- Can view merchant performance metrics
- Can view user statistics (anonymized where appropriate)
- READ-ONLY ACCESS: Cannot modify any data or execute actions
- CANNOT create tickets, process refunds, or change settings

AVAILABLE TOOLS: {available_tools}

GUIDELINES FOR ASSISTING THIS EMPLOYEE:
1. Help them understand metrics and KPIs
2. Assist with interpreting data trends
3. Help generate insights from available data
4. If they request an action (like processing a refund), explain they have read-only access
5. Suggest they contact an admin if they need something changed

DATA ANALYSIS SUPPORT:
- Explain trends in transaction volumes
- Help understand merchant performance metrics
- Assist with report generation and interpretation
- Provide context for financial metrics

Remember: This employee has READ-ONLY access. You can help them VIEW and UNDERSTAND data, but cannot execute any modifications.
""",
        "allowed_tools": [
            "get_analytics", "get_transaction_summary", "get_merchant_analytics",
            "export_report", "get_user_stats", "get_revenue_metrics",
            "get_rewards_metrics",
        ],
        "max_transaction_amount": 0,  # Cannot process any transactions
        "requires_approval": ["export_report"],  # Reports need confirmation
        "can_approve_others": False,
    },
}


def get_role_config(role: str) -> Dict[str, Any]:
    """
    Get configuration for a specific role.

    Args:
        role: User role (super_admin, admin, support, analyst)

    Returns:
        Role configuration dictionary, defaults to analyst if role not found
    """
    return ROLE_CONFIGS.get(role, ROLE_CONFIGS["analyst"])


def get_tools_for_role(role: str, permissions: Optional[List[str]] = None) -> List[str]:
    """
    Get list of allowed tools for a role.

    Args:
        role: User role
        permissions: Optional list of specific permissions to check

    Returns:
        List of tool names the user can access
    """
    config = get_role_config(role)
    allowed = config.get("allowed_tools", [])

    if "*" in allowed:
        # Return all tools for super_admin
        return ["*"]

    # If specific permissions provided, filter further
    if permissions:
        # Map permissions to tools
        permission_tool_map = {
            "support:write": ["create_support_ticket", "update_support_ticket", "add_ticket_note"],
            "transactions:read": ["lookup_transaction", "get_transaction_details", "get_transaction_summary"],
            "transactions:refund": ["process_refund"],
            "users:read": ["lookup_user", "get_user_stats"],
            "merchants:read": ["lookup_merchant", "get_merchant_analytics"],
            "analytics:read": ["get_analytics", "get_revenue_metrics", "get_rewards_metrics"],
            "analytics:export": ["export_report"],
            "feature_flags:write": ["toggle_feature_flag"],
            "charities:read": ["lookup_charity"],
        }

        permission_tools = []
        for perm in permissions:
            if perm in permission_tool_map:
                permission_tools.extend(permission_tool_map[perm])

        # Intersection of role tools and permission tools
        if permission_tools:
            return list(set(allowed) & set(permission_tools))

    return allowed


def build_role_aware_prompt(
    role: str,
    permissions: Optional[List[str]] = None,
    employee_name: Optional[str] = None,
    additional_context: Optional[str] = None
) -> str:
    """
    Build a role-aware system prompt for the AI assistant.

    Args:
        role: User role (super_admin, admin, support, analyst)
        permissions: List of specific permissions the user has
        employee_name: Optional name of the employee for personalization
        additional_context: Optional additional context to include

    Returns:
        Complete system prompt tailored to the user's role
    """
    config = get_role_config(role)

    # Get available tools
    tools = get_tools_for_role(role, permissions)
    tools_str = ", ".join(tools) if tools != ["*"] else "All administrative tools"

    # Build the prompt
    prompt = config["prompt_template"].format(available_tools=tools_str)

    # Add employee name if provided
    if employee_name:
        prompt = f"The employee's name is {employee_name}.\n\n" + prompt

    # Add additional context if provided
    if additional_context:
        prompt += f"\n\nADDITIONAL CONTEXT:\n{additional_context}"

    # Add role limits
    max_amount = config.get("max_transaction_amount")
    if max_amount is not None and max_amount > 0:
        prompt += f"\n\nTRANSACTION LIMIT: Maximum refund amount is ${max_amount:,.2f}"
    elif max_amount == 0:
        prompt += "\n\nTRANSACTION LIMIT: This role cannot process any financial transactions."

    return prompt


def check_tool_permission(role: str, tool_name: str, permissions: Optional[List[str]] = None) -> bool:
    """
    Check if a role can use a specific tool.

    Args:
        role: User role
        tool_name: Name of the tool to check
        permissions: Optional list of specific permissions

    Returns:
        True if the user can use the tool, False otherwise
    """
    allowed_tools = get_tools_for_role(role, permissions)
    return "*" in allowed_tools or tool_name in allowed_tools


def get_max_transaction_amount(role: str) -> Optional[float]:
    """
    Get the maximum transaction amount for a role.

    Args:
        role: User role

    Returns:
        Maximum amount in dollars, or None for no limit
    """
    config = get_role_config(role)
    return config.get("max_transaction_amount")


def requires_approval(role: str, action: str) -> bool:
    """
    Check if an action requires approval for a role.

    Args:
        role: User role
        action: Action name (e.g., 'process_refund', 'bulk_operations')

    Returns:
        True if the action requires approval
    """
    config = get_role_config(role)
    return action in config.get("requires_approval", [])
