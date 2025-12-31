"""
RAG Service - Retrieval-Augmented Generation

Provides knowledge base retrieval functionality using vector search.

Architecture:
- Vector database (pgvector with PostgreSQL)
- Embedding generation (sentence-transformers local or OpenAI)
- Semantic search and reranking
- Context assembly for LLM prompts

Status: Phase 1, Week 2-3 - Active Development
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import sys
from pathlib import Path

# Add parent directory for imports
sys.path.insert(0, str(Path(__file__).parent))

from embeddings import get_embedding_service

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
    print("⚠️  PostgreSQL driver not available - running in mock mode")

app = FastAPI(
    title="SwipeSavvy RAG Service",
    description="Knowledge base retrieval for AI agents",
    version="0.1.0"
)

# Global instances
db_connection = None
embedding_service = None


class RAGQuery(BaseModel):
    """Request model for RAG query"""
    query: str
    top_k: int = 5
    min_similarity: float = 0.5
    category_filter: Optional[str] = None


class RAGResult(BaseModel):
    """Single retrieval result"""
    content: str
    similarity: float
    title: str
    category: str
    chunk_id: int
    metadata: Dict[str, Any] = {}


class RAGResponse(BaseModel):
    """Response model for RAG query"""
    results: List[RAGResult]
    total_results: int
    context: str  # Assembled context for LLM


class ContextRequest(BaseModel):
    """Request for context assembly"""
    query: str
    max_tokens: int = 2000
    top_k: int = 3
    category_filter: Optional[str] = None


def get_db_connection():
    """Get PostgreSQL connection"""
    global db_connection
    if db_connection is None or db_connection.closed:
        db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/swipesavvy_agents")
        db_connection = psycopg2.connect(db_url)
    return db_connection


def get_embedding_service_instance():
    """Get or create embedding service"""
    global embedding_service
    if embedding_service is None:
        embedding_service = get_embedding_service()
    return embedding_service


def assemble_context(results: List[RAGResult], query: str) -> str:
    """
    Assemble retrieved results into context for LLM prompt
    
    Format:
    [Source 1: Title - Category]
    Content...
    
    [Source 2: Title - Category]
    Content...
    """
    if not results:
        return "No relevant knowledge base information found."
    
    context_parts = []
    for i, result in enumerate(results, 1):
        context_parts.append(
            f"[Source {i}: {result.title} - {result.category}]\n{result.content}\n"
        )
    
    return "\n".join(context_parts)


@app.get("/")
async def index():
    """Service information"""
    return {
        "service": "SwipeSavvy RAG Service",
        "version": "0.1.0",
        "status": "active",
        "endpoints": [
            "GET /health - Health check",
            "POST /api/v1/rag/query - Semantic search",
            "POST /api/v1/rag/context - Context assembly"
        ]
    }


@app.get("/health")
async def health():
    """Health check with database stats"""
    emb = get_embedding_service_instance()
    
    health_data = {
        "status": "healthy",
        "embedding_service": emb.model,
        "embedding_dimension": emb.dimension,
        "postgres_available": POSTGRES_AVAILABLE
    }
    
    # Check database if available
    if POSTGRES_AVAILABLE:
        try:
            conn = get_db_connection()
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Count documents
                cur.execute("SELECT COUNT(*) as count FROM kb_documents")
                kb_docs = cur.fetchone()['count']
                
                # Count chunks
                cur.execute("SELECT COUNT(*) as count FROM kb_chunks")
                kb_chunks = cur.fetchone()['count']
                
                health_data["knowledge_base"] = {
                    "documents": kb_docs,
                    "chunks": kb_chunks
                }
        except Exception as e:
            health_data["database_error"] = str(e)
    
    return health_data


@app.post("/api/v1/rag/query")
async def query(request: RAGQuery) -> RAGResponse:
    """
    Semantic search over knowledge base
    
    Uses pgvector for cosine similarity search
    Returns top-k most relevant chunks with metadata
    """
    if not POSTGRES_AVAILABLE:
        raise HTTPException(status_code=503, detail="PostgreSQL not available")
    
    # Get embedding for query
    emb = get_embedding_service_instance()
    query_embedding = emb.embed_text(request.query)
    
    # Convert to PostgreSQL array format
    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
    
    # Execute vector search
    conn = get_db_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        sql = """
            SELECT 
                c.id as chunk_id,
                c.content,
                c.metadata,
                d.title,
                d.category,
                1 - (c.embedding <=> %s::vector) as similarity
            FROM kb_chunks c
            JOIN kb_documents d ON c.document_id = d.id
            WHERE 1=1
        """
        params = [embedding_str]
        
        # Optional category filter
        if request.category_filter:
            sql += " AND d.category = %s"
            params.append(request.category_filter)
        
        # Order by similarity and limit
        sql += " ORDER BY c.embedding <=> %s::vector LIMIT %s"
        params.extend([embedding_str, request.top_k])
        
        cur.execute(sql, params)
        rows = cur.fetchall()
    
    # Convert to results
    results = []
    for row in rows:
        if row['similarity'] >= request.min_similarity:
            results.append(RAGResult(
                content=row['content'],
                similarity=row['similarity'],
                title=row['title'],
                category=row['category'],
                chunk_id=row['chunk_id'],
                metadata=row.get('metadata', {})
            ))
    
    # Assemble context
    context = assemble_context(results, request.query)
    
    return RAGResponse(
        results=results,
        total_results=len(results),
        context=context
    )


@app.post("/api/v1/rag/context")
async def get_context(request: ContextRequest) -> Dict[str, Any]:
    """
    Get assembled context for LLM prompt
    
    Performs semantic search and formats results as context string
    optimized for LLM injection
    """
    # Call query endpoint
    query_request = RAGQuery(
        query=request.query,
        top_k=request.top_k,
        category_filter=request.category_filter
    )
    
    response = await query(query_request)
    
    return {
        "query": request.query,
        "context": response.context,
        "num_sources": len(response.results),
        "sources": [
            {
                "title": r.title,
                "category": r.category,
                "similarity": r.similarity
            }
            for r in response.results
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
