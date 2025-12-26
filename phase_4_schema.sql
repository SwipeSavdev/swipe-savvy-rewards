"""
Phase 4 Database Schema Additions
Purpose: Tables and indexes for analytics, A/B testing, and optimization
Tech: PostgreSQL
Created: December 26, 2025
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
    
    UNIQUE(campaign_id, date),
    INDEX idx_analytics_campaign_date (campaign_id, date),
    INDEX idx_analytics_date (date)
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
    
    UNIQUE(campaign_id, segment_name),
    INDEX idx_segment_analytics_campaign (campaign_id),
    INDEX idx_segment_analytics_segment (segment_name)
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
    
    UNIQUE(campaign_id, period, granularity),
    INDEX idx_trend_campaign (campaign_id),
    INDEX idx_trend_period (period)
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
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    target_sample_size INTEGER DEFAULT 1000,
    confidence_level DECIMAL(3, 2) DEFAULT 0.95,  -- 0.90, 0.95, 0.99
    minimum_effect_size DECIMAL(5, 4) DEFAULT 0.10,  -- 10% improvement
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'running',  -- 'running', 'completed', 'paused'
    
    -- Metadata
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tests_active (is_active),
    INDEX idx_tests_control (control_campaign_id),
    INDEX idx_tests_variant (variant_campaign_id)
);

-- A/B test user assignments (consistent hashing)
CREATE TABLE IF NOT EXISTS ab_test_assignments (
    id BIGSERIAL PRIMARY KEY,
    test_id VARCHAR(20) NOT NULL REFERENCES ab_tests(test_id),
    user_id VARCHAR(255) NOT NULL,
    assigned_group VARCHAR(20) NOT NULL,  -- 'control' or 'variant'
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(test_id, user_id),
    INDEX idx_assignment_test (test_id),
    INDEX idx_assignment_group (test_id, assigned_group)
);

-- A/B test results and analysis
CREATE TABLE IF NOT EXISTS ab_test_results (
    id BIGSERIAL PRIMARY KEY,
    test_id VARCHAR(20) NOT NULL REFERENCES ab_tests(test_id),
    
    -- Group performance
    control_conv_rate DECIMAL(6, 4),
    variant_conv_rate DECIMAL(6, 4),
    
    -- Statistical analysis
    p_value DECIMAL(6, 4),
    is_significant BOOLEAN DEFAULT FALSE,
    confidence_level VARCHAR(10) DEFAULT '95%',
    statistical_power DECIMAL(5, 3),
    
    -- Results
    improvement_percent DECIMAL(8, 2),
    winner VARCHAR(20),  -- 'control', 'variant', 'no_winner'
    recommendation TEXT,
    
    -- Metadata
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_results_test (test_id),
    INDEX idx_results_winner (winner)
);

-- ═════════════════════════════════════════════════════════════════════════════
-- ML OPTIMIZATION TABLES
-- ═════════════════════════════════════════════════════════════════════════════

-- ML model versions
CREATE TABLE IF NOT EXISTS ml_models (
    id BIGSERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,  -- 'conversion_predictor', 'send_time', etc
    
    -- Model data
    model_data BYTEA,
    scaler_data BYTEA,
    
    -- Training info
    training_samples INTEGER,
    training_r2_score DECIMAL(5, 4),
    training_mae DECIMAL(8, 4),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trained_at TIMESTAMP,
    
    UNIQUE(model_name, version),
    INDEX idx_models_active (is_active)
);

-- Feature importance tracking
CREATE TABLE IF NOT EXISTS model_feature_importance (
    id BIGSERIAL PRIMARY KEY,
    model_id BIGINT NOT NULL REFERENCES ml_models(id),
    feature_name VARCHAR(100) NOT NULL,
    importance_score DECIMAL(8, 4) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(model_id, feature_name),
    INDEX idx_feature_importance_model (model_id)
);

-- Campaign optimization recommendations
CREATE TABLE IF NOT EXISTS campaign_optimizations (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    
    -- Recommendation
    recommendation_type VARCHAR(100) NOT NULL,  -- 'offer_amount', 'timing', 'segment', 'channel'
    current_value VARCHAR(255),
    recommended_value VARCHAR(255),
    
    -- Analysis
    confidence_score DECIMAL(5, 4),
    expected_improvement DECIMAL(8, 2),
    reason TEXT,
    
    -- Status
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_optimizations_campaign (campaign_id),
    INDEX idx_optimizations_applied (is_applied),
    INDEX idx_optimizations_type (recommendation_type)
);

-- Offer optimization history (for learning)
CREATE TABLE IF NOT EXISTS offer_optimization_history (
    id BIGSERIAL PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(campaign_id),
    
    -- Offer details
    offer_amount DECIMAL(10, 2) NOT NULL,
    offer_type VARCHAR(50),  -- 'discount', 'cashback', 'freemium'
    
    -- Performance
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(6, 4),
    revenue DECIMAL(10, 2),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_offer_history_campaign (campaign_id),
    INDEX idx_offer_history_amount (offer_amount)
);

-- Send time optimization (user level)
CREATE TABLE IF NOT EXISTS user_optimal_send_times (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    
    -- Optimal time analysis
    optimal_hour INTEGER,  -- 0-23
    optimal_day_of_week INTEGER,  -- 0-6 (Mon-Sun)
    
    -- Performance metrics
    avg_conversion_rate DECIMAL(6, 4),
    confidence_score DECIMAL(5, 4),
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_analyzed TIMESTAMP,
    
    INDEX idx_send_times_user (user_id)
);

-- Merchant affinity scores
CREATE TABLE IF NOT EXISTS user_merchant_affinity (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id),
    
    -- Affinity calculation
    visit_frequency DECIMAL(8, 4),  -- Visits per month
    avg_spend DECIMAL(10, 2),
    category_match_score DECIMAL(5, 4),
    affinity_score DECIMAL(5, 4),  -- Combined score
    
    -- Ranking
    rank_in_category INTEGER,
    
    -- Metadata
    last_visited TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, merchant_id),
    INDEX idx_affinity_user (user_id),
    INDEX idx_affinity_merchant (merchant_id),
    INDEX idx_affinity_score (affinity_score DESC)
);

-- ═════════════════════════════════════════════════════════════════════════════
-- PERFORMANCE VIEWS
-- ═════════════════════════════════════════════════════════════════════════════

-- Campaign performance summary
CREATE VIEW IF NOT EXISTS campaign_performance_summary AS
SELECT 
    c.campaign_id,
    c.campaign_type,
    c.title,
    c.merchant_id,
    c.is_active,
    
    -- Daily metrics
    COALESCE(SUM(cad.views), 0) as total_views,
    COALESCE(SUM(cad.conversions), 0) as total_conversions,
    COALESCE(SUM(cad.revenue), 0) as total_revenue,
    COALESCE(SUM(cad.cost), 0) as total_cost,
    
    -- Rates
    CASE WHEN SUM(cad.views) > 0 
         THEN SUM(cad.conversions)::DECIMAL / SUM(cad.views)::DECIMAL
         ELSE 0 
    END as overall_conversion_rate,
    
    CASE WHEN SUM(cad.cost) > 0
         THEN SUM(cad.revenue)::DECIMAL / SUM(cad.cost)::DECIMAL
         ELSE 0
    END as roas,
    
    -- Metadata
    c.created_at
FROM campaigns c
LEFT JOIN campaign_analytics_daily cad ON c.id = cad.campaign_id
GROUP BY c.id, c.campaign_id, c.campaign_type, c.title, c.merchant_id, c.is_active, c.created_at;

-- A/B test summary
CREATE VIEW IF NOT EXISTS ab_test_summary AS
SELECT 
    t.test_id,
    t.test_name,
    t.is_active,
    t.start_date,
    t.end_date,
    
    -- Control group
    t.control_campaign_id,
    (SELECT COUNT(DISTINCT user_id) FROM ab_test_assignments WHERE test_id = t.test_id AND assigned_group = 'control') as control_users,
    
    -- Variant group
    t.variant_campaign_id,
    (SELECT COUNT(DISTINCT user_id) FROM ab_test_assignments WHERE test_id = t.test_id AND assigned_group = 'variant') as variant_users,
    
    -- Latest result
    r.is_significant,
    r.improvement_percent,
    r.winner,
    r.analyzed_at
FROM ab_tests t
LEFT JOIN ab_test_results r ON t.test_id = r.test_id
ORDER BY t.created_at DESC;

-- ═════════════════════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═════════════════════════════════════════════════════════════════════════════

-- Analytics query optimization
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_daily_agg 
    ON campaign_analytics_daily(campaign_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_segment_analytics_agg 
    ON campaign_segment_analytics(campaign_id, segment_name);

-- A/B testing query optimization
CREATE INDEX IF NOT EXISTS idx_ab_tests_performance 
    ON ab_tests(is_active, start_date DESC);

CREATE INDEX IF NOT EXISTS idx_ab_results_performance 
    ON ab_test_results(test_id, analyzed_at DESC);

-- Optimization tracking
CREATE INDEX IF NOT EXISTS idx_optimizations_status 
    ON campaign_optimizations(campaign_id, is_applied, created_at DESC);

-- User affinity queries
CREATE INDEX IF NOT EXISTS idx_user_affinity_ranking 
    ON user_merchant_affinity(user_id, affinity_score DESC, rank_in_category);
