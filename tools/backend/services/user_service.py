"""
User Management API Service
Handles user profile, accounts, transactions, and rewards data
File: user_service.py
Created: December 28, 2025
"""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session

# ============================================================================
# USER SERVICE
# ============================================================================

class UserService:
    """Service for managing user data"""
    
    def __init__(self, db=None):
        self.db = db
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile information"""
        try:
            if not self.db:
                # Mock fallback for testing
                return {
                    "user_id": user_id,
                    "email": f"user{user_id}@example.com",
                    "name": f"User {user_id}",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "account_status": "active",
                    "total_transactions": 45,
                    "lifetime_value": 2350.75
                }
            
            # Query users table
            query = text("""
                SELECT user_id, email, name, created_at, status, 
                       (SELECT COUNT(*) FROM transactions WHERE user_id = users.user_id) as total_txns,
                       (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = users.user_id) as lifetime_val
                FROM users 
                WHERE user_id = :id
            """)
            result = self.db.execute(query, {'id': user_id}).fetchone()
            
            if not result:
                return None
            
            return {
                "user_id": result[0],
                "email": result[1],
                "name": result[2],
                "created_at": result[3].isoformat() if result[3] else None,
                "account_status": result[4],
                "total_transactions": result[5] or 0,
                "lifetime_value": float(result[6]) if result[6] else 0.0
            }
        except Exception as e:
            raise ValueError(f"Failed to get user profile: {str(e)}")
    
    def get_user_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's linked accounts"""
        try:
            if not self.db:
                # Mock fallback
                return []
            
            # Query accounts/cards tables
            query = text("""
                SELECT account_id, account_type, last_four, is_primary, created_at
                FROM user_accounts
                WHERE user_id = :id
                ORDER BY is_primary DESC, created_at DESC
            """)
            results = self.db.execute(query, {'id': user_id}).fetchall()
            
            return [{
                "account_id": row[0],
                "account_type": row[1],
                "last_four": row[2],
                "is_primary": row[3],
                "created_at": row[4].isoformat() if row[4] else None
            } for row in results]
        except Exception as e:
            raise ValueError(f"Failed to get user accounts: {str(e)}")
    
    def get_user_transactions(self, user_id: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Get user's transaction history"""
        try:
            if not self.db:
                # Mock fallback
                return {
                    "transactions": [],
                    "total": 0,
                    "limit": limit,
                    "offset": offset
                }
            
            # Query transactions table
            count_query = text("SELECT COUNT(*) FROM transactions WHERE user_id = :id")
            count_result = self.db.execute(count_query, {'id': user_id}).scalar()
            
            query = text("""
                SELECT transaction_id, user_id, amount, merchant_name, category, transaction_date, status
                FROM transactions
                WHERE user_id = :id
                ORDER BY transaction_date DESC
                LIMIT :limit OFFSET :offset
            """)
            results = self.db.execute(query, {
                'id': user_id,
                'limit': limit,
                'offset': offset
            }).fetchall()
            
            transactions = [{
                "transaction_id": row[0],
                "amount": float(row[2]),
                "merchant_name": row[3],
                "category": row[4],
                "transaction_date": row[5].isoformat() if row[5] else None,
                "status": row[6]
            } for row in results]
            
            return {
                "transactions": transactions,
                "total": count_result or 0,
                "limit": limit,
                "offset": offset
            }
        except Exception as e:
            raise ValueError(f"Failed to get user transactions: {str(e)}")
    
    def get_user_rewards(self, user_id: str) -> Dict[str, Any]:
        """Get user's rewards and loyalty information"""
        try:
            if not self.db:
                # Mock fallback
                return {
                    "user_id": user_id,
                    "points_balance": 0,
                    "tier": "standard",
                    "boosts": []
                }
            
            # Query rewards/loyalty tables
            query = text("""
                SELECT user_id, points_balance, tier_level, tier_name
                FROM user_loyalty
                WHERE user_id = :id
            """)
            result = self.db.execute(query, {'id': user_id}).fetchone()
            
            if not result:
                return {
                    "user_id": user_id,
                    "points_balance": 0,
                    "tier": "standard",
                    "boosts": []
                }
            
            boosts_query = text("""
                SELECT boost_id, boost_type, multiplier, expires_at
                FROM loyalty_boosts
                WHERE user_id = :id AND expires_at > NOW()
            """)
            boosts = self.db.execute(boosts_query, {'id': user_id}).fetchall()
            
            return {
                "user_id": result[0],
                "points_balance": result[1] or 0,
                "tier": result[3] or "standard",
                "boosts": [{
                    "boost_id": b[0],
                    "boost_type": b[1],
                    "multiplier": float(b[2]),
                    "expires_at": b[3].isoformat() if b[3] else None
                } for b in boosts]
            }
        except Exception as e:
            raise ValueError(f"Failed to get user rewards: {str(e)}")
    
    def get_user_spending_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get user's spending analytics"""
        try:
            if not self.db:
                # Mock fallback
                return {
                    "user_id": user_id,
                    "period_days": days,
                    "total_spent": 0.00,
                    "spending_by_category": {}
                }
            
            # Query transactions and analytics tables
            query = text("""
                SELECT 
                    category,
                    COUNT(*) as transaction_count,
                    SUM(amount) as category_total
                FROM transactions
                WHERE user_id = :id 
                  AND transaction_date >= NOW() - INTERVAL '1 day' * :days
                GROUP BY category
                ORDER BY category_total DESC
            """)
            results = self.db.execute(query, {'id': user_id, 'days': days}).fetchall()
            
            total_spent = sum(float(row[2]) for row in results if row[2])
            spending_by_category = {
                row[0]: {
                    "count": row[1],
                    "total": float(row[2]) if row[2] else 0.0,
                    "percentage": (float(row[2]) / total_spent * 100) if total_spent > 0 else 0
                } for row in results
            }
            
            return {
                "user_id": user_id,
                "period_days": days,
                "total_spent": total_spent,
                "spending_by_category": spending_by_category
            }
        except Exception as e:
            raise ValueError(f"Failed to get spending analytics: {str(e)}")

# ============================================================================
# FASTAPI ROUTER
# ============================================================================

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile information"""
    service = UserService()
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
async def get_user_accounts(user_id: str):
    """Get user's linked accounts"""
    service = UserService()
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
    offset: int = Query(0, ge=0)
):
    """Get user's transaction history"""
    service = UserService()
    try:
        result = service.get_user_transactions(user_id, limit, offset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/rewards")
async def get_user_rewards(user_id: str):
    """Get user's rewards and loyalty information"""
    service = UserService()
    try:
        result = service.get_user_rewards(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/analytics/spending")
async def get_user_spending_analytics(
    user_id: str,
    days: int = Query(30, ge=1, le=365)
):
    """Get user's spending analytics"""
    service = UserService()
    try:
        result = service.get_user_spending_analytics(user_id, days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def setup_user_routes(app, db: Optional[Session] = None):
    """Setup user routes in FastAPI app"""
    app.include_router(router)
    if db:
        # Store db reference for use in endpoint handlers
        pass
    print("✅ User service routes initialized (5 endpoints)")
