-- ============================================================================
-- CRITICAL SCHEMA FIXES FOR SWIPESAVVY v1.2.0
-- Fixes blocking issues identified in backend architecture audit
-- Date: December 28, 2025
-- ============================================================================

-- This script MUST be run BEFORE swipesavvy_complete_schema.sql
-- It creates the prerequisite tables that other schemas reference

-- ============================================================================
-- FIX 1: CREATE USERS TABLE (Referenced by feature_flags_schema.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  user_type VARCHAR(50) DEFAULT 'customer',  -- customer, admin, support
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_user_type CHECK (user_type IN ('customer', 'admin', 'support'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Insert default system user for audit trails
INSERT INTO users (id, email, name, user_type)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'system@swipesavvy.com',
  'System User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- FIX 2: CREATE CAMPAIGNS TABLE (Referenced by phase_4_schema.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  campaign_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(100) NOT NULL,  -- LOCATION_DEAL, EMAIL_OFFER, SEASONAL, etc.
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Dates
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  
  -- Offer Details
  offer_amount DECIMAL(10, 2),
  offer_type VARCHAR(50),  -- FIXED_DISCOUNT, PERCENTAGE, BOGO, etc.
  
  -- Targeting
  target_segment VARCHAR(100),  -- high_value_users, new_users, location_california, etc.
  target_merchant_id INTEGER,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
  CONSTRAINT valid_offer_type CHECK (offer_type IN ('FIXED_DISCOUNT', 'PERCENTAGE', 'BOGO', 'FREE_SHIPPING', 'OTHER'))
);

-- Create indexes for common queries
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-- ============================================================================
-- FIX 3: VERIFY DATABASE CONFIGURATION
-- ============================================================================

-- These grants ensure both application users have proper access
CREATE USER IF NOT EXISTS swipesavvy_backend WITH PASSWORD 'secure_password_change_in_production';
CREATE USER IF NOT EXISTS swipesavvy_analytics WITH PASSWORD 'analytics_password_change_in_production';

-- Grant permissions to backend user (full access)
GRANT USAGE ON SCHEMA public TO swipesavvy_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO swipesavvy_backend;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO swipesavvy_backend;

-- Grant permissions to analytics user (read-only)
GRANT USAGE ON SCHEMA public TO swipesavvy_analytics;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO swipesavvy_analytics;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO swipesavvy_analytics;

-- ============================================================================
-- NOTES FOR NEXT STEPS
-- ============================================================================
-- 
-- After running this script successfully:
-- 
-- 1. Run swipesavvy_complete_schema.sql
--    psql -U postgres -d swipesavvy_db -f swipesavvy_complete_schema.sql
-- 
-- 2. Verify all tables created:
--    psql -U postgres -d swipesavvy_db -c "\dt"
-- 
-- 3. Run feature_flags_schema.sql
--    psql -U postgres -d swipesavvy_db -f feature_flags_schema.sql
-- 
-- 4. Verify foreign keys work:
--    psql -U postgres -d swipesavvy_db -c "\d feature_flags"
-- 
-- 5. Fix and run phase_4_schema.sql with corrected syntax
--    (SQL syntax errors must be corrected first - see SYNTAX_FIXES.md)
-- 
-- ============================================================================
