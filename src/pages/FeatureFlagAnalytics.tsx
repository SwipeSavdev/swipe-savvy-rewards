import React, { useState, useEffect } from 'react';
import './FeatureFlagAnalytics.css';

interface AnalyticsData {
  flag_key: string;
  flag_name: string;
  total_users: number;
  total_interactions: number;
  completion_rate: number;
  engagement_score: number;
  period_days: number;
  daily_data: Array<{
    date: string;
    users: number;
    interactions: number;
    completions: number;
  }>;
}

interface VariantData {
  name: string;
  percentage: number;
  users: number;
  conversions: number;
  conversion_rate: number;
}

const FeatureFlagAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real implementation, fetch actual analytics
      const mockData: AnalyticsData[] = [
        {
          flag_key: 'tier_progress_bar',
          flag_name: 'Tier Progress Bar',
          total_users: 12450,
          total_interactions: 34820,
          completion_rate: 87.5,
          engagement_score: 8.2,
          period_days: timeRange,
          daily_data: generateMockDailyData(timeRange),
        },
        {
          flag_key: 'social_sharing',
          flag_name: 'Social Sharing',
          total_users: 8920,
          total_interactions: 15640,
          completion_rate: 72.3,
          engagement_score: 7.1,
          period_days: timeRange,
          daily_data: generateMockDailyData(timeRange),
        },
        {
          flag_key: 'receipt_generation',
          flag_name: 'Receipt Generation',
          total_users: 6450,
          total_interactions: 12340,
          completion_rate: 81.2,
          engagement_score: 7.8,
          period_days: timeRange,
          daily_data: generateMockDailyData(timeRange),
        },
      ];
      setAnalyticsData(mockData);
      if (mockData.length > 0) {
        setSelectedFlag(mockData[0].flag_key);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateMockDailyData = (days: number) => {
    const data = [];
    for (let i = days; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 2000) + 500,
        interactions: Math.floor(Math.random() * 5000) + 1000,
        completions: Math.floor(Math.random() * 4000) + 500,
      });
    }
    return data;
  };

  const selectedAnalytics = analyticsData.find(
    (data) => data.flag_key === selectedFlag
  );

  if (loading) return <div className="ffa-container"><div className="ffa-loading">Loading...</div></div>;

  return (
    <div className="ffa-container">
      <div className="ffa-header">
        <h1>📊 Feature Flag Analytics</h1>
        <p>Monitor feature usage, engagement, and performance metrics</p>
      </div>

      {error && <div className="ffa-error">{error}</div>}

      <div className="ffa-controls">
        <div className="ffa-time-range">
          <label>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(parseInt(e.target.value))}>
            <option value={1}>Last 24 Hours</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="ffa-main-grid">
        <div className="ffa-flag-list">
          <h3>Features</h3>
          <div className="ffa-flags">
            {analyticsData.map((data) => (
              <div
                key={data.flag_key}
                className={`ffa-flag-item ${selectedFlag === data.flag_key ? 'active' : ''}`}
                onClick={() => setSelectedFlag(data.flag_key)}
              >
                <div className="ffa-flag-name">{data.flag_name}</div>
                <div className="ffa-flag-stats">
                  <span>{data.total_users.toLocaleString()} users</span>
                  <span>{data.engagement_score.toFixed(1)}/10 engagement</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedAnalytics && (
          <div className="ffa-analytics-main">
            <div className="ffa-metrics-grid">
              <div className="ffa-metric-card">
                <div className="ffa-metric-label">Total Users</div>
                <div className="ffa-metric-value">{selectedAnalytics.total_users.toLocaleString()}</div>
                <div className="ffa-metric-change">+12% from previous period</div>
              </div>

              <div className="ffa-metric-card">
                <div className="ffa-metric-label">Total Interactions</div>
                <div className="ffa-metric-value">
                  {selectedAnalytics.total_interactions.toLocaleString()}
                </div>
                <div className="ffa-metric-change">+8% from previous period</div>
              </div>

              <div className="ffa-metric-card">
                <div className="ffa-metric-label">Completion Rate</div>
                <div className="ffa-metric-value">
                  {selectedAnalytics.completion_rate.toFixed(1)}%
                </div>
                <div className="ffa-progress-bar">
                  <div
                    className="ffa-progress-fill"
                    style={{ width: `${selectedAnalytics.completion_rate}%` }}
                  />
                </div>
              </div>

              <div className="ffa-metric-card">
                <div className="ffa-metric-label">Engagement Score</div>
                <div className="ffa-metric-value">
                  {selectedAnalytics.engagement_score.toFixed(1)}/10
                </div>
                <div className="ffa-engagement-bar">
                  <div
                    className="ffa-engagement-fill"
                    style={{ width: `${(selectedAnalytics.engagement_score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="ffa-chart-container">
              <h3>Daily Trends</h3>
              <div className="ffa-chart">
                {selectedAnalytics.daily_data.map((day, index) => (
                  <div key={index} className="ffa-chart-column">
                    <div className="ffa-chart-bars">
                      <div
                        className="ffa-chart-bar users"
                        style={{
                          height: `${(day.users / 2500) * 100}%`,
                        }}
                        title={`Users: ${day.users}`}
                      />
                      <div
                        className="ffa-chart-bar interactions"
                        style={{
                          height: `${(day.interactions / 6000) * 100}%`,
                        }}
                        title={`Interactions: ${day.interactions}`}
                      />
                    </div>
                    <div className="ffa-chart-date">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="ffa-chart-legend">
                <span>
                  <span className="ffa-legend-color users"></span> Users
                </span>
                <span>
                  <span className="ffa-legend-color interactions"></span> Interactions
                </span>
              </div>
            </div>

            <div className="ffa-variants-container">
              <h3>A/B Test Variants</h3>
              <div className="ffa-variants-grid">
                {[
                  {
                    name: 'Control',
                    percentage: 50,
                    users: selectedAnalytics.total_users / 2,
                    conversions: Math.floor((selectedAnalytics.total_users / 2) * 0.85),
                    conversion_rate: 85.2,
                  },
                  {
                    name: 'Treatment',
                    percentage: 50,
                    users: selectedAnalytics.total_users / 2,
                    conversions: Math.floor((selectedAnalytics.total_users / 2) * 0.88),
                    conversion_rate: 88.5,
                  },
                ].map((variant) => (
                  <div key={variant.name} className="ffa-variant-card">
                    <h4>{variant.name}</h4>
                    <div className="ffa-variant-stat">
                      <span>Sample Size:</span>
                      <strong>{variant.users.toLocaleString()}</strong>
                    </div>
                    <div className="ffa-variant-stat">
                      <span>Conversions:</span>
                      <strong>{variant.conversions.toLocaleString()}</strong>
                    </div>
                    <div className="ffa-variant-stat">
                      <span>Conversion Rate:</span>
                      <strong>{variant.conversion_rate.toFixed(1)}%</strong>
                    </div>
                    <div className="ffa-variant-progress">
                      <div
                        className="ffa-variant-fill"
                        style={{ width: `${variant.conversion_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureFlagAnalytics;
