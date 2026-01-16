import { describe, it, expect, beforeEach } from 'vitest'
import { goalsApi } from './goalsApi'
import { setToken, clearTokens } from './apiClient'

describe('goalsApi', () => {
  beforeEach(() => {
    clearTokens()
    setToken('mock-jwt-token')
  })

  describe('getGoals', () => {
    it('should fetch all goals', async () => {
      const goals = await goalsApi.getGoals()

      expect(Array.isArray(goals)).toBe(true)
      expect(goals.length).toBe(2)
      expect(goals[0].name).toBe('Emergency Fund')
      expect(goals[0].targetAmount).toBe(10000)
    })
  })

  describe('getGoal', () => {
    it('should fetch single goal by ID', async () => {
      const goal = await goalsApi.getGoal('goal-1')

      expect(goal.id).toBe('goal-1')
      expect(goal.name).toBe('Emergency Fund')
      expect(goal.currentAmount).toBe(6500)
    })
  })

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const newGoal = await goalsApi.createGoal({
        name: 'New Car',
        targetAmount: 25000,
      })

      expect(newGoal.id).toBeDefined()
      expect(newGoal.name).toBe('New Car')
      expect(newGoal.targetAmount).toBe(25000)
      expect(newGoal.currentAmount).toBe(0)
    })
  })

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      await expect(goalsApi.deleteGoal('goal-1')).resolves.not.toThrow()
    })
  })

  describe('contribute', () => {
    it('should contribute to a goal', async () => {
      const result = await goalsApi.contribute('goal-1', 500)

      expect(result.goal.currentAmount).toBe(7000) // 6500 + 500
      expect(result.contribution.amount).toBe(500)
      expect(result.contribution.type).toBe('manual')
    })
  })
})
