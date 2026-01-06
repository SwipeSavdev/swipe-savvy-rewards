/**
 * Support API Service
 * Handles all communication with the backend support system API
 */

import axios, { AxiosInstance } from 'axios'
import { MobileAppDatabase } from '../database/MobileAppDatabase'
import { MOBILE_DB_CONFIG } from '../database/config'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

interface CreateTicketPayload {
  customer_id: string
  category: string
  subject: string
  description: string
  priority?: string
  attachments?: string[]
}

interface TicketMessage {
  message_content: string
  attachments?: string[]
  sender_type?: string
}

export class SupportAPIService {
  private api: AxiosInstance
  private db: MobileAppDatabase | null = null

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api/support`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add request interceptor for auth tokens
    this.api.interceptors.request.use(async (config) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('API Error:', error.response?.data || error.message)
        // Queue failed requests for offline retry
        if (this.db && error.config && error.response?.status >= 500) {
          await this.queueOfflineRequest(error.config)
        }
        throw error
      }
    )
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      this.db = MobileAppDatabase.getInstance()
      await this.db.initialize()
      console.log('✅ Support API Service initialized')
    } catch (error) {
      console.error('Failed to initialize Support API Service:', error)
      throw error
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(payload: CreateTicketPayload) {
    try {
      const response = await this.api.post('/tickets', payload)
      
      // Store in local database for offline access
      if (this.db) {
        await this.db.insertSupportTicket({
          id: response.data.ticket_id,
          ticket_number: response.data.ticket_id,
          user_id: payload.customer_id,
          category: payload.category,
          subject: payload.subject,
          description: payload.description,
          priority: payload.priority || 'medium',
          status: 'open',
        } as any)

        // Cache the ticket
        await this.db.cacheData('support_tickets', response.data.ticket, MOBILE_DB_CONFIG.CACHE.TICKET_TTL)
      }

      return response.data
    } catch (error) {
      console.error('Failed to create ticket:', error)
      
      // Store in offline queue for later sync
      if (this.db && error instanceof Error) {
        await (this.db as any).addToOfflineQueue({
          endpoint: '/api/support/tickets',
          method: 'POST',
          payload,
          timestamp: new Date().toISOString(),
          retries: 0
        })
      }
      
      throw error
    }
  }

  /**
   * Get ticket details
   */
  async getTicket(ticketId: string) {
    try {
      const response = await this.api.get(`/tickets/${ticketId}`)
      
      // Cache the ticket
      if (this.db) {
        await this.db.cacheData('support_tickets', response.data.ticket, MOBILE_DB_CONFIG.CACHE.TICKET_TTL)
      }

      return response.data
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
      
      // Try to get from local cache
      if (this.db) {
        const cachedTicket = await (this.db as any).getCachedData('support_tickets', ticketId)
        if (cachedTicket) {
          console.log('Using cached ticket data')
          return { ticket: cachedTicket }
        }
      }
      
      throw error
    }
  }

  /**
   * List tickets for customer
   */
  async listTickets(customerId: string, status?: string) {
    try {
      const params: any = { customer_id: customerId }
      if (status) params.status = status

      const response = await this.api.get('/tickets', { params })
      
      // Cache tickets
      if (this.db && response.data.tickets) {
        for (const ticket of response.data.tickets) {
          await this.db.cacheData('support_tickets', ticket, MOBILE_DB_CONFIG.CACHE.TICKET_TTL)
        }
      }

      return response.data
    } catch (error) {
      console.error('Failed to list tickets:', error)
      
      // Get from local database
      if (this.db) {
        const localTickets = await (this.db as any).getCustomerTickets(customerId)
        return {
          tickets: localTickets,
          total: localTickets.length,
          cached: true
        }
      }
      
      throw error
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId: string, updates: Partial<CreateTicketPayload>) {
    try {
      const response = await this.api.put(`/tickets/${ticketId}`, updates)
      
      // Update local database
      if (this.db) {
        await (this.db as any).updateSupportTicket(ticketId, updates)
        await this.db.cacheData('support_tickets', response.data.ticket, MOBILE_DB_CONFIG.CACHE.TICKET_TTL)
      }

      return response.data
    } catch (error) {
      console.error('Failed to update ticket:', error)
      
      // Queue for offline sync
      if (this.db) {
        await (this.db as any).addToOfflineQueue({
          endpoint: `/api/support/tickets/${ticketId}`,
          method: 'PUT',
          payload: updates,
          timestamp: new Date().toISOString(),
          retries: 0
        })
      }
      
      throw error
    }
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(ticketId: string, reason: string, level: string) {
    try {
      const response = await this.api.post(`/tickets/${ticketId}/escalate`, {
        reason,
        escalation_level: level
      })
      
      if (this.db) {
        await (this.db as any).updateSupportTicket(ticketId, { status: 'escalated' })
      }

      return response.data
    } catch (error) {
      console.error('Failed to escalate ticket:', error)
      throw error
    }
  }

  /**
   * Add message to ticket
   */
  async addMessage(ticketId: string, message: TicketMessage) {
    try {
      const response = await this.api.post(`/tickets/${ticketId}/messages`, message)
      
      // Store in local database
      if (this.db) {
        await (this.db as any).insertChatMessage({
          ticket_id: ticketId,
          message_id: response.data.message.message_id,
          sender_id: 'customer',
          sender_type: message.sender_type || 'customer',
          message_content: message.message_content,
          created_at: new Date().toISOString()
        })
      }

      return response.data
    } catch (error) {
      console.error('Failed to add message:', error)
      
      // Queue for offline sync
      if (this.db) {
        await (this.db as any).addToOfflineQueue({
          endpoint: `/api/support/tickets/${ticketId}/messages`,
          method: 'POST',
          payload: message,
          timestamp: new Date().toISOString(),
          retries: 0
        })
      }
      
      throw error
    }
  }

  /**
   * Verify customer identity
   */
  async verifyCustomer(customerId: string, email: string, phone: string) {
    try {
      const response = await this.api.post('/verify-customer', {
        customer_id: customerId,
        email,
        phone
      })
      
      // Store verification status
      if (this.db) {
        await this.db.cacheData('customer_verified', {
          customer_id: customerId,
          verified: true,
          timestamp: new Date().toISOString()
        }, 1440) // Cache for 24 hours
      }

      return response.data
    } catch (error) {
      console.error('Failed to verify customer:', error)
      throw error
    }
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics() {
    try {
      const response = await this.api.get('/dashboard/metrics')
      
      if (this.db) {
        await this.db.cacheData('dashboard_metrics', response.data.metrics, 5) // 5-minute cache
      }

      return response.data
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      throw error
    }
  }

  /**
   * Sync offline queue with backend
   */
  async syncOfflineQueue() {
    try {
      if (!this.db) {
        console.log('Database not initialized, skipping sync')
        return
      }

      const queue = await this.db.getOfflineQueue()
      
      if (!queue || queue.length === 0) {
        console.log('No offline requests to sync')
        return
      }

      console.log(`Syncing ${queue.length} offline requests...`)
      
      const results = []
      for (const item of queue) {
        try {
          let response
          
          if (item.method === 'POST') {
            response = await this.api.post(item.endpoint, item.payload)
          } else if (item.method === 'PUT') {
            response = await this.api.put(item.endpoint, item.payload)
          } else if (item.method === 'GET') {
            response = await this.api.get(item.endpoint)
          }

          // Remove from queue on success
          await this.db.removeFromOfflineQueue(item.id)
          results.push({ success: true, item })
        } catch (error) {
          console.error(`Failed to sync ${item.endpoint}:`, error)
          
          // Update retry count
          const retries = (item.retries || 0) + 1
          if (retries < MOBILE_DB_CONFIG.OFFLINE_QUEUE.MAX_RETRIES) {
            await (this.db as any).updateOfflineQueueRetries(item.id, retries)
          } else {
            // Max retries exceeded, remove from queue
            await this.db.removeFromOfflineQueue(item.id)
            console.error(`Max retries exceeded for ${item.endpoint}`)
          }
          
          results.push({ success: false, item, error })
        }
      }

      console.log(`Sync complete: ${results.filter(r => r.success).length}/${queue.length} successful`)
      return results
    } catch (error) {
      console.error('Error during offline queue sync:', error)
      throw error
    }
  }

  /**
   * Queue a request for offline retry
   */
  private async queueOfflineRequest(config: any) {
    try {
      if (!this.db) return

      await (this.db as any).addToOfflineQueue({
        endpoint: config.url,
        method: config.method || 'GET',
        payload: config.data,
        timestamp: new Date().toISOString(),
        retries: 0
      })
    } catch (error) {
      console.error('Failed to queue offline request:', error)
    }
  }
}

// Singleton instance
let instance: SupportAPIService | null = null

export function getSupportAPIService(): SupportAPIService {
  if (!instance) {
    instance = new SupportAPIService()
  }
  return instance
}
