import React, { useState, useEffect } from 'react';
import { BarChart3, Check, Clock, Hourglass, MessageSquare, Radio, TrendingUp, Zap } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useLiveMetrics, useRealtimeDashboard } from '../../services/websocket';

interface OverviewStats {
  total_sessions: number;
  active_sessions: number;
  closed_sessions: number;
  waiting_sessions: number;
  total_messages: number;
  avg_messages_per_session: number;
  avg_response_time_seconds: number;
  time_range_hours: number;
  generated_at: string;
}

interface Props {
  timeRangeHours: number;
  loading?: boolean;
}

const DashboardOverviewRealtime: React.FC<Props> = ({ timeRangeHours, loading: _loading = false }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  // Real-time metrics hook
  const liveMetrics = useLiveMetrics();
  const { isConnected } = useRealtimeDashboard();

  // Fetch initial data
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/overview?time_range_hours=${timeRangeHours}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(response.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        setError(`Failed to load dashboard overview: ${err}`);
        console.error('Overview error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, [timeRangeHours]);

  // Update with real-time metrics
  useEffect(() => {
    if (liveMetrics && stats) {
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...liveMetrics,
          generated_at: new Date().toISOString(),
        };
      });
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [liveMetrics]);

  if (isLoading) {
    return (
      <div className="stats-grid loading">
        Loading overview...
        {isConnected && <span className="live-indicator"><Radio className="w-3 h-3 text-red-500" /> LIVE</span>}
      </div>
    );
  }

  if (error) {
    return <div className="stats-grid error">{error}</div>;
  }

  if (!stats) {
    return <div className="stats-grid empty">No data available</div>;
  }

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Overview</h2>
        <div className="status-bar">
          {isConnected && (
            <span className="live-badge">
              <span className="pulse"></span> Live Updates Active
            </span>
          )}
          <span className="last-update">Updated: {lastUpdate}</span>
        </div>
      </div>
      <div className="stats-grid">
        <StatCard
          title="Total Sessions"
          value={stats.total_sessions}
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
          isLive={isConnected}
        />
        <StatCard
          title="Active Sessions"
          value={stats.active_sessions}
          icon={<Radio className="w-5 h-5" />}
          color="green"
          isLive={isConnected}
          highlight={stats.active_sessions > 0}
        />
        <StatCard
          title="Waiting Sessions"
          value={stats.waiting_sessions}
          icon={<Hourglass className="w-5 h-5" />}
          color="orange"
          isLive={isConnected}
          highlight={stats.waiting_sessions > 0}
        />
        <StatCard
          title="Closed Sessions"
          value={stats.closed_sessions}
          icon={<Check className="w-5 h-5" />}
          color="gray"
          isLive={isConnected}
        />
        <StatCard
          title="Total Messages"
          value={stats.total_messages}
          icon={<MessageSquare className="w-5 h-5" />}
          color="purple"
          isLive={isConnected}
        />
        <StatCard
          title="Avg Msg/Session"
          value={stats.avg_messages_per_session.toFixed(1)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
          isLive={isConnected}
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avg_response_time_seconds.toFixed(1)}s`}
          icon={<Zap className="w-5 h-5" />}
          color="red"
          isLive={isConnected}
        />
        <StatCard
          title="Time Range"
          value={`${stats.time_range_hours}h`}
          icon={<Clock className="w-5 h-5" />}
          color="gray"
          isLive={isConnected}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLive?: boolean;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  isLive = false,
  highlight = false,
}) => {
  return (
    <div className={`stat-card stat-${color} ${highlight ? 'highlighted' : ''} ${isLive ? 'live' : ''}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
      {isLive && <div className="live-dot"></div>}
    </div>
  );
};

export default DashboardOverviewRealtime;
