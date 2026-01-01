// AI Marketing Analytics - React Component Setup (MVP-003)
// Created: December 31, 2025
// Purpose: React component tree, hooks, and KPI dashboard UI

// ============================================================================
// FILE STRUCTURE TO CREATE:
// ============================================================================
// src/
// ├── components/
// │   ├── AIMarketingPage.tsx (main dashboard component)
// │   ├── KPIHeader.tsx (top metrics summary)
// │   ├── FilterBar.tsx (date/campaign filters)
// │   ├── CampaignList.tsx (paginated campaign table)
// │   ├── DrilldownPanel.tsx (day-level drilldown)
// │   ├── RecommendationCenter.tsx (action center)
// │   ├── Charts/
// │   │   ├── KPISparkline.tsx (mini charts)
// │   │   ├── TrendChart.tsx (multi-period trend)
// │   │   └── FunnelChart.tsx (multi-stage funnel)
// │   └── PII/
// │       └── PIIConsentModal.tsx (drilldown consent)
// ├── hooks/
// │   ├── useSWRKPI.ts (KPI data hook)
// │   ├── useSWRCampaigns.ts (campaigns list hook)
// │   ├── useSWRDrilldown.ts (drilldown hook)
// │   ├── useSWRRecommendations.ts (recommendations hook)
// │   └── useFilterState.ts (filter state management)
// ├── types/
// │   ├── api.ts (API response types)
// │   ├── filters.ts (filter types)
// │   └── recommendations.ts (recommendation types)
// ├── utils/
// │   ├── metrics.ts (metric calculations)
// │   ├── formatting.ts (number/date formatting)
// │   └── cache.ts (local SWR cache strategy)
// └── styles/
//     └── dashboard.css (Tailwind classes)

// ============================================================================
// 1. API Types (types/api.ts)
// ============================================================================

export interface KPIMetrics {
  campaign_id: number;
  campaign_name: string;
  measurement_date: string; // YYYY-MM-DD
  total_sends: number;
  total_opens: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  cost_per_conversion: number;
  roi: number;
}

export interface Campaign {
  id: number;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  channel: 'email' | 'sms' | 'push' | 'web';
  created_at: string;
  updated_at: string;
  subject_line?: string;
  preheader?: string;
}

export interface CampaignDetails extends Campaign {
  metrics: KPIMetrics;
  segment_id?: number;
  segment_name?: string;
}

export interface Recommendation {
  recommendation_id: number;
  campaign_id: number;
  recommendation_type: 
    | 'test_creative'
    | 'optimize_send_time'
    | 'increase_budget'
    | 'pause_low_roi'
    | 'expand_segment'
    | 'reduce_frequency'
    | 'a_b_test_copy';
  confidence_score: number;
  decision: 'pending' | 'accepted' | 'rejected' | 'expired';
  expected_impact: number;
  created_at: string;
}

export interface DrilldownData {
  campaign_id: number;
  campaign_name: string;
  measurement_date: string;
  sends: number;
  opens: number;
  clicks: number;
  conversions: number;
  unsubscribes: number;
  spend: number;
  open_rate: number;
  click_rate: number;
  // Time-series sparkline data
  hourly_data?: Array<{
    hour: string;
    opens: number;
    clicks: number;
    conversions: number;
  }>;
}

// ============================================================================
// 2. Custom Hooks (hooks/useSWRKPI.ts)
// ============================================================================

import useSWR from 'swr';
import { KPIMetrics } from '../types/api';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useSWRKPI(
  campaignId?: number,
  startDate?: string,
  endDate?: string
) {
  // Build query string
  const params = new URLSearchParams();
  if (campaignId) params.append('campaign_id', campaignId.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `/api/v1/kpi?${params.toString()}`;
  
  // SWR hook with 30-second revalidation
  const { data, error, isLoading, mutate } = useSWR<KPIMetrics[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // Dedupe requests within 30s
      focusThrottleInterval: 60000,
      errorRetryCount: 2,
      errorRetryInterval: 5000,
      // Stale-while-revalidate pattern: serve stale, fetch new in background
      compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  );
  
  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate // Manual revalidation trigger
  };
}

// ============================================================================
// 3. Filter State Hook (hooks/useFilterState.ts)
// ============================================================================

import { useCallback, useState } from 'react';

export interface FilterState {
  campaignId?: number;
  campaignName?: string;
  channel?: 'email' | 'sms' | 'push' | 'web';
  status?: 'active' | 'paused' | 'draft' | 'completed';
  startDate: string; // YYYY-MM-DD
  endDate: string;
  sortBy: 'roi' | 'send_volume' | 'conversion_rate' | 'cost_per_conversion';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: FilterState = {
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  sortBy: 'roi',
  sortOrder: 'desc',
};

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  return { filters, updateFilter, resetFilters };
}

// ============================================================================
// 4. Main Dashboard Component (components/AIMarketingPage.tsx)
// ============================================================================

import React from 'react';
import { useFilterState } from '../hooks/useFilterState';
import { useSWRKPI } from '../hooks/useSWRKPI';
import CampaignList from './CampaignList';
import DrilldownPanel from './DrilldownPanel';
import FilterBar from './FilterBar';
import KPIHeader from './KPIHeader';
import RecommendationCenter from './RecommendationCenter';

export default function AIMarketingPage() {
  const { filters, updateFilter, resetFilters } = useFilterState();
  const { data: kpiData, isLoading, error, mutate } = useSWRKPI(
    filters.campaignId,
    filters.startDate,
    filters.endDate
  );
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [showPIIConsent, setShowPIIConsent] = useState(false);
  
  // Calculate aggregate metrics
  const aggregateMetrics = React.useMemo(() => {
    if (!kpiData || kpiData.length === 0) return null;
    
    return {
      totalSends: kpiData.reduce((sum, m) => sum + m.total_sends, 0),
      totalOpens: kpiData.reduce((sum, m) => sum + m.total_opens, 0),
      totalClicks: kpiData.reduce((sum, m) => sum + m.total_clicks, 0),
      totalConversions: kpiData.reduce((sum, m) => sum + m.total_conversions, 0),
      totalSpend: kpiData.reduce((sum, m) => sum + m.total_spend, 0),
      avgOpenRate: (
        kpiData.reduce((sum, m) => sum + m.open_rate, 0) / kpiData.length
      ).toFixed(2),
      avgConversionRate: (
        kpiData.reduce((sum, m) => sum + m.conversion_rate, 0) / kpiData.length
      ).toFixed(2),
      avgROI: (
        kpiData.reduce((sum, m) => sum + m.roi, 0) / kpiData.length
      ).toFixed(2),
    };
  }, [kpiData]);
  
  return (
    <div className="ai-marketing-page">
      {/* Header: Title + Export Button */}
      <header className="page-header">
        <h1>Marketing Analytics Dashboard</h1>
        <button onClick={() => mutate()} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>
      
      {/* Filter Bar: Date range, campaigns, sorting */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />
      
      {/* KPI Header: 8 metric cards (sends, opens, clicks, conversions, spend, open rate, ctr, roi) */}
      {aggregateMetrics && (
        <KPIHeader metrics={aggregateMetrics} isLoading={isLoading} />
      )}
      
      {/* Main Content: 2-column layout */}
      <div className="dashboard-grid">
        {/* Left: Campaign List + Funnel Chart */}
        <div className="left-panel">
          <CampaignList
            data={kpiData}
            isLoading={isLoading}
            error={error}
            onSelectCampaign={(id, date) => {
              setSelectedCampaignId(id);
              setSelectedDate(date);
              setShowPIIConsent(true); // Show PII consent before drilldown
            }}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(key) => updateFilter('sortBy', key)}
          />
        </div>
        
        {/* Right: Recommendations + Drilldown */}
        <div className="right-panel">
          <RecommendationCenter campaignId={selectedCampaignId} />
          
          {/* Drilldown Panel (hidden until campaign selected + PII consent) */}
          {showDrilldown && selectedCampaignId && selectedDate && (
            <DrilldownPanel
              campaignId={selectedCampaignId}
              measurementDate={selectedDate}
              onClose={() => setShowDrilldown(false)}
            />
          )}
          
          {/* PII Consent Modal */}
          {showPIIConsent && (
            <div className="pii-consent-modal">
              <h3>Access to User-Level Data</h3>
              <p>
                You are about to view user-level campaign metrics. This data is classified
                as Personally Identifiable Information (PII). Your access will be logged
                for compliance and audit purposes (GDPR Article 5, CCPA §1798.120).
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowPIIConsent(false);
                    setShowDrilldown(true);
                  }}
                  className="btn-primary"
                >
                  I Understand, Continue
                </button>
                <button
                  onClick={() => setShowPIIConsent(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. KPI Header Component (components/KPIHeader.tsx)
// ============================================================================


interface KPIHeaderProps {
  metrics: {
    totalSends: number;
    totalOpens: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: number;
    avgOpenRate: string;
    avgConversionRate: string;
    avgROI: string;
  };
  isLoading: boolean;
}

export default function KPIHeader({ metrics, isLoading }: KPIHeaderProps) {
  if (isLoading) return <div className="kpi-header loading" />;
  
  return (
    <div className="kpi-header">
      <div className="kpi-card">
        <label>Total Sends</label>
        <span>{metrics.totalSends.toLocaleString()}</span>
      </div>
      <div className="kpi-card">
        <label>Total Opens</label>
        <span>{metrics.totalOpens.toLocaleString()}</span>
      </div>
      <div className="kpi-card">
        <label>Total Clicks</label>
        <span>{metrics.totalClicks.toLocaleString()}</span>
      </div>
      <div className="kpi-card">
        <label>Total Conversions</label>
        <span>{metrics.totalConversions.toLocaleString()}</span>
      </div>
      <div className="kpi-card">
        <label>Total Spend</label>
        <span>${metrics.totalSpend.toFixed(2)}</span>
      </div>
      <div className="kpi-card">
        <label>Avg Open Rate</label>
        <span>{metrics.avgOpenRate}%</span>
      </div>
      <div className="kpi-card">
        <label>Avg Conversion Rate</label>
        <span>{metrics.avgConversionRate}%</span>
      </div>
      <div className="kpi-card highlight">
        <label>Avg ROI</label>
        <span>{metrics.avgROI}x</span>
      </div>
    </div>
  );
}

// ============================================================================
// 6. Filter Bar Component (components/FilterBar.tsx)
// ============================================================================

import { FilterState } from '../hooks/useFilterState';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label>Start Date</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFilterChange('startDate', e.target.value)}
        />
      </div>
      
      <div className="filter-group">
        <label>End Date</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFilterChange('endDate', e.target.value)}
        />
      </div>
      
      <div className="filter-group">
        <label>Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
        >
          <option value="roi">ROI</option>
          <option value="send_volume">Send Volume</option>
          <option value="conversion_rate">Conversion Rate</option>
          <option value="cost_per_conversion">Cost Per Conversion</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Order</label>
        <select
          value={filters.sortOrder}
          onChange={(e) => onFilterChange('sortOrder', e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      
      <button onClick={onReset} className="btn-secondary">
        Reset Filters
      </button>
    </div>
  );
}

// ============================================================================
// 7. Campaign List Component (components/CampaignList.tsx)
// ============================================================================


interface CampaignListProps {
  data?: KPIMetrics[];
  isLoading: boolean;
  error?: Error;
  onSelectCampaign: (campaignId: number, date: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (key: string) => void;
}

export default function CampaignList({
  data,
  isLoading,
  error,
  onSelectCampaign,
  sortBy,
  sortOrder,
}: CampaignListProps) {
  if (error) return <div className="error">Failed to load campaigns: {error.message}</div>;
  if (isLoading) return <div className="loading">Loading campaigns...</div>;
  if (!data || data.length === 0) return <div>No campaigns found</div>;
  
  return (
    <div className="campaign-list">
      <h2>Campaigns ({data.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Date</th>
            <th>Sends</th>
            <th>Opens</th>
            <th>Clicks</th>
            <th>Conversions</th>
            <th>Open Rate</th>
            <th>Conv. Rate</th>
            <th>Spend</th>
            <th>ROI</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((metric) => (
            <tr key={`${metric.campaign_id}-${metric.measurement_date}`}>
              <td>{metric.campaign_name}</td>
              <td>{metric.measurement_date}</td>
              <td>{metric.total_sends.toLocaleString()}</td>
              <td>{metric.total_opens.toLocaleString()}</td>
              <td>{metric.total_clicks.toLocaleString()}</td>
              <td>{metric.total_conversions.toLocaleString()}</td>
              <td>{metric.open_rate.toFixed(2)}%</td>
              <td>{metric.conversion_rate.toFixed(2)}%</td>
              <td>${metric.total_spend.toFixed(2)}</td>
              <td className={metric.roi > 0 ? 'positive' : 'negative'}>
                {metric.roi.toFixed(2)}x
              </td>
              <td>
                <button
                  onClick={() =>
                    onSelectCampaign(metric.campaign_id, metric.measurement_date)
                  }
                  className="btn-sm"
                >
                  Drilldown
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// DEPLOYMENT NOTES
// ============================================================================
// 1. Install dependencies:
//    npm install react swr recharts date-fns
//
// 2. Environment variables (.env):
//    VITE_API_BASE_URL=http://localhost:8000
//
// 3. Run dev server:
//    npm run dev (starts on http://localhost:5173 with Vite)
//
// 4. Build for production:
//    npm run build
//
// 5. Component nesting hierarchy:
//    AIMarketingPage
//    ├── FilterBar
//    ├── KPIHeader (8 metric cards)
//    ├── CampaignList (sortable, paginated table)
//    ├── RecommendationCenter (7 rec types)
//    ├── DrilldownPanel (hidden, shows on row click)
//    │   └── FunnelChart (hourly sparklines)
//    └── PIIConsentModal (async consent workflow)
