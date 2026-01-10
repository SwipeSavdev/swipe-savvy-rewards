import React, { useState, useEffect } from 'react';
import { Check, Clock, MessageSquare, Radio, RefreshCw } from 'lucide-react';
import { apiClient } from '../../services/api';
import {
  useRealtimeDashboard,
  useQueueUpdates,
  requestQueueUpdate,
} from '../../services/websocket';

interface WaitingSession {
  session_id: string;
  wait_time_seconds: number;
  initiator_id: string;
  message_count: number;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

const WaitingSessionsQueueRealtime: React.FC = () => {
  const [sessions, setSessions] = useState<WaitingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Real-time hooks
  const { isConnected } = useRealtimeDashboard();
  const { queueDepth: _queueDepth } = useQueueUpdates();

  // Fetch initial waiting sessions
  useEffect(() => {
    const fetchWaitingSessions = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get(
          '/api/v1/admin/chat-dashboard/waiting-sessions',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSessions(response.data.sessions || response.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
      } catch (err) {
        setError(`Failed to load waiting sessions: ${err}`);
        console.error('Waiting sessions error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitingSessions();

    // More frequent refresh for urgent queue
    const interval = setInterval(fetchWaitingSessions, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    requestQueueUpdate();
  };

  if (isLoading) {
    return (
      <div className="waiting-queue loading">
        Loading waiting sessions...
        {isConnected && <span className="live-indicator"><Radio className="w-3 h-3 text-red-500" /> LIVE</span>}
      </div>
    );
  }

  if (error) {
    return <div className="waiting-queue error">{error}</div>;
  }

  return (
    <div className="waiting-sessions-queue">
      <div className="queue-header">
        <h3>Waiting Queue ({sessions.length})</h3>
        <div className="queue-controls">
          {isConnected && (
            <span className="live-badge critical">
              <span className="pulse"></span> Live Updates
            </span>
          )}
          <button onClick={handleRefresh} className="btn-refresh">
            <RefreshCw className="w-4 h-4 inline mr-1" /> Refresh
          </button>
          <span className="last-update">Updated: {lastUpdate}</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state success">
          <Check className="w-4 h-4 inline mr-1" /> All customers are being served!
        </div>
      ) : (
        <div className="queue-list">
          {sessions.map((session, index) => (
            <div
              key={session.session_id}
              className={`queue-item priority-${session.priority} ${
                isConnected ? 'live' : ''
              }`}
            >
              <div className="queue-position">#{index + 1}</div>
              <div className="queue-info">
                <div className="session-header">
                  <span className="customer-id">
                    {session.initiator_id.slice(0, 8)}
                  </span>
                  <span className={`priority-badge priority-${session.priority}`}>
                    {session.priority}
                  </span>
                  {isConnected && <span className="live-dot"></span>}
                </div>
                <div className="queue-details">
                  <span className="wait-time">
                    <Clock className="w-4 h-4 inline mr-1" />{formatWaitTime(session.wait_time_seconds)}
                  </span>
                  <span className="message-count">
                    <MessageSquare className="w-4 h-4 inline mr-1" />{session.message_count} messages
                  </span>
                </div>
              </div>
              <button className="btn-small btn-assign">Assign Agent</button>
            </div>
          ))}
        </div>
      )}

      {isConnected && sessions.length > 0 && (
        <div className="queue-stats">
          <small>
            Avg wait time:{' '}
            {(
              sessions.reduce((acc, s) => acc + s.wait_time_seconds, 0) /
              sessions.length
            ).toFixed(0)}
            s
          </small>
        </div>
      )}
    </div>
  );
};

function formatWaitTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default WaitingSessionsQueueRealtime;
