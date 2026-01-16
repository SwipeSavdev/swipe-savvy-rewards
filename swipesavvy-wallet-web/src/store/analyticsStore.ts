import { create } from 'zustand'
import { analyticsApi, type AnalyticsParams, type SpendingInsight } from '../services/api'
import type { Analytics, SpendingCategory, MonthlyTrend } from '../types/api'

type Period = '7d' | '30d' | '90d' | '1y' | 'all'

interface AnalyticsState {
  overview: Analytics | null
  spendingByCategory: SpendingCategory[]
  monthlyTrends: MonthlyTrend[]
  insights: SpendingInsight[]
  topMerchants: {
    merchantId: string
    merchantName: string
    merchantLogo?: string
    totalSpent: number
    transactionCount: number
    category: string
  }[]
  selectedPeriod: Period
  isLoading: boolean
  error: string | null

  // Actions
  fetchOverview: (params?: AnalyticsParams) => Promise<void>
  fetchSpendingByCategory: (params?: AnalyticsParams) => Promise<void>
  fetchMonthlyTrends: (params?: AnalyticsParams) => Promise<void>
  fetchInsights: () => Promise<void>
  fetchTopMerchants: (limit?: number) => Promise<void>
  fetchAll: (period?: Period) => Promise<void>
  setPeriod: (period: Period) => void
  clearError: () => void
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  overview: null,
  spendingByCategory: [],
  monthlyTrends: [],
  insights: [],
  topMerchants: [],
  selectedPeriod: '30d',
  isLoading: false,
  error: null,

  fetchOverview: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const period = params?.period || get().selectedPeriod
      const overview = await analyticsApi.getOverview({ ...params, period })
      set({ overview, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch overview'
      set({ error: message, isLoading: false })
    }
  },

  fetchSpendingByCategory: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const period = params?.period || get().selectedPeriod
      const spendingByCategory = await analyticsApi.getSpendingByCategory({ ...params, period })
      set({ spendingByCategory, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch spending'
      set({ error: message, isLoading: false })
    }
  },

  fetchMonthlyTrends: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const period = params?.period || get().selectedPeriod
      const monthlyTrends = await analyticsApi.getMonthlyTrends({ ...params, period })
      set({ monthlyTrends, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch trends'
      set({ error: message, isLoading: false })
    }
  },

  fetchInsights: async () => {
    set({ isLoading: true, error: null })
    try {
      const insights = await analyticsApi.getInsights()
      set({ insights, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch insights'
      set({ error: message, isLoading: false })
    }
  },

  fetchTopMerchants: async (limit = 5) => {
    set({ isLoading: true, error: null })
    try {
      const period = get().selectedPeriod
      const topMerchants = await analyticsApi.getTopMerchants({ limit, period })
      set({ topMerchants, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch merchants'
      set({ error: message, isLoading: false })
    }
  },

  fetchAll: async (period) => {
    const selectedPeriod = period || get().selectedPeriod
    if (period) {
      set({ selectedPeriod: period })
    }

    set({ isLoading: true, error: null })

    try {
      const [overview, spendingByCategory, monthlyTrends, insights, topMerchants] = await Promise.all([
        analyticsApi.getOverview({ period: selectedPeriod }),
        analyticsApi.getSpendingByCategory({ period: selectedPeriod }),
        analyticsApi.getMonthlyTrends({ period: selectedPeriod }),
        analyticsApi.getInsights(),
        analyticsApi.getTopMerchants({ limit: 5, period: selectedPeriod }),
      ])

      set({
        overview,
        spendingByCategory,
        monthlyTrends,
        insights,
        topMerchants,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch analytics'
      set({ error: message, isLoading: false })
    }
  },

  setPeriod: (period: Period) => {
    set({ selectedPeriod: period })
    get().fetchAll(period)
  },

  clearError: () => set({ error: null }),
}))
