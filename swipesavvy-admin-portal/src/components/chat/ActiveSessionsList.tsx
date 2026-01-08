import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface ChatSession {
  session_id: string;
  status: string;
  duration_seconds: number;
  total_messages: number;
  unread_count: number;
  participant_count: number;
  initiator_id: string;
  assigned_agent_id: string;
  last_activity: string;
  latest_message?: {
    content: string;
    timestamp: string;
    sender_id: string;
  };
}

interface Props {
  timeRangeHours: number;
  limit: number;
  onSessionSelect?: (_sessionId: string) => void;
}

const ActiveSessionsList: React.FC<Props> = ({
  timeRangeHours: _timeRangeHours,
  limit,
  onSessionSelect,
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/active-sessions?limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(response.data.sessions || response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load active sessions: ${err}`);
        console.error('Sessions error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [limit]);

  if (isLoading) {
    return <div className="sessions-list loading">Loading active sessions...</div>;
  }

  if (error) {
    return <div className="sessions-list error">{error}</div>;
  }

  return (
    <div className="active-sessions">
      <h3>Active Sessions ({sessions.length})</h3>
      <div className="sessions-container">
        {sessions.length === 0 ? (
          <div className="empty-state">No active sessions</div>
        ) : (
          <div className="sessions-table">
            <div className="table-header">
              <div className="col-id">Session ID</div>
              <div className="col-initiator">Initiator</div>
              <div className="col-agent">Assigned Agent</div>
              <div className="col-messages">Messages</div>
              <div className="col-duration">Duration</div>
              <div className="col-actions">Actions</div>
            </div>
            {sessions.map((session) => (
              <div key={session.session_id} className="table-row">
                <div className="col-id">
                  <code>{session.session_id.slice(0, 8)}...</code>
                </div>
                <div className="col-initiator">
                  <span className="badge badge-user">{session.initiator_id.slice(0, 8)}</span>
                </div>
                <div className="col-agent">
                  <span className="badge badge-agent">
                    {session.assigned_agent_id.slice(0, 8)}
                  </span>
                </div>
                <div className="col-messages">
                  {session.total_messages}
                  {session.unread_count > 0 && (
                    <span className="unread-badge">{session.unread_count}</span>
                  )}
                </div>
                <div className="col-duration">
                  {formatDuration(session.duration_seconds)}
                </div>
                <div className="col-actions">
                  <button
                    className="btn-small btn-view"
                    onClick={() => onSessionSelect?.(session.session_id)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {sessions.length > 0 && sessions[0].latest_message && (
        <div className="latest-message">
          <small>Latest: {sessions[0].latest_message.content.slice(0, 50)}...</small>
        </div>
      )}
    </div>
  );
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default ActiveSessionsList;
