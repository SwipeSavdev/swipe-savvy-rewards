import { api } from './apiClient'
import type { Transaction, PaginatedResponse, TransactionType, TransactionStatus } from '../../types/api'

export interface TransactionFilters {
  search?: string
  type?: TransactionType
  status?: TransactionStatus
  category?: string
  startDate?: string
  endDate?: string
}

// Backend may return different field names - normalize to frontend Transaction type
interface BackendTransaction {
  id: string
  type?: TransactionType
  title?: string
  name?: string
  amount: number
  currency?: string
  status?: TransactionStatus
  timestamp?: string
  createdAt?: string
  created_at?: string
  description?: string
  category?: string
  merchantLogo?: string
  merchant_logo?: string
}

function normalizeTransaction(tx: BackendTransaction): Transaction {
  return {
    id: tx.id,
    type: tx.type || 'payment',
    title: tx.title || tx.name || tx.description || 'Transaction',
    amount: tx.amount,
    currency: tx.currency || 'USD',
    status: tx.status || 'completed',
    timestamp: tx.timestamp || tx.createdAt || tx.created_at || new Date().toISOString(),
    description: tx.description,
    category: tx.category,
    merchantLogo: tx.merchantLogo || tx.merchant_logo,
  }
}

export const transactionsApi = {
  /**
   * Get transactions with pagination and filters
   * Normalizes response to always return PaginatedResponse format
   */
  getTransactions: async (params?: {
    page?: number
    limit?: number
    filters?: TransactionFilters
  }): Promise<PaginatedResponse<Transaction>> => {
    const page = params?.page || 1
    const limit = params?.limit || 20

    try {
      const searchParams = new URLSearchParams()
      searchParams.set('page', page.toString())
      searchParams.set('limit', limit.toString())

      if (params?.filters) {
        const { search, type, status, category, startDate, endDate } = params.filters
        if (search) searchParams.set('search', search)
        if (type) searchParams.set('type', type)
        if (status) searchParams.set('status', status)
        if (category) searchParams.set('category', category)
        if (startDate) searchParams.set('start_date', startDate)
        if (endDate) searchParams.set('end_date', endDate)
      }

      const query = searchParams.toString()
      const response = await api.get<PaginatedResponse<BackendTransaction> | BackendTransaction[]>(
        `/api/v1/wallet/transactions${query ? `?${query}` : ''}`
      )

      // Normalize response - handle both array and paginated formats
      if (Array.isArray(response)) {
        return {
          data: response.map(normalizeTransaction),
          total: response.length,
          page,
          limit,
          hasMore: response.length === limit,
        }
      }

      // Normalize paginated response
      return {
        ...response,
        data: Array.isArray(response.data) ? response.data.map(normalizeTransaction) : [],
      }
    } catch {
      return { data: [], total: 0, page, limit, hasMore: false }
    }
  },

  /**
   * Get single transaction by ID
   */
  getTransaction: async (transactionId: string): Promise<Transaction> => {
    return api.get<Transaction>(`/api/v1/transactions/${transactionId}`)
  },

  /**
   * Get transaction categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/api/v1/transactions/categories')
      return Array.isArray(response) ? response : []
    } catch {
      return []
    }
  },

  /**
   * Export transactions
   */
  exportTransactions: async (params: {
    format: 'csv' | 'pdf'
    filters?: TransactionFilters
  }): Promise<Blob> => {
    const searchParams = new URLSearchParams()
    searchParams.set('format', params.format)

    if (params.filters) {
      const { search, type, status, category, startDate, endDate } = params.filters
      if (search) searchParams.set('search', search)
      if (type) searchParams.set('type', type)
      if (status) searchParams.set('status', status)
      if (category) searchParams.set('category', category)
      if (startDate) searchParams.set('start_date', startDate)
      if (endDate) searchParams.set('end_date', endDate)
    }

    const response = await fetch(
      `/api/v1/transactions/export?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('wallet_auth_token')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return response.blob()
  },
}
