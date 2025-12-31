-- Initialize pgvector extension and create knowledge base schema
-- This script runs automatically when PostgreSQL container starts

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base documents table
CREATE TABLE IF NOT EXISTS kb_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base chunks table (for RAG retrieval)
CREATE TABLE IF NOT EXISTS kb_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES kb_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI ada-002 dimension
    token_count INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique chunks per document
    UNIQUE(document_id, chunk_index)
);

-- Index for vector similarity search (HNSW for better performance)
CREATE INDEX IF NOT EXISTS kb_chunks_embedding_idx 
ON kb_chunks USING hnsw (embedding vector_cosine_ops);

-- Index for filtering by document
CREATE INDEX IF NOT EXISTS kb_chunks_document_id_idx 
ON kb_chunks(document_id);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS kb_documents_category_idx 
ON kb_documents(category);

-- Function to search knowledge base by semantic similarity
CREATE OR REPLACE FUNCTION search_kb(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5,
    filter_category VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    chunk_id INTEGER,
    document_id INTEGER,
    title VARCHAR,
    content TEXT,
    category VARCHAR,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS chunk_id,
        c.document_id,
        d.title,
        c.content,
        d.category,
        1 - (c.embedding <=> query_embedding) AS similarity,
        c.metadata
    FROM kb_chunks c
    JOIN kb_documents d ON c.document_id = d.id
    WHERE 
        1 - (c.embedding <=> query_embedding) > match_threshold
        AND (filter_category IS NULL OR d.category = filter_category)
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Insert sample knowledge base document
INSERT INTO kb_documents (title, content, category, subcategory, url) VALUES
(
    'How to Check Your Account Balance',
    'To check your account balance in SwipeSavvy:

1. Open the SwipeSavvy mobile app
2. Log in with your credentials or biometric authentication
3. Your balance is displayed prominently on the home screen
4. Tap "Accounts" to see detailed balance breakdowns
5. Pull down to refresh and see real-time balance updates

You can also:
- Use the balance widget on your phone home screen
- Ask Siri/Google Assistant "What''s my SwipeSavvy balance?"
- Check balance in notifications after transactions

For security, balance is hidden by default with asterisks. Tap to reveal.',
    'accounts',
    'balance',
    '/help/accounts/check-balance'
),
(
    'Transaction History and Search',
    'View and search your transaction history in SwipeSavvy:

**Viewing Transactions:**
1. Open the app and tap "Transactions" tab
2. See all transactions sorted by date (newest first)
3. Swipe down to load older transactions
4. Tap any transaction for full details

**Search and Filter:**
- Use the search bar to find transactions by merchant, amount, or description
- Filter by date range using the calendar icon
- Filter by category (groceries, dining, transportation, etc.)
- Filter by transaction type (debit, credit, transfer)

**Export Transactions:**
- Tap the export icon (top right)
- Choose format: CSV, PDF, or email
- Select date range
- Transactions are sent to your registered email

Transaction history is available for up to 7 years.',
    'transactions',
    'history',
    '/help/transactions/history'
),
(
    'Security and Privacy Features',
    'SwipeSavvy security features keep your money and data safe:

**Authentication:**
- Biometric login (Face ID, Touch ID, fingerprint)
- 6-digit PIN as backup
- Two-factor authentication (2FA) via SMS or authenticator app

**Transaction Security:**
- Real-time fraud monitoring
- Instant transaction notifications
- Ability to freeze/unfreeze card instantly
- Set spending limits and controls

**Data Protection:**
- End-to-end encryption for all data
- PCI-DSS Level 1 certified
- No sharing of personal data without consent
- GDPR and CCPA compliant

**Account Protection:**
- Automatic logout after inactivity
- Device authorization required
- Suspicious activity alerts
- One-tap emergency account freeze

**Privacy Controls:**
- Hide balance on home screen
- Customize notification privacy
- Control what data is shared
- Delete account and data anytime',
    'security',
    'privacy',
    '/help/security/features'
);

-- Create a test search (commented out, use for verification)
-- SELECT * FROM search_kb(
--     (SELECT embedding FROM kb_chunks LIMIT 1),
--     0.5,
--     3,
--     'accounts'
-- );

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
