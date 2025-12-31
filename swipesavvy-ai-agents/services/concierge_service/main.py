"""
AI Concierge Service - With Authentication & Financial Endpoints
Provides conversational AI interface using Together.AI LLM and user authentication
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
from typing import Optional, AsyncGenerator
from together import Together
import json
import time
from .auth_service import AuthService
from .rewards_service import RewardsService
from datetime import datetime, timedelta
import uuid

# Import shared modules
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "shared"))
try:
    from shared.logging_config import get_logger
except ImportError:
    import logging
    def get_logger(name, **kwargs):
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger(name)

# Initialize
app = FastAPI(title="AI Concierge Service")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = get_logger("concierge-service")
auth_service = AuthService()
rewards_service = RewardsService()

# Environment variables
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY", "")
RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://rag:8001")
GUARDRAILS_SERVICE_URL = os.getenv("GUARDRAILS_SERVICE_URL", "http://guardrails:8002")

# Initialize Together client
together_client = Together(api_key=TOGETHER_API_KEY) if TOGETHER_API_KEY else None

# In-memory data storage
conversations = {}
transactions_db = {}
accounts_db = {}

# ===== REQUEST/RESPONSE MODELS =====

class SignupRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refreshToken: str

class AuthResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None
    expiresIn: Optional[int] = None
    error: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    context: Optional[dict] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict

class InitializeRewardsRequest(BaseModel):
    user_id: str
    starting_points: int = 1000

class RedeemOfferRequest(BaseModel):
    offer_id: str

# ===== FINANCIAL MODELS =====

class Transaction(BaseModel):
    id: str
    user_id: str
    amount: float
    type: str
    category: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    status: str
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
    type: str
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


# ===== AUTH ENDPOINTS =====

@app.post("/api/v1/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """Sign up new user"""
    success, data = auth_service.signup(
        request.email,
        request.password,
        request.firstName,
        request.lastName
    )
    
    if success:
        # Initialize financial data for new user
        user_id = data.get("user", {}).get("id")
        if user_id:
            initialize_user_data(user_id)
        logger.info(f"New user signed up: {request.email}")
        return AuthResponse(success=True, **data)
    else:
        return AuthResponse(success=False, error=data.get("error"))

@app.post("/api/v1/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user"""
    success, data = auth_service.login(request.email, request.password)
    
    if success:
        logger.info(f"User logged in: {request.email}")
        return AuthResponse(success=True, **data)
    else:
        return AuthResponse(success=False, error=data.get("error"))

@app.post("/api/v1/auth/refresh")
async def refresh(request: RefreshRequest):
    """Refresh access token"""
    success, data = auth_service.refresh(request.refreshToken)
    
    if success:
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}


# ===== REWARDS ENDPOINTS =====

@app.post("/api/v1/rewards/initialize")
async def initialize_rewards(request: InitializeRewardsRequest):
    """Initialize rewards for new user"""
    success, data = rewards_service.initialize_user(request.user_id, request.starting_points)
    if success:
        logger.info(f"Rewards initialized for user {request.user_id}")
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}

@app.get("/api/v1/rewards/points/{user_id}")
async def get_points(user_id: str):
    """Get user points balance"""
    success, data = rewards_service.get_user_points(user_id)
    if success:
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}

@app.get("/api/v1/rewards/history/{user_id}")
async def get_history(user_id: str, limit: int = 50):
    """Get transaction history"""
    success, data = rewards_service.get_transaction_history(user_id, limit)
    if success:
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}

@app.get("/api/v1/rewards/offers")
async def get_offers():
    """Get available redemption offers"""
    success, data = rewards_service.get_available_offers()
    if success:
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}

@app.post("/api/v1/rewards/redeem")
async def redeem_offer(user_id: str, request: RedeemOfferRequest):
    """Redeem an offer"""
    success, data = rewards_service.redeem_offer(user_id, request.offer_id)
    if success:
        logger.info(f"User {user_id} redeemed offer {request.offer_id}")
        return {"success": True, **data}
    else:
        return {"success": False, "error": data.get("error")}


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


# ===== HEALTH CHECK =====

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "api": "up",
            "auth": "enabled",
            "together_ai": "configured" if together_client else "not_configured",
            "rag": "available",
            "guardrails": "available"
        }
    }


# ===== HELPER FUNCTIONS =====

async def get_rag_context(message: str, user_id: str) -> str:
    """Get context from RAG service"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{RAG_SERVICE_URL}/api/v1/rag/context",
                json={
                    "query": message,
                    "user_id": user_id,
                    "top_k": 3
                }
            )
            if response.status_code == 200:
                data = response.json()
                return data.get("context", "")
            else:
                logger.warning(f"RAG service returned {response.status_code}")
                return ""
    except Exception as e:
        logger.error(f"Error calling RAG service: {e}")
        return ""

async def check_guardrails(message: str, user_id: str) -> dict:
    """Check message through guardrails"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{GUARDRAILS_SERVICE_URL}/api/v1/guardrails/check",
                json={
                    "text": message,
                    "user_id": user_id
                }
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Guardrails returned {response.status_code}")
                return {"safe": True, "checks": {}}
    except Exception as e:
        logger.error(f"Error calling guardrails: {e}")
        return {"safe": True, "checks": {}}

async def generate_response_stream(
    message: str,
    user_id: str,
    session_id: str,
    context: Optional[dict] = None
) -> AsyncGenerator[str, None]:
    """Generate streaming response from LLM"""
    
    # Check guardrails
    guardrails_result = await check_guardrails(message, user_id)
    
    if not guardrails_result.get("safe", True):
        yield f"data: {json.dumps({'type': 'error', 'content': 'Message blocked by safety filters'})}\n\n"
        yield "data: [DONE]\n\n"
        return
    
    # Get RAG context
    rag_context = await get_rag_context(message, user_id)
    
    # Build conversation history
    conversation = conversations.get(session_id, [])
    conversation.append({"role": "user", "content": message})
    
    # Construct system message
    system_message = f"""You are Finley, the helpful AI assistant for SwipeSavvy mobile wallet.
Context from knowledge base:
{rag_context if rag_context else "No additional context available."}

Your capabilities:
- Answer questions about SwipeSavvy features
- Provide financial guidance and support
- Be friendly, concise, and helpful
- Remember conversation context

Guidelines:
- Keep responses brief and to the point
- Use the knowledge base context when relevant
- Be conversational and helpful
- If you don't know something, say so
"""
    
    # Generate response
    if not together_client:
        yield f"data: {json.dumps({'type': 'thinking'})}\n\n"
        yield f"data: {json.dumps({'type': 'message', 'content': 'I apologize, but I am not fully configured yet. Please contact support.'})}\n\n"
        yield "data: [DONE]\n\n"
        return
    
    try:
        yield f"data: {json.dumps({'type': 'thinking'})}\n\n"
        
        messages = [{"role": "system", "content": system_message}]
        messages.extend(conversation[-10:])
        
        stream = together_client.chat.completions.create(
            model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
            messages=messages,
            stream=True,
            max_tokens=512,
            temperature=0.7,
        )
        
        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                yield f"data: {json.dumps({'type': 'message', 'delta': content, 'content': full_response})}\n\n"
        
        conversation.append({"role": "assistant", "content": full_response})
        conversations[session_id] = conversation[-20:]
        
        yield f"data: {json.dumps({'type': 'done', 'message_id': f'{session_id}_{int(time.time())}', 'session_id': session_id})}\n\n"
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': f'Error: {str(e)}'})}\n\n"
        yield "data: [DONE]\n\n"

@app.post("/api/v1/chat")
async def chat(request: ChatRequest):
    """Chat endpoint with streaming response"""
    session_id = request.session_id or f"session_{request.user_id}_{int(time.time())}"
    logger.info(f"Chat request from user {request.user_id}, session {session_id}")
    
    return StreamingResponse(
        generate_response_stream(
            request.message,
            request.user_id,
            session_id,
            request.context
        ),
        media_type="text/event-stream"
    )

@app.get("/api/v1/conversations/{session_id}")
async def get_conversation(session_id: str):
    """Get conversation history"""
    conversation = conversations.get(session_id, [])
    return {
        "session_id": session_id,
        "messages": conversation,
        "message_count": len(conversation)
    }

@app.on_event("startup")
async def startup_event():
    """Startup event"""
    logger.info("Concierge service starting up...")
    logger.info(f"RAG service URL: {RAG_SERVICE_URL}")
    logger.info(f"Guardrails service URL: {GUARDRAILS_SERVICE_URL}")
    logger.info(f"Together API configured: {bool(together_client)}")
    logger.info("Auth service initialized")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
