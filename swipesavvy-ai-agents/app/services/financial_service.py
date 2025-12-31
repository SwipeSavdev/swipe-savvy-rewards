"""
Financial Transaction Models and Services
Manages accounts, transactions, balances, and financial operations
"""

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum
import secrets
from decimal import Decimal

# ==================== Models ====================

class TransactionType(str, Enum):
    """Types of financial transactions"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    INVESTMENT = "investment"
    REWARD = "reward"
    FEE = "fee"

class TransactionStatus(str, Enum):
    """Transaction status"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class AccountType(str, Enum):
    """Account types"""
    CHECKING = "checking"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    WALLET = "wallet"

class Account(BaseModel):
    """Account model"""
    id: str
    user_id: str
    account_type: AccountType
    balance: Decimal
    currency: str = "USD"
    created_at: datetime
    updated_at: datetime
    is_primary: bool = False

class Transaction(BaseModel):
    """Transaction model"""
    id: str
    user_id: str
    account_id: str
    type: TransactionType
    amount: Decimal
    description: str
    status: TransactionStatus
    recipient_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    metadata: dict = {}

class CreateAccountRequest(BaseModel):
    """Create account request"""
    account_type: AccountType
    is_primary: bool = False

class CreateTransactionRequest(BaseModel):
    """Create transaction request"""
    type: TransactionType
    amount: Decimal
    description: str
    recipient_id: Optional[str] = None
    account_id: Optional[str] = None
    metadata: dict = {}

class BalanceResponse(BaseModel):
    """Balance response"""
    account_id: str
    balance: Decimal
    currency: str
    last_updated: datetime

class TransactionHistoryResponse(BaseModel):
    """Transaction history response"""
    transaction_id: str
    type: str
    amount: Decimal
    description: str
    status: str
    created_at: datetime
    recipient_name: Optional[str] = None

class MonthlyAnalyticsResponse(BaseModel):
    """Monthly analytics response"""
    month: str
    income: Decimal
    expenses: Decimal
    net_change: Decimal
    transaction_count: int

# ==================== Database (Mock) ====================

ACCOUNTS_DB = {}  # user_id -> [accounts]
TRANSACTIONS_DB = {}  # transaction_id -> transaction

class AccountModel:
    """Account database model"""
    def __init__(self, user_id: str, account_type: AccountType, is_primary: bool = False):
        self.id = secrets.token_urlsafe(16)
        self.user_id = user_id
        self.account_type = account_type
        self.balance = Decimal("0.00")
        self.currency = "USD"
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_primary = is_primary

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_type": self.account_type,
            "balance": self.balance,
            "currency": self.currency,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_primary": self.is_primary,
        }

class TransactionModel:
    """Transaction database model"""
    def __init__(self, user_id: str, account_id: str, transaction_type: TransactionType,
                 amount: Decimal, description: str, recipient_id: Optional[str] = None,
                 metadata: dict = None):
        self.id = secrets.token_urlsafe(16)
        self.user_id = user_id
        self.account_id = account_id
        self.type = transaction_type
        self.amount = amount
        self.description = description
        self.status = TransactionStatus.COMPLETED
        self.recipient_id = recipient_id
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_id": self.account_id,
            "type": self.type,
            "amount": self.amount,
            "description": self.description,
            "status": self.status,
            "recipient_id": self.recipient_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "metadata": self.metadata,
        }

# ==================== Account Service ====================

class AccountService:
    """Account management service"""

    @staticmethod
    def create_account(user_id: str, account_type: AccountType, is_primary: bool = False) -> AccountModel:
        """Create new account"""
        if user_id not in ACCOUNTS_DB:
            ACCOUNTS_DB[user_id] = []

        account = AccountModel(user_id, account_type, is_primary)
        ACCOUNTS_DB[user_id].append(account)
        return account

    @staticmethod
    def get_accounts(user_id: str) -> List[AccountModel]:
        """Get all accounts for user"""
        return ACCOUNTS_DB.get(user_id, [])

    @staticmethod
    def get_account(account_id: str, user_id: str) -> Optional[AccountModel]:
        """Get specific account"""
        accounts = ACCOUNTS_DB.get(user_id, [])
        return next((a for a in accounts if a.id == account_id), None)

    @staticmethod
    def get_primary_account(user_id: str) -> Optional[AccountModel]:
        """Get primary account for user"""
        accounts = ACCOUNTS_DB.get(user_id, [])
        return next((a for a in accounts if a.is_primary), None)

    @staticmethod
    def update_balance(account_id: str, user_id: str, amount: Decimal) -> AccountModel:
        """Update account balance"""
        account = AccountService.get_account(account_id, user_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        account.balance += amount
        account.updated_at = datetime.utcnow()
        return account

    @staticmethod
    def delete_account(account_id: str, user_id: str) -> bool:
        """Delete account"""
        if user_id not in ACCOUNTS_DB:
            return False

        ACCOUNTS_DB[user_id] = [a for a in ACCOUNTS_DB[user_id] if a.id != account_id]
        return True

# ==================== Transaction Service ====================

class TransactionService:
    """Transaction management service"""

    @staticmethod
    def create_transaction(user_id: str, account_id: str, transaction_type: TransactionType,
                          amount: Decimal, description: str, recipient_id: Optional[str] = None,
                          metadata: dict = None) -> TransactionModel:
        """Create transaction and update balance"""
        # Verify account exists
        account = AccountService.get_account(account_id, user_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        # Create transaction
        transaction = TransactionModel(
            user_id, account_id, transaction_type, amount, description, recipient_id, metadata
        )
        TRANSACTIONS_DB[transaction.id] = transaction

        # Update balance based on transaction type
        if transaction_type in [TransactionType.DEPOSIT, TransactionType.REWARD]:
            AccountService.update_balance(account_id, user_id, amount)
        elif transaction_type in [TransactionType.WITHDRAWAL, TransactionType.TRANSFER, TransactionType.FEE]:
            if account.balance < amount:
                raise HTTPException(status_code=400, detail="Insufficient funds")
            AccountService.update_balance(account_id, user_id, -amount)
        elif transaction_type == TransactionType.INVESTMENT:
            if account.balance < amount:
                raise HTTPException(status_code=400, detail="Insufficient funds")
            AccountService.update_balance(account_id, user_id, -amount)

        return transaction

    @staticmethod
    def get_transactions(user_id: str, limit: int = 50, offset: int = 0) -> List[TransactionModel]:
        """Get transactions for user"""
        user_transactions = [
            t for t in TRANSACTIONS_DB.values() if t.user_id == user_id
        ]
        user_transactions.sort(key=lambda x: x.created_at, reverse=True)
        return user_transactions[offset:offset + limit]

    @staticmethod
    def get_transaction(transaction_id: str, user_id: str) -> Optional[TransactionModel]:
        """Get specific transaction"""
        transaction = TRANSACTIONS_DB.get(transaction_id)
        if transaction and transaction.user_id == user_id:
            return transaction
        return None

    @staticmethod
    def get_transactions_by_account(account_id: str, user_id: str,
                                   limit: int = 50, offset: int = 0) -> List[TransactionModel]:
        """Get transactions for specific account"""
        # Verify account belongs to user
        if not AccountService.get_account(account_id, user_id):
            raise HTTPException(status_code=404, detail="Account not found")

        account_transactions = [
            t for t in TRANSACTIONS_DB.values()
            if t.account_id == account_id and t.user_id == user_id
        ]
        account_transactions.sort(key=lambda x: x.created_at, reverse=True)
        return account_transactions[offset:offset + limit]

    @staticmethod
    def get_monthly_analytics(user_id: str) -> List[MonthlyAnalyticsResponse]:
        """Get monthly financial analytics"""
        from collections import defaultdict

        monthly_data = defaultdict(lambda: {"income": Decimal("0"), "expenses": Decimal("0"), "count": 0})

        transactions = [t for t in TRANSACTIONS_DB.values() if t.user_id == user_id]

        for transaction in transactions:
            month_key = transaction.created_at.strftime("%Y-%m")

            if transaction.type in [TransactionType.DEPOSIT, TransactionType.REWARD]:
                monthly_data[month_key]["income"] += transaction.amount
            elif transaction.type in [TransactionType.WITHDRAWAL, TransactionType.TRANSFER, TransactionType.FEE]:
                monthly_data[month_key]["expenses"] += transaction.amount

            monthly_data[month_key]["count"] += 1

        result = []
        for month, data in sorted(monthly_data.items()):
            result.append(MonthlyAnalyticsResponse(
                month=month,
                income=data["income"],
                expenses=data["expenses"],
                net_change=data["income"] - data["expenses"],
                transaction_count=data["count"]
            ))

        return result

# ==================== API Routes ====================

def create_financial_routes(app: FastAPI, get_current_user=None):
    """Create financial API routes"""

    @app.post("/api/accounts", response_model=Account, tags=["Accounts"])
    async def create_account(request: CreateAccountRequest, current_user = Depends(get_current_user)):
        """Create new account"""
        account = AccountService.create_account(
            current_user.id, request.account_type, request.is_primary
        )
        return account.to_dict()

    @app.get("/api/accounts", response_model=List[Account], tags=["Accounts"])
    async def get_accounts(current_user = Depends(get_current_user)):
        """Get all accounts"""
        accounts = AccountService.get_accounts(current_user.id)
        return [a.to_dict() for a in accounts]

    @app.get("/api/accounts/{account_id}", response_model=Account, tags=["Accounts"])
    async def get_account(account_id: str, current_user = Depends(get_current_user)):
        """Get account details"""
        account = AccountService.get_account(account_id, current_user.id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account.to_dict()

    @app.get("/api/accounts/{account_id}/balance", response_model=BalanceResponse, tags=["Accounts"])
    async def get_balance(account_id: str, current_user = Depends(get_current_user)):
        """Get account balance"""
        account = AccountService.get_account(account_id, current_user.id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

        return {
            "account_id": account.id,
            "balance": account.balance,
            "currency": account.currency,
            "last_updated": account.updated_at
        }

    @app.post("/api/transactions", response_model=Transaction, tags=["Transactions"])
    async def create_transaction(request: CreateTransactionRequest, current_user = Depends(get_current_user)):
        """Create transaction"""
        account_id = request.account_id or AccountService.get_primary_account(current_user.id).id

        transaction = TransactionService.create_transaction(
            current_user.id, account_id, request.type, request.amount,
            request.description, request.recipient_id, request.metadata
        )
        return transaction.to_dict()

    @app.get("/api/transactions", response_model=List[Transaction], tags=["Transactions"])
    async def get_transactions(
        limit: int = 50, offset: int = 0,
        current_user = Depends(get_current_user)
    ):
        """Get transaction history"""
        transactions = TransactionService.get_transactions(current_user.id, limit, offset)
        return [t.to_dict() for t in transactions]

    @app.get("/api/accounts/{account_id}/transactions", response_model=List[Transaction], tags=["Transactions"])
    async def get_account_transactions(
        account_id: str, limit: int = 50, offset: int = 0,
        current_user = Depends(get_current_user)
    ):
        """Get account transaction history"""
        transactions = TransactionService.get_transactions_by_account(
            account_id, current_user.id, limit, offset
        )
        return [t.to_dict() for t in transactions]

    @app.get("/api/transactions/{transaction_id}", response_model=Transaction, tags=["Transactions"])
    async def get_transaction(transaction_id: str, current_user = Depends(get_current_user)):
        """Get transaction details"""
        transaction = TransactionService.get_transaction(transaction_id, current_user.id)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return transaction.to_dict()

    @app.get("/api/analytics/monthly", response_model=List[MonthlyAnalyticsResponse], tags=["Analytics"])
    async def get_monthly_analytics(current_user = Depends(get_current_user)):
        """Get monthly financial analytics"""
        return TransactionService.get_monthly_analytics(current_user.id)

    return app
