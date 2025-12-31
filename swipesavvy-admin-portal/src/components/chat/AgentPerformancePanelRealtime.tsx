import React, { useEffect, useState } from 'react';
import { useRealtimeDashboard, useAgentStatusUpdates } from '@/services/websocket';
import { apiClient } from '@/services/api';

interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'idle' | 'offline' | 'in_call';
  sessionCount: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  lastActive: string;
}

interface AgentPerformancePanelRealtimeProps {
  departmentId?: string;
  limit?: number;
}

const AgentPerformancePanelRealtime: React.FC<AgentPerformancePanelRealtimeProps> = ({
  departmentId,
  limit = 10,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealtimeDashboard();
  const agentStatusMap = useAgentStatusUpdates();

  // Fetch initial agent data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (departmentId) params.append('department_id', departmentId);
        params.append('limit', limit.toString());

        const response = await apiClient.get(`/api/v1/admin/agents?${params}`);
        setAgents(response.data);
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [departmentId, limit]);

  // Update agent statuses from WebSocket
  useEffect(() => {
    if (agentStatusMap.size === 0) return;

    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        const status = agentStatusMap.get(agent.id);
        if (status) {
          return {
            ...agent,
            status: status as any,
            lastActive: new Date().toISOString(),
          };
        }
        return agent;
      })
    );
    setLastUpdate(new Date().toLocaleTimeString());
  }, [agentStatusMap]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#48bb78'; // green
      case 'idle':
        return '#ed8936'; // orange
      case 'in_call':
        return '#4299e1'; // blue
      case 'offline':
        return '#cbd5e0'; // gray
      default:
        return '#718096';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 4.5) return '#48bb78';
    if (score >= 4.0) return '#38a169';
    if (score >= 3.5) return '#ed8936';
    return '#f56565';
  };

  if (loading && agents.length === 0) {
    return (
      <div className="agent-panel loading">
        <p>Loading agent performance data...</p>
      </div>
    );
  }

  return (
    <div className={`agent-panel ${isConnected ? 'live' : ''}`}>
      <div className="agent-header-realtime">
        <div>
          <h3>Agent Performance</h3>
          <p className="subtitle">Real-time agent status and metrics</p>
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

      <div className="agent-grid">
        {agents.map((agent) => (
          <div key={agent.id} className={`agent-card ${isConnected ? 'live' : ''}`}>
            <div className="agent-header">
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p className="agent-email">{agent.email}</p>
              </div>
              <div className="agent-status">
                <div
                  className="status-indicator"
                  style={{
                    backgroundColor: getStatusColor(agent.status),
                    animation:
                      agent.status === 'active' || agent.status === 'in_call'
                        ? 'pulse 1.5s ease-in-out infinite'
                        : 'none',
                  }}
                />
                <span className="status-label">{getStatusLabel(agent.status)}</span>
              </div>
            </div>

            <div className="agent-metrics">
              <div className="metric">
                <span className="metric-label">Active Sessions</span>
                <span className="metric-value">{agent.sessionCount}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Resolution</span>
                <span className="metric-value">{agent.averageResolutionTime} min</span>
              </div>
              <div className="metric">
                <span className="metric-label">Satisfaction Score</span>
                <span
                  className="metric-value"
                  style={{ color: getSatisfactionColor(agent.satisfactionScore) }}
                >
                  {agent.satisfactionScore.toFixed(1)}/5.0
                </span>
              </div>
            </div>

            <div className="agent-footer">
              <span className="last-active">
                Last active: {new Date(agent.lastActive).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .agent-panel {
          padding: 1.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .agent-panel.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          color: #a0aec0;
          font-size: 0.875rem;
        }

        .agent-header-realtime {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .agent-header-realtime h3 {
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

        .last-update {
          font-size: 0.75rem;
          color: #a0aec0;
          font-style: italic;
        }

        .agent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .agent-card {
          padding: 1rem;
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          transition: all 0.3s;
        }

        .agent-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .agent-card.live {
          border-left: 6px solid #48bb78;
          animation: live-highlight 2s ease-in-out infinite;
        }

        @keyframes live-highlight {
          0%,
          100% {
            background: #f7fafc;
          }
          50% {
            background: #edf2f7;
          }
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .agent-info h4 {
          margin: 0;
          font-size: 1rem;
          color: #2d3748;
        }

        .agent-email {
          margin: 0.25rem 0 0;
          font-size: 0.75rem;
          color: #a0aec0;
        }

        .agent-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .status-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #4a5568;
          white-space: nowrap;
        }

        .agent-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-label {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 600;
        }

        .metric-value {
          font-size: 0.875rem;
          color: #2d3748;
          font-weight: 600;
        }

        .agent-footer {
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }

        .last-active {
          font-size: 0.65rem;
          color: #a0aec0;
        }

        @media (max-width: 768px) {
          .agent-grid {
            grid-template-columns: 1fr;
          }

          .agent-header-realtime {
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
        }
      `}</style>
    </div>
  );
};

export default AgentPerformancePanelRealtime;
