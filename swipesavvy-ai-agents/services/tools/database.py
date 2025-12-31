"""
Mock Database Service for AI Agent Tools
Provides in-memory data for development and testing
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import random

class MockDatabase:
    """In-memory database for testing AI agent tools"""
    
    def __init__(self):
        self._users = self._generate_users()
        self._accounts = self._generate_accounts()
        self._transactions = self._generate_transactions()
    
    def _generate_users(self) -> List[Dict[str, Any]]:
        """Generate test users"""
        return [
            {
                "id": "user_001",
                "email": "sarah.johnson@example.com",
                "first_name": "Sarah",
                "last_name": "Johnson",
                "phone": "+1-555-0101",
                "status": "active"
            },
            {
                "id": "user_002",
                "email": "michael.chen@example.com",
                "first_name": "Michael",
                "last_name": "Chen",
                "phone": "+1-555-0102",
                "status": "active"
            }
        ]
    
    def _generate_accounts(self) -> List[Dict[str, Any]]:
        """Generate test accounts"""
        return [
            {
                "id": "acct_001",
                "user_id": "user_001",
                "account_number": "SS1234567890",
                "account_type": "checking",
                "account_name": "Sarah's Checking",
                "balance": 345678,  # $3,456.78
                "available_balance": 325678,
                "currency": "USD",
                "status": "active"
            },
            {
                "id": "acct_002",
                "user_id": "user_001",
                "account_number": "SS1234567891",
                "account_type": "savings",
                "account_name": "Sarah's Savings",
                "balance": 1250000,  # $12,500.00
                "available_balance": 1250000,
                "currency": "USD",
                "status": "active"
            },
            {
                "id": "acct_003",
                "user_id": "user_002",
                "account_number": "SS2234567890",
                "account_type": "checking",
                "account_name": "Michael's Checking",
                "balance": 892341,  # $8,923.41
                "available_balance": 882341,
                "currency": "USD",
                "status": "active"
            }
        ]
    
    def _generate_transactions(self) -> List[Dict[str, Any]]:
        """Generate test transactions"""
        categories = {
            "groceries": ["Whole Foods", "Trader Joe's", "Safeway"],
            "restaurants": ["Chipotle", "Starbucks", "Panera Bread"],
            "shopping": ["Amazon", "Target", "Apple Store"],
            "transportation": ["Uber", "Lyft", "Shell Gas"],
            "utilities": ["PG&E", "Comcast", "AT&T"]
        }
        
        transactions = []
        current_date = datetime.now()
        
        for i in range(30):
            category = random.choice(list(categories.keys()))
            merchant = random.choice(categories[category])
            amount = random.randint(500, 15000)
            days_ago = random.randint(0, 30)
            
            transactions.append({
                "id": f"txn_{i:03d}",
                "user_id": "user_001",
                "from_account_id": "acct_001",
                "transaction_type": "debit",
                "amount": amount,
                "currency": "USD",
                "status": "completed" if days_ago > 0 else random.choice(["pending", "completed"]),
                "description": f"Purchase at {merchant}",
                "merchant_name": merchant,
                "category": category,
                "created_at": (current_date - timedelta(days=days_ago)).isoformat(),
                "processed_at": (current_date - timedelta(days=days_ago)).isoformat() if days_ago > 0 else None
            })
        
        # Add specific test transaction
        transactions.append({
            "id": "txn_large_001",
            "user_id": "user_001",
            "from_account_id": "acct_001",
            "transaction_type": "debit",
            "amount": 150000,  # $1,500
            "currency": "USD",
            "status": "pending",
            "description": "Purchase at Apple Store",
            "merchant_name": "Apple Store",
            "category": "shopping",
            "created_at": current_date.isoformat(),
            "processed_at": None
        })
        
        transactions.sort(key=lambda x: x["created_at"], reverse=True)
        return transactions
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        return next((u for u in self._users if u["id"] == user_id), None)
    
    def get_accounts_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all accounts for a user"""
        return [a for a in self._accounts if a["user_id"] == user_id]
    
    def get_account(self, account_id: str) -> Optional[Dict[str, Any]]:
        """Get account by ID"""
        return next((a for a in self._accounts if a["id"] == account_id), None)
    
    def get_transactions(
        self,
        user_id: str,
        account_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get transactions with filters"""
        transactions = [t for t in self._transactions if t["user_id"] == user_id]
        
        if account_id:
            transactions = [t for t in transactions if t["from_account_id"] == account_id]
        
        if start_date:
            transactions = [t for t in transactions if t["created_at"] >= start_date]
        
        if end_date:
            transactions = [t for t in transactions if t["created_at"] <= end_date]
        
        if category:
            transactions = [t for t in transactions if t.get("category") == category]
        
        return transactions[:limit]
    
    def get_transaction(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """Get single transaction by ID"""
        return next((t for t in self._transactions if t["id"] == transaction_id), None)

# Global instance
_db_instance = None

def get_database() -> MockDatabase:
    """Get or create database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = MockDatabase()
    return _db_instance
