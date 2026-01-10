import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useRealtimeDashboard, useRealtimeData } from '@/services/websocket';
import { apiClient } from '@/services/api';

interface SatisfactionMetrics {
  averageScore: number;
  totalRatings: number;
  ratingDistribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  trend: number; // percentage change from previous period
  lastUpdated: string;
}

interface CustomerSatisfactionMetricsRealtimeProps {
  timeRangeHours?: number;
}

const CustomerSatisfactionMetricsRealtime: React.FC<
  CustomerSatisfactionMetricsRealtimeProps
> = ({ timeRangeHours = 24 }) => {
  const [metrics, setMetrics] = useState<SatisfactionMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeDashboard();

  // Subscribe to metrics updates
  useRealtimeData('metrics_updated', (data) => {
    if (data.metrics?.satisfactionMetrics) {
      setMetrics(data.metrics.satisfactionMetrics);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  });

  // Fetch initial metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/satisfaction-metrics?hours=${timeRangeHours}`
        );
        setMetrics(response.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch satisfaction metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRangeHours]);

  if (loading && !metrics) {
    return (
      <div className="satisfaction-panel loading">
        <p>Loading satisfaction metrics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="satisfaction-panel error">
        <p>Unable to load satisfaction metrics</p>
      </div>
    );
  }

  const getRatingColor = (score: number) => {
    if (score >= 4.5) return '#48bb78'; // green
    if (score >= 4.0) return '#38a169'; // dark green
    if (score >= 3.5) return '#ed8936'; // orange
    if (score >= 3.0) return '#dd6b20'; // dark orange
    return '#f56565'; // red
  };

  const getDistributionPercentages = () => {
    const total = Object.values(metrics.ratingDistribution).reduce((a, b) => a + b, 0);
    if (total === 0) return { five: 0, four: 0, three: 0, two: 0, one: 0 };

    return {
      five: (metrics.ratingDistribution.five_star / total) * 100,
      four: (metrics.ratingDistribution.four_star / total) * 100,
      three: (metrics.ratingDistribution.three_star / total) * 100,
      two: (metrics.ratingDistribution.two_star / total) * 100,
      one: (metrics.ratingDistribution.one_star / total) * 100,
    };
  };

  const percentages = getDistributionPercentages();

  return (
    <div className={`satisfaction-panel ${isConnected ? 'live' : ''}`}>
      <div className="satisfaction-header">
        <div>
          <h3>Customer Satisfaction</h3>
          <p className="subtitle">Real-time CSAT metrics and ratings distribution</p>
        </div>
        <div className="status-bar">
          {isConnected && (
            <>
              <span className="live-badge">
                <span className="pulse" />
                Live Updates Active
              </span>
              <span className="last-update">Updated: {lastUpdate}</span>
            </>
          )}
        </div>
      </div>

      <div className="satisfaction-content">
        {/* Main Score Card */}
        <div className="score-card">
          <div className="score-display">
            <div
              className="score-number"
              style={{ color: getRatingColor(metrics.averageScore) }}
            >
              {metrics.averageScore.toFixed(2)}
            </div>
            <div className="score-label">/ 5.0</div>
          </div>
          <div className="score-info">
            <div className="info-row">
              <span className="info-label">Total Ratings</span>
              <span className="info-value">{metrics.totalRatings}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Trend</span>
              <span
                className="info-value trend"
                style={{
                  color: metrics.trend >= 0 ? '#48bb78' : '#f56565',
                }}
              >
                {metrics.trend >= 0 ? '+' : ''}{metrics.trend}%
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rating-distribution">
          <h4>Rating Distribution</h4>

          <div className="rating-bar">
            <div className="rating-label"><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /> 5 Stars</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${percentages.five}%`,
                  backgroundColor: '#48bb78',
                }}
              />
            </div>
            <div className="count">{metrics.ratingDistribution.five_star}</div>
          </div>

          <div className="rating-bar">
            <div className="rating-label"><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /> 4 Stars</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${percentages.four}%`,
                  backgroundColor: '#38a169',
                }}
              />
            </div>
            <div className="count">{metrics.ratingDistribution.four_star}</div>
          </div>

          <div className="rating-bar">
            <div className="rating-label"><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /> 3 Stars</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${percentages.three}%`,
                  backgroundColor: '#ed8936',
                }}
              />
            </div>
            <div className="count">{metrics.ratingDistribution.three_star}</div>
          </div>

          <div className="rating-bar">
            <div className="rating-label"><Star className="w-3 h-3 inline text-yellow-500" /><Star className="w-3 h-3 inline text-yellow-500" /> 2 Stars</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${percentages.two}%`,
                  backgroundColor: '#dd6b20',
                }}
              />
            </div>
            <div className="count">{metrics.ratingDistribution.two_star}</div>
          </div>

          <div className="rating-bar">
            <div className="rating-label"><Star className="w-3 h-3 inline text-yellow-500" /> 1 Star</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{
                  width: `${percentages.one}%`,
                  backgroundColor: '#f56565',
                }}
              />
            </div>
            <div className="count">{metrics.ratingDistribution.one_star}</div>
          </div>
        </div>
      </div>

      <style>{`
        .satisfaction-panel {
          padding: 1.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .satisfaction-panel.loading,
        .satisfaction-panel.error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #a0aec0;
          font-size: 0.875rem;
        }

        .satisfaction-panel.live {
          border-left: 6px solid #48bb78;
          background: linear-gradient(to right, rgba(72, 187, 120, 0.05), transparent);
        }

        .satisfaction-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .satisfaction-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .subtitle {
          margin: 0.25rem 0 0;
          color: #718096;
          font-size: 0.875rem;
        }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(72, 187, 120, 0.1), rgba(72, 187, 120, 0.05));
          border: 1px solid #48bb78;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #22543d;
          font-weight: 600;
        }

        .pulse {
          display: inline-block;
          width: 0.5rem;
          height: 0.5rem;
          background: #48bb78;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        .last-update {
          font-size: 0.75rem;
          color: #a0aec0;
          font-style: italic;
        }

        .satisfaction-content {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
        }

        .score-card {
          padding: 2rem 1rem;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border: 2px solid #e2e8f0;
          border-radius: 0.375rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .score-display {
          display: flex;
          align-items: baseline;
          margin-bottom: 1.5rem;
        }

        .score-number {
          font-size: 3rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 1rem;
          color: #a0aec0;
          margin-left: 0.25rem;
        }

        .score-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #cbd5e0;
        }

        .info-label {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 1.125rem;
          color: #2d3748;
          font-weight: 700;
        }

        .info-value.trend {
          font-weight: 700;
        }

        .rating-distribution {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating-distribution h4 {
          margin: 0;
          font-size: 1rem;
          color: #2d3748;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .rating-bar {
          display: grid;
          grid-template-columns: 120px 1fr 50px;
          gap: 1rem;
          align-items: center;
        }

        .rating-label {
          font-size: 0.875rem;
          color: #4a5568;
          font-weight: 600;
        }

        .bar-container {
          height: 24px;
          background: #f7fafc;
          border-radius: 0.25rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .bar-fill {
          height: 100%;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 0.5rem;
        }

        .count {
          font-size: 0.875rem;
          color: #2d3748;
          font-weight: 600;
          text-align: right;
        }

        @media (max-width: 768px) {
          .satisfaction-content {
            grid-template-columns: 1fr;
          }

          .satisfaction-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .status-bar {
            width: 100%;
            flex-direction: column;
          }

          .live-badge {
            width: 100%;
            justify-content: center;
          }

          .last-update {
            display: none;
          }

          .rating-bar {
            grid-template-columns: 100px 1fr 40px;
            gap: 0.5rem;
          }

          .rating-label {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerSatisfactionMetricsRealtime;
