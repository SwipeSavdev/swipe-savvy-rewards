"""
Admin Portal - Audit Logs Management Routes

Endpoints for viewing audit logs in the admin portal
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/admin", tags=["admin-audit"])

# Demo Audit Logs Data
DEMO_AUDIT_LOGS = [
    {
        "id": "log_1",
        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
        "userId": "admin_user_1",
        "userName": "John Admin",
        "action": "UPDATE_USER",
        "resource": "User: user_123",
        "description": "Updated user status from active to suspended",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
        "changes": {"status": {"from": "active", "to": "suspended"}}
    },
    {
        "id": "log_2",
        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
        "userId": "admin_user_2",
        "userName": "Jane Manager",
        "action": "DELETE_MERCHANT",
        "resource": "Merchant: merchant_456",
        "description": "Deleted merchant account due to policy violation",
        "ipAddress": "192.168.1.101",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "status": "success",
        "changes": {"deleted": True}
    },
    {
        "id": "log_3",
        "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
        "userId": "admin_user_1",
        "userName": "John Admin",
        "action": "CREATE_FEATURE_FLAG",
        "resource": "FeatureFlag: dark_mode_v2",
        "description": "Created new feature flag for dark mode v2",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
        "changes": {"created": True, "enabled": False}
    },
    {
        "id": "log_4",
        "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
        "userId": "admin_user_3",
        "userName": "Bob Analyst",
        "action": "VIEW_DASHBOARD",
        "resource": "Dashboard",
        "description": "Accessed main dashboard",
        "ipAddress": "192.168.1.102",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
        "status": "success",
        "changes": {}
    },
    {
        "id": "log_5",
        "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
        "userId": "admin_user_1",
        "userName": "John Admin",
        "action": "UPDATE_CAMPAIGN",
        "resource": "Campaign: spring_2024",
        "description": "Updated campaign budget from 5000 to 7500",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "status": "success",
        "changes": {"budget": {"from": 5000, "to": 7500}}
    },
    {
        "id": "log_6",
        "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
        "userId": "admin_user_2",
        "userName": "Jane Manager",
        "action": "FAILED_LOGIN",
        "resource": "Authentication",
        "description": "Failed login attempt with incorrect password",
        "ipAddress": "192.168.1.105",
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64)",
        "status": "failed",
        "changes": {}
    },
    {
        "id": "log_7",
        "timestamp": (datetime.now() - timedelta(hours=7)).isoformat(),
        "userId": "admin_user_3",
        "userName": "Bob Analyst",
        "action": "EXPORT_REPORT",
        "resource": "Report: monthly_analytics",
        "description": "Exported monthly analytics report as CSV",
        "ipAddress": "192.168.1.102",
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)",
        "status": "success",
        "changes": {"format": "CSV", "exported": True}
    },
]

class AuditLog(BaseModel):
    id: str
    timestamp: str
    userId: str
    userName: str
    action: str
    resource: str
    description: str
    ipAddress: str
    userAgent: str
    status: str
    changes: Dict[str, Any]

class AuditLogsListResponse(BaseModel):
    logs: List[AuditLog]
    total: int
    page: int
    per_page: int
    total_pages: int

@router.get("/audit-logs")
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    action: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """
    List all audit logs with pagination and filtering
    
    Query params:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10, max: 100)
    - action: Filter by action type
    - status: Filter by status (success, failed)
    - user_id: Filter by user ID
    - search: Search by description or resource
    """
    try:
        # Filter logs
        filtered = DEMO_AUDIT_LOGS.copy()
        
        if action:
            filtered = [l for l in filtered if l['action'].lower() == action.lower()]
        
        if status:
            filtered = [l for l in filtered if l['status'].lower() == status.lower()]
        
        if user_id:
            filtered = [l for l in filtered if l['userId'].lower() == user_id.lower()]
        
        if search:
            search_lower = search.lower()
            filtered = [l for l in filtered if search_lower in l['description'].lower() or search_lower in l['resource'].lower()]
        
        # Sort by timestamp descending (newest first)
        filtered.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Pagination
        total = len(filtered)
        total_pages = (total + per_page - 1) // per_page
        start = (page - 1) * per_page
        end = start + per_page
        paginated = filtered[start:end]
        
        return {
            "logs": paginated,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
    except Exception as e:
        logger.error(f"Error listing audit logs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list audit logs")


@router.get("/audit-logs/{log_id}")
async def get_audit_log(log_id: str) -> Dict[str, Any]:
    """Get a specific audit log by ID"""
    try:
        log = next((l for l in DEMO_AUDIT_LOGS if l['id'] == log_id), None)
        if not log:
            raise HTTPException(status_code=404, detail="Audit log not found")
        
        return {
            "success": True,
            "log": log
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit log: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get audit log")


@router.get("/audit-logs/stats/overview")
async def get_audit_stats() -> Dict[str, Any]:
    """Get audit logs overview statistics"""
    try:
        successful = sum(1 for l in DEMO_AUDIT_LOGS if l['status'] == 'success')
        failed = sum(1 for l in DEMO_AUDIT_LOGS if l['status'] == 'failed')
        
        actions = {}
        for log in DEMO_AUDIT_LOGS:
            action = log['action']
            actions[action] = actions.get(action, 0) + 1
        
        return {
            "total_logs": len(DEMO_AUDIT_LOGS),
            "successful_actions": successful,
            "failed_actions": failed,
            "unique_actions": len(actions),
            "unique_users": len(set(l['userId'] for l in DEMO_AUDIT_LOGS)),
            "most_common_action": max(actions.items(), key=lambda x: x[1])[0] if actions else None
        }
    except Exception as e:
        logger.error(f"Error getting audit stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get audit stats")
