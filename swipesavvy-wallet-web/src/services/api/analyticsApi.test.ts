import { describe, it, expect, beforeEach } from 'vitest'
import { analyticsApi } from './analyticsApi'
import { setToken, clearTokens } from './apiClient'

describe('analyticsApi', () => {
  beforeEach(() => {
    clearTokens()
    setToken('mock-jwt-token')
  })

  describe('getOverview', () => {
    it('should fetch analytics overview', async () => {
      const overview = await analyticsApi.getOverview()

      expect(overview.totalIncome).toBeDefined()
      expect(overview.totalExpenses).toBeDefined()
      expect(overview.totalSavings).toBeDefined()
      expect(overview.savingsRate).toBeDefined()
    })

    it('should support period parameter', async () => {
      const overview = await analyticsApi.getOverview({ period: '30d' })

      expect(overview).toBeDefined()
    })
  })

  describe('getSpendingByCategory', () => {
    it('should fetch spending breakdown', async () => {
      const spending = await analyticsApi.getSpendingByCategory()

      expect(Array.isArray(spending)).toBe(true)
      expect(spending.length).toBeGreaterThan(0)
      expect(spending[0].category).toBeDefined()
      expect(spending[0].amount).toBeDefined()
      expect(spending[0].percentage).toBeDefined()
    })
  })

  describe('getMonthlyTrends', () => {
    it('should fetch monthly trends', async () => {
      const trends = await analyticsApi.getMonthlyTrends()

      expect(Array.isArray(trends)).toBe(true)
      expect(trends.length).toBeGreaterThan(0)
      expect(trends[0].month).toBeDefined()
      expect(trends[0].income).toBeDefined()
      expect(trends[0].expenses).toBeDefined()
    })
  })

  describe('getInsights', () => {
    it('should fetch AI insights', async () => {
      const insights = await analyticsApi.getInsights()

      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights[0].title).toBeDefined()
      expect(insights[0].description).toBeDefined()
    })
  })

  describe('getTopMerchants', () => {
    it('should fetch top merchants', async () => {
      const merchants = await analyticsApi.getTopMerchants({ limit: 5 })

      expect(Array.isArray(merchants)).toBe(true)
      expect(merchants.length).toBeGreaterThan(0)
      expect(merchants[0].merchantName).toBeDefined()
      expect(merchants[0].totalSpent).toBeDefined()
    })
  })
})
