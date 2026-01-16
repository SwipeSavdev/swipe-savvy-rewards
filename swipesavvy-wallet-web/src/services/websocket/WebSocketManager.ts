/**
 * WebSocket Manager for Real-Time Sync
 *
 * Handles:
 * - Connection management with auto-reconnect
 * - JWT authentication
 * - Heartbeat/keepalive
 * - Message routing to stores
 */

export type WSMessageType =
  | 'auth'
  | 'auth_success'
  | 'auth_error'
  | 'heartbeat'
  | 'balance_update'
  | 'transaction_created'
  | 'transaction_updated'
  | 'reward_earned'
  | 'goal_progress'
  | 'budget_alert'
  | 'card_status'
  | 'notification'
  | 'error'

export interface WSMessage<T = unknown> {
  type: WSMessageType
  data?: T
  timestamp: number
  requestId?: string
}

export interface WSBalanceUpdate {
  available: number
  pending: number
  currency: string
}

export interface WSTransactionCreated {
  id: string
  amount: number
  merchantName: string
  category: string
  type: 'credit' | 'debit'
  status: string
  createdAt: string
}

export interface WSRewardEarned {
  points: number
  reason: string
  totalPoints: number
  tier: string
}

export interface WSGoalProgress {
  goalId: string
  currentAmount: number
  targetAmount: number
  percentComplete: number
}

export interface WSBudgetAlert {
  budgetId: string
  category: string
  spent: number
  limit: number
  percentUsed: number
  alertType: 'near_limit' | 'over_limit'
}

type MessageHandler<T = unknown> = (data: T) => void

interface ConnectionConfig {
  url: string
  token: string
  reconnectAttempts?: number
  reconnectDelay?: number
  heartbeatInterval?: number
}

class WalletWebSocketManager {
  private ws: WebSocket | null = null
  private config: ConnectionConfig | null = null
  private handlers: Map<WSMessageType, Set<MessageHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private heartbeatInterval = 30000
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private isAuthenticated = false

  /**
   * Connect to WebSocket server
   */
  async connect(config: ConnectionConfig): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected')
      return
    }

    if (this.isConnecting) {
      console.log('[WS] Connection already in progress')
      return
    }

    this.config = {
      ...config,
      reconnectAttempts: config.reconnectAttempts ?? this.maxReconnectAttempts,
      reconnectDelay: config.reconnectDelay ?? this.reconnectDelay,
      heartbeatInterval: config.heartbeatInterval ?? this.heartbeatInterval,
    }

    this.maxReconnectAttempts = this.config.reconnectAttempts!
    this.reconnectDelay = this.config.reconnectDelay!
    this.heartbeatInterval = this.config.heartbeatInterval!

    return this.createConnection()
  }

  private createConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('No configuration provided'))
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('[WS] Connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.authenticate()
          resolve()
        }

        this.ws.onclose = (event) => {
          console.log(`[WS] Disconnected: ${event.code} ${event.reason}`)
          this.isConnecting = false
          this.isAuthenticated = false
          this.stopHeartbeat()
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error)
          this.isConnecting = false
          reject(error)
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Authenticate with JWT token
   */
  private authenticate(): void {
    if (!this.config?.token) {
      console.error('[WS] No token for authentication')
      return
    }

    this.send({
      type: 'auth',
      data: { token: this.config.token },
      timestamp: Date.now(),
    })
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(rawData: string): void {
    try {
      const message: WSMessage = JSON.parse(rawData)
      console.log('[WS] Received:', message.type)

      switch (message.type) {
        case 'auth_success':
          this.isAuthenticated = true
          this.startHeartbeat()
          this.emit('auth_success', message.data)
          break

        case 'auth_error':
          this.isAuthenticated = false
          this.emit('auth_error', message.data)
          this.disconnect()
          break

        case 'heartbeat':
          // Respond to server heartbeat
          this.send({ type: 'heartbeat', timestamp: Date.now() })
          break

        default:
          // Route to registered handlers
          this.emit(message.type, message.data)
      }
    } catch (error) {
      console.error('[WS] Failed to parse message:', error)
    }
  }

  /**
   * Send a message to the server
   */
  send(message: WSMessage): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Cannot send - not connected')
      return
    }

    this.ws.send(JSON.stringify(message))
  }

  /**
   * Subscribe to a message type
   */
  on<T = unknown>(type: WSMessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }

    this.handlers.get(type)!.add(handler as MessageHandler)

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler)
    }
  }

  /**
   * Emit to handlers
   */
  private emit<T>(type: WSMessageType, data: T): void {
    const handlers = this.handlers.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[WS] Handler error for ${type}:`, error)
        }
      })
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', timestamp: Date.now() })
      }
    }, this.heartbeatInterval)
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached')
      this.emit('error', { message: 'Connection lost' })
      return
    }

    if (this.reconnectTimer) {
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.createConnection().catch((error) => {
        console.error('[WS] Reconnect failed:', error)
      })
    }, delay)
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isAuthenticated = false
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated
  }

  /**
   * Get connection state
   */
  getState(): 'connecting' | 'connected' | 'disconnected' | 'authenticating' {
    if (this.isConnecting) return 'connecting'
    if (this.ws?.readyState === WebSocket.OPEN) {
      return this.isAuthenticated ? 'connected' : 'authenticating'
    }
    return 'disconnected'
  }
}

// Singleton instance
export const wsManager = new WalletWebSocketManager()
