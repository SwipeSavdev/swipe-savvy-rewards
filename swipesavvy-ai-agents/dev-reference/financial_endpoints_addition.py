# This file contains the financial endpoints to be added to main.py
# Add this code after the rewards endpoints and before the chat endpoint

# ===== IN-MEMORY DATA STORAGE (At the top with other in-memory storage) =====
# Add these with the "conversations" dictionary

# In-memory transaction storage
transactions_db = {}

# In-memory accounts storage
accounts_db = {}

# ===== MODELS FOR FINANCIAL ENDPOINTS =====
# Add these Pydantic models with other request/response models

class Transaction(BaseModel):
    id: str
    user_id: str
    amount: float
    type: str  # payment, transfer, deposit, withdrawal, refund
    category: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    status: str  # completed, pending, failed
    created_at: str
    updated_at: str

class TransactionCreate(BaseModel):
    amount: float
    type: str
    category: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    recipient_id: Optional[str] = None
    status: str = "completed"

class Account(BaseModel):
    id: str
    user_id: str
    name: str
    type: str  # checking, savings, credit, investment
    balance: float
    available_balance: float
    account_number: str
    created_at: str
    updated_at: str

class SpendingCategory(BaseModel):
    id: str
    name: str
    amount: float
    percentage: int
    color: str
    transaction_count: int


# ===== HELPER FUNCTION FOR MOCK DATA =====

def initialize_user_data(user_id: str):
    """Initialize mock data for a new user"""
    import uuid
    from datetime import datetime, timedelta
    
    if user_id not in transactions_db:
        transactions_db[user_id] = [
            {
                "id": f"txn_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "amount": 12.50,
                "type": "payment",
                "category": "coffee",
                "description": "Coffee at Starbucks",
                "merchant": "Starbucks",
                "status": "completed",
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z",
                "updated_at": (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z"
            },
            {
                "id": f"txn_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "amount": 45.99,
                "type": "payment",
                "category": "dining",
                "description": "Dinner at Restaurant",
                "merchant": "Local Restaurant",
                "status": "completed",
                "created_at": (datetime.utcnow() - timedelta(hours=4)).isoformat() + "Z",
                "updated_at": (datetime.utcnow() - timedelta(hours=4)).isoformat() + "Z"
            },
            {
                "id": f"txn_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "amount": 89.99,
                "type": "payment",
                "category": "groceries",
                "description": "Grocery shopping",
                "merchant": "Whole Foods",
                "status": "completed",
                "created_at": (datetime.utcnow() - timedelta(hours=8)).isoformat() + "Z",
                "updated_at": (datetime.utcnow() - timedelta(hours=8)).isoformat() + "Z"
            },
            {
                "id": f"txn_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "amount": 500.00,
                "type": "transfer",
                "category": "transfer",
                "description": "Transfer to savings",
                "merchant": "Internal Transfer",
                "status": "completed",
                "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z",
                "updated_at": (datetime.utcnow() - timedelta(days=1)).isoformat() + "Z"
            }
        ]
    
    if user_id not in accounts_db:
        accounts_db[user_id] = [
            {
                "id": f"acc_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "name": "Checking Account",
                "type": "checking",
                "balance": 2547.83,
                "available_balance": 2547.83,
                "account_number": "****1234",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            },
            {
                "id": f"acc_{uuid.uuid4().hex[:12]}",
                "user_id": user_id,
                "name": "Savings Account",
                "type": "savings",
                "balance": 12340.50,
                "available_balance": 12340.50,
                "account_number": "****5678",
                "created_at": datetime.utcnow().isoformat() + "Z",
                "updated_at": datetime.utcnow().isoformat() + "Z"
            }
        ]


# ===== TRANSACTION ENDPOINTS =====

@app.get("/api/v1/transactions/{user_id}")
async def get_transactions(
    user_id: str,
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    type_filter: Optional[str] = None
):
    """Get transactions for a user with optional filtering"""
    initialize_user_data(user_id)
    
    transactions = transactions_db.get(user_id, [])
    
    # Filter by category if provided
    if category:
        transactions = [t for t in transactions if t.get("category") == category]
    
    # Filter by type if provided
    if type_filter:
        transactions = [t for t in transactions if t.get("type") == type_filter]
    
    # Sort by created_at descending
    transactions = sorted(transactions, key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Apply pagination
    transactions = transactions[offset:offset + limit]
    
    logger.info(f"Retrieved {len(transactions)} transactions for user {user_id}")
    return transactions


@app.post("/api/v1/transactions/{user_id}")
async def create_transaction(user_id: str, transaction: TransactionCreate):
    """Create a new transaction for a user"""
    initialize_user_data(user_id)
    
    import uuid
    from datetime import datetime
    
    new_txn = {
        "id": f"txn_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "category": transaction.category or "other",
        "description": transaction.description or "",
        "merchant": transaction.merchant or "Direct Transfer",
        "status": transaction.status,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    
    if user_id not in transactions_db:
        transactions_db[user_id] = []
    
    transactions_db[user_id].append(new_txn)
    logger.info(f"Created transaction {new_txn['id']} for user {user_id}")
    
    return new_txn


@app.get("/api/v1/transactions/{user_id}/{transaction_id}")
async def get_transaction(user_id: str, transaction_id: str):
    """Get a specific transaction"""
    initialize_user_data(user_id)
    
    transactions = transactions_db.get(user_id, [])
    for txn in transactions:
        if txn.get("id") == transaction_id:
            return txn
    
    raise HTTPException(status_code=404, detail="Transaction not found")


# ===== ACCOUNT ENDPOINTS =====

@app.get("/api/v1/accounts/{user_id}")
async def get_accounts(user_id: str):
    """Get all accounts for a user"""
    initialize_user_data(user_id)
    
    accounts = accounts_db.get(user_id, [])
    logger.info(f"Retrieved {len(accounts)} accounts for user {user_id}")
    return accounts


@app.get("/api/v1/accounts/{user_id}/{account_id}")
async def get_account(user_id: str, account_id: str):
    """Get a specific account"""
    initialize_user_data(user_id)
    
    accounts = accounts_db.get(user_id, [])
    for acc in accounts:
        if acc.get("id") == account_id:
            return acc
    
    raise HTTPException(status_code=404, detail="Account not found")


# ===== ANALYTICS ENDPOINT =====

@app.get("/api/v1/accounts/{user_id}/analytics")
async def get_spending_analytics(user_id: str, period: str = "month"):
    """Get spending analytics by category"""
    initialize_user_data(user_id)
    
    from datetime import datetime, timedelta
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:  # year
        start_date = now - timedelta(days=365)
    
    # Get transactions for the period
    transactions = transactions_db.get(user_id, [])
    
    # Filter transactions by date and status
    period_transactions = [
        t for t in transactions
        if t.get("status") == "completed" and
        datetime.fromisoformat(t.get("created_at", "").replace("Z", "+00:00")) >= start_date.replace(tzinfo=None)
    ]
    
    # Group by category and calculate totals
    category_totals = {}
    total_amount = 0
    
    for txn in period_transactions:
        category = txn.get("category", "Other").capitalize()
        if category not in category_totals:
            category_totals[category] = {"amount": 0, "count": 0}
        
        category_totals[category]["amount"] += txn.get("amount", 0)
        category_totals[category]["count"] += 1
        total_amount += txn.get("amount", 0)
    
    # Color map for categories
    color_map = {
        "Dining": "#235393",
        "Shopping": "#9B59B6",
        "Gas": "#FF9800",
        "Coffee": "#8B4513",
        "Entertainment": "#E74C3C",
        "Groceries": "#27AE60",
        "Utilities": "#132136",
        "Transport": "#3498DB",
        "Health": "#1ABC9C",
        "Transfer": "#2ECC71",
        "Other": "#999999"
    }
    
    # Build response
    analytics = []
    for category, data in category_totals.items():
        percentage = int((data["amount"] / total_amount * 100)) if total_amount > 0 else 0
        analytics.append({
            "id": f"cat_{category.lower()}",
            "name": category,
            "amount": round(data["amount"], 2),
            "percentage": percentage,
            "color": color_map.get(category, "#999999"),
            "transaction_count": data["count"]
        })
    
    # Sort by amount descending
    analytics.sort(key=lambda x: x["amount"], reverse=True)
    
    logger.info(f"Retrieved {len(analytics)} spending categories for user {user_id}")
    return analytics
