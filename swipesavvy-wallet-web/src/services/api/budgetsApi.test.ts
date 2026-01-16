import { describe, it, expect, beforeEach } from 'vitest'
import { budgetsApi } from './budgetsApi'
import { setToken, clearTokens } from './apiClient'

describe('budgetsApi', () => {
  beforeEach(() => {
    clearTokens()
    setToken('mock-jwt-token')
  })

  describe('getBudgets', () => {
    it('should fetch all budgets', async () => {
      const budgets = await budgetsApi.getBudgets()

      expect(Array.isArray(budgets)).toBe(true)
      expect(budgets.length).toBe(2)
      expect(budgets[0].category).toBe('Food & Dining')
      expect(budgets[0].budgetAmount).toBe(500)
    })
  })

  describe('getSummary', () => {
    it('should fetch budget summary', async () => {
      const summary = await budgetsApi.getSummary()

      expect(summary.totalBudgeted).toBe(1500)
      expect(summary.totalSpent).toBe(1100)
      expect(summary.totalRemaining).toBe(400)
      expect(summary.budgetsOverLimit).toBe(0)
    })
  })

  describe('getAlerts', () => {
    it('should fetch budget alerts', async () => {
      const alerts = await budgetsApi.getAlerts()

      expect(Array.isArray(alerts)).toBe(true)
      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].type).toBe('near_limit')
      expect(alerts[0].percentUsed).toBe(90)
    })
  })

  describe('createBudget', () => {
    it('should create a new budget', async () => {
      const newBudget = await budgetsApi.createBudget({
        category: 'Travel',
        amount: 1000,
        period: 'monthly',
      })

      expect(newBudget.id).toBeDefined()
      expect(newBudget.category).toBe('Travel')
      expect(newBudget.budgetAmount).toBe(1000)
      expect(newBudget.spentAmount).toBe(0)
    })
  })

  describe('deleteBudget', () => {
    it('should delete a budget', async () => {
      await expect(budgetsApi.deleteBudget('budget-1')).resolves.not.toThrow()
    })
  })
})
