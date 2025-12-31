"""
Database migration script

Creates initial database schema for AI agents services:
- Session storage
- Conversation history
- User verification state
- Tool call logs
- Audit logs

Usage:
    python scripts/migrate.py
"""

import os
import sys
from datetime import datetime

# Database connection will be added in Week 2
# For now, this is a placeholder


def create_sessions_table():
    """Create sessions table for conversation state"""
    schema = """
    CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_verified BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
    );
    """
    print("Schema for sessions table:")
    print(schema)
    return schema


def create_messages_table():
    """Create messages table for conversation history"""
    schema = """
    CREATE TABLE IF NOT EXISTS messages (
        message_id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,  -- 'user', 'assistant', 'system'
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tool_calls JSONB,
        metadata JSONB,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        INDEX idx_session_id (session_id),
        INDEX idx_created_at (created_at)
    );
    """
    print("\nSchema for messages table:")
    print(schema)
    return schema


def create_tool_calls_table():
    """Create tool_calls table for audit trail"""
    schema = """
    CREATE TABLE IF NOT EXISTS tool_calls (
        call_id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        message_id INTEGER,
        tool_name VARCHAR(255) NOT NULL,
        arguments JSONB NOT NULL,
        result JSONB,
        status VARCHAR(50) NOT NULL,  -- 'success', 'error', 'pending'
        error_message TEXT,
        latency_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE SET NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_tool_name (tool_name),
        INDEX idx_created_at (created_at)
    );
    """
    print("\nSchema for tool_calls table:")
    print(schema)
    return schema


def create_verifications_table():
    """Create verifications table for identity checks"""
    schema = """
    CREATE TABLE IF NOT EXISTS verifications (
        verification_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        verification_type VARCHAR(50) NOT NULL,  -- 'sms_otp', 'email_otp'
        code_hash VARCHAR(255),  -- Hashed OTP code
        status VARCHAR(50) NOT NULL,  -- 'pending', 'verified', 'expired', 'failed'
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        verified_at TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_session_id (session_id),
        INDEX idx_status (status)
    );
    """
    print("\nSchema for verifications table:")
    print(schema)
    return schema


def create_audit_logs_table():
    """Create audit_logs table for compliance"""
    schema = """
    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        user_id VARCHAR(255),
        event_type VARCHAR(100) NOT NULL,  -- 'pii_masked', 'policy_violation', etc.
        event_data JSONB NOT NULL,
        severity VARCHAR(20) NOT NULL,  -- 'info', 'warning', 'error', 'critical'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_user_id (user_id),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
    );
    """
    print("\nSchema for audit_logs table:")
    print(schema)
    return schema


def create_handoffs_table():
    """Create handoffs table for human agent escalation"""
    schema = """
    CREATE TABLE IF NOT EXISTS handoffs (
        handoff_id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        reason VARCHAR(100) NOT NULL,
        priority VARCHAR(20) NOT NULL,  -- 'low', 'normal', 'high', 'urgent'
        status VARCHAR(50) NOT NULL,  -- 'pending', 'in_progress', 'completed', 'cancelled'
        context JSONB,
        agent_id VARCHAR(255),  -- Assigned human agent
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_at TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        INDEX idx_session_id (session_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
    );
    """
    print("\nSchema for handoffs table:")
    print(schema)
    return schema


def main():
    """Run all migrations"""
    print("=" * 80)
    print("AI Agents Database Migration Script")
    print("=" * 80)
    print(f"\nTimestamp: {datetime.utcnow().isoformat()}")
    print("\nNOTE: This is a preview script. Actual database connection")
    print("will be implemented in Week 2.")
    print("\n" + "=" * 80)
    
    # Create all tables
    create_sessions_table()
    create_messages_table()
    create_tool_calls_table()
    create_verifications_table()
    create_audit_logs_table()
    create_handoffs_table()
    
    print("\n" + "=" * 80)
    print("Migration preview complete!")
    print("\nNext steps:")
    print("1. Provision PostgreSQL database (Week 1)")
    print("2. Update .env with DATABASE_URL")
    print("3. Install psycopg2: pip install psycopg2-binary")
    print("4. Run this script again to create tables")
    print("=" * 80)


if __name__ == "__main__":
    main()
