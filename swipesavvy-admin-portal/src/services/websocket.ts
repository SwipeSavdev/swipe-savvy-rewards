import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * WebSocket Connection Manager for Dashboard Real-Time Updates
 * Handles connection lifecycle, message streaming, and reconnection logic
 */

type MessageHandler = (data: any) => void;
type ConnectionHandler = (connected: boolean) => void;

interface MessageEvent {
  type: string;
  data: any;
  timestamp: string;
}

class DashboardWebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectionHandlers: ConnectionHandler[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval = 30000; // 30 seconds

  constructor(baseUrl: string = 'localhost:8000') {
    this.url = `ws://${baseUrl}/api/v1/admin/chat-dashboard/ws`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ Dashboard WebSocket connected');
          this.reconnectAttempts = 0;

          // Send authentication
          this.send({
            type: 'auth',
            token,
            timestamp: new Date().toISOString(),
          });

          // Start heartbeat
          this.startHeartbeat();

          // Notify listeners
          this.notifyConnectionChange(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: MessageEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('❌ Dashboard WebSocket disconnected');
          this.stopHeartbeat();
          this.notifyConnectionChange(false);

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.scheduleReconnect(token);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Subscribe to message type
   */
  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: MessageEvent): void {
    console.log(`📨 Dashboard message: ${message.type}`, message.data);

    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach((handler) => {
      try {
        handler(message.data);
      } catch (error) {
        console.error(`Error in handler for ${message.type}:`, error);
      }
    });
  }

  /**
   * Notify connection change listeners
   */
  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection change handler:', error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(token: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, capped at 60s + jitter
    const exponentialDelay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    const maxDelay = 60000; // Cap at 60 seconds
    const cappedDelay = Math.min(exponentialDelay, maxDelay);
    const jitter = Math.random() * 1000; // Add up to 1s jitter to prevent thundering herd
    const delay = cappedDelay + jitter;
    
    if (this.reconnectAttempts <= 3) {
      // Only log first 3 attempts to avoid console spam
      console.log(`⏳ Reconnecting in ${delay.toFixed(0)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('Reconnection failed:', error);
        // No need to recursively call reconnect - connect() handles it
      });
    }, delay) as unknown as NodeJS.Timeout;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        });
      }
    }, this.heartbeatInterval) as unknown as NodeJS.Timeout;
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Singleton instance
let dashboardWsManager: DashboardWebSocketManager | null = null;

/**
 * Reset the singleton (called on page unload/reload)
 */
export function resetDashboardWebSocket(): void {
  if (dashboardWsManager) {
    dashboardWsManager.disconnect();
    dashboardWsManager = null;
  }
}

export function getDashboardWebSocketManager(baseUrl?: string): DashboardWebSocketManager {
  if (!dashboardWsManager) {
    dashboardWsManager = new DashboardWebSocketManager(baseUrl);
  }
  return dashboardWsManager;
}

/**
 * Hook: useRealtimeDashboard
 * Subscribes to real-time dashboard updates
 */
export function useRealtimeDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const managerRef = useRef<DashboardWebSocketManager | null>(null);

  useEffect(() => {
    const manager = getDashboardWebSocketManager();
    managerRef.current = manager;

    const token = localStorage.getItem('authToken');
    if (token) {
      manager.connect(token).catch((error) => {
        console.error('Failed to connect to dashboard WebSocket:', error);
      });

      const unsubscribe = manager.onConnectionChange((connected) => {
        setIsConnected(connected);
      });

      return () => {
        unsubscribe();
      };
    }
  }, []);

  return {
    isConnected,
    manager: managerRef.current,
  };
}

/**
 * Hook: useRealtimeData
 * Subscribe to specific data type updates
 */
export function useRealtimeData<T = any>(
  dataType: string,
  onData?: (data: T) => void
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const manager = getDashboardWebSocketManager();

    if (!manager.isConnected()) {
      const token = localStorage.getItem('authToken');
      if (token) {
        manager.connect(token).catch((err) => {
          setError(`Failed to connect: ${err.message}`);
        });
      }
    }

    const unsubscribe = manager.on(dataType, (newData: T) => {
      setData(newData);
      setError(null);
      onData?.(newData);
    });

    return unsubscribe;
  }, [dataType, onData]);

  return { data, error };
}

/**
 * Hook: useSessionUpdates
 * Real-time session status and message updates
 */
export function useSessionUpdates(sessionId: string) {
  const [session, setSession] = useState<any>(null);
  const [newMessage, setNewMessage] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const manager = getDashboardWebSocketManager();

    // Subscribe to session updates
    const unsubSession = manager.on('session_update', (data: any) => {
      if (data.session_id === sessionId) {
        setSession(data);
      }
    });

    // Subscribe to new messages
    const unsubMessage = manager.on('message_created', (data: any) => {
      if (data.session_id === sessionId) {
        setNewMessage(data);
      }
    });

    // Subscribe to typing indicators
    const unsubTyping = manager.on('typing_indicator', (data: any) => {
      if (data.session_id === sessionId) {
        if (data.is_typing) {
          setTypingUsers((prev) => [...new Set([...prev, data.user_id])]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
        }
      }
    });

    return () => {
      unsubSession();
      unsubMessage();
      unsubTyping();
    };
  }, [sessionId]);

  return { session, newMessage, typingUsers };
}

/**
 * Hook: useQueueUpdates
 * Real-time waiting queue updates
 */
export function useQueueUpdates() {
  const [queueDepth, setQueueDepth] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const manager = getDashboardWebSocketManager();

    // Subscribe to queue depth changes
    const unsubDepth = manager.on('queue_depth_changed', (data: any) => {
      setQueueDepth(data.depth);
    });

    // Subscribe to queue updates
    const unsubQueue = manager.on('queue_updated', (data: any) => {
      setSessions(data.sessions || []);
    });

    return () => {
      unsubDepth();
      unsubQueue();
    };
  }, []);

  return { queueDepth, sessions };
}

/**
 * Hook: useAgentStatusUpdates
 * Real-time agent online/offline status
 */
export function useAgentStatusUpdates() {
  const [agents, setAgents] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const manager = getDashboardWebSocketManager();

    // Subscribe to agent status changes
    const unsubscribe = manager.on('agent_status_changed', (data: any) => {
      setAgents((prev) => {
        const updated = new Map(prev);
        updated.set(data.agent_id, data.status);
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  return agents;
}

/**
 * Hook: useLiveMetrics
 * Real-time dashboard metrics
 */
export function useLiveMetrics() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const manager = getDashboardWebSocketManager();

    // Subscribe to metrics updates
    const unsubscribe = manager.on('metrics_updated', (data: any) => {
      setMetrics(data);
    });

    return unsubscribe;
  }, []);

  return metrics;
}

/**
 * Emit events to server
 */
export function requestSessionUpdate(sessionId: string): void {
  const manager = getDashboardWebSocketManager();
  manager.send({
    type: 'request_session_update',
    session_id: sessionId,
  });
}

export function requestQueueUpdate(): void {
  const manager = getDashboardWebSocketManager();
  manager.send({
    type: 'request_queue_update',
  });
}

export function requestMetricsUpdate(): void {
  const manager = getDashboardWebSocketManager();
  manager.send({
    type: 'request_metrics_update',
  });
}

export { DashboardWebSocketManager };
