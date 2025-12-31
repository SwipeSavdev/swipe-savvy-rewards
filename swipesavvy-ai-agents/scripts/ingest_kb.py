#!/usr/bin/env python3
"""
RAG Knowledge Base Ingestion Pipeline

Reads markdown files from knowledge-base/, chunks them, generates embeddings,
and stores in PostgreSQL with pgvector for semantic search.
"""

import os
import sys
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
import psycopg2
from psycopg2.extras import execute_values

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.rag_service.embeddings import get_embedding_service


def parse_markdown_frontmatter(content: str) -> Tuple[Dict[str, Any], str]:
    """
    Extract frontmatter and content from markdown file
    
    Returns:
        (metadata_dict, content_without_frontmatter)
    """
    metadata = {}
    
    # Check for YAML frontmatter
    if content.startswith("---\n"):
        parts = content.split("---\n", 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            content = parts[2].strip()
            
            # Parse frontmatter
            for line in frontmatter.strip().split("\n"):
                if ":" in line:
                    key, value = line.split(":", 1)
                    key = key.strip()
                    value = value.strip()
                    
                    # Handle lists
                    if value.startswith("[") and value.endswith("]"):
                        value = [v.strip().strip("'\"") for v in value[1:-1].split(",")]
                    
                    metadata[key] = value
    
    return metadata, content


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks for better retrieval
    
    Args:
        text: Text to chunk
        chunk_size: Target tokens per chunk
        overlap: Overlapping tokens between chunks
        
    Returns:
        List of text chunks
    """
    # Split by paragraphs first (preserves semantic meaning)
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    
    chunks = []
    current_chunk = []
    current_size = 0
    
    emb_service = get_embedding_service()
    
    for para in paragraphs:
        para_tokens = emb_service.count_tokens(para)
        
        if current_size + para_tokens > chunk_size and current_chunk:
            # Save current chunk
            chunks.append("\n\n".join(current_chunk))
            
            # Start new chunk with overlap (keep last paragraph)
            if len(current_chunk) > 1:
                current_chunk = [current_chunk[-1], para]
                current_size = emb_service.count_tokens(current_chunk[-1]) + para_tokens
            else:
                current_chunk = [para]
                current_size = para_tokens
        else:
            current_chunk.append(para)
            current_size += para_tokens
    
    # Add final chunk
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
    
    return chunks


def load_knowledge_base_files(kb_dir: Path) -> List[Dict[str, Any]]:
    """
    Load all markdown files from knowledge base directory
    
    Returns:
        List of documents with metadata and content
    """
    documents = []
    
    for md_file in kb_dir.glob("*.md"):
        print(f"  Loading: {md_file.name}")
        
        with open(md_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        metadata, content = parse_markdown_frontmatter(content)
        
        doc = {
            "title": metadata.get("title", md_file.stem.replace("-", " ").title()),
            "content": content,
            "category": metadata.get("category", "general"),
            "subcategory": metadata.get("subcategory", ""),
            "url": f"/help/{metadata.get('category', 'general')}/{md_file.stem}",
            "metadata": metadata
        }
        
        documents.append(doc)
    
    return documents


def ingest_to_database(documents: List[Dict[str, Any]], db_url: str):
    """
    Ingest documents into PostgreSQL with embeddings
    
    Args:
        documents: List of documents to ingest
        db_url: PostgreSQL connection string
    """
    print(f"\nConnecting to database...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Initialize embedding service
    emb_service = get_embedding_service()
    print(f"Using embedding model: {emb_service.model} (dimension: {emb_service.dimension})")
    
    # Check if we need to update vector dimension
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='kb_chunks' AND column_name='embedding'")
    result = cur.fetchone()
    if result:
        # Extract dimension from vector(N)
        current_dim = int(result[1].split("(")[1].split(")")[0])
        if current_dim != emb_service.dimension:
            print(f"⚠️  Updating vector dimension from {current_dim} to {emb_service.dimension}")
            cur.execute(f"ALTER TABLE kb_chunks ALTER COLUMN embedding TYPE vector({emb_service.dimension})")
            conn.commit()
    
    # Clear existing data
    print("Clearing existing knowledge base...")
    cur.execute("TRUNCATE kb_documents CASCADE")
    conn.commit()
    
    total_chunks = 0
    
    for doc_idx, doc in enumerate(documents, 1):
        print(f"\n[{doc_idx}/{len(documents)}] Processing: {doc['title']}")
        
        # Insert document
        cur.execute("""
            INSERT INTO kb_documents (title, content, category, subcategory, url, metadata)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            doc["title"],
            doc["content"],
            doc["category"],
            doc["subcategory"],
            doc["url"],
            psycopg2.extras.Json(doc["metadata"])
        ))
        
        doc_id = cur.fetchone()[0]
        
        # Chunk content
        chunks = chunk_text(doc["content"])
        print(f"  Created {len(chunks)} chunks")
        
        # Generate embeddings in batch
        print(f"  Generating embeddings...")
        embeddings = emb_service.embed_batch(chunks)
        
        # Prepare chunk data
        chunk_data = []
        for chunk_idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            token_count = emb_service.count_tokens(chunk)
            chunk_data.append((
                doc_id,
                chunk_idx,
                chunk,
                embedding,
                token_count,
                psycopg2.extras.Json({})
            ))
        
        # Insert chunks
        execute_values(
            cur,
            """
            INSERT INTO kb_chunks (document_id, chunk_index, content, embedding, token_count, metadata)
            VALUES %s
            """,
            chunk_data
        )
        
        total_chunks += len(chunks)
        print(f"  ✅ Inserted {len(chunks)} chunks")
    
    conn.commit()
    
    # Print summary
    cur.execute("SELECT COUNT(*) FROM kb_documents")
    doc_count = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM kb_chunks")
    chunk_count = cur.fetchone()[0]
    
    print(f"\n{'='*60}")
    print(f"✅ Ingestion Complete!")
    print(f"{'='*60}")
    print(f"Documents ingested: {doc_count}")
    print(f"Total chunks: {chunk_count}")
    print(f"Embedding dimension: {emb_service.dimension}")
    print(f"Model: {emb_service.model}")
    
    cur.close()
    conn.close()


def test_search(db_url: str, query: str = "How do I check my balance?"):
    """
    Test semantic search on ingested knowledge base
    """
    print(f"\n{'='*60}")
    print(f"Testing Semantic Search")
    print(f"{'='*60}")
    print(f"Query: {query}\n")
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Generate query embedding
    emb_service = get_embedding_service()
    query_embedding = emb_service.embed_text(query)
    
    # Search using pgvector similarity
    cur.execute("""
        SELECT 
            c.id,
            d.title,
            c.content,
            d.category,
            1 - (c.embedding <=> %s::vector) AS similarity
        FROM kb_chunks c
        JOIN kb_documents d ON c.document_id = d.id
        ORDER BY c.embedding <=> %s::vector
        LIMIT 3
    """, (query_embedding, query_embedding))
    
    results = cur.fetchall()
    
    for idx, (chunk_id, title, content, category, similarity) in enumerate(results, 1):
        print(f"Result {idx}:")
        print(f"  Title: {title}")
        print(f"  Category: {category}")
        print(f"  Similarity: {similarity:.3f}")
        print(f"  Content: {content[:200]}...")
        print()
    
    cur.close()
    conn.close()


if __name__ == "__main__":
    # Configuration
    KB_DIR = Path(__file__).parent.parent / "knowledge-base"
    DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/swipesavvy_agents")
    
    print("="*60)
    print("SwipeSavvy RAG Knowledge Base Ingestion")
    print("="*60)
    
    # Load documents
    print(f"\nLoading knowledge base from: {KB_DIR}")
    documents = load_knowledge_base_files(KB_DIR)
    print(f"Found {len(documents)} documents")
    
    # Ingest to database
    ingest_to_database(documents, DB_URL)
    
    # Test search
    test_search(DB_URL)
    
    print("\n✅ All done! Knowledge base is ready for RAG.")
