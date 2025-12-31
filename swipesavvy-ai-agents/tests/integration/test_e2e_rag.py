#!/usr/bin/env python3
"""
End-to-end test for AI Concierge with RAG integration

Tests the complete flow:
1. User query → RAG retrieval → Context injection → LLM response
"""

import os
import sys
from pathlib import Path
import asyncio

# Add services to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "services"))

# Set environment variables
os.environ["TOGETHER_API_KEY"] = os.getenv("TOGETHER_API_KEY", "")
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/swipesavvy_agents")

async def test_rag_retrieval():
    """Test RAG service retrieval"""
    print("="*60)
    print("TEST 1: RAG Service Retrieval")
    print("="*60)
    
    from rag_service.embeddings import get_embedding_service
    
    # Initialize embedding service
    emb_service = get_embedding_service()
    print(f"✅ Embedding service initialized: {emb_service.model}")
    
    # Test query
    test_query = "How do I check my account balance?"
    embedding = emb_service.embed_text(test_query)
    print(f"✅ Generated embedding for query (dimension: {len(embedding)})")
    
    print(f"\nQuery: {test_query}")
    print(f"Embedding (first 5): {embedding[:5]}")
    
    return True


async def test_rag_context_assembly():
    """Test context assembly from RAG results"""
    print("\n" + "="*60)
    print("TEST 2: Context Assembly")
    print("="*60)
    
    # Mock RAG results
    from rag_service.main import RAGResult, assemble_context
    
    mock_results = [
        RAGResult(
            content="To check your account balance:\n1. Open SwipeSavvy app\n2. Balance shown on home screen\n3. Tap eye icon to reveal",
            similarity=0.85,
            title="How to Check Your Account Balance",
            category="accounts",
            chunk_id=1,
            metadata={}
        ),
        RAGResult(
            content="Alternative methods:\n- Home screen widget\n- Voice assistant (Siri/Google)\n- Smart watch",
            similarity=0.78,
            title="How to Check Your Account Balance",
            category="accounts",
            chunk_id=2,
            metadata={}
        )
    ]
    
    context = assemble_context(mock_results, "How do I check my balance?")
    
    print("✅ Context assembled successfully")
    print(f"\nAssembled Context:\n{'-'*60}\n{context}\n{'-'*60}")
    
    return True


async def test_concierge_chat():
    """Test full concierge chat with RAG integration"""
    print("\n" + "="*60)
    print("TEST 3: Full Concierge Chat Flow")
    print("="*60)
    
    if not os.getenv("TOGETHER_API_KEY"):
        print("⚠️  TOGETHER_API_KEY not set - skipping LLM test")
        return False
    
    from concierge_agent.main import ChatRequest, chat
    
    test_queries = [
        "How do I check my account balance?",
        "How can I send money to a friend?",
        "What security features does SwipeSavvy have?"
    ]
    
    for idx, query in enumerate(test_queries, 1):
        print(f"\n[Query {idx}] {query}")
        
        request = ChatRequest(
            user_id="test_user_123",
            message=query,
            session_id=f"test_session_{idx}"
        )
        
        try:
            response = await chat(request)
            print(f"✅ Response received:")
            print(f"{response.response[:200]}...")
            print(f"Session ID: {response.session_id}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False
    
    return True


async def run_all_tests():
    """Run all end-to-end tests"""
    print("\n" + "="*60)
    print("SwipeSavvy AI Agents - End-to-End Test Suite")
    print("="*60 + "\n")
    
    results = {
        "RAG Retrieval": await test_rag_retrieval(),
        "Context Assembly": await test_rag_context_assembly(),
        "Concierge Chat": await test_concierge_chat()
    }
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All tests passed!")
    else:
        print("\n⚠️  Some tests failed")
    
    return all_passed


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
