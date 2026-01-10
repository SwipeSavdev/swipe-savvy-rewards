import React, { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, Phone, Star, Zap } from 'lucide-react';
import { apiClient } from '../../services/api';

interface AgentMetrics {
  agent_id: string;
  sessions_handled: number;
  total_messages: number;
  avg_messages_per_session: number;
  avg_response_time_seconds: number;
  avg_customer_rating: number;
  status: string;
}

interface Props {
  timeRangeHours: number;
  agentId?: string;
}

const AgentPerformancePanel: React.FC<Props> = ({ timeRangeHours, agentId }) => {
  const [agents, setAgents] = useState<AgentMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentPerformance = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const params = new URLSearchParams({
          time_range_hours: timeRangeHours.toString(),
          ...(agentId && { agent_id: agentId }),
        });
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/agent-performance?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAgents(response.data.agents || response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load agent performance: ${err}`);
        console.error('Agent performance error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentPerformance();
  }, [timeRangeHours, agentId]);

  if (isLoading) {
    return <div className="agent-panel loading">Loading agent metrics...</div>;
  }

  if (error) {
    return <div className="agent-panel error">{error}</div>;
  }

  return (
    <div className="agent-performance">
      <h3>Agent Performance</h3>
      {agents.length === 0 ? (
        <div className="empty-state">No agent data available</div>
      ) : (
        <div className="agents-list">
          {agents.map((agent) => (
            <div key={agent.agent_id} className="agent-card">
              <div className="agent-header">
                <span className="agent-id">{agent.agent_id.slice(0, 8)}</span>
                <span className={`agent-status status-${agent.status}`}>
                  {agent.status}
                </span>
              </div>
              <div className="agent-metrics">
                <MetricRow
                  label="Sessions"
                  value={agent.sessions_handled}
                  icon={<Phone className="w-4 h-4" />}
                />
                <MetricRow
                  label="Messages"
                  value={agent.total_messages}
                  icon={<MessageSquare className="w-4 h-4" />}
                />
                <MetricRow
                  label="Avg Msg/Session"
                  value={agent.avg_messages_per_session.toFixed(1)}
                  icon={<BarChart3 className="w-4 h-4" />}
                />
                <MetricRow
                  label="Avg Response"
                  value={`${agent.avg_response_time_seconds.toFixed(1)}s`}
                  icon={<Zap className="w-4 h-4" />}
                />
                <MetricRow
                  label="Rating"
                  value={agent.avg_customer_rating.toFixed(1)}
                  icon={<Star className="w-4 h-4" />}
                  highlight={agent.avg_customer_rating >= 4.5}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface MetricRowProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  highlight?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, icon, highlight }) => {
  return (
    <div className={`metric-row ${highlight ? 'highlight' : ''}`}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
};

export default AgentPerformancePanel;
