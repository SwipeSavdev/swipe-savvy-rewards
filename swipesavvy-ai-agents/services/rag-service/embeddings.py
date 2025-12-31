"""
Embedding service for RAG system

Supports both OpenAI and local sentence-transformers models
"""

import os
from typing import List, Dict, Any
import tiktoken

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class EmbeddingService:
    """Generate embeddings for RAG retrieval"""
    
    def __init__(self, provider: str = "sentence-transformers", model: str = None):
        """
        Initialize embedding service
        
        Args:
            provider: "openai" or "sentence-transformers"
            model: Model name (optional, uses defaults)
        """
        self.provider = provider
        
        if provider == "openai":
            if not OPENAI_AVAILABLE:
                raise ImportError("OpenAI not installed. Run: pip install openai")
            self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self.model = model or "text-embedding-3-small"  # 1536 dimensions, cheaper
            self.dimension = 1536
            
        elif provider == "sentence-transformers":
            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                raise ImportError("sentence-transformers not installed")
            # Using all-MiniLM-L6-v2: fast, 384 dimensions, good quality
            self.model = model or "all-MiniLM-L6-v2"
            self.encoder = SentenceTransformer(self.model)
            self.dimension = self.encoder.get_sentence_embedding_dimension()
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text to embed
            
        Returns:
            List of floats (embedding vector)
        """
        if self.provider == "openai":
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        
        elif self.provider == "sentence-transformers":
            embedding = self.encoder.encode(text, convert_to_numpy=True)
            return embedding.tolist()
    
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts (more efficient)
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        if self.provider == "openai":
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            return [item.embedding for item in response.data]
        
        elif self.provider == "sentence-transformers":
            embeddings = self.encoder.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
    
    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text (for chunking)
        
        Args:
            text: Text to count tokens
            
        Returns:
            Token count
        """
        if self.provider == "openai":
            encoding = tiktoken.encoding_for_model("gpt-4")
        else:
            # Approximate for sentence-transformers
            encoding = tiktoken.get_encoding("cl100k_base")
        
        return len(encoding.encode(text))
    
    def get_dimension(self) -> int:
        """Get embedding dimension"""
        return self.dimension


# Convenience functions
def get_embedding_service(provider: str = None) -> EmbeddingService:
    """
    Get embedding service with automatic provider selection
    
    Tries OpenAI if key available, else falls back to sentence-transformers
    """
    if provider:
        return EmbeddingService(provider=provider)
    
    # Auto-select provider
    if os.getenv("OPENAI_API_KEY") and OPENAI_AVAILABLE:
        print("Using OpenAI embeddings (text-embedding-3-small)")
        return EmbeddingService(provider="openai")
    elif SENTENCE_TRANSFORMERS_AVAILABLE:
        print("Using local sentence-transformers (all-MiniLM-L6-v2)")
        return EmbeddingService(provider="sentence-transformers")
    else:
        raise RuntimeError("No embedding provider available. Install openai or sentence-transformers")


if __name__ == "__main__":
    # Test embedding service
    print("Testing Embedding Service\n")
    
    # Test sentence-transformers (local, free)
    print("1. Testing sentence-transformers...")
    emb_service = EmbeddingService(provider="sentence-transformers")
    
    test_text = "How do I check my account balance?"
    embedding = emb_service.embed_text(test_text)
    
    print(f"   Text: {test_text}")
    print(f"   Dimension: {emb_service.get_dimension()}")
    print(f"   Embedding (first 5): {embedding[:5]}")
    print(f"   Token count: {emb_service.count_tokens(test_text)}")
    
    # Test batch
    texts = [
        "How do I check my balance?",
        "Send money to a friend",
        "Report a fraudulent transaction"
    ]
    embeddings = emb_service.embed_batch(texts)
    print(f"\n   Batch embedding: {len(embeddings)} texts embedded")
    
    print("\n✅ Embedding service working correctly!")
    print(f"   Provider: {emb_service.provider}")
    print(f"   Model: {emb_service.model}")
    print(f"   Dimension: {emb_service.dimension}")
