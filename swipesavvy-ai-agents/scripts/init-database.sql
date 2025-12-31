-- SwipeSavvy AI Agents - Database Schema
-- Phase 1, Week 4: Core tables for accounts and transactions
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(50) DEFAULT 'pending',
    
    -- Security
    password_hash TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- =====================================================
-- ACCOUNTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Account details
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50) DEFAULT 'checking' NOT NULL,
    account_name VARCHAR(100),
    
    -- Balances (stored in cents for precision)
    balance BIGINT DEFAULT 0 NOT NULL,
    available_balance BIGINT DEFAULT 0 NOT NULL,
    pending_balance BIGINT DEFAULT 0 NOT NULL,
    
    -- Currency
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Limits
    daily_spend_limit BIGINT DEFAULT 500000, -- $5,000 in cents
    daily_transfer_limit BIGINT DEFAULT 1000000, -- $10,000 in cents
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for accounts
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL, -- Stored in cents
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Accounts
    from_account_id UUID REFERENCES accounts(id),
    to_account_id UUID REFERENCES accounts(id),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- External references
    external_transaction_id VARCHAR(100),
    payment_method VARCHAR(50),
    payment_processor VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    settled_at TIMESTAMP WITH TIME ZONE,
    
    -- Description
    description TEXT,
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    category VARCHAR(100),
    
    -- Location
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_country VARCHAR(3) DEFAULT 'USA',
    
    -- Reconciliation
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT check_amount_positive CHECK (amount > 0),
    CONSTRAINT check_accounts_different CHECK (
        from_account_id IS NULL OR 
        to_account_id IS NULL OR 
        from_account_id != to_account_id
    )
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_name) WHERE merchant_name IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(from_account_id, created_at DESC) WHERE deleted_at IS NULL;

-- GIN index for metadata and tags
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON transactions USING GIN (tags);

-- =====================================================
-- LEDGER ENTRIES TABLE (Double-entry bookkeeping)
-- =====================================================
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Entry details
    entry_type VARCHAR(10) NOT NULL, -- DEBIT or CREDIT
    account_id UUID NOT NULL REFERENCES accounts(id),
    amount BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Balance tracking
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    
    -- Metadata
    posting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_entry_type CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    CONSTRAINT check_ledger_amount_positive CHECK (amount > 0),
    CONSTRAINT check_balance_calculation CHECK (
        (entry_type = 'CREDIT' AND balance_after = balance_before + amount) OR
        (entry_type = 'DEBIT' AND balance_after = balance_before - amount)
    )
);

-- Indexes for ledger_entries
CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id, posting_date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_date ON ledger_entries(posting_date DESC);

-- =====================================================
-- SESSIONS TABLE (For chat sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session details
    session_type VARCHAR(50) DEFAULT 'concierge',
    status VARCHAR(50) DEFAULT 'active',
    
    -- Metadata
    conversation_history JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- Account balance view with pending transactions
CREATE OR REPLACE VIEW account_summary_view AS
SELECT
    a.id AS account_id,
    a.account_number,
    a.user_id,
    a.account_type,
    a.balance,
    a.available_balance,
    a.currency,
    a.status,
    COALESCE(SUM(CASE WHEN t.status = 'pending' THEN t.amount ELSE 0 END), 0) AS pending_amount,
    COUNT(t.id) FILTER (WHERE t.created_at >= CURRENT_DATE) AS transactions_today,
    MAX(t.created_at) AS last_transaction_at,
    a.created_at AS account_created_at
FROM accounts a
LEFT JOIN transactions t ON (t.from_account_id = a.id OR t.to_account_id = a.id)
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.account_number, a.user_id, a.account_type, a.balance, a.available_balance, a.currency, a.status, a.created_at;

-- User transaction summary
CREATE OR REPLACE VIEW user_transaction_summary AS
SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    u.last_name,
    COUNT(t.id) AS total_transactions,
    COUNT(t.id) FILTER (WHERE t.created_at >= CURRENT_DATE) AS transactions_today,
    COUNT(t.id) FILTER (WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days') AS transactions_last_30_days,
    COALESCE(SUM(t.amount) FILTER (WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) AS spend_last_30_days,
    MAX(t.created_at) AS last_transaction_at
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'User accounts with authentication and profile information';
COMMENT ON TABLE accounts IS 'Financial accounts (checking, savings) linked to users';
COMMENT ON TABLE transactions IS 'All financial transactions with full audit trail';
COMMENT ON TABLE ledger_entries IS 'Double-entry bookkeeping ledger for transaction integrity';
COMMENT ON TABLE chat_sessions IS 'AI agent conversation sessions';

COMMENT ON COLUMN accounts.balance IS 'Current balance in cents (e.g., $100.00 = 10000)';
COMMENT ON COLUMN accounts.available_balance IS 'Available balance excluding pending holds, in cents';
COMMENT ON COLUMN transactions.amount IS 'Transaction amount in cents';
COMMENT ON COLUMN ledger_entries.entry_type IS 'DEBIT (decrease balance) or CREDIT (increase balance)';
