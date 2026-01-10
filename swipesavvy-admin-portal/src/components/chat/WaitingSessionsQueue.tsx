import React, { useState, useEffect } from 'react';
import { Check, Clock, MessageSquare } from 'lucide-react';
import { apiClient } from '../../services/api';

interface WaitingSession {
  session_id: string;
  wait_time_seconds: number;
  initiator_id: string;
  message_count: number;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

const WaitingSessionsQueue: React.FC = () => {
  const [sessions, setSessions] = useState<WaitingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
      } catch (err) {
        setError(`Failed to load waiting sessions: ${err}`);
        console.error('Waiting sessions error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWaitingSessions();
    const interval = setInterval(fetchWaitingSessions, 5000); // More frequent refresh
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="waiting-queue loading">Loading waiting sessions...</div>;
  }

  if (error) {
    return <div className="waiting-queue error">{error}</div>;
  }

  return (
    <div className="waiting-sessions-queue">
      <h3>Waiting Queue ({sessions.length})</h3>
      {sessions.length === 0 ? (
        <div className="empty-state"><Check className="w-4 h-4 inline mr-1" /> All customers are being served!</div>
      ) : (
        <div className="queue-list">
          {sessions.map((session, index) => (
            <div key={session.session_id} className={`queue-item priority-${session.priority}`}>
              <div className="queue-position">#{index + 1}</div>
              <div className="queue-info">
                <div className="session-header">
                  <span className="customer-id">{session.initiator_id.slice(0, 8)}</span>
                  <span className={`priority-badge priority-${session.priority}`}>
                    {session.priority}
                  </span>
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
    </div>
  );
};

function formatWaitTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default WaitingSessionsQueue;
