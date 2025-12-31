-- ============================================================================
-- SWIPESAVVY DATABASE SCHEMA
-- Comprehensive PostgreSQL schema for all applications
-- Database: swipesavvy_db
-- Version: 1.0
-- Created: December 26, 2025
-- ============================================================================

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS swipesavvy_db
  WITH ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- ============================================================================
-- SECTION 1: FEATURE FLAGS TABLES
-- ============================================================================

-- Feature Flags - Main configuration table
CREATE TABLE IF NOT EXISTS feature_flags (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('UI', 'Advanced', 'Experimental', 'Rollout')),
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  owner_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Feature Flag Rollouts - Targeting and variant configuration
CREATE TABLE IF NOT EXISTS feature_flag_rollouts (
  id SERIAL PRIMARY KEY,
  flag_id INTEGER NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_segment VARCHAR(100),
  variant_key VARCHAR(100),
  variant_value TEXT,
  percentage INTEGER DEFAULT 100 CHECK (percentage >= 0 AND percentage <= 100),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature Flag Usage - Analytics tracking
CREATE TABLE IF NOT EXISTS feature_flag_usage (
  id SERIAL PRIMARY KEY,
  flag_id INTEGER NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id VARCHAR(255),
  app_type VARCHAR(50) CHECK (app_type IN ('mobile', 'admin', 'web')),
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  value_used BOOLEAN,
  device_info JSONB,
  request_id VARCHAR(255)
);

-- Feature Flag Analytics - Daily aggregates
CREATE TABLE IF NOT EXISTS feature_flag_analytics (
  id SERIAL PRIMARY KEY,
  flag_id INTEGER NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  total_checks INTEGER DEFAULT 0,
  enabled_count INTEGER DEFAULT 0,
  disabled_count INTEGER DEFAULT 0,
  avg_response_time_ms FLOAT DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  cache_hit_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(flag_id, date)
);

-- Feature Flag Audit Log - Change history
CREATE TABLE IF NOT EXISTS feature_flag_audit_log (
  id SERIAL PRIMARY KEY,
  flag_id INTEGER NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'TOGGLE', 'DELETE')),
  old_value JSONB,
  new_value JSONB,
  changed_by VARCHAR(255) NOT NULL,
  change_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- ============================================================================
-- SECTION 2: ANALYTICS TABLES
-- ============================================================================

-- Campaign Analytics - Daily metrics
CREATE TABLE IF NOT EXISTS campaign_analytics_daily (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  roi DECIMAL(10, 2) DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0,
  click_through_rate FLOAT DEFAULT 0,
  conversion_rate FLOAT DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, date)
);

-- Campaign Analytics - Segment breakdown
CREATE TABLE IF NOT EXISTS campaign_analytics_segments (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  segment_name VARCHAR(100),
  date DATE,
  users_count INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  retention_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 3: A/B TESTING TABLES
-- ============================================================================

-- A/B Tests - Test configuration
CREATE TABLE IF NOT EXISTS ab_tests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_id INTEGER,
  hypothesis TEXT,
  control_variant VARCHAR(100) NOT NULL,
  variant_a VARCHAR(100),
  variant_b VARCHAR(100),
  variant_c VARCHAR(100),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('draft', 'running', 'completed', 'paused', 'archived')),
  sample_size INTEGER,
  confidence_level FLOAT DEFAULT 95.0,
  min_statistical_power FLOAT DEFAULT 80.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- A/B Test Assignments - User variant assignments
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  variant_assigned VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_test_user (test_id, user_id)
);

-- A/B Test Results - Statistical analysis
CREATE TABLE IF NOT EXISTS ab_test_results (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_name VARCHAR(100),
  users_count INTEGER,
  conversions INTEGER,
  conversion_rate FLOAT,
  revenue DECIMAL(10, 2),
  avg_order_value DECIMAL(10, 2),
  statistical_significance FLOAT,
  p_value FLOAT,
  confidence_interval_lower FLOAT,
  confidence_interval_upper FLOAT,
  winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 4: ML MODEL TABLES
-- ============================================================================

-- ML Models - Trained model versions
CREATE TABLE IF NOT EXISTS ml_models (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('conversion', 'churn', 'affinity', 'offer')),
  version VARCHAR(50) NOT NULL,
  training_date TIMESTAMP NOT NULL,
  accuracy FLOAT,
  precision FLOAT,
  recall FLOAT,
  f1_score FLOAT,
  auc_score FLOAT,
  feature_count INTEGER,
  training_samples INTEGER,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('training', 'active', 'deprecated', 'archived')),
  model_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);

-- ============================================================================
-- SECTION 5: USER OPTIMIZATION TABLES
-- ============================================================================

-- User Merchant Affinity - User-merchant preference scores
CREATE TABLE IF NOT EXISTS user_merchant_affinity (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  merchant_id INTEGER,
  affinity_score FLOAT DEFAULT 0.0 CHECK (affinity_score >= 0.0 AND affinity_score <= 1.0),
  interaction_count INTEGER DEFAULT 0,
  last_interaction TIMESTAMP,
  purchase_count INTEGER DEFAULT 0,
  avg_transaction_value DECIMAL(10, 2),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, merchant_id)
);

-- Optimal Send Times - Best time to contact users
CREATE TABLE IF NOT EXISTS user_optimal_send_times (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  optimal_hour INTEGER CHECK (optimal_hour >= 0 AND optimal_hour < 24),
  optimal_day_of_week INTEGER CHECK (optimal_day_of_week >= 0 AND optimal_day_of_week < 7),
  confidence_score FLOAT DEFAULT 0.0,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  open_rate_morning FLOAT,
  open_rate_afternoon FLOAT,
  open_rate_evening FLOAT,
  engagement_score FLOAT
);

-- Campaign Optimizations - Recommendations for campaigns
CREATE TABLE IF NOT EXISTS campaign_optimizations (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  recommendation_type VARCHAR(100) NOT NULL CHECK (recommendation_type IN ('offer', 'timing', 'audience', 'creative', 'channel')),
  recommendation_text TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.0,
  potential_uplift_percent FLOAT,
  implementation_effort VARCHAR(50) CHECK (implementation_effort IN ('low', 'medium', 'high')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  implemented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 6: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Feature Flags Indexes
CREATE INDEX idx_ff_enabled ON feature_flags(enabled);
CREATE INDEX idx_ff_category ON feature_flags(category);
CREATE INDEX idx_ff_created_at ON feature_flags(created_at);
CREATE INDEX idx_ff_key ON feature_flags(key);

-- Feature Flag Usage Indexes
CREATE INDEX idx_ffu_flag_id ON feature_flag_usage(flag_id);
CREATE INDEX idx_ffu_user_id ON feature_flag_usage(user_id);
CREATE INDEX idx_ffu_accessed_at ON feature_flag_usage(accessed_at);
CREATE INDEX idx_ffu_app_type ON feature_flag_usage(app_type);

-- Feature Flag Analytics Indexes
CREATE INDEX idx_ffa_flag_id ON feature_flag_analytics(flag_id);
CREATE INDEX idx_ffa_date ON feature_flag_analytics(date);

-- Feature Flag Rollouts Indexes
CREATE INDEX idx_ffr_flag_id ON feature_flag_rollouts(flag_id);

-- Analytics Indexes
CREATE INDEX idx_cad_campaign_id ON campaign_analytics_daily(campaign_id);
CREATE INDEX idx_cad_date ON campaign_analytics_daily(date);
CREATE INDEX idx_cas_campaign_id ON campaign_analytics_segments(campaign_id);
CREATE INDEX idx_cas_segment ON campaign_analytics_segments(segment_name);

-- A/B Test Indexes
CREATE INDEX idx_abt_status ON ab_tests(status);
CREATE INDEX idx_abt_campaign_id ON ab_tests(campaign_id);
CREATE INDEX idx_abt_created_at ON ab_tests(created_at);
CREATE INDEX idx_ata_test_id ON ab_test_assignments(test_id);
CREATE INDEX idx_ata_user_id ON ab_test_assignments(user_id);

-- ML Models Indexes
CREATE INDEX idx_mlm_type ON ml_models(model_type);
CREATE INDEX idx_mlm_status ON ml_models(status);

-- User Optimization Indexes
CREATE INDEX idx_uma_user_id ON user_merchant_affinity(user_id);
CREATE INDEX idx_uma_merchant_id ON user_merchant_affinity(merchant_id);
CREATE INDEX idx_ust_user_id ON user_optimal_send_times(user_id);
CREATE INDEX idx_co_campaign_id ON campaign_optimizations(campaign_id);

-- ============================================================================
-- SECTION 7: SEED DATA
-- ============================================================================

-- Insert default feature flags
INSERT INTO feature_flags (key, name, description, category, enabled, owner_email, created_by) 
VALUES 
  ('tier_progress_bar', 'Tier Progress Bar', 'Display tier progression visualization', 'UI', true, 'engineering@swipesavvy.com', 'system'),
  ('amount_chip_selector', 'Amount Chip Selector', 'Quick-select amount chips', 'UI', true, 'engineering@swipesavvy.com', 'system'),
  ('platform_goal_meter', 'Platform Goal Meter', 'Community goal progress display', 'UI', true, 'engineering@swipesavvy.com', 'system'),
  ('ai_concierge_chat', 'AI Concierge Chat', 'AI-powered customer support chat', 'UI', true, 'engineering@swipesavvy.com', 'system'),
  ('dark_mode', 'Dark Mode', 'Dark theme support', 'UI', true, 'engineering@swipesavvy.com', 'system'),
  ('social_sharing', 'Social Sharing', 'Social media sharing integration', 'Advanced', true, 'product@swipesavvy.com', 'system'),
  ('receipt_generation', 'Receipt Generation', 'Digital receipt generation and export', 'Advanced', true, 'product@swipesavvy.com', 'system'),
  ('community_feed', 'Community Feed', 'Share transactions to community feed (beta)', 'Experimental', false, 'product@swipesavvy.com', 'system'),
  ('notification_center', 'Notification Center', 'Centralized notification hub (beta)', 'Experimental', false, 'engineering@swipesavvy.com', 'system'),
  ('advanced_analytics', 'Advanced Analytics', 'Enhanced analytics dashboard (beta)', 'Experimental', false, 'data@swipesavvy.com', 'system')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SECTION 8: FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update feature_flags.updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for feature_flags updated_at
DROP TRIGGER IF EXISTS trigger_feature_flags_timestamp ON feature_flags;
CREATE TRIGGER trigger_feature_flags_timestamp
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_timestamp();

-- Function to update rollouts.updated_at
CREATE OR REPLACE FUNCTION update_rollouts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rollouts updated_at
DROP TRIGGER IF EXISTS trigger_rollouts_timestamp ON feature_flag_rollouts;
CREATE TRIGGER trigger_rollouts_timestamp
  BEFORE UPDATE ON feature_flag_rollouts
  FOR EACH ROW
  EXECUTE FUNCTION update_rollouts_timestamp();

-- Function to log audit changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO feature_flag_audit_log (
    flag_id,
    action,
    old_value,
    new_value,
    changed_by,
    created_at
  ) VALUES (
    NEW.id,
    CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE 'UPDATE' END,
    CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    row_to_json(NEW),
    COALESCE(NEW.updated_by, 'system'),
    CURRENT_TIMESTAMP
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for audit logging
DROP TRIGGER IF EXISTS trigger_audit_feature_flags ON feature_flags;
CREATE TRIGGER trigger_audit_feature_flags
  AFTER INSERT OR UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_feature_flag_change();

-- ============================================================================
-- SECTION 9: VIEWS FOR EASY DATA ACCESS
-- ============================================================================

-- View: Active Feature Flags
CREATE OR REPLACE VIEW v_active_feature_flags AS
SELECT 
  id,
  key,
  name,
  description,
  category,
  enabled,
  rollout_percentage,
  owner_email,
  created_at,
  updated_at
FROM feature_flags
WHERE enabled = true
ORDER BY category, name;

-- View: Feature Flag Usage Summary
CREATE OR REPLACE VIEW v_feature_flag_usage_summary AS
SELECT 
  ff.key,
  ff.name,
  COUNT(DISTINCT ffu.user_id) as unique_users,
  COUNT(ffu.id) as total_checks,
  ffu.app_type,
  MAX(ffu.accessed_at) as last_accessed
FROM feature_flags ff
LEFT JOIN feature_flag_usage ffu ON ff.id = ffu.flag_id
WHERE ffu.accessed_at >= NOW() - INTERVAL '30 days'
GROUP BY ff.id, ff.key, ff.name, ffu.app_type
ORDER BY total_checks DESC;

-- View: A/B Test Summary
CREATE OR REPLACE VIEW v_ab_test_summary AS
SELECT 
  t.id,
  t.name,
  t.status,
  COUNT(DISTINCT a.user_id) as users_assigned,
  SUM(CASE WHEN r.conversions > 0 THEN r.conversions ELSE 0 END) as total_conversions,
  t.start_date,
  t.end_date
FROM ab_tests t
LEFT JOIN ab_test_assignments a ON t.id = a.test_id
LEFT JOIN ab_test_results r ON t.id = r.test_id
GROUP BY t.id, t.name, t.status, t.start_date, t.end_date;

-- View: Campaign Performance Summary
CREATE OR REPLACE VIEW v_campaign_performance_summary AS
SELECT 
  campaign_id,
  SUM(impressions) as total_impressions,
  SUM(clicks) as total_clicks,
  SUM(conversions) as total_conversions,
  SUM(revenue) as total_revenue,
  AVG(roi) as avg_roi,
  MAX(date) as latest_date
FROM campaign_analytics_daily
WHERE date >= NOW() - INTERVAL '90 days'
GROUP BY campaign_id;

-- ============================================================================
-- SECTION 10: GRANT PERMISSIONS
-- ============================================================================

-- Create application user (backend)
CREATE USER IF NOT EXISTS swipesavvy_backend WITH PASSWORD 'secure_password_123';

-- Create read-only user (analytics/reporting)
CREATE USER IF NOT EXISTS swipesavvy_analytics WITH PASSWORD 'analytics_password_456';

-- Grant permissions to backend user
GRANT USAGE ON SCHEMA public TO swipesavvy_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO swipesavvy_backend;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO swipesavvy_backend;

-- Grant permissions to analytics user
GRANT USAGE ON SCHEMA public TO swipesavvy_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO swipesavvy_analytics;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO swipesavvy_analytics;

-- ============================================================================
-- SECTION 11: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE feature_flags IS 'Main feature flag configuration table. Stores all feature flags with their settings, categories, and rollout percentages.';
COMMENT ON TABLE feature_flag_usage IS 'Tracks every access to feature flags for analytics and monitoring. Supports mobile, admin, and web apps.';
COMMENT ON TABLE feature_flag_analytics IS 'Aggregated daily analytics for each feature flag including access counts, error rates, and cache hit rates.';
COMMENT ON TABLE campaign_analytics_daily IS 'Daily performance metrics for marketing campaigns including impressions, clicks, conversions, and ROI.';
COMMENT ON TABLE ab_tests IS 'Configuration and metadata for A/B tests including hypotheses, variants, and statistical parameters.';
COMMENT ON TABLE ab_test_assignments IS 'Records which users are assigned to which variants in each A/B test for attribution.';
COMMENT ON TABLE ml_models IS 'Versions of trained ML models with their performance metrics and deployment status.';
COMMENT ON TABLE user_merchant_affinity IS 'User-merchant affinity scores to identify which merchants each user prefers.';
COMMENT ON TABLE user_optimal_send_times IS 'Calculated optimal times to send notifications to each user based on historical engagement.';
COMMENT ON TABLE campaign_optimizations IS 'AI-generated optimization recommendations for marketing campaigns.';

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================
-- All tables, indexes, views, and triggers are ready
-- Applications can now connect and perform CRUD operations
-- Default feature flags have been seeded
-- Users: swipesavvy_backend, swipesavvy_analytics
-- ============================================================================
