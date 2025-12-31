"""
Load testing script using Locust
"""

from locust import HttpUser, task, between
import json
import random


class SwipeSavvyConciergeUser(HttpUser):
    """Simulates user interactions with the Concierge service"""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    def on_start(self):
        """Initialize session"""
        self.session_id = f"test_session_{random.randint(1000, 9999)}"
        self.user_id = f"test_user_{random.randint(100, 999)}"
    
    @task(3)
    def check_balance(self):
        """Test balance inquiry - most common operation"""
        payload = {
            "message": "What's my account balance?",
            "session_id": self.session_id,
            "user_id": self.user_id
        }
        
        with self.client.post(
            "/api/v1/chat",
            json=payload,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if "balance" in data.get("message", "").lower():
                    response.success()
                else:
                    response.failure("Balance not in response")
            else:
                response.failure(f"Got status {response.status_code}")
    
    @task(2)
    def get_transactions(self):
        """Test transaction history"""
        payload = {
            "message": "Show me my recent transactions",
            "session_id": self.session_id,
            "user_id": self.user_id
        }
        
        self.client.post("/api/v1/chat", json=payload)
    
    @task(1)
    def transfer_money(self):
        """Test money transfer - less common"""
        payload = {
            "message": "Transfer $50 to account 67890",
            "session_id": self.session_id,
            "user_id": self.user_id
        }
        
        self.client.post("/api/v1/chat", json=payload)
    
    @task(1)
    def pay_bill(self):
        """Test bill payment"""
        payload = {
            "message": "Pay my electricity bill $120",
            "session_id": self.session_id,
            "user_id": self.user_id
        }
        
        self.client.post("/api/v1/chat", json=payload)
    
    @task(5)
    def health_check(self):
        """Test health endpoint - very frequent"""
        self.client.get("/health")


class GuardrailsUser(HttpUser):
    """Test guardrails service performance"""
    
    wait_time = between(0.5, 2)
    
    @task
    def check_content_safety(self):
        """Test content safety check"""
        messages = [
            "What's my balance?",
            "Transfer $100 to John",
            "Show my transactions",
            "Pay my bill"
        ]
        
        payload = {
            "text": random.choice(messages),
            "check_safety": True,
            "check_pii": True,
            "check_injection": True
        }
        
        self.client.post("/api/v1/guardrails/check", json=payload)


class RAGServiceUser(HttpUser):
    """Test RAG service performance"""
    
    wait_time = between(1, 2)
    
    @task
    def semantic_search(self):
        """Test semantic search"""
        queries = [
            "How do I transfer money?",
            "What are the transaction limits?",
            "How do I reset my password?",
            "What is the interest rate?"
        ]
        
        payload = {
            "query": random.choice(queries),
            "limit": 5
        }
        
        self.client.post("/api/v1/rag/search", json=payload)
