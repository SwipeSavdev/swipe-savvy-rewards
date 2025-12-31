"""
Transaction-related tools for AI agents
Read-only operations for transaction inquiries
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from .database import get_database

def get_transactions(
    user_id: str,
    limit: int = 10,
    account_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get transaction history for a user
    
    Args:
        user_id: User's unique identifier
        limit: Maximum number of transactions to return (default 10, max 100)
        account_id: Optional filter by account
        start_date: Optional start date (ISO format)
        end_date: Optional end date (ISO format)
        category: Optional category filter
    
    Returns:
        Dict with transaction list and metadata
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
        
        # Validate limit
        limit = min(max(1, limit), 100)
        
        # Get transactions
        transactions = db.get_transactions(
            user_id=user_id,
            account_id=account_id,
            start_date=start_date,
            end_date=end_date,
            category=category,
            limit=limit
        )
        
        # Format transactions
        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                "id": txn["id"],
                "date": txn["created_at"],
                "type": txn["transaction_type"],
                "amount": txn["amount"] / 100,  # Convert cents to dollars
                "currency": txn["currency"],
                "status": txn["status"],
                "description": txn["description"],
                "merchant": txn.get("merchant_name"),
                "category": txn.get("category"),
                "account_id": txn["from_account_id"]
            })
        
        # Calculate summary
        total_amount = sum(t["amount"] for t in formatted_transactions)
        pending_count = len([t for t in formatted_transactions if t["status"] == "pending"])
        
        return {
            "success": True,
            "data": {
                "user_id": user_id,
                "transactions": formatted_transactions,
                "count": len(formatted_transactions),
                "summary": {
                    "total_amount": total_amount,
                    "pending_count": pending_count,
                    "completed_count": len(formatted_transactions) - pending_count
                },
                "filters": {
                    "account_id": account_id,
                    "start_date": start_date,
                    "end_date": end_date,
                    "category": category,
                    "limit": limit
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


def get_transaction_details(user_id: str, transaction_id: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific transaction
    
    Args:
        user_id: User's unique identifier
        transaction_id: Transaction ID to retrieve
    
    Returns:
        Dict with detailed transaction information
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
        
        # Get transaction
        transaction = db.get_transaction(transaction_id)
        if not transaction:
            return {
                "success": False,
                "error": {
                    "code": "TRANSACTION_NOT_FOUND",
                    "message": f"Transaction {transaction_id} not found"
                }
            }
        
        # Verify ownership
        if transaction["user_id"] != user_id:
            return {
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Transaction does not belong to user"
                }
            }
        
        # Format detailed response
        return {
            "success": True,
            "data": {
                "id": transaction["id"],
                "user_id": transaction["user_id"],
                "account_id": transaction["from_account_id"],
                "type": transaction["transaction_type"],
                "amount": transaction["amount"] / 100,
                "currency": transaction["currency"],
                "status": transaction["status"],
                "description": transaction["description"],
                "merchant": transaction.get("merchant_name"),
                "category": transaction.get("category"),
                "created_at": transaction["created_at"],
                "processed_at": transaction.get("processed_at"),
                "metadata": {
                    "can_dispute": transaction["status"] == "completed",
                    "is_pending": transaction["status"] == "pending",
                    "is_recent": (datetime.now() - datetime.fromisoformat(transaction["created_at"].replace('Z', '+00:00'))).days < 7
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
