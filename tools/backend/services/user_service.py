"""
User Management API Service
Handles user profile, accounts, transactions, and rewards data
File: /tools/backend/services/user_service.py
Created: December 28, 2025
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any
import sys
from pathlib import Path

# Import get_db from main module
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Temporary placeholder for get_db until main is properly imported
def get_db():
    """Temporary placeholder get_db function"""
    pass

# ============================================================================
# USER SERVICE
# ============================================================================

class UserService:
    """Service for managing user data and profiles"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile information"""
        try:
            # TODO: Query users table
            # For now, return mock response
            return {
                "user_id": user_id,
                "email": f"user{user_id}@example.com",
                "name": f"User {user_id}",
                "created_at": datetime.utcnow().isoformat(),
                "account_status": "active",
                "total_transactions": 45,
                "lifetime_value": 2350.75
            }
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")
    
    def get_user_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's linked accounts (bank accounts, cards, wallets)"""
        try:
            # TODO: Query accounts/cards/linked_banks tables
            # For now, return mock response
            return [
                {
                    "account_id": "acc-001",
                    "type": "card",
                    "card_type": "credit",
                    "issuer": "Visa",
                    "last_four": "4242",
                    "is_default": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "account_id": "acc-002",
                    "type": "bank",
                    "bank_name": "Chase",
                    "account_type": "checking",
                    "last_four": "1234",
                    "is_verified": True,
                    "created_at": datetime.utcnow().isoformat()
                }
            ]
        except Exception as e:
            raise Exception(f"Failed to get user accounts: {str(e)}")
    
    def get_user_transactions(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get user's recent transactions"""
        try:
            # TODO: Query transactions table
            # For now, return mock response
            return {
                "transactions": [
                    {
                        "transaction_id": "txn-001",
                        "merchant": "Starbucks Downtown",
                        "amount": 5.75,
                        "category": "Restaurants & Cafes",
                        "timestamp": datetime.utcnow().isoformat(),
                        "status": "completed"
                    },
                    {
                        "transaction_id": "txn-002",
                        "merchant": "Whole Foods",
                        "amount": 87.50,
                        "category": "Grocery & Food",
                        "timestamp": datetime.utcnow().isoformat(),
                        "status": "completed"
                    }
                ],
                "total": 45,
                "limit": limit,
                "offset": offset
            }
        except Exception as e:
            raise Exception(f"Failed to get user transactions: {str(e)}")
    
    def get_user_rewards(self, user_id: str) -> Dict[str, Any]:
        """Get user's rewards and loyalty information"""
        try:
            # TODO: Query rewards/loyalty tables
            # For now, return mock response
            return {
                "user_id": user_id,
                "points_balance": 12450,
                "tier": "gold",
                "next_tier_points_needed": 5000,
                "boosts": [
                    {
                        "id": "boost-fuel",
                        "name": "2× Points on Fuel",
                        "multiplier": 2.0,
                        "category": "Gas Stations",
                        "expires_at": datetime.utcnow().isoformat()
                    }
                ],
                "recent_transactions": [
                    {
                        "merchant": "Shell Gas Station",
                        "points_earned": 50,
                        "timestamp": datetime.utcnow().isoformat()
                    }
                ]
            }
        except Exception as e:
            raise Exception(f"Failed to get user rewards: {str(e)}")
    
    def get_user_spending_analytics(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get user's spending analytics and trends"""
        try:
            # TODO: Query transactions and analytics tables
            # For now, return mock response
            return {
                "user_id": user_id,
                "period_days": days,
                "total_spent": 2345.67,
                "transaction_count": 45,
                "average_transaction": 52.13,
                "spending_by_category": {
                    "Restaurants & Cafes": 650.25,
                    "Grocery & Food": 850.00,
                    "Retail & Shopping": 450.00,
                    "Gas Stations": 395.42
                },
                "daily_average": 78.19,
                "trend": "up"  # up, down, stable
            }
        except Exception as e:
            raise Exception(f"Failed to get spending analytics: {str(e)}")

# ============================================================================
# FASTAPI ROUTER
# ============================================================================

router = APIRouter(prefix="/api/users", tags=["users"])

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    """Dependency injection for user service"""
    return UserService(db)

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Get user profile information
    
    Path Parameters:
    - user_id: User identifier (UUID or string)
    
    Response:
    {
      "user_id": "user-12345",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z",
      "account_status": "active",
      "total_transactions": 45,
      "lifetime_value": 2350.75
    }
    """
    try:
        result = service.get_user_profile(user_id)
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/accounts")
async def get_user_accounts(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Get user's linked accounts (cards, bank accounts, wallets)
    
    Path Parameters:
    - user_id: User identifier
    
    Response:
    [
      {
        "account_id": "acc-001",
        "type": "card|bank|wallet",
        "name": "Visa ending in 4242",
        "is_default": true,
        "created_at": "2025-01-01T00:00:00Z"
      },
      ...
    ]
    """
    try:
        result = service.get_user_accounts(user_id)
        return {
            "user_id": user_id,
            "accounts": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/transactions")
async def get_user_transactions(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: UserService = Depends(get_user_service)
):
    """
    Get user's transaction history
    
    Path Parameters:
    - user_id: User identifier
    
    Query Parameters:
    - limit: Number of transactions to return (default 20, max 100)
    - offset: Number of transactions to skip for pagination (default 0)
    
    Response:
    {
      "transactions": [
        {
          "transaction_id": "txn-001",
          "merchant": "Starbucks",
          "amount": 5.75,
          "category": "Restaurants & Cafes",
          "timestamp": "2025-12-28T10:30:00Z",
          "status": "completed"
        },
        ...
      ],
      "total": 45,
      "limit": 20,
      "offset": 0
    }
    """
    try:
        result = service.get_user_transactions(user_id, limit, offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/rewards")
async def get_user_rewards(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Get user's rewards, loyalty points, and boosts
    
    Path Parameters:
    - user_id: User identifier
    
    Response:
    {
      "user_id": "user-12345",
      "points_balance": 12450,
      "tier": "gold|silver|bronze|standard",
      "next_tier_points_needed": 5000,
      "boosts": [
        {
          "id": "boost-fuel",
          "name": "2× Points on Fuel",
          "multiplier": 2.0,
          "category": "Gas Stations",
          "expires_at": "2025-12-31T23:59:59Z"
        }
      ]
    }
    """
    try:
        result = service.get_user_rewards(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/analytics/spending")
async def get_user_spending_analytics(
    user_id: str,
    days: int = Query(30, ge=1, le=365),
    service: UserService = Depends(get_user_service)
):
    """
    Get user's spending analytics and trends
    
    Path Parameters:
    - user_id: User identifier
    
    Query Parameters:
    - days: Number of days to analyze (default 30, max 365)
    
    Response:
    {
      "user_id": "user-12345",
      "period_days": 30,
      "total_spent": 2345.67,
      "transaction_count": 45,
      "average_transaction": 52.13,
      "spending_by_category": {
        "Restaurants & Cafes": 650.25,
        "Grocery & Food": 850.00,
        ...
      },
      "daily_average": 78.19,
      "trend": "up"
    }
    """
    try:
        result = service.get_user_spending_analytics(user_id, days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SETUP FUNCTION
# ============================================================================

def setup_user_routes(app):
    """
    Setup user routes in FastAPI app
    
    Usage in main.py:
        from user_service import setup_user_routes
        setup_user_routes(app)
    
    This will register all user endpoints:
    - GET /api/users/{user_id}
    - GET /api/users/{user_id}/accounts
    - GET /api/users/{user_id}/transactions
    - GET /api/users/{user_id}/rewards
    - GET /api/users/{user_id}/analytics/spending
    """
    app.include_router(router)
    print("✅ User service routes initialized (5 endpoints)")
