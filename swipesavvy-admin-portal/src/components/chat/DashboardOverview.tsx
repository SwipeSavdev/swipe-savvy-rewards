import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

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

const DashboardOverview: React.FC<Props> = ({ timeRangeHours, loading: _loading = false }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return <div className="stats-grid loading">Loading overview...</div>;
  }

  if (error) {
    return <div className="stats-grid error">{error}</div>;
  }

  if (!stats) {
    return <div className="stats-grid empty">No data available</div>;
  }

  return (
    <div className="dashboard-overview">
      <h2>Overview</h2>
      <div className="stats-grid">
        <StatCard
          title="Total Sessions"
          value={stats.total_sessions}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Active Sessions"
          value={stats.active_sessions}
          icon="🟢"
          color="green"
        />
        <StatCard
          title="Waiting Sessions"
          value={stats.waiting_sessions}
          icon="⏳"
          color="orange"
        />
        <StatCard
          title="Closed Sessions"
          value={stats.closed_sessions}
          icon="✓"
          color="gray"
        />
        <StatCard
          title="Total Messages"
          value={stats.total_messages}
          icon="💬"
          color="purple"
        />
        <StatCard
          title="Avg Msg/Session"
          value={stats.avg_messages_per_session.toFixed(1)}
          icon="📈"
          color="blue"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats.avg_response_time_seconds.toFixed(1)}s`}
          icon="⚡"
          color="red"
        />
        <StatCard
          title="Time Range"
          value={`${stats.time_range_hours}h`}
          icon="🕐"
          color="gray"
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};

export default DashboardOverview;
