import React, { useState, useEffect } from 'react';
import { Check, CheckCheck, FileText, Mail, MessageSquare, Send } from 'lucide-react';
import { apiClient } from '../../services/api';

interface MessageAnalyticsData {
  total_messages: number;
  message_types: Record<string, number>;
  status_distribution: Record<string, number>;
  avg_message_length: number;
  time_range_hours: number;
}

interface Props {
  timeRangeHours: number;
}

const MessageAnalytics: React.FC<Props> = ({ timeRangeHours }) => {
  const [analytics, setAnalytics] = useState<MessageAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/message-analytics?time_range_hours=${timeRangeHours}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load message analytics: ${err}`);
        console.error('Analytics error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRangeHours]);

  if (isLoading) {
    return <div className="message-analytics loading">Loading message analytics...</div>;
  }

  if (error) {
    return <div className="message-analytics error">{error}</div>;
  }

  if (!analytics) {
    return <div className="message-analytics empty">No message data available</div>;
  }

  return (
    <div className="message-analytics-panel">
      <h3>Message Analytics</h3>
      
      <div className="analytics-overview">
        <div className="overview-stat">
          <div className="stat-icon"><MessageSquare className="w-5 h-5" /></div>
          <div className="stat-content">
            <div className="stat-label">Total Messages</div>
            <div className="stat-value">{analytics.total_messages}</div>
          </div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon"><FileText className="w-5 h-5" /></div>
          <div className="stat-content">
            <div className="stat-label">Avg Length</div>
            <div className="stat-value">{analytics.avg_message_length} chars</div>
          </div>
        </div>
      </div>

      <div className="analytics-breakdown">
        <div className="breakdown-section">
          <h4>Message Types</h4>
          <div className="breakdown-list">
            {Object.entries(analytics.message_types).map(([type, count]) => {
              const percentage = (count / analytics.total_messages) * 100;
              return (
                <div key={type} className="breakdown-item">
                  <span className="item-label">{type}</span>
                  <div className="item-bar">
                    <div 
                      className="bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="item-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="breakdown-section">
          <h4>Message Status</h4>
          <div className="breakdown-list">
            {Object.entries(analytics.status_distribution).map(([status, count]) => {
              const percentage = (count / analytics.total_messages) * 100;
              const statusIcon = getStatusIcon(status);
              return (
                <div key={status} className="breakdown-item">
                  <span className="item-label">{statusIcon} {status}</span>
                  <div className="item-bar">
                    <div 
                      className={`bar-fill bar-${status}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="item-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function getStatusIcon(status: string): React.ReactNode {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'sent':
      return <Send className="w-4 h-4 inline" />;
    case 'delivered':
      return <Check className="w-4 h-4 inline" />;
    case 'read':
      return <CheckCheck className="w-4 h-4 inline" />;
    default:
      return <Mail className="w-4 h-4 inline" />;
  }
}

export default MessageAnalytics;
