/**
 * AI Marketing Page Fix
 * 
 * This file contains a fixed version of the AIMarketingPage component
 * with proper error handling and fallback UI
 * 
 * Copy this to: swipesavvy-admin-portal/src/pages/AIMarketingPage.tsx
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, TrendingUp, Users } from 'lucide-react';

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  campaign_type: string;
  status: string;
  created_at: string;
  sent_count?: number;
  conversion_rate?: number;
}

interface Segment {
  pattern: string;
  size: number;
  avgSpend?: number;
  percentage?: number;
}

interface Analytics {
  total_campaigns?: number;
  active_campaigns?: number;
  total_sent?: number;
  avg_conversion_rate?: number;
}

export function AIMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'segments' | 'analytics'>('campaigns');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch campaigns
      try {
        const campaignsRes = await fetch('http://localhost:8000/api/marketing/campaigns?limit=10', {
          timeout: 5000
        } as any);
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.warn('Could not fetch campaigns:', err);
      }

      // Try to fetch segments
      try {
        const segmentsRes = await fetch('http://localhost:8000/api/marketing/segments?limit=10', {
          timeout: 5000
        } as any);
        if (segmentsRes.ok) {
          const data = await segmentsRes.json();
          setSegments(data.segments || []);
        }
      } catch (err) {
        console.warn('Could not fetch segments:', err);
      }

      // Try to fetch analytics
      try {
        const analyticsRes = await fetch('http://localhost:8000/api/marketing/analytics', {
          timeout: 5000
        } as any);
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data || {});
        }
      } catch (err) {
        console.warn('Could not fetch analytics:', err);
      }

      // If no data was fetched, show warning but don't error
      if (campaigns.length === 0 && segments.length === 0) {
        setError('Backend API unavailable. Showing demo data.');
        setDemoData();
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load marketing data');
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  const setDemoData = () => {
    // Set demo data to show UI
    setCampaigns([
      {
        campaign_id: 1,
        campaign_name: 'Holiday Challenge',
        campaign_type: 'Challenge',
        status: 'active',
        created_at: '2025-12-01',
        sent_count: 5542,
        conversion_rate: 28.5
      },
      {
        campaign_id: 2,
        campaign_name: 'New Year Cashback',
        campaign_type: 'Loyalty',
        status: 'active',
        created_at: '2025-12-20',
        sent_count: 3200,
        conversion_rate: 15.8
      }
    ]);

    setSegments([
      { pattern: 'High Spender', size: 2850, avgSpend: 8500, percentage: 22 },
      { pattern: 'Frequent Shopper', size: 7912, avgSpend: 2100, percentage: 61 },
      { pattern: 'Location Clustered', size: 2080, avgSpend: 3200, percentage: 16 }
    ]);

    setAnalytics({
      total_campaigns: 12,
      active_campaigns: 2,
      total_sent: 8742,
      avg_conversion_rate: 22.1
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-8 h-8 text-blue-600" />
          AI Marketing Engine
        </h1>
        <p className="text-gray-600 mt-2">Automated behavioral targeting with multi-channel notifications</p>
      </div>

      {error && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900">Notice</h3>
            <p className="text-amber-700 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-1">Active Campaigns</div>
            <div className="text-3xl font-bold text-blue-600">{analytics.active_campaigns || 0}</div>
            <div className="text-xs text-blue-700 mt-2">of {analytics.total_campaigns || 0} total</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-sm font-medium text-green-900 mb-1">Notifications Sent</div>
            <div className="text-3xl font-bold text-green-600">{(analytics.total_sent || 0).toLocaleString()}</div>
            <div className="text-xs text-green-700 mt-2">messages delivered</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-sm font-medium text-purple-900 mb-1">Avg Conversion Rate</div>
            <div className="text-3xl font-bold text-purple-600">{(analytics.avg_conversion_rate || 0).toFixed(1)}%</div>
            <div className="text-xs text-purple-700 mt-2">across all campaigns</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="text-sm font-medium text-orange-900 mb-1">Channels Active</div>
            <div className="text-3xl font-bold text-orange-600">4</div>
            <div className="text-xs text-orange-700 mt-2">📧 📱 💬 🔔</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📊 Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('segments')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'segments'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            👥 Segments ({segments.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No campaigns available</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.campaign_name}</h3>
                    <p className="text-sm text-gray-600">{campaign.campaign_type} • {campaign.status}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                    {campaign.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Sent:</span>
                    <div className="font-bold text-gray-900">{(campaign.sent_count || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Conversion:</span>
                    <div className="font-bold text-gray-900">{(campaign.conversion_rate || 0).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <div className="font-bold text-gray-900">{new Date(campaign.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 col-span-full">
              <p>No segments available</p>
            </div>
          ) : (
            segments.map((segment) => (
              <div key={segment.pattern} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{segment.pattern}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <div className="font-bold text-gray-900">{segment.size.toLocaleString()} users</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Percentage:</span>
                    <div className="font-bold text-gray-900">{segment.percentage || 0}%</div>
                  </div>
                  {segment.avgSpend && (
                    <div>
                      <span className="text-gray-600">Avg Spend:</span>
                      <div className="font-bold text-gray-900">${(segment.avgSpend).toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Performance Overview</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{campaigns.length}</div>
                <div className="text-sm text-gray-600">Total Campaigns</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{segments.length}</div>
                <div className="text-sm text-gray-600">Segments</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {(campaigns.reduce((sum, c) => sum + (c.conversion_rate || 0), 0) / Math.max(campaigns.length, 1)).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Avg Conversion</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-gray-700">
              The AI Marketing Engine is configured and ready. Connect your backend to see live campaign data, segment analysis, and performance metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIMarketingPage;
