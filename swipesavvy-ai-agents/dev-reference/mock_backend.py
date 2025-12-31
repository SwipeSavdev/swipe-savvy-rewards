#!/usr/bin/env python3
"""
Mock Savvy AI Backend Server
Simple FastAPI server for development without Docker dependencies
Provides mock responses for the Savvy AI integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json
from datetime import datetime
from typing import List, Dict, Any
import uvicorn

app = FastAPI(
    title="Savvy AI Backend Mock",
    description="Mock API for Savvy AI Platform Development",
    version="1.0.0"
)

# Enable CORS for frontend apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data storage
users_db = {
    "user_1": {
        "id": "user_1",
        "email": "demo@savvywallet.com",
        "name": "Demo User",
        "created_at": datetime.now().isoformat()
    }
}

accounts_db = {
    "acc_1": {
        "id": "acc_1",
        "user_id": "user_1",
        "type": "checking",
        "balance": 2547.83,
        "currency": "USD"
    },
    "acc_2": {
        "id": "acc_2",
        "user_id": "user_1",
        "type": "savings",
        "balance": 12340.50,
        "currency": "USD"
    }
}

transactions_db = {
    "txn_1": {"id": "txn_1", "account_id": "acc_1", "type": "debit", "amount": 5.47, "description": "Starbucks", "date": "2025-12-25"},
    "txn_2": {"id": "txn_2", "account_id": "acc_1", "type": "debit", "amount": 18.23, "description": "Uber", "date": "2025-12-24"},
    "txn_3": {"id": "txn_3", "account_id": "acc_1", "type": "debit", "amount": 42.99, "description": "Amazon", "date": "2025-12-23"},
    "txn_4": {"id": "txn_4", "account_id": "acc_1", "type": "debit", "amount": 87.34, "description": "Whole Foods", "date": "2025-12-22"},
}

conversations_db = {}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Savvy AI Mock Backend",
        "timestamp": datetime.now().isoformat()
    }

# Docs endpoints
@app.get("/docs", include_in_schema=False)
async def docs():
    return {"message": "API Documentation at /docs"}

@app.get("/")
async def root():
    return {
        "message": "Savvy AI Backend Mock Server",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "chat_stream": "/api/v1/chat/stream",
            "accounts": "/api/v1/accounts",
            "transactions": "/api/v1/transactions",
            "auth": "/api/auth/login"
        }
    }

# Authentication endpoints
@app.post("/api/auth/login")
async def login(email: str, password: str):
    return {
        "token": "mock-jwt-token-12345",
        "user": users_db["user_1"],
        "expires_in": 3600
    }

@app.post("/api/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

# Account endpoints
@app.get("/api/v1/accounts")
async def get_accounts():
    return list(accounts_db.values())

@app.get("/api/v1/accounts/{account_id}")
async def get_account(account_id: str):
    if account_id not in accounts_db:
        raise HTTPException(status_code=404, detail="Account not found")
    return accounts_db[account_id]

# Transaction endpoints
@app.get("/api/v1/transactions")
async def get_transactions():
    return list(transactions_db.values())

@app.get("/api/v1/transactions/{transaction_id}")
async def get_transaction(transaction_id: str):
    if transaction_id not in transactions_db:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transactions_db[transaction_id]

# Analytics endpoint
@app.get("/api/v1/analytics/monthly")
async def get_monthly_analytics():
    return {
        "month": "December 2025",
        "total_spending": 154.03,
        "transactions": 4,
        "top_category": "Food & Dining",
        "average_transaction": 38.51,
        "insights": [
            "Your spending on dining is 15% higher than last month",
            "Consider setting a budget for transportation",
            "You're on track with your savings goals"
        ]
    }

# Chat streaming endpoint - the main AI feature
@app.post("/api/v1/chat/stream")
async def chat_stream(message: str = None):
    """Stream AI responses for chat messages"""
    
    # Generate mock AI response based on message
    ai_response = generate_ai_response(message or "")
    
    async def generate():
        # Stream the response in chunks
        for chunk in ai_response.split(" "):
            yield f"data: {json.dumps({'chunk': chunk + ' '})}\n\n"
            await asyncio.sleep(0.05)  # Simulate streaming delay
        # Send completion marker
        yield f"data: {json.dumps({'done': True})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/api/v1/chat/message")
async def send_message(message: str):
    """Send a message and get response"""
    response = generate_ai_response(message)
    return {
        "id": "msg_" + datetime.now().isoformat(),
        "message": response,
        "timestamp": datetime.now().isoformat()
    }

def generate_ai_response(message: str) -> str:
    """Generate contextual AI responses"""
    message_lower = message.lower()
    
    if not message:
        return "Hi! I'm Savvy AI, your personal finance assistant. How can I help you today? You can ask me about your balance, recent transactions, spending patterns, or financial recommendations."
    
    if "balance" in message_lower:
        return "Your current checking account balance is $2,547.83 and your savings account has $12,340.50. Your total liquid assets are $14,888.33. Would you like to see a breakdown or have any questions?"
    
    if "transaction" in message_lower or "recent" in message_lower:
        return "Here are your recent transactions: Starbucks ($5.47), Uber ($18.23), Amazon ($42.99), and Whole Foods ($87.34). You've spent $154.03 in the last few days. Would you like more details about any of these transactions?"
    
    if "spending" in message_lower or "budget" in message_lower:
        return "Your monthly spending trend shows an average of $2,100/month. This month you're at $500 so far. I notice your dining expenses are slightly higher than usual. Would you like me to suggest budget adjustments?"
    
    if "recommendation" in message_lower or "suggest" in message_lower:
        return "Based on your spending patterns, I recommend: 1) Increasing your savings rate by 5%, 2) Setting up automatic transfers to savings, 3) Using cashback cards for dining purchases. You could save an estimated $300/month with these adjustments."
    
    if "transfer" in message_lower or "pay" in message_lower:
        return "I can help you with transfers and payments. Which account would you like to transfer from? And to whom would you like to send the money? I'll guide you through the process securely."
    
    # Default response
    return "That's a great question! I can help you with account management, transaction analysis, spending insights, and financial recommendations. What would you like to know more about?"

# Chat history endpoints
@app.post("/api/v1/chat/session/new")
async def new_chat_session():
    session_id = "session_" + datetime.now().isoformat()
    conversations_db[session_id] = {
        "id": session_id,
        "created_at": datetime.now().isoformat(),
        "messages": []
    }
    return {"session_id": session_id}

@app.get("/api/v1/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    if session_id not in conversations_db:
        raise HTTPException(status_code=404, detail="Session not found")
    return conversations_db[session_id]

# Recommendations endpoint
@app.get("/api/v1/chat/suggestions")
async def get_suggestions():
    return {
        "suggestions": [
            "Increase emergency fund to 6 months of expenses",
            "Consider opening a high-yield savings account",
            "Set up automatic bill payments to avoid late fees",
            "Review your subscription services for savings opportunities",
            "Consider refinancing your loans for better rates"
        ]
    }

# Feature flags
@app.get("/api/v1/feature-flags")
async def get_feature_flags():
    return {
        "features": {
            "ai_chat": True,
            "voice_input": True,
            "transaction_analysis": True,
            "spending_insights": True,
            "financial_recommendations": True,
            "offline_mode": True,
            "charts": True,
            "analytics": True
        }
    }

if __name__ == "__main__":
    print("🚀 Starting Savvy AI Mock Backend Server on http://0.0.0.0:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("✅ Health Check: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
