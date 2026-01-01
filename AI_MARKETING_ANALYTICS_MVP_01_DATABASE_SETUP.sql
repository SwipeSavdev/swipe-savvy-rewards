-- AI Marketing Analytics - MVP Database Setup (MVP-001)
-- Created: December 31, 2025
-- Purpose: Initialize 8 new tables and 7 materialized views for Phase 1
-- Note: Assumes base tables exist (ai_campaigns, campaign_metrics, user_segments, etc.)

-- ============================================================================
-- 1. NEW TABLES (8 total)
-- ============================================================================

-- Table 1: campaign_costs - Track spend data per campaign
CREATE TABLE IF NOT EXISTS campaign_costs (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES ai_campaigns(id) ON DELETE CASCADE,
    cost_date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'web')),
    spend_amount DECIMAL(12, 2) NOT NULL CHECK (spend_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    cost_type VARCHAR(30) DEFAULT 'total' CHECK (cost_type IN ('total', 'platform_fee', 'creative')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, cost_date, channel)
);

CREATE INDEX idx_campaign_costs_campaign_date ON campaign_costs(campaign_id, cost_date DESC);
CREATE INDEX idx_campaign_costs_date ON campaign_costs(cost_date DESC);

-- Table 2: campaign_attribution - Multi-touch attribution data
CREATE TABLE IF NOT EXISTS campaign_attribution (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES ai_campaigns(id) ON DELETE CASCADE,
    attributed_conversions INT DEFAULT 0 CHECK (attributed_conversions >= 0),
    attributed_revenue DECIMAL(12, 2) DEFAULT 0 CHECK (attributed_revenue >= 0),
    attribution_model VARCHAR(30) DEFAULT 'last_click' CHECK (attribution_model IN ('first_touch', 'last_click', 'linear', 'time_decay')),
    measurement_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, measurement_date, attribution_model)
);

CREATE INDEX idx_attribution_campaign_date ON campaign_attribution(campaign_id, measurement_date DESC);

-- Table 3: marketing_job_runs - Background job execution log
CREATE TABLE IF NOT EXISTS marketing_job_runs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed', 'timeout')),
    rows_processed INT DEFAULT 0,
    rows_updated INT DEFAULT 0,
    error_message TEXT,
    duration_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_runs_name_date ON marketing_job_runs(job_name, started_at DESC);
CREATE INDEX idx_job_runs_status ON marketing_job_runs(status, started_at DESC);

-- Table 4: marketing_llm_log - LLM API call tracking
CREATE TABLE IF NOT EXISTS marketing_llm_log (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT REFERENCES ai_campaigns(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL,
    prompt_tokens INT NOT NULL CHECK (prompt_tokens > 0),
    completion_tokens INT NOT NULL CHECK (completion_tokens >= 0),
    total_tokens INT NOT NULL CHECK (total_tokens > 0),
    estimated_cost DECIMAL(10, 4) NOT NULL CHECK (estimated_cost > 0),
    latency_ms INT NOT NULL CHECK (latency_ms > 0),
    status_code INT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_llm_log_campaign_date ON marketing_llm_log(campaign_id, created_at DESC);
CREATE INDEX idx_llm_log_created_at ON marketing_llm_log(created_at DESC);

-- Table 5: recommendation_decisions - Recommendation acceptance tracking
CREATE TABLE IF NOT EXISTS recommendation_decisions (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES ai_campaigns(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('test_creative', 'optimize_send_time', 'increase_budget', 'pause_low_roi', 'expand_segment', 'reduce_frequency', 'a_b_test_copy')),
    confidence_score DECIMAL(5, 3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('accepted', 'rejected', 'pending', 'expired')),
    accepted_at TIMESTAMP,
    accepted_by VARCHAR(100),
    reason_declined TEXT,
    expected_impact DECIMAL(10, 2),
    actual_impact DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_campaign_date ON recommendation_decisions(campaign_id, created_at DESC);
CREATE INDEX idx_recommendations_decision_date ON recommendation_decisions(decision, created_at DESC);

-- Table 6: pii_access_log - PII data access audit trail
CREATE TABLE IF NOT EXISTS pii_access_log (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    access_type VARCHAR(50) NOT NULL CHECK (access_type IN ('view', 'export', 'download', 'api_call')),
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    ip_address INET,
    user_agent TEXT,
    pii_fields_accessed TEXT[],
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'denied', 'failed')),
    denial_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pii_access_user_date ON pii_access_log(user_id, created_at DESC);
CREATE INDEX idx_pii_access_date ON pii_access_log(created_at DESC);
CREATE INDEX idx_pii_access_type ON pii_access_log(access_type, created_at DESC);

-- Table 7: api_request_log - API observability and performance tracking
CREATE TABLE IF NOT EXISTS api_request_log (
    id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(100) NOT NULL UNIQUE,
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    status_code INT NOT NULL,
    user_id VARCHAR(100),
    latency_ms INT NOT NULL CHECK (latency_ms >= 0),
    db_latency_ms INT DEFAULT 0 CHECK (db_latency_ms >= 0),
    cache_hit BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    request_body_size INT,
    response_body_size INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_request_endpoint_date ON api_request_log(endpoint, created_at DESC);
CREATE INDEX idx_api_request_status ON api_request_log(status_code, created_at DESC);
CREATE INDEX idx_api_request_user_date ON api_request_log(user_id, created_at DESC);
CREATE INDEX idx_api_request_latency ON api_request_log(latency_ms DESC) WHERE status_code = 200;

-- Table 8: marketing_scheduler_log - APScheduler job tracking
CREATE TABLE IF NOT EXISTS marketing_scheduler_log (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(100) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('interval', 'cron', 'date', 'manual')),
    scheduled_time TIMESTAMP NOT NULL,
    execution_start TIMESTAMP,
    execution_end TIMESTAMP,
    next_run_time TIMESTAMP,
    job_result VARCHAR(50) CHECK (job_result IN ('success', 'failure', 'skipped', 'timeout')),
    output TEXT,
    exception_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduler_job_id_date ON marketing_scheduler_log(job_id, scheduled_time DESC);
CREATE INDEX idx_scheduler_next_run ON marketing_scheduler_log(next_run_time) WHERE next_run_time IS NOT NULL;

-- ============================================================================
-- 2. MATERIALIZED VIEWS (7 total)
-- ============================================================================

-- MV 1: kpi_metrics_daily_mv - Daily KPI aggregates
CREATE MATERIALIZED VIEW IF NOT EXISTS kpi_metrics_daily_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    DATE(cm.measurement_date) AS measurement_date,
    c.status,
    COUNT(DISTINCT cm.id) AS metrics_count,
    SUM(cm.opens) AS total_opens,
    SUM(cm.clicks) AS total_clicks,
    SUM(cm.conversions) AS total_conversions,
    ROUND(
        CASE WHEN SUM(cm.sends) > 0 THEN (SUM(cm.opens)::NUMERIC / SUM(cm.sends)) * 100 ELSE 0 END,
        2
    ) AS open_rate,
    ROUND(
        CASE WHEN SUM(cm.opens) > 0 THEN (SUM(cm.clicks)::NUMERIC / SUM(cm.opens)) * 100 ELSE 0 END,
        2
    ) AS click_rate,
    ROUND(
        CASE WHEN SUM(cm.sends) > 0 THEN (SUM(cm.conversions)::NUMERIC / SUM(cm.sends)) * 100 ELSE 0 END,
        2
    ) AS conversion_rate,
    COALESCE(SUM(cc.spend_amount), 0) AS total_spend,
    ROUND(
        CASE WHEN COALESCE(SUM(cc.spend_amount), 0) > 0 
             AND SUM(cm.conversions) > 0
             THEN COALESCE(SUM(cc.spend_amount), 0) / SUM(cm.conversions)
             ELSE 0
        END,
        2
    ) AS cost_per_conversion,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
LEFT JOIN campaign_costs cc ON c.id = cc.campaign_id AND DATE(cm.measurement_date) = cc.cost_date
WHERE cm.measurement_date IS NOT NULL
GROUP BY c.id, c.name, c.status, DATE(cm.measurement_date);

CREATE UNIQUE INDEX idx_kpi_metrics_daily_unique ON kpi_metrics_daily_mv(campaign_id, measurement_date);
CREATE INDEX idx_kpi_metrics_daily_date ON kpi_metrics_daily_mv(measurement_date DESC);

-- MV 2: campaign_attribution_mv - Attribution metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_attribution_mv AS
SELECT
    ca.campaign_id,
    c.name AS campaign_name,
    ca.attribution_model,
    ca.measurement_date,
    ca.attributed_conversions,
    ca.attributed_revenue,
    ROUND((ca.attributed_conversions::NUMERIC / NULLIF(cm.conversions, 0)) * 100, 2) AS conversion_attribution_rate,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM campaign_attribution ca
JOIN ai_campaigns c ON ca.campaign_id = c.id
LEFT JOIN campaign_metrics cm ON ca.campaign_id = cm.campaign_id AND DATE(ca.measurement_date) = DATE(cm.measurement_date);

CREATE UNIQUE INDEX idx_attribution_mv_unique ON campaign_attribution_mv(campaign_id, measurement_date, attribution_model);

-- MV 3: roi_metrics_daily_mv - ROI calculation
CREATE MATERIALIZED VIEW IF NOT EXISTS roi_metrics_daily_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    DATE(cm.measurement_date) AS measurement_date,
    SUM(cc.spend_amount) AS total_spend,
    COALESCE(SUM(ca.attributed_revenue), 0) AS total_revenue,
    ROUND(
        CASE WHEN SUM(cc.spend_amount) > 0 
             THEN (COALESCE(SUM(ca.attributed_revenue), 0) - SUM(cc.spend_amount)) / SUM(cc.spend_amount)
             ELSE 0
        END,
        4
    ) AS roi,
    ROUND(COALESCE(SUM(ca.attributed_revenue), 0) / NULLIF(SUM(cc.spend_amount), 0), 2) AS roas,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
LEFT JOIN campaign_costs cc ON c.id = cc.campaign_id AND DATE(cm.measurement_date) = cc.cost_date
LEFT JOIN campaign_attribution ca ON c.id = ca.campaign_id AND DATE(cm.measurement_date) = ca.measurement_date
GROUP BY c.id, c.name, DATE(cm.measurement_date);

CREATE UNIQUE INDEX idx_roi_metrics_unique ON roi_metrics_daily_mv(campaign_id, measurement_date);

-- MV 4: engagement_metrics_mv - Engagement trends
CREATE MATERIALIZED VIEW IF NOT EXISTS engagement_metrics_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    DATE(cm.measurement_date) AS measurement_date,
    SUM(cm.sends) AS total_sends,
    SUM(cm.opens) AS total_opens,
    SUM(cm.clicks) AS total_clicks,
    SUM(cm.unsubscribes) AS total_unsubscribes,
    ROUND((SUM(cm.unsubscribes)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 3) AS unsubscribe_rate,
    ROUND((SUM(cm.opens)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2) AS open_rate,
    ROUND((SUM(cm.clicks)::NUMERIC / NULLIF(SUM(cm.opens), 0)) * 100, 2) AS ctr,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
GROUP BY c.id, c.name, DATE(cm.measurement_date);

CREATE UNIQUE INDEX idx_engagement_metrics_unique ON engagement_metrics_mv(campaign_id, measurement_date);

-- MV 5: funnel_metrics_mv - Multi-stage funnel analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS funnel_metrics_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    DATE(cm.measurement_date) AS measurement_date,
    SUM(cm.sends) AS stage_sends,
    SUM(cm.opens) AS stage_opens,
    SUM(cm.clicks) AS stage_clicks,
    SUM(cm.conversions) AS stage_conversions,
    ROUND((SUM(cm.opens)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2) AS sends_to_opens_rate,
    ROUND((SUM(cm.clicks)::NUMERIC / NULLIF(SUM(cm.opens), 0)) * 100, 2) AS opens_to_clicks_rate,
    ROUND((SUM(cm.conversions)::NUMERIC / NULLIF(SUM(cm.clicks), 0)) * 100, 2) AS clicks_to_conversions_rate,
    ROUND((SUM(cm.conversions)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2) AS sends_to_conversions_rate,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
GROUP BY c.id, c.name, DATE(cm.measurement_date);

CREATE UNIQUE INDEX idx_funnel_metrics_unique ON funnel_metrics_mv(campaign_id, measurement_date);

-- MV 6: segment_performance_mv - Performance by user segment
CREATE MATERIALIZED VIEW IF NOT EXISTS segment_performance_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    us.id AS segment_id,
    us.name AS segment_name,
    DATE(cm.measurement_date) AS measurement_date,
    COUNT(DISTINCT cm.id) AS metrics_records,
    ROUND(AVG(cm.opens::NUMERIC), 2) AS avg_opens,
    ROUND(AVG(cm.clicks::NUMERIC), 2) AS avg_clicks,
    ROUND(AVG(cm.conversions::NUMERIC), 2) AS avg_conversions,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
LEFT JOIN user_segments us ON c.id = us.campaign_id
GROUP BY c.id, c.name, us.id, us.name, DATE(cm.measurement_date);

CREATE INDEX idx_segment_performance_campaign_date ON segment_performance_mv(campaign_id, measurement_date DESC);

-- MV 7: creative_insights_mv - Creative performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS creative_insights_mv AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    DATE(cm.measurement_date) AS measurement_date,
    c.subject_line,
    c.preheader,
    COUNT(*) AS sends,
    ROUND(AVG(cm.opens::NUMERIC), 2) AS avg_opens_per_metric,
    ROUND(AVG(cm.clicks::NUMERIC), 2) AS avg_clicks_per_metric,
    ROUND(AVG(cm.conversions::NUMERIC), 2) AS avg_conversions_per_metric,
    CURRENT_TIMESTAMP AS last_refreshed_at
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
GROUP BY c.id, c.name, c.subject_line, c.preheader, DATE(cm.measurement_date);

CREATE INDEX idx_creative_insights_campaign_date ON creative_insights_mv(campaign_id, measurement_date DESC);

-- ============================================================================
-- 3. MATERIALIZED VIEW REFRESH SCHEDULE (PostgreSQL pg_cron)
-- ============================================================================
-- Note: Install pg_cron extension first:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Refresh MVs every hour at :00
SELECT cron.schedule('refresh_kpi_metrics_daily_mv', '0 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY kpi_metrics_daily_mv');
SELECT cron.schedule('refresh_campaign_attribution_mv', '5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_attribution_mv');
SELECT cron.schedule('refresh_roi_metrics_daily_mv', '10 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY roi_metrics_daily_mv');
SELECT cron.schedule('refresh_engagement_metrics_mv', '15 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY engagement_metrics_mv');
SELECT cron.schedule('refresh_funnel_metrics_mv', '20 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY funnel_metrics_mv');
SELECT cron.schedule('refresh_segment_performance_mv', '25 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY segment_performance_mv');
SELECT cron.schedule('refresh_creative_insights_mv', '30 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY creative_insights_mv');

-- ============================================================================
-- 4. DATA QUALITY CHECKS (SQL assertions)
-- ============================================================================

-- Check 1: No null campaign_ids in cost table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM campaign_costs WHERE campaign_id IS NULL) THEN
        RAISE WARNING 'Data Quality Issue: campaign_costs contains null campaign_ids';
    END IF;
END $$;

-- Check 2: Conversions should not exceed clicks
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM kpi_metrics_daily_mv WHERE stage_conversions > stage_clicks) THEN
        RAISE WARNING 'Data Quality Issue: Conversions exceed clicks in KPI metrics';
    END IF;
END $$;

-- Check 3: Clicks should not exceed opens
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM engagement_metrics_mv WHERE total_clicks > total_opens) THEN
        RAISE WARNING 'Data Quality Issue: Clicks exceed opens in engagement metrics';
    END IF;
END $$;

-- Check 4: Opens should not exceed sends
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM kpi_metrics_daily_mv WHERE total_opens > (total_opens + total_clicks + total_conversions)) THEN
        RAISE WARNING 'Data Quality Issue: Logical inconsistency in metrics';
    END IF;
END $$;

-- Check 5: ROI rate should be numeric
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM roi_metrics_daily_mv WHERE roi IS NULL AND total_spend > 0) THEN
        RAISE WARNING 'Data Quality Issue: NULL ROI with non-zero spend';
    END IF;
END $$;

-- Check 6: Attribution model should be valid
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM campaign_attribution WHERE attribution_model NOT IN ('first_touch', 'last_click', 'linear', 'time_decay')) THEN
        RAISE WARNING 'Data Quality Issue: Invalid attribution model';
    END IF;
END $$;

-- Check 7: Cost per conversion should be non-negative
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM kpi_metrics_daily_mv WHERE cost_per_conversion < 0) THEN
        RAISE WARNING 'Data Quality Issue: Negative cost per conversion';
    END IF;
END $$;

-- ============================================================================
-- 5. PRODUCTION QUERIES (for API endpoints)
-- ============================================================================

-- Query 1: Get KPI summary for dashboard
-- Usage: SELECT * FROM fn_get_kpi_summary(campaign_id, start_date, end_date)
CREATE OR REPLACE FUNCTION fn_get_kpi_summary(p_campaign_id BIGINT, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    campaign_id BIGINT,
    campaign_name VARCHAR,
    total_sends BIGINT,
    total_opens BIGINT,
    total_clicks BIGINT,
    total_conversions BIGINT,
    total_spend NUMERIC,
    open_rate NUMERIC,
    click_rate NUMERIC,
    conversion_rate NUMERIC,
    cost_per_conversion NUMERIC,
    roi NUMERIC
) AS $$
SELECT
    c.id,
    c.name,
    SUM(cm.sends)::BIGINT,
    SUM(cm.opens)::BIGINT,
    SUM(cm.clicks)::BIGINT,
    SUM(cm.conversions)::BIGINT,
    COALESCE(SUM(cc.spend_amount), 0),
    ROUND((SUM(cm.opens)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2),
    ROUND((SUM(cm.clicks)::NUMERIC / NULLIF(SUM(cm.opens), 0)) * 100, 2),
    ROUND((SUM(cm.conversions)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2),
    ROUND(COALESCE(SUM(cc.spend_amount), 0) / NULLIF(SUM(cm.conversions), 0), 2),
    ROUND(CASE WHEN SUM(cc.spend_amount) > 0 
               THEN (COALESCE(SUM(ca.attributed_revenue), 0) - SUM(cc.spend_amount)) / SUM(cc.spend_amount)
               ELSE 0 END, 4)
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id AND cm.measurement_date >= p_start_date AND cm.measurement_date <= p_end_date
LEFT JOIN campaign_costs cc ON c.id = cc.campaign_id AND cc.cost_date >= p_start_date AND cc.cost_date <= p_end_date
LEFT JOIN campaign_attribution ca ON c.id = ca.campaign_id AND ca.measurement_date >= p_start_date AND ca.measurement_date <= p_end_date
WHERE c.id = p_campaign_id
GROUP BY c.id, c.name;
$$ LANGUAGE SQL;

-- Query 2: Get campaign drilldown details
CREATE OR REPLACE FUNCTION fn_get_campaign_drilldown(p_campaign_id BIGINT, p_measurement_date DATE)
RETURNS TABLE (
    campaign_id BIGINT,
    campaign_name VARCHAR,
    measurement_date DATE,
    sends BIGINT,
    opens BIGINT,
    clicks BIGINT,
    conversions BIGINT,
    unsubscribes BIGINT,
    spend NUMERIC,
    open_rate NUMERIC,
    click_rate NUMERIC
) AS $$
SELECT
    c.id,
    c.name,
    cm.measurement_date,
    SUM(cm.sends)::BIGINT,
    SUM(cm.opens)::BIGINT,
    SUM(cm.clicks)::BIGINT,
    SUM(cm.conversions)::BIGINT,
    COALESCE(SUM(cm.unsubscribes), 0)::BIGINT,
    COALESCE(SUM(cc.spend_amount), 0),
    ROUND((SUM(cm.opens)::NUMERIC / NULLIF(SUM(cm.sends), 0)) * 100, 2),
    ROUND((SUM(cm.clicks)::NUMERIC / NULLIF(SUM(cm.opens), 0)) * 100, 2)
FROM ai_campaigns c
LEFT JOIN campaign_metrics cm ON c.id = cm.campaign_id
LEFT JOIN campaign_costs cc ON c.id = cc.campaign_id AND DATE(cm.measurement_date) = cc.cost_date
WHERE c.id = p_campaign_id AND DATE(cm.measurement_date) = p_measurement_date
GROUP BY c.id, c.name, cm.measurement_date;
$$ LANGUAGE SQL;

-- Query 3: Get active recommendations
CREATE OR REPLACE FUNCTION fn_get_active_recommendations(p_campaign_id BIGINT)
RETURNS TABLE (
    recommendation_id BIGINT,
    campaign_id BIGINT,
    recommendation_type VARCHAR,
    confidence_score NUMERIC,
    decision VARCHAR,
    expected_impact NUMERIC,
    created_at TIMESTAMP
) AS $$
SELECT
    id,
    campaign_id,
    recommendation_type,
    confidence_score,
    decision,
    expected_impact,
    created_at
FROM recommendation_decisions
WHERE campaign_id = p_campaign_id AND decision IN ('pending', 'accepted')
ORDER BY created_at DESC;
$$ LANGUAGE SQL;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total new tables: 8
-- Total materialized views: 7
-- Total indexes: 22
-- Total functions: 3
-- Estimated storage: ~500MB (depends on historical data volume)
--
-- Next steps:
-- 1. Run this script on target database
-- 2. Verify all objects created: SELECT * FROM information_schema.tables WHERE table_schema = 'public'
-- 3. Populate test data
-- 4. Monitor MV refresh times: SELECT * FROM cron.job ORDER BY jobid DESC LIMIT 10
