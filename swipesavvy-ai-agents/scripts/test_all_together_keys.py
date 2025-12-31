#!/usr/bin/env python3
"""
Test all three Together.AI API keys
Verifies authentication and basic functionality for each key
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

def test_key(name, env_var):
    """Test a single API key"""
    api_key = os.getenv(env_var)
    if not api_key:
        print(f"❌ {name}: {env_var} not found in environment")
        return False
    
    print(f"\n🔄 Testing {name}...")
    print(f"   Key: {api_key[:20]}...{api_key[-10:]}")
    
    try:
        client = Together(api_key=api_key)
        
        # Test basic completion
        response = client.chat.completions.create(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello' if you can read this."}
            ],
            max_tokens=50,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        print(f"   ✅ Authentication: PASSED")
        print(f"   ✅ Response: {reply.strip()[:60]}...")
        print(f"   ✅ Tokens: {response.usage.total_tokens}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

def main():
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     Together.AI - Multi-Key Verification                   ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    keys_to_test = [
        ("Support/Concierge (Primary)", "TOGETHER_API_KEY"),
        ("General/Backup", "TOGETHER_API_KEY_GENERAL"),
        ("AI Marketing", "TOGETHER_API_KEY_MARKETING"),
    ]
    
    results = []
    for name, env_var in keys_to_test:
        result = test_key(name, env_var)
        results.append((name, result))
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print("="*60)
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {name}")
    
    all_passed = all(result for _, result in results)
    print("\n" + "="*60)
    if all_passed:
        print("✅ All keys verified and operational!")
        print("="*60)
        return 0
    else:
        print("⚠️  Some keys failed verification")
        print("="*60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
