import { api } from './apiClient'
import type { Recipient } from '../../types/api'

export interface Transfer {
  id: string
  type: 'internal' | 'external' | 'p2p'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  amount: number
  fee: number
  currency: string
  fromAccountId: string
  fromAccountName: string
  toAccountId?: string
  toAccountName?: string
  recipientId?: string
  recipientName?: string
  recipientEmail?: string
  memo?: string
  scheduledDate?: string
  completedAt?: string
  estimatedArrival?: string
  failureReason?: string
  createdAt: string
}

export interface TransferQuote {
  amount: number
  fee: number
  total: number
  estimatedArrival: string
  exchangeRate?: number
}

export interface CreateTransferPayload {
  type: 'internal' | 'external' | 'p2p'
  amount: number
  fromAccountId: string
  toAccountId?: string
  recipientId?: string
  recipientEmail?: string
  memo?: string
  scheduledDate?: string
}

export const transfersApi = {
  /**
   * Get transfer history
   */
  getTransfers: async (params?: {
    page?: number
    limit?: number
    type?: 'internal' | 'external' | 'p2p'
    status?: 'pending' | 'completed' | 'failed'
    startDate?: string
    endDate?: string
  }): Promise<Transfer[]> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.type) searchParams.set('type', params.type)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.startDate) searchParams.set('start_date', params.startDate)
    if (params?.endDate) searchParams.set('end_date', params.endDate)

    const query = searchParams.toString()
    return api.get<Transfer[]>(`/api/v1/transfers${query ? `?${query}` : ''}`)
  },

  /**
   * Get a single transfer
   */
  getTransfer: async (transferId: string): Promise<Transfer> => {
    return api.get<Transfer>(`/api/v1/transfers/${transferId}`)
  },

  /**
   * Get transfer quote (fee, estimated arrival)
   */
  getQuote: async (payload: {
    type: 'internal' | 'external' | 'p2p'
    amount: number
    fromAccountId: string
    toAccountId?: string
  }): Promise<TransferQuote> => {
    return api.post<TransferQuote>('/api/v1/transfers/quote', payload)
  },

  /**
   * Create a new transfer
   */
  createTransfer: async (payload: CreateTransferPayload): Promise<Transfer> => {
    return api.post<Transfer>('/api/v1/transfers', payload)
  },

  /**
   * Cancel a pending transfer
   */
  cancelTransfer: async (transferId: string): Promise<Transfer> => {
    return api.post<Transfer>(`/api/v1/transfers/${transferId}/cancel`)
  },

  /**
   * Get all saved recipients
   */
  getRecipients: async (): Promise<Recipient[]> => {
    try {
      return await api.get<Recipient[]>('/api/v1/transfers/recipients')
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Add a new recipient
   */
  addRecipient: async (recipient: {
    name: string
    email?: string
    phone?: string
    bankAccountId?: string
    walletAddress?: string
    type: 'person' | 'business'
  }): Promise<Recipient> => {
    return api.post<Recipient>('/api/v1/transfers/recipients', recipient)
  },

  /**
   * Update a recipient
   */
  updateRecipient: async (recipientId: string, updates: {
    name?: string
    email?: string
    phone?: string
    bankAccountId?: string
  }): Promise<Recipient> => {
    return api.put<Recipient>(`/api/v1/transfers/recipients/${recipientId}`, updates)
  },

  /**
   * Delete a recipient
   */
  deleteRecipient: async (recipientId: string): Promise<void> => {
    return api.delete(`/api/v1/transfers/recipients/${recipientId}`)
  },

  /**
   * Get recent recipients (for quick transfer)
   */
  getRecentRecipients: async (limit?: number): Promise<Recipient[]> => {
    try {
      const query = limit ? `?limit=${limit}` : ''
      return await api.get<Recipient[]>(`/api/v1/transfers/recipients/recent${query}`)
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Request money from someone
   */
  requestMoney: async (payload: {
    amount: number
    recipientEmail: string
    memo?: string
  }): Promise<{
    requestId: string
    status: 'sent'
    expiresAt: string
  }> => {
    return api.post('/api/v1/transfers/request', payload)
  },

  /**
   * Schedule a recurring transfer
   */
  scheduleRecurring: async (payload: {
    type: 'internal' | 'external' | 'p2p'
    amount: number
    fromAccountId: string
    toAccountId?: string
    recipientId?: string
    frequency: 'weekly' | 'biweekly' | 'monthly'
    startDate: string
    endDate?: string
    memo?: string
  }): Promise<{
    scheduleId: string
    nextTransferDate: string
  }> => {
    return api.post('/api/v1/transfers/recurring', payload)
  },

  /**
   * Cancel a recurring transfer schedule
   */
  cancelRecurring: async (scheduleId: string): Promise<void> => {
    return api.delete(`/api/v1/transfers/recurring/${scheduleId}`)
  },
}
