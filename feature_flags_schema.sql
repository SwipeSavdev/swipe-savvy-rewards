-- Feature Flag Management System
-- Allows admins to toggle features on/off and track usage

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'ui', 'advanced', 'experimental', 'rollout'
  enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  enabled_by UUID REFERENCES users(id),
  enabled_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_flag_rollouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  variant VARCHAR(50), -- 'control', 'treatment', 'a', 'b', etc.
  enabled BOOLEAN DEFAULT FALSE,
  percentage INTEGER DEFAULT 100, -- rollout percentage (0-100)
  targeting_rules JSONB, -- complex targeting rules
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flag_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  action VARCHAR(50), -- 'view', 'interact', 'complete', 'dismiss'
  device_type VARCHAR(50), -- 'ios', 'android', 'web'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  variant VARCHAR(50),
  total_users INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2),
  engagement_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(feature_flag_id, date, variant)
);

CREATE TABLE IF NOT EXISTS feature_flag_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id),
  action VARCHAR(50), -- 'created', 'enabled', 'disabled', 'updated'
  changes JSONB,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);
CREATE INDEX idx_feature_flag_usage_user ON feature_flag_usage(user_id);
CREATE INDEX idx_feature_flag_usage_flag ON feature_flag_usage(feature_flag_id);
CREATE INDEX idx_feature_flag_analytics_date ON feature_flag_analytics(date);
CREATE INDEX idx_feature_flag_audit_flag ON feature_flag_audit_log(feature_flag_id);

-- Sample Feature Flags
INSERT INTO feature_flags (key, name, description, category, enabled) VALUES
('tier_progress_bar', 'Tier Progress Bar', 'Display tier progress visualization on rewards screen', 'ui', true),
('amount_chip_selector', 'Amount Chip Selector', 'Quick select amount chips for donations', 'ui', true),
('platform_goal_meter', 'Platform Goal Meter', 'Show community-wide goal progress', 'ui', true),
('social_sharing', 'Social Sharing', 'Allow sharing receipts to social media', 'advanced', true),
('receipt_generation', 'Receipt Generation', 'Generate and download transaction receipts', 'advanced', true),
('community_feed', 'Community Feed', 'Share transactions to community feed', 'advanced', false),
('ai_concierge_chat', 'AI Concierge', 'Enable AI Concierge bottom sheet chat', 'ui', true),
('dark_mode', 'Dark Mode Support', 'Enable dark mode theme switching', 'ui', true),
('notification_center', 'Notification Center', 'Centralized notification management', 'experimental', false),
('advanced_analytics', 'Advanced Analytics', 'Enhanced transaction analytics dashboard', 'advanced', false)
ON CONFLICT DO NOTHING;
