"""
Phase 4 Database Schema Additions - CORRECTED FOR POSTGRESQL
Purpose: Tables and indexes for analytics, A/B testing, and optimization
Tech: PostgreSQL (CORRECTED - was MySQL syntax)
Created: December 26, 2025
Fixed: December 28, 2025
"""

-- ═════════════════════════════════════════════════════════════════════════════
-- ANALYTICS TABLES
-- ═════════════════════════════════════════════════════════════════════════════

-- Daily campaign performance snapshots
CREATE TABLE IF NOT EXISTS campaign_analytics_daily (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    date DATE NOT NULL,
    
    -- Metrics
    impressions INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    cost DECIMAL(10, 2) DEFAULT 0,
    
    -- Calculated rates
    view_rate DECIMAL(6, 4) DEFAULT 0,
    click_through_rate DECIMAL(6, 4) DEFAULT 0,
    conversion_rate DECIMAL(6, 4) DEFAULT 0,
    revenue_per_impression DECIMAL(8, 4) DEFAULT 0,
    cost_per_acquisition DECIMAL(10, 2) DEFAULT 0,
    return_on_ad_spend DECIMAL(8, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, date)
);

-- Campaign performance by user segment
CREATE TABLE IF NOT EXISTS campaign_segment_analytics (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    segment_name VARCHAR(100) NOT NULL,
    
    -- Metrics
    users_reached INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- Calculated
    conversion_rate DECIMAL(6, 4) DEFAULT 0,
    average_revenue_per_user DECIMAL(10, 2) DEFAULT 0,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, segment_name)
);

-- Campaign trend data (hourly/daily)
CREATE TABLE IF NOT EXISTS campaign_trend_data (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    period TIMESTAMP NOT NULL,
    granularity VARCHAR(20) DEFAULT 'daily',  -- 'hourly', 'daily', 'weekly'
    
    -- Metrics
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- Calculated
    conversion_rate DECIMAL(6, 4) DEFAULT 0,
    
    UNIQUE(campaign_id, period, granularity)
);

-- ═════════════════════════════════════════════════════════════════════════════
-- A/B TESTING TABLES
-- ═════════════════════════════════════════════════════════════════════════════

-- A/B test definitions
CREATE TABLE IF NOT EXISTS ab_tests (
    id BIGSERIAL PRIMARY KEY,
    test_id VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    
    -- Campaigns
    control_campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    variant_campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    
    -- Configuration
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft',
    
    -- Statistics
    hypothesis TEXT,
    sample_size INTEGER,
    confidence_level FLOAT DEFAULT 95.0,
    minimum_effect_size FLOAT DEFAULT 10.0,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_ab_status CHECK (status IN ('draft', 'running', 'completed', 'paused', 'archived'))
);

-- User assignments to test variants
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    assigned_group VARCHAR(100) NOT NULL,  -- 'control' or 'variant'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A/B test results and statistical analysis
CREATE TABLE IF NOT EXISTS ab_test_results (
    id BIGSERIAL PRIMARY KEY,
    test_id BIGINT NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant_name VARCHAR(100),
    
    -- Metrics
    users_count INTEGER,
    conversions INTEGER,
    conversion_rate DECIMAL(6, 4),
    revenue DECIMAL(10, 2),
    average_order_value DECIMAL(10, 2),
    
    -- Statistical Analysis
    statistical_significance FLOAT,
    p_value FLOAT,
    confidence_interval_lower FLOAT,
    confidence_interval_upper FLOAT,
    
    winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE (CORRECTED POSTGRESQL SYNTAX)
-- ═════════════════════════════════════════════════════════════════════════════

-- Analytics Indexes
CREATE INDEX idx_analytics_campaign_date ON campaign_analytics_daily(campaign_id, date);
CREATE INDEX idx_analytics_date ON campaign_analytics_daily(date);
CREATE INDEX idx_segment_analytics_campaign ON campaign_segment_analytics(campaign_id);
CREATE INDEX idx_segment_analytics_segment ON campaign_segment_analytics(segment_name);

-- A/B Testing Indexes
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_created_at ON ab_tests(created_at);
CREATE INDEX idx_ab_test_assignments_test_id ON ab_test_assignments(test_id);
CREATE INDEX idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_results_test_id ON ab_test_results(test_id);

-- Trend Data Indexes
CREATE INDEX idx_trend_campaign ON campaign_trend_data(campaign_id);
CREATE INDEX idx_trend_period ON campaign_trend_data(period);

-- ═════════════════════════════════════════════════════════════════════════════
-- DEPLOYMENT NOTES
-- ═════════════════════════════════════════════════════════════════════════════
--
-- This file has been CORRECTED from the original phase_4_schema.sql which had:
-- ✅ FIXED: MySQL "INDEX idx_name (columns)" → PostgreSQL "CREATE INDEX idx_name ON table(columns)"
-- ✅ FIXED: All index definitions now use proper PostgreSQL syntax
--
-- Deployment Order:
-- 1. Run 01_FIX_CRITICAL_SCHEMA_ISSUES.sql (creates users and campaigns tables)
-- 2. Run swipesavvy_complete_schema.sql (main schema)
-- 3. Run feature_flags_schema.sql (feature management)
-- 4. Run THIS FILE - phase_4_schema.sql (corrected version)
-- 5. Run merchants_schema.sql (merchant network)
--
-- ═════════════════════════════════════════════════════════════════════════════
