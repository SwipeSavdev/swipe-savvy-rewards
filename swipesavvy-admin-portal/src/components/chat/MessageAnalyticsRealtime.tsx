import React, { useEffect, useState } from 'react';
import { Check, CheckCheck, Eye, File, FileText, Image, Music, Video, XCircle } from 'lucide-react';
import { useRealtimeDashboard, useRealtimeData } from '@/services/websocket';
import { apiClient } from '@/services/api';

interface MessageAnalytics {
  totalMessages: number;
  messagesByType: {
    text: number;
    image: number;
    file: number;
    audio: number;
    video: number;
  };
  messagesByStatus: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  averageResponseTime: number;
  messagesPerHour: number;
  peakHour: string;
  lastUpdated: string;
}

interface MessageAnalyticsRealtimeProps {
  timeRangeHours?: number;
}

const MessageAnalyticsRealtime: React.FC<MessageAnalyticsRealtimeProps> = ({
  timeRangeHours = 24,
}) => {
  const [analytics, setAnalytics] = useState<MessageAnalytics | null>(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeDashboard();

  // Subscribe to metrics updates
  useRealtimeData('metrics_updated', (data) => {
    if (data.metrics?.messageAnalytics) {
      setAnalytics(data.metrics.messageAnalytics);
      setLastUpdate(new Date().toLocaleTimeString());
    }
  });

  // Fetch initial analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/message-analytics?hours=${timeRangeHours}`
        );
        setAnalytics(response.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch message analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRangeHours]);

  if (loading && !analytics) {
    return (
      <div className="analytics-panel loading">
        <p>Loading message analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-panel error">
        <p>Unable to load message analytics</p>
      </div>
    );
  }

  const getTotalByType = () =>
    Object.values(analytics.messagesByType).reduce((a, b) => a + b, 0);
  const getTotalByStatus = () =>
    Object.values(analytics.messagesByStatus).reduce((a, b) => a + b, 0);

  const typePercentages = {
    text: (analytics.messagesByType.text / getTotalByType()) * 100 || 0,
    image: (analytics.messagesByType.image / getTotalByType()) * 100 || 0,
    file: (analytics.messagesByType.file / getTotalByType()) * 100 || 0,
    audio: (analytics.messagesByType.audio / getTotalByType()) * 100 || 0,
    video: (analytics.messagesByType.video / getTotalByType()) * 100 || 0,
  };

  const statusPercentages = {
    sent: (analytics.messagesByStatus.sent / getTotalByStatus()) * 100 || 0,
    delivered: (analytics.messagesByStatus.delivered / getTotalByStatus()) * 100 || 0,
    read: (analytics.messagesByStatus.read / getTotalByStatus()) * 100 || 0,
    failed: (analytics.messagesByStatus.failed / getTotalByStatus()) * 100 || 0,
  };

  return (
    <div className={`analytics-panel ${isConnected ? 'live' : ''}`}>
      <div className="analytics-header">
        <div>
          <h3>Message Analytics</h3>
          <p className="subtitle">Real-time message type and status breakdown</p>
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

      <div className="analytics-content">
        {/* Overview Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{analytics.totalMessages}</div>
            <div className="metric-label">Total Messages</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{analytics.messagesPerHour.toFixed(1)}</div>
            <div className="metric-label">Messages/Hour</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{analytics.averageResponseTime}s</div>
            <div className="metric-label">Avg Response Time</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Peak Hour</div>
            <div className="metric-value-large">{analytics.peakHour}</div>
          </div>
        </div>

        <div className="charts-grid">
          {/* Message Types Chart */}
          <div className="chart-card">
            <h4>Message Types</h4>
            <div className="type-chart">
              <div className="type-bar">
                <div className="type-label">
                  <span><FileText className="w-4 h-4 inline mr-1" /> Text</span>
                  <span>{analytics.messagesByType.text}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar-fill"
                    style={{
                      width: `${typePercentages.text}%`,
                      backgroundColor: '#4299e1',
                    }}
                  />
                </div>
              </div>

              <div className="type-bar">
                <div className="type-label">
                  <span><Image className="w-4 h-4 inline mr-1" /> Image</span>
                  <span>{analytics.messagesByType.image}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar-fill"
                    style={{
                      width: `${typePercentages.image}%`,
                      backgroundColor: '#48bb78',
                    }}
                  />
                </div>
              </div>

              <div className="type-bar">
                <div className="type-label">
                  <span><File className="w-4 h-4 inline mr-1" /> File</span>
                  <span>{analytics.messagesByType.file}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar-fill"
                    style={{
                      width: `${typePercentages.file}%`,
                      backgroundColor: '#ed8936',
                    }}
                  />
                </div>
              </div>

              <div className="type-bar">
                <div className="type-label">
                  <span><Music className="w-4 h-4 inline mr-1" /> Audio</span>
                  <span>{analytics.messagesByType.audio}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar-fill"
                    style={{
                      width: `${typePercentages.audio}%`,
                      backgroundColor: '#9f7aea',
                    }}
                  />
                </div>
              </div>

              <div className="type-bar">
                <div className="type-label">
                  <span><Video className="w-4 h-4 inline mr-1" /> Video</span>
                  <span>{analytics.messagesByType.video}</span>
                </div>
                <div className="type-bar-container">
                  <div
                    className="type-bar-fill"
                    style={{
                      width: `${typePercentages.video}%`,
                      backgroundColor: '#f6ad55',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Message Status Chart */}
          <div className="chart-card">
            <h4>Message Status</h4>
            <div className="status-chart">
              <div className="status-bar">
                <div className="status-label">
                  <span><Check className="w-4 h-4 inline mr-1" /> Sent</span>
                  <span>{analytics.messagesByStatus.sent}</span>
                </div>
                <div className="status-bar-container">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${statusPercentages.sent}%`,
                      backgroundColor: '#4299e1',
                    }}
                  />
                </div>
              </div>

              <div className="status-bar">
                <div className="status-label">
                  <span><CheckCheck className="w-4 h-4 inline mr-1" /> Delivered</span>
                  <span>{analytics.messagesByStatus.delivered}</span>
                </div>
                <div className="status-bar-container">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${statusPercentages.delivered}%`,
                      backgroundColor: '#48bb78',
                    }}
                  />
                </div>
              </div>

              <div className="status-bar">
                <div className="status-label">
                  <span><Eye className="w-4 h-4 inline mr-1" /> Read</span>
                  <span>{analytics.messagesByStatus.read}</span>
                </div>
                <div className="status-bar-container">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${statusPercentages.read}%`,
                      backgroundColor: '#38a169',
                    }}
                  />
                </div>
              </div>

              <div className="status-bar">
                <div className="status-label">
                  <span><XCircle className="w-4 h-4 inline mr-1" /> Failed</span>
                  <span>{analytics.messagesByStatus.failed}</span>
                </div>
                <div className="status-bar-container">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${statusPercentages.failed}%`,
                      backgroundColor: '#f56565',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-panel {
          padding: 1.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .analytics-panel.loading,
        .analytics-panel.error {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #a0aec0;
          font-size: 0.875rem;
        }

        .analytics-panel.live {
          border-left: 6px solid #48bb78;
          background: linear-gradient(to right, rgba(72, 187, 120, 0.05), transparent);
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .analytics-header h3 {
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

        .analytics-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          text-align: center;
        }

        .metric-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .metric-value-large {
          font-size: 1.125rem;
          font-weight: 700;
          color: #4299e1;
          margin-top: 0.5rem;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 600;
          text-transform: uppercase;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .chart-card {
          padding: 1.5rem;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
        }

        .chart-card h4 {
          margin: 0 0 1.5rem;
          font-size: 1rem;
          color: #2d3748;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .type-chart,
        .status-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .type-bar,
        .status-bar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-label,
        .status-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #4a5568;
          font-weight: 600;
        }

        .type-bar-container,
        .status-bar-container {
          height: 20px;
          background: white;
          border-radius: 0.25rem;
          overflow: hidden;
          border: 1px solid #cbd5e0;
        }

        .type-bar-fill,
        .status-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
          min-width: 2px;
        }

        @media (max-width: 768px) {
          .analytics-header {
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

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageAnalyticsRealtime;
