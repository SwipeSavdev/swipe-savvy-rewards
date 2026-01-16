import { api } from './apiClient'
import type { Budget } from '../../types/api'

export interface CreateBudgetPayload {
  category: string
  amount: number
  period: 'weekly' | 'monthly'
  alertThreshold?: number // percentage (0-100)
  rollover?: boolean
}

export interface UpdateBudgetPayload {
  amount?: number
  period?: 'weekly' | 'monthly'
  alertThreshold?: number
  rollover?: boolean
}

export interface BudgetSummary {
  totalBudgeted: number
  totalSpent: number
  totalRemaining: number
  budgetsOverLimit: number
  budgetsNearLimit: number
}

export const budgetsApi = {
  /**
   * Get all budgets
   */
  getBudgets: async (): Promise<Budget[]> => {
    try {
      const response = await api.get<Budget[]>('/api/v1/budgets')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get a single budget by ID
   */
  getBudget: async (budgetId: string): Promise<Budget> => {
    return api.get<Budget>(`/api/v1/budgets/${budgetId}`)
  },

  /**
   * Create a new budget
   */
  createBudget: async (payload: CreateBudgetPayload): Promise<Budget> => {
    return api.post<Budget>('/api/v1/budgets', payload)
  },

  /**
   * Update an existing budget
   */
  updateBudget: async (budgetId: string, payload: UpdateBudgetPayload): Promise<Budget> => {
    return api.put<Budget>(`/api/v1/budgets/${budgetId}`, payload)
  },

  /**
   * Delete a budget
   */
  deleteBudget: async (budgetId: string): Promise<void> => {
    return api.delete(`/api/v1/budgets/${budgetId}`)
  },

  /**
   * Get budget summary (totals across all budgets)
   */
  getSummary: async (period?: 'current' | 'last'): Promise<BudgetSummary> => {
    try {
      const query = period ? `?period=${period}` : ''
      return await api.get<BudgetSummary>(`/api/v1/budgets/summary${query}`)
    } catch {
      // Endpoint may not exist - return default summary
      return {
        totalBudgeted: 0,
        totalSpent: 0,
        totalRemaining: 0,
        budgetsOverLimit: 0,
        budgetsNearLimit: 0,
      }
    }
  },

  /**
   * Get spending by category for budget comparison
   */
  getCategorySpending: async (category: string, params?: {
    period?: 'weekly' | 'monthly'
    months?: number
  }): Promise<{
    period: string
    budgeted: number
    spent: number
  }[]> => {
    const searchParams = new URLSearchParams()
    searchParams.set('category', category)
    if (params?.period) searchParams.set('period', params.period)
    if (params?.months) searchParams.set('months', params.months.toString())

    return api.get(`/api/v1/budgets/category-spending?${searchParams.toString()}`)
  },

  /**
   * Reset budget spending (start of new period)
   */
  resetBudget: async (budgetId: string): Promise<Budget> => {
    return api.post<Budget>(`/api/v1/budgets/${budgetId}/reset`)
  },

  /**
   * Get budget alerts (over limit, near limit)
   */
  getAlerts: async (): Promise<{
    budgetId: string
    category: string
    type: 'over_limit' | 'near_limit'
    percentUsed: number
    spent: number
    limit: number
    message: string
  }[]> => {
    try {
      const response = await api.get('/api/v1/budgets/alerts')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },
}
