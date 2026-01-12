import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveSessionsList from '../components/chat/ActiveSessionsList';
import AgentPerformancePanel from '../components/chat/AgentPerformancePanel';
import CustomerSatisfactionMetrics from '../components/chat/CustomerSatisfactionMetrics';
import DashboardOverview from '../components/chat/DashboardOverview';
import MessageAnalytics from '../components/chat/MessageAnalytics';
import WaitingSessionsQueue from '../components/chat/WaitingSessionsQueue';
import '../styles/chat-dashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

interface DashboardFilters {
  timeRange: number; // hours (1, 24, 168, 720)
  sessionLimit: number; // 1-100
  agentId?: string;
}

const ChatDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: 24,
    sessionLimit: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(10000); // 10 seconds

  // Validate user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger refresh in child components via state update
      setFilters(prev => ({ ...prev }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleTimeRangeChange = useCallback((hours: number) => {
    setFilters(prev => ({ ...prev, timeRange: hours }));
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If using mock API, skip the real API call
      if (USE_MOCK_API) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/admin/chat-dashboard/overview`, {
        params: {
          timeRange: filters.timeRange,
          limit: filters.sessionLimit,
          ...(filters.agentId ? { agentId: filters.agentId } : {}),
        },
      });
      // Data is used by child components; they maintain their own state
    } catch (err: any) {
      console.error('Failed to fetch chat dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters.timeRange, filters.sessionLimit, filters.agentId]);

  const handleSessionLimitChange = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, sessionLimit: limit }));
  }, []);

  const handleRefreshIntervalChange = useCallback((interval: number) => {
    setRefreshInterval(interval);
  }, []);

  return (
    <div className="chat-dashboard-page">
      <div className="dashboard-header">
        <h1>Chat Dashboard</h1>
        <p>Real-time support team management and analytics</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="control-group">
          <label>Time Range</label>
          <select 
            value={filters.timeRange}
            onChange={(e) => handleTimeRangeChange(parseInt(e.target.value))}
          >
            <option value={1}>Last Hour</option>
            <option value={24}>Last 24 Hours</option>
            <option value={168}>Last 7 Days</option>
            <option value={720}>Last 30 Days</option>
          </select>
        </div>

        <div className="control-group">
          <label>Session Limit</label>
          <input 
            type="number"
            min="1"
            max="100"
            value={filters.sessionLimit}
            onChange={(e) => handleSessionLimitChange(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Auto-Refresh Interval</label>
          <select 
            value={refreshInterval}
            onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
          >
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={0}>Disabled</option>
          </select>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Overview Stats */}
        <div className="dashboard-section full-width">
          <DashboardOverview 
            timeRangeHours={filters.timeRange}
            loading={loading}
          />
        </div>

        {/* Left Column */}
        <div className="dashboard-column left">
          {/* Active Sessions */}
          <div className="dashboard-section">
            <ActiveSessionsList 
              timeRangeHours={filters.timeRange}
              limit={filters.sessionLimit}
              onSessionSelect={(sessionId) => {
                navigate(`/chat-sessions/${sessionId}`);
              }}
            />
          </div>

          {/* Waiting Queue */}
          <div className="dashboard-section">
            <WaitingSessionsQueue />
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column right">
          {/* Agent Performance */}
          <div className="dashboard-section">
            <AgentPerformancePanel 
              timeRangeHours={filters.timeRange}
              agentId={filters.agentId}
            />
          </div>

          {/* Customer Satisfaction */}
          <div className="dashboard-section">
            <CustomerSatisfactionMetrics 
              timeRangeHours={filters.timeRange}
            />
          </div>

          {/* Message Analytics */}
          <div className="dashboard-section">
            <MessageAnalytics 
              timeRangeHours={filters.timeRange}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner">Loading dashboard data...</div>
        </div>
      )}
    </div>
  );
};

export default ChatDashboardPage;
