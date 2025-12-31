-- SwipeSavvy Database Schema
-- Created: 2025-12-29
-- PostgreSQL 14.20

-- ============================================
-- swipesavvy_dev Database Tables
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'support', 'user', 'merchant')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'admin' CHECK (role IN ('admin', 'support_manager', 'analyst', 'viewer')),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
ALTER TABLE admin_users ADD CONSTRAINT fk_admin_users_created_by 
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    country VARCHAR(100),
    location VARCHAR(255),
    business_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    transaction_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 100.00,
    monthly_volume DECIMAL(15, 2) DEFAULT 0.00,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merchants_status ON merchants(status);
CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
CREATE INDEX IF NOT EXISTS idx_merchants_join_date ON merchants(join_date);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets(customer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
ALTER TABLE support_tickets ADD CONSTRAINT fk_tickets_assigned_to 
    FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    environment VARCHAR(50) DEFAULT 'development' CHECK (environment IN ('development', 'staging', 'production')),
    targeted_users TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_flags_name ON feature_flags(name);
CREATE INDEX IF NOT EXISTS idx_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_flags_environment ON feature_flags(environment);
ALTER TABLE feature_flags ADD CONSTRAINT fk_flags_created_by 
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- AI Campaigns Table
CREATE TABLE IF NOT EXISTS ai_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) DEFAULT 'email',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    budget DECIMAL(15, 2) DEFAULT 0.00,
    spent DECIMAL(15, 2) DEFAULT 0.00,
    roi DECIMAL(6, 2) DEFAULT 0.00,
    conversions INTEGER DEFAULT 0,
    engagement DECIMAL(5, 2) DEFAULT 0.00,
    audience_size INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON ai_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON ai_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON ai_campaigns(start_date);
ALTER TABLE ai_campaigns ADD CONSTRAINT fk_campaigns_created_by 
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) DEFAULT 'create' CHECK (action_type IN ('create', 'read', 'update', 'delete', 'login', 'logout')),
    resource_type VARCHAR(100),
    resource_id UUID,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    changes JSONB,
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_action ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_logs_created ON audit_logs(created_at);
ALTER TABLE audit_logs ADD CONSTRAINT fk_logs_user 
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    UNIQUE(category, key)
);

CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);
ALTER TABLE settings ADD CONSTRAINT fk_settings_created_by 
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Dashboard Analytics Table
CREATE TABLE IF NOT EXISTS dashboard_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) DEFAULT 'counter',
    period_date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(15, 2) DEFAULT 0.00,
    average_transaction DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_period ON dashboard_analytics(period_date);
CREATE INDEX IF NOT EXISTS idx_analytics_metric ON dashboard_analytics(metric_name);

-- ============================================
-- swipesavvy_ai Database Tables
-- ============================================

-- AI Campaign Details Table
CREATE TABLE IF NOT EXISTS campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spend DECIMAL(15, 2) DEFAULT 0.00,
    revenue DECIMAL(15, 2) DEFAULT 0.00,
    ctr DECIMAL(6, 4) DEFAULT 0.00,
    conversion_rate DECIMAL(6, 4) DEFAULT 0.00,
    roas DECIMAL(6, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_perf_campaign ON campaign_performance(campaign_id);
CREATE INDEX IF NOT EXISTS idx_perf_date ON campaign_performance(date);

-- AI Models Table
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    model_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    accuracy DECIMAL(5, 4),
    deployment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_models_name ON ai_models(name);
CREATE INDEX IF NOT EXISTS idx_models_status ON ai_models(status);

-- ============================================
-- swipesavvy_wallet Database Tables
-- ============================================

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_type VARCHAR(50) DEFAULT 'transfer' CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payment', 'refund')),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    recipient_id UUID,
    payment_method VARCHAR(100),
    reference_number VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_ref ON wallet_transactions(reference_number);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) DEFAULT 'card' CHECK (type IN ('card', 'bank_account', 'wallet', 'digital_wallet')),
    token VARCHAR(255),
    last_four VARCHAR(4),
    expiry_date DATE,
    is_default BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);

-- ============================================
-- Chat System Tables (Phase 10 Task 3)
-- ============================================

-- Chat Rooms Table (for group messaging)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('support', 'team', 'general', 'private')),
    is_active BOOLEAN DEFAULT true,
    is_private BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    allow_users BOOLEAN DEFAULT true,
    allow_files BOOLEAN DEFAULT true,
    allow_voice BOOLEAN DEFAULT false,
    allow_video BOOLEAN DEFAULT false,
    total_messages INTEGER DEFAULT 0,
    active_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_at ON chat_rooms(created_at);

-- Chat Sessions Table (conversation threads)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived', 'waiting')),
    initiator_id UUID NOT NULL,
    assigned_agent_id UUID,
    meta_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    closed_at TIMESTAMP,
    archived_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    rating INTEGER,
    feedback TEXT
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_initiator ON chat_sessions(initiator_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON chat_sessions(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_activity ON chat_sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_room ON chat_sessions(chat_room_id);

-- Chat Participants Table (user membership in sessions)
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'support_agent', 'admin')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    last_read_message_id UUID,
    last_read_at TIMESTAMP,
    muted BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_chat_participants_session ON chat_participants(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants_role ON chat_participants(role);

-- Chat Messages Table (individual messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'typing', 'system')),
    content TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_by_count INTEGER DEFAULT 0,
    reactions JSONB,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    mentions JSONB
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON chat_messages(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- Chat Typing Indicators Table (real-time typing notifications)
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    is_typing BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_typing_session ON chat_typing_indicators(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_user ON chat_typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_is_typing ON chat_typing_indicators(is_typing);

-- Chat Notification Preferences Table (per-user notification settings)
CREATE TABLE IF NOT EXISTS chat_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT false,
    sound_enabled BOOLEAN DEFAULT true,
    notify_all BOOLEAN DEFAULT true,
    notify_mentions_only BOOLEAN DEFAULT false,
    dnd_enabled BOOLEAN DEFAULT false,
    dnd_start VARCHAR(5),
    dnd_end VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_notif_user ON chat_notification_preferences(user_id);

-- Chat Blocked Users Table (privacy and safety)
CREATE TABLE IF NOT EXISTS chat_blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    blocked_user_id UUID NOT NULL,
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_blocked_user ON chat_blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_blocked_blocked_user ON chat_blocked_users(blocked_user_id);

-- Chat Audit Logs Table (compliance and monitoring)
CREATE TABLE IF NOT EXISTS chat_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL CHECK (action IN ('message_sent', 'session_started', 'session_closed', 'agent_assigned', 'message_edited', 'message_deleted', 'participant_added', 'participant_removed')),
    resource VARCHAR(50) NOT NULL CHECK (resource IN ('message', 'session', 'room', 'user')),
    resource_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_audit_session ON chat_audit_logs(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_user ON chat_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_audit_action ON chat_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_chat_audit_created_at ON chat_audit_logs(created_at);
