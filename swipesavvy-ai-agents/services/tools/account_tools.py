"""
Account-related tools for AI agents
Read-only operations for account inquiries
"""

from typing import Dict, Any, List
from .database import get_database

def get_account_balance(user_id: str, account_id: str = None) -> Dict[str, Any]:
    """
    Get account balance(s) for a user
    
    Args:
        user_id: User's unique identifier
        account_id: Optional specific account ID (returns all if not provided)
    
    Returns:
        Dict with account balance information
    """
    try:
        db = get_database()
        
        # Verify user exists
        user = db.get_user(user_id)
        if not user:
            return {
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": f"User {user_id} not found"
                }
            }
        
        # Get account(s)
        if account_id:
            account = db.get_account(account_id)
            if not account:
                return {
                    "success": False,
                    "error": {
                        "code": "ACCOUNT_NOT_FOUND",
                        "message": f"Account {account_id} not found"
                    }
                }
            
            # Verify ownership
            if account["user_id"] != user_id:
                return {
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Account does not belong to user"
                    }
                }
            
            accounts = [account]
        else:
            accounts = db.get_accounts_by_user(user_id)
        
        # Format response
        balance_data = []
        for acc in accounts:
            balance_data.append({
                "account_id": acc["id"],
                "account_number": acc["account_number"],
                "account_type": acc["account_type"],
                "account_name": acc.get("account_name"),
                "balance": acc["balance"] / 100,  # Convert cents to dollars
                "available_balance": acc["available_balance"] / 100,
                "currency": acc["currency"],
                "status": acc["status"]
            })
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "accounts": balance_data,
                "total_balance": sum(a["balance"] for a in balance_data)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(e)
            }
        }


def get_account_info(user_id: str) -> Dict[str, Any]:
    """
    Get comprehensive account information for a user
    
    Args:
        user_id: User's unique identifier
    
    Returns:
        Dict with account details, limits, and status
    """
    try:
        db = get_database()
        
        # Get user
        user = db.get_user(user_id)
        if not user:
            return {
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": f"User {user_id} not found"
                }
            }
        
        # Get accounts
        accounts = db.get_accounts_by_user(user_id)
        
        # Get recent activity count
        recent_transactions = db.get_transactions(user_id, limit=100)
        today_count = len([t for t in recent_transactions if t["created_at"].startswith(str(datetime.now().date()))])
        
        from datetime import datetime
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "user_name": f"{user['first_name']} {user['last_name']}",
                "email": user["email"],
                "account_count": len(accounts),
                "accounts": [
                    {
                        "id": a["id"],
                        "type": a["account_type"],
                        "number": a["account_number"],
                        "balance": a["balance"] / 100,
                        "status": a["status"]
                    }
                    for a in accounts
                ],
                "activity": {
                    "transactions_today": today_count,
                    "total_recent": len(recent_transactions)
                }
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(e)
            }
        }
