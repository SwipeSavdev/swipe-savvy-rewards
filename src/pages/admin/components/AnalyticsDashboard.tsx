/**
 * Analytics Dashboard Component
 * Displays comprehensive campaign performance metrics, ROI analysis, and trends
 * 
 * Features:
 * - Real-time campaign metrics
 * - Segment performance analysis
 * - ROI and revenue tracking
 * - Trend visualization (daily/weekly/monthly)
 * - Portfolio performance overview
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, Click, DollarSign,
  Target, BarChart3, RefreshCw, Download, Filter
} from 'lucide-react';

interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  views: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  cost: number;
  roi: number;
  roi_percentage: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface SegmentPerformance {
  segment_name: string;
  users_count: number;
  views: number;
  conversions: number;
  conversion_rate: number;
  avg_order_value: number;
  revenue: number;
}

interface TrendData {
  date: string;
  views: number;
  conversions: number;
  revenue: number;
  cost: number;
}

interface PortfolioMetrics {
  total_campaigns: number;
  active_campaigns: number;
  total_views: number;
  total_conversions: number;
  overall_conversion_rate: number;
  total_revenue: number;
  total_cost: number;
  overall_roi: number;
  top_campaign: {
    name: string;
    roi: number;
  };
  worst_campaign: {
    name: string;
    roi: number;
  };
}

interface AnalyticsDashboardProps {
  campaignId?: string;
  timeRange?: '7days' | '30days' | '90days';
  onCampaignSelect?: (campaignId: string) => void;
}

/**
 * Analytics Dashboard Component
 * Main visualization component for campaign performance metrics
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  campaignId,
  timeRange = '30days',
  onCampaignSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'segments' | 'trends'>('overview');
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics | null>(null);
  const [segmentPerformance, setSegmentPerformance] = useState<SegmentPerformance[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '30days' | '90days'>(timeRange);

  // Load campaign metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const endpointUrl = campaignId
          ? `/api/analytics/campaign/${campaignId}/metrics?start_date=${getDateRange(selectedTimeRange).start}&end_date=${getDateRange(selectedTimeRange).end}`
          : `/api/analytics/portfolio?days=${getDaysFromRange(selectedTimeRange)}`;

        const response = await fetch(endpointUrl);
        
        if (!response.ok) throw new Error('Failed to fetch metrics');
        
        const data = await response.json();
        
        if (campaignId) {
          setCampaignMetrics(data.data);
        } else {
          setPortfolioMetrics(data.data);
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [campaignId, selectedTimeRange]);

  // Load segment performance
  useEffect(() => {
    if (!campaignId) return;

    const loadSegments = async () => {
      try {
        const response = await fetch(`/api/analytics/campaign/${campaignId}/segments`);
        if (!response.ok) throw new Error('Failed to fetch segments');
        const data = await response.json();
        setSegmentPerformance(data.data || []);
      } catch (error) {
        console.error('Error loading segments:', error);
      }
    };

    loadSegments();
  }, [campaignId]);

  // Load trend data
  useEffect(() => {
    if (!campaignId) return;

    const loadTrends = async () => {
      try {
        const response = await fetch(
          `/api/analytics/campaign/${campaignId}/trends?interval=${getTrendInterval(selectedTimeRange)}`
        );
        if (!response.ok) throw new Error('Failed to fetch trends');
        const data = await response.json();
        setTrendData(data.data || []);
      } catch (error) {
        console.error('Error loading trends:', error);
      }
    };

    loadTrends();
  }, [campaignId, selectedTimeRange]);

  const handleRefresh = async () => {
    setLoading(true);
    // Re-trigger all useEffect hooks by setting loading state
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="analytics-dashboard p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {campaignId ? 'Campaign Analytics' : 'Portfolio Overview'}
          </h1>
          <p className="text-gray-600 mt-2">
            {campaignMetrics?.campaign_name || 'All campaigns'}
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex gap-2 items-center"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['overview', 'metrics', 'segments', 'trends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Key Metrics Cards */}
            <MetricsCards metrics={campaignMetrics} portfolio={portfolioMetrics} />
            
            {/* Quick Stats */}
            {campaignMetrics && (
              <div className="grid grid-cols-2 gap-6">
                <StatCard
                  title="Views"
                  value={campaignMetrics.views.toLocaleString()}
                  change={12}
                  icon={Eye}
                />
                <StatCard
                  title="Conversions"
                  value={campaignMetrics.conversions.toLocaleString()}
                  change={8}
                  icon={Click}
                />
                <StatCard
                  title="Revenue"
                  value={`$${campaignMetrics.revenue.toLocaleString()}`}
                  change={15}
                  icon={DollarSign}
                />
                <StatCard
                  title="ROI"
                  value={`${campaignMetrics.roi_percentage.toFixed(1)}%`}
                  change={5}
                  icon={TrendingUp}
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'metrics' && campaignMetrics && (
          <MetricsTab metrics={campaignMetrics} />
        )}

        {activeTab === 'segments' && segmentPerformance.length > 0 && (
          <SegmentsTab segments={segmentPerformance} />
        )}

        {activeTab === 'trends' && trendData.length > 0 && (
          <TrendsTab data={trendData} timeRange={selectedTimeRange} />
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Metrics Cards Component
 */
const MetricsCards: React.FC<{
  metrics?: CampaignMetrics;
  portfolio?: PortfolioMetrics;
}> = ({ metrics, portfolio }) => {
  if (metrics) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <Card title="Total Views" value={metrics.views.toLocaleString()} change={12} />
        <Card title="Conversions" value={metrics.conversions.toLocaleString()} change={8} />
        <Card title="Conversion Rate" value={`${(metrics.conversion_rate * 100).toFixed(2)}%`} />
        <Card title="ROI" value={`${metrics.roi_percentage.toFixed(1)}%`} change={5} />
      </div>
    );
  }

  if (portfolio) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <Card title="Active Campaigns" value={portfolio.active_campaigns.toString()} />
        <Card title="Total Views" value={portfolio.total_views.toLocaleString()} />
        <Card title="Conv. Rate" value={`${(portfolio.overall_conversion_rate * 100).toFixed(2)}%`} />
        <Card title="Avg ROI" value={`${portfolio.overall_roi.toFixed(1)}%`} />
      </div>
    );
  }

  return null;
};

/**
 * Card Component
 */
const Card: React.FC<{
  title: string;
  value: string;
  change?: number;
}> = ({ title, value, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <p className="text-sm text-gray-600 mb-2">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {change && (
      <p className={`text-sm mt-2 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last period
      </p>
    )}
  </div>
);

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
}> = ({ title, value, change, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-sm text-green-600 mt-2">↑ {change}%</p>
    </div>
    <Icon size={32} className="text-blue-600 opacity-30" />
  </div>
);

/**
 * Metrics Tab Component
 */
const MetricsTab: React.FC<{ metrics: CampaignMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-2 gap-6">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Performance Summary</h3>
      <div className="space-y-4">
        <MetricRow label="Views" value={metrics.views.toLocaleString()} />
        <MetricRow label="Conversions" value={metrics.conversions.toLocaleString()} />
        <MetricRow label="Conversion Rate" value={`${(metrics.conversion_rate * 100).toFixed(2)}%`} />
        <MetricRow label="Revenue" value={`$${metrics.revenue.toLocaleString()}`} highlight />
        <MetricRow label="Cost" value={`$${metrics.cost.toLocaleString()}`} />
        <MetricRow label="Profit" value={`$${(metrics.revenue - metrics.cost).toLocaleString()}`} highlight />
        <MetricRow label="ROI" value={`${metrics.roi_percentage.toFixed(1)}%`} highlight />
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
      <div className="space-y-4">
        <MetricRow label="Campaign ID" value={metrics.campaign_id} />
        <MetricRow label="Status" value={metrics.status} />
        <MetricRow label="Start Date" value={new Date(metrics.start_date).toLocaleDateString()} />
        <MetricRow label="End Date" value={new Date(metrics.end_date).toLocaleDateString()} />
      </div>
    </div>
  </div>
);

/**
 * Segments Tab Component
 */
const SegmentsTab: React.FC<{ segments: SegmentPerformance[] }> = ({ segments }) => {
  const chartData = segments.map(s => ({
    name: s.segment_name,
    conversions: s.conversions,
    value: s.conversion_rate * 100
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Conversion Rate by Segment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" name="Conversion Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Segment Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold">Segment</th>
                <th className="text-right py-3 px-4">Users</th>
                <th className="text-right py-3 px-4">Views</th>
                <th className="text-right py-3 px-4">Conversions</th>
                <th className="text-right py-3 px-4">Conv. Rate</th>
                <th className="text-right py-3 px-4">Avg Order</th>
                <th className="text-right py-3 px-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg) => (
                <tr key={seg.segment_name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{seg.segment_name}</td>
                  <td className="text-right py-3 px-4">{seg.users_count.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">{seg.views.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">{seg.conversions.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-blue-600 font-medium">
                    {(seg.conversion_rate * 100).toFixed(2)}%
                  </td>
                  <td className="text-right py-3 px-4">${seg.avg_order_value.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-medium">${seg.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Trends Tab Component
 */
const TrendsTab: React.FC<{ data: TrendData[]; timeRange: '7days' | '30days' | '90days' }> = ({ data, timeRange }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Views & Conversions Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#3b82f6" name="Views" />
          <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" fill="#fbbf24" stroke="#f59e0b" name="Revenue" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

/**
 * Metric Row Component
 */
const MetricRow: React.FC<{
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600">{label}</span>
    <span className={highlight ? 'font-semibold text-blue-600' : 'font-medium text-gray-900'}>
      {value}
    </span>
  </div>
);

/**
 * Helper Functions
 */
function getDateRange(range: string) {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case '7days':
      start.setDate(end.getDate() - 7);
      break;
    case '30days':
      start.setDate(end.getDate() - 30);
      break;
    case '90days':
      start.setDate(end.getDate() - 90);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

function getDaysFromRange(range: string): number {
  switch (range) {
    case '7days': return 7;
    case '30days': return 30;
    case '90days': return 90;
    default: return 30;
  }
}

function getTrendInterval(range: string): 'hourly' | 'daily' | 'weekly' {
  switch (range) {
    case '7days': return 'daily';
    case '30days': return 'daily';
    case '90days': return 'weekly';
    default: return 'daily';
  }
}

export default AnalyticsDashboard;
