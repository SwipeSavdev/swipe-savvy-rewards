#!/usr/bin/env python3
"""
Test Together.AI API connection and functionality
"""

import os
from pathlib import Path
import sys

# Load environment variables from .env
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key.strip()] = value.strip()

try:
    from together import Together
except ImportError:
    print("❌ Together SDK not installed. Run: pip install together")
    sys.exit(1)

def test_api_connection():
    """Test basic API connection"""
    print("Testing Together.AI API connection...\n")
    
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        print("❌ TOGETHER_API_KEY not found in environment")
        return False
    
    print(f"✅ API Key found: {api_key[:20]}...{api_key[-10:]}")
    
    try:
        client = Together(api_key=api_key)
        
        # Test simple completion
        print("\n🔄 Testing chat completion with Llama 3.3 70B...")
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[
                {"role": "system", "content": "You are a helpful financial assistant for SwipeSavvy mobile wallet."},
                {"role": "user", "content": "What is your name?"}
            ],
            max_tokens=100,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        print(f"\n✅ API Response:")
        print(f"   Model: {response.model}")
        print(f"   Reply: {reply}")
        print(f"   Tokens: {response.usage.total_tokens} (input: {response.usage.prompt_tokens}, output: {response.usage.completion_tokens})")
        
        # Test with a financial query
        print("\n🔄 Testing financial domain query...")
        response2 = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[
                {"role": "system", "content": "You are a helpful financial assistant for SwipeSavvy mobile wallet. Answer questions about accounts, transactions, and balances."},
                {"role": "user", "content": "How do I check my account balance?"}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        reply2 = response2.choices[0].message.content
        print(f"\n✅ Financial Query Response:")
        print(f"   {reply2}")
        
        print("\n" + "="*60)
        print("✅ Together.AI API is working correctly!")
        print("="*60)
        print("\nNext Steps:")
        print("1. API key is configured and operational")
        print("2. Ready to integrate into concierge agent service")
        print("3. Can start Week 4 agent development")
        
        return True
        
    except Exception as e:
        print(f"\n❌ API Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_api_connection()
    sys.exit(0 if success else 1)
