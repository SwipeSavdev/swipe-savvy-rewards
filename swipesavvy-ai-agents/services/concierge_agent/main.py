"""
SwipeSavvy Concierge AI Agent
Main entry point for the AI concierge service
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Concierge Agent API")

class ConversationMessage(BaseModel):
    role: str
    content: str

class ConversationRequest(BaseModel):
    messages: list[ConversationMessage]
    user_id: str

class ConversationResponse(BaseModel):
    response: str
    status: str = "success"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/api/v1/chat")
async def chat(request: ConversationRequest):
    """Process conversation request"""
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        last_message = request.messages[-1].content
        
        # Simple mock response
        response = f"I received your message: '{last_message}'. How can I help you with your SwipeSavvy account?"
        
        return ConversationResponse(response=response)
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/status")
async def status():
    """Get agent status"""
    return {"status": "running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
