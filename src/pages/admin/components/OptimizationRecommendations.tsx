/**
 * Optimization Recommendations Component
 * Displays ML-based optimization suggestions and recommendations
 * 
 * Features:
 * - Offer optimization recommendations
 * - Optimal send time suggestions
 * - Merchant affinity insights
 * - Segment recommendations
 * - Real-time optimization impact estimates
 * - One-click optimization application
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';
import {
  Lightbulb, TrendingUp, Clock, Users, DollarSign, Check,
  AlertCircle, RefreshCw, ChevronRight, Target, Zap
} from 'lucide-react';

interface Recommendation {
  recommendation_id: string;
  campaign_id: string;
  recommendation_type: 'offer' | 'send_time' | 'segment' | 'merchant';
  title: string;
  description: string;
  current_value: number;
  recommended_value: number;
  expected_impact: number;
  impact_type: 'conversion_rate' | 'revenue' | 'roi' | 'engagement';
  confidence_score: number;
  affected_users: number;
  estimated_roi_improvement: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  applied: boolean;
  applied_at?: string;
}

interface OfferOptimization {
  segment: string;
  current_offer: number;
  recommended_offer: number;
  expected_lift: number;
  affected_users: number;
  confidence: number;
}

interface SendTimeOptimization {
  segment: string;
  current_time: string;
  recommended_time: string;
  open_rate_improvement: number;
  affected_users: number;
}

interface MerchantAffinity {
  merchant_id: string;
  merchant_name: string;
  affinity_score: number;
  user_count: number;
  avg_purchase_value: number;
  recommendation: string;
}

interface OptimizationRecommendationsProps {
  campaignId: string;
  onApplyRecommendation?: (recommendationId: string) => void;
}

/**
 * Optimization Recommendations Component
 */
export const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({
  campaignId,
  onApplyRecommendation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'offers' | 'timing' | 'merchants' | 'segments'>('overview');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [offerOptimizations, setOfferOptimizations] = useState<OfferOptimization[]>([]);
  const [sendTimeOptimizations, setSendTimeOptimizations] = useState<SendTimeOptimization[]>([]);
  const [merchantAffinities, setMerchantAffinities] = useState<MerchantAffinity[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/optimize/recommendations/${campaignId}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        
        const data = await response.json();
        setRecommendations(data.data || []);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [campaignId]);

  // Load offer optimizations
  useEffect(() => {
    const loadOfferOptimizations = async () => {
      try {
        const response = await fetch(`/api/optimize/offer/${campaignId}`);
        if (!response.ok) throw new Error('Failed to fetch offer optimizations');
        
        const data = await response.json();
        setOfferOptimizations(data.data || []);
      } catch (error) {
        console.error('Error loading offer optimizations:', error);
      }
    };

    if (activeTab === 'offers' || activeTab === 'overview') {
      loadOfferOptimizations();
    }
  }, [campaignId, activeTab]);

  // Load send time optimizations
  useEffect(() => {
    const loadSendTimeOptimizations = async () => {
      try {
        const response = await fetch(`/api/optimize/send-time/${campaignId}`);
        if (!response.ok) throw new Error('Failed to fetch send time optimizations');
        
        const data = await response.json();
        setSendTimeOptimizations(data.data || []);
      } catch (error) {
        console.error('Error loading send time optimizations:', error);
      }
    };

    if (activeTab === 'timing' || activeTab === 'overview') {
      loadSendTimeOptimizations();
    }
  }, [campaignId, activeTab]);

  // Load merchant affinities
  useEffect(() => {
    const loadMerchantAffinities = async () => {
      try {
        const response = await fetch(`/api/optimize/affinity/${campaignId}`);
        if (!response.ok) throw new Error('Failed to fetch merchant affinities');
        
        const data = await response.json();
        setMerchantAffinities(data.data || []);
      } catch (error) {
        console.error('Error loading merchant affinities:', error);
      }
    };

    if (activeTab === 'merchants' || activeTab === 'overview') {
      loadMerchantAffinities();
    }
  }, [campaignId, activeTab]);

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      setApplyingId(recommendationId);
      const response = await fetch(`/api/optimize/apply/${recommendationId}`, { method: 'POST' });
      
      if (!response.ok) throw new Error('Failed to apply recommendation');
      
      // Update local state
      setRecommendations(
        recommendations.map((rec) =>
          rec.recommendation_id === recommendationId
            ? { ...rec, applied: true, applied_at: new Date().toISOString() }
            : rec
        )
      );

      if (onApplyRecommendation) {
        onApplyRecommendation(recommendationId);
      }
    } catch (error) {
      console.error('Error applying recommendation:', error);
    } finally {
      setApplyingId(null);
    }
  };

  const getTotalEstimatedImprovement = () => {
    return recommendations
      .filter((r) => !r.applied)
      .reduce((sum, r) => sum + r.expected_impact, 0);
  };

  return (
    <div className="optimization-recommendations p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb size={32} className="text-yellow-500" />
          AI Optimization Recommendations
        </h1>
        <p className="text-gray-600 mt-2">
          Machine learning insights to improve campaign performance
        </p>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Total Recommendations"
          value={recommendations.length.toString()}
          icon={Lightbulb}
          color="yellow"
        />
        <SummaryCard
          label="Applied"
          value={recommendations.filter((r) => r.applied).length.toString()}
          icon={Check}
          color="green"
        />
        <SummaryCard
          label="Potential Improvement"
          value={`${getTotalEstimatedImprovement().toFixed(1)}%`}
          icon={TrendingUp}
          color="blue"
        />
        <SummaryCard
          label="Avg Confidence"
          value={`${(recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / (recommendations.length || 1)).toFixed(0)}%`}
          icon={Zap}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['overview', 'offers', 'timing', 'merchants', 'segments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'offers' && 'Offer Optimization'}
            {tab === 'timing' && 'Send Timing'}
            {tab === 'merchants' && 'Merchant Affinity'}
            {tab === 'segments' && 'Segment Recommendations'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab
            recommendations={recommendations}
            onApply={handleApplyRecommendation}
            applyingId={applyingId}
          />
        )}

        {activeTab === 'offers' && (
          <OffersTab
            optimizations={offerOptimizations}
            recommendations={recommendations}
          />
        )}

        {activeTab === 'timing' && (
          <TimingTab optimizations={sendTimeOptimizations} />
        )}

        {activeTab === 'merchants' && (
          <MerchantsTab affinities={merchantAffinities} />
        )}

        {activeTab === 'segments' && (
          <SegmentsTab recommendations={recommendations} />
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
 * Summary Card Component
 */
const SummaryCard: React.FC<{
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: 'yellow' | 'green' | 'blue' | 'purple';
}> = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-lg border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon size={32} className="opacity-30" />
      </div>
    </div>
  );
};

/**
 * Overview Tab
 */
const OverviewTab: React.FC<{
  recommendations: Recommendation[];
  onApply: (id: string) => void;
  applyingId: string | null;
}> = ({ recommendations, onApply, applyingId }) => {
  const byPriority = {
    critical: recommendations.filter((r) => r.priority === 'critical'),
    high: recommendations.filter((r) => r.priority === 'high'),
    medium: recommendations.filter((r) => r.priority === 'medium'),
    low: recommendations.filter((r) => r.priority === 'low'),
  };

  return (
    <div className="space-y-6">
      {/* Critical Recommendations */}
      {byPriority.critical.length > 0 && (
        <RecommendationSection
          title="🔴 Critical - Act Now"
          recommendations={byPriority.critical}
          onApply={onApply}
          applyingId={applyingId}
        />
      )}

      {/* High Priority */}
      {byPriority.high.length > 0 && (
        <RecommendationSection
          title="🟠 High Priority"
          recommendations={byPriority.high}
          onApply={onApply}
          applyingId={applyingId}
        />
      )}

      {/* Medium Priority */}
      {byPriority.medium.length > 0 && (
        <RecommendationSection
          title="🟡 Medium Priority"
          recommendations={byPriority.medium}
          onApply={onApply}
          applyingId={applyingId}
        />
      )}

      {/* Low Priority */}
      {byPriority.low.length > 0 && (
        <RecommendationSection
          title="🟢 Low Priority"
          recommendations={byPriority.low}
          onApply={onApply}
          applyingId={applyingId}
        />
      )}

      {recommendations.length === 0 && (
        <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
          <Check size={48} className="mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Optimized!</h3>
          <p className="text-gray-600">
            Campaign is performing well. No new recommendations at this time.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Recommendation Section Component
 */
const RecommendationSection: React.FC<{
  title: string;
  recommendations: Recommendation[];
  onApply: (id: string) => void;
  applyingId: string | null;
}> = ({ title, recommendations, onApply, applyingId }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </div>
    
    <div className="divide-y divide-gray-200">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.recommendation_id}
          recommendation={rec}
          onApply={onApply}
          isApplying={applyingId === rec.recommendation_id}
        />
      ))}
    </div>
  </div>
);

/**
 * Recommendation Card Component
 */
const RecommendationCard: React.FC<{
  recommendation: Recommendation;
  onApply: (id: string) => void;
  isApplying: boolean;
}> = ({ recommendation, onApply, isApplying }) => {
  const impactIcons = {
    conversion_rate: TrendingUp,
    revenue: DollarSign,
    roi: Zap,
    engagement: Users,
  };

  const ImpactIcon = impactIcons[recommendation.impact_type];

  return (
    <div className="p-6 hover:bg-blue-50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            {recommendation.title}
            <span className={`text-sm px-2 py-1 rounded font-medium ${
              recommendation.priority === 'critical' ? 'bg-red-100 text-red-700' :
              recommendation.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {recommendation.priority}
            </span>
          </h4>
          <p className="text-gray-600 mt-2">{recommendation.description}</p>
        </div>
        <button
          onClick={() => onApply(recommendation.recommendation_id)}
          disabled={isApplying || recommendation.applied}
          className={`px-4 py-2 rounded-lg font-medium ml-4 flex gap-2 items-center transition ${
            recommendation.applied
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          } disabled:opacity-50`}
        >
          {isApplying && <RefreshCw size={16} className="animate-spin" />}
          {recommendation.applied ? (
            <>
              <Check size={16} />
              Applied
            </>
          ) : (
            <>
              <ChevronRight size={16} />
              Apply
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-600">Current Value</p>
          <p className="font-semibold text-gray-900 mt-1">{recommendation.current_value.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Recommended</p>
          <p className="font-semibold text-blue-600 mt-1">{recommendation.recommended_value.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Expected Impact</p>
          <p className="font-semibold text-green-600 mt-1">+{recommendation.expected_impact.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Confidence</p>
          <div className="mt-1 flex items-center gap-1">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${recommendation.confidence_score}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">{recommendation.confidence_score}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600">Affected Users</p>
          <p className="font-semibold text-gray-900 mt-1">{recommendation.affected_users.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Offers Tab
 */
const OffersTab: React.FC<{
  optimizations: OfferOptimization[];
  recommendations: Recommendation[];
}> = ({ optimizations, recommendations }) => {
  if (optimizations.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offer Data</h3>
        <p className="text-gray-600">Insufficient data to optimize offers</p>
      </div>
    );
  }

  const chartData = optimizations.map((opt) => ({
    segment: opt.segment,
    current: opt.current_offer,
    recommended: opt.recommended_offer,
    lift: opt.expected_lift,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Offer Adjustment by Segment</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#9ca3af" name="Current Offer" />
            <Bar dataKey="recommended" fill="#3b82f6" name="Recommended Offer" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Segment</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Current Offer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Recommended</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Expected Lift</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Affected Users</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {optimizations.map((opt, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{opt.segment}</td>
                <td className="px-6 py-4 text-gray-900">${opt.current_offer.toFixed(2)}</td>
                <td className="px-6 py-4 font-semibold text-blue-600">${opt.recommended_offer.toFixed(2)}</td>
                <td className="px-6 py-4 text-green-600 font-semibold">+{opt.expected_lift.toFixed(1)}%</td>
                <td className="px-6 py-4 text-gray-900">{opt.affected_users.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${opt.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{opt.confidence}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Timing Tab
 */
const TimingTab: React.FC<{ optimizations: SendTimeOptimization[] }> = ({ optimizations }) => {
  if (optimizations.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Timing Data</h3>
        <p className="text-gray-600">Insufficient data to optimize send times</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Segment</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Current Send Time</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Recommended Time</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Open Rate Improvement</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Affected Users</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {optimizations.map((opt, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{opt.segment}</td>
              <td className="px-6 py-4 text-gray-900">{opt.current_time}</td>
              <td className="px-6 py-4 font-semibold text-blue-600">{opt.recommended_time}</td>
              <td className="px-6 py-4 text-green-600 font-semibold">+{opt.open_rate_improvement.toFixed(1)}%</td>
              <td className="px-6 py-4 text-gray-900">{opt.affected_users.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Merchants Tab
 */
const MerchantsTab: React.FC<{ affinities: MerchantAffinity[] }> = ({ affinities }) => {
  if (affinities.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <Target size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Merchant Data</h3>
        <p className="text-gray-600">Merchant affinity data will appear here</p>
      </div>
    );
  }

  const chartData = affinities.slice(0, 8).map((m) => ({
    name: m.merchant_name,
    value: m.affinity_score,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Top Merchant Affinities</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Merchant</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Affinity Score</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Users</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Avg Purchase</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {affinities.map((merchant) => (
              <tr key={merchant.merchant_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{merchant.merchant_name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${merchant.affinity_score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{(merchant.affinity_score * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{merchant.user_count.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-900">${merchant.avg_purchase_value.toFixed(2)}</td>
                <td className="px-6 py-4 text-blue-600 font-medium">{merchant.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Segments Tab
 */
const SegmentsTab: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => {
  const segmentRecs = recommendations.filter((r) => r.recommendation_type === 'segment');

  if (segmentRecs.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <Users size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Segment Recommendations</h3>
        <p className="text-gray-600">Segment optimization will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {segmentRecs.map((rec) => (
        <div key={rec.recommendation_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{rec.title}</h4>
              <p className="text-gray-600 mt-2">{rec.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600">Affected Users</p>
              <p className="font-semibold text-gray-900 mt-1">{rec.affected_users.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Expected Lift</p>
              <p className="font-semibold text-green-600 mt-1">+{rec.expected_impact.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Confidence</p>
              <p className="font-semibold text-gray-900 mt-1">{rec.confidence_score}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">ROI Improvement</p>
              <p className="font-semibold text-blue-600 mt-1">+${rec.estimated_roi_improvement.toFixed(0)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OptimizationRecommendations;
