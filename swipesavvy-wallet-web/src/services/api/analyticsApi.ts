import { api } from './apiClient'
import type { Analytics, SpendingCategory, MonthlyTrend } from '../../types/api'

export interface AnalyticsParams {
  period?: '7d' | '30d' | '90d' | '1y' | 'all'
  startDate?: string
  endDate?: string
}

export interface SpendingInsight {
  id: string
  type: 'saving_opportunity' | 'spending_increase' | 'goal_progress' | 'budget_alert'
  title: string
  description: string
  amount?: number
  percentChange?: number
  category?: string
  actionUrl?: string
  createdAt: string
}

export const analyticsApi = {
  /**
   * Get analytics overview (income, expenses, savings)
   */
  getOverview: async (params?: AnalyticsParams): Promise<Analytics> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.period) searchParams.set('period', params.period)
      if (params?.startDate) searchParams.set('start_date', params.startDate)
      if (params?.endDate) searchParams.set('end_date', params.endDate)

      const query = searchParams.toString()
      const url = `/api/v1/analytics${query ? `?${query}` : ''}`
      return await api.get<Analytics>(url)
    } catch {
      // Endpoint may not exist - return default analytics
      return {
        totalIncome: 0,
        totalExpenses: 0,
        totalSavings: 0,
        savingsRate: 0,
        spendingByCategory: [],
        monthlyTrend: [],
        insights: [],
      }
    }
  },

  /**
   * Get spending breakdown by category
   */
  getSpendingByCategory: async (params?: AnalyticsParams): Promise<SpendingCategory[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.period) searchParams.set('period', params.period)
      if (params?.startDate) searchParams.set('start_date', params.startDate)
      if (params?.endDate) searchParams.set('end_date', params.endDate)

      const query = searchParams.toString()
      const response = await api.get<SpendingCategory[]>(
        `/api/v1/analytics/spending/categories${query ? `?${query}` : ''}`
      )
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get monthly trends (income vs expenses over time)
   */
  getMonthlyTrends: async (params?: AnalyticsParams): Promise<MonthlyTrend[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.period) searchParams.set('period', params.period)
      if (params?.startDate) searchParams.set('start_date', params.startDate)
      if (params?.endDate) searchParams.set('end_date', params.endDate)

      const query = searchParams.toString()
      const response = await api.get<MonthlyTrend[]>(
        `/api/v1/analytics/trends/monthly${query ? `?${query}` : ''}`
      )
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get AI-generated spending insights
   */
  getInsights: async (): Promise<SpendingInsight[]> => {
    try {
      const response = await api.get<SpendingInsight[]>('/api/v1/analytics/insights')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get spending comparison (this period vs last period)
   */
  getComparison: async (period: '7d' | '30d' | '90d'): Promise<{
    current: Analytics
    previous: Analytics
    percentChange: {
      income: number
      expenses: number
      savings: number
    }
  }> => {
    return api.get(`/api/v1/analytics/comparison?period=${period}`)
  },

  /**
   * Get top merchants by spending
   */
  getTopMerchants: async (params?: {
    limit?: number
    period?: AnalyticsParams['period']
  }): Promise<{
    merchantId: string
    merchantName: string
    merchantLogo?: string
    totalSpent: number
    transactionCount: number
    category: string
  }[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.period) searchParams.set('period', params.period)

      const query = searchParams.toString()
      const response = await api.get(`/api/v1/analytics/merchants/top${query ? `?${query}` : ''}`)
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },
}
