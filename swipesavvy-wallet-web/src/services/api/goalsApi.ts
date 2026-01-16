import { api } from './apiClient'
import type { SavingsGoal } from '../../types/api'

export interface CreateGoalPayload {
  name: string
  targetAmount: number
  targetDate?: string
  icon?: string
  color?: string
  autoContribute?: {
    enabled: boolean
    amount: number
    frequency: 'weekly' | 'biweekly' | 'monthly'
  }
}

export interface UpdateGoalPayload {
  name?: string
  targetAmount?: number
  targetDate?: string
  icon?: string
  color?: string
  autoContribute?: {
    enabled: boolean
    amount: number
    frequency: 'weekly' | 'biweekly' | 'monthly'
  }
}

export interface GoalContribution {
  id: string
  goalId: string
  amount: number
  type: 'manual' | 'auto' | 'roundup'
  createdAt: string
}

export const goalsApi = {
  /**
   * Get all savings goals
   */
  getGoals: async (): Promise<SavingsGoal[]> => {
    try {
      const response = await api.get<SavingsGoal[]>('/api/v1/goals')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get a single goal by ID
   */
  getGoal: async (goalId: string): Promise<SavingsGoal> => {
    return api.get<SavingsGoal>(`/api/v1/goals/${goalId}`)
  },

  /**
   * Create a new savings goal
   */
  createGoal: async (payload: CreateGoalPayload): Promise<SavingsGoal> => {
    return api.post<SavingsGoal>('/api/v1/goals', payload)
  },

  /**
   * Update an existing goal
   */
  updateGoal: async (goalId: string, payload: UpdateGoalPayload): Promise<SavingsGoal> => {
    return api.put<SavingsGoal>(`/api/v1/goals/${goalId}`, payload)
  },

  /**
   * Delete a goal
   */
  deleteGoal: async (goalId: string): Promise<void> => {
    return api.delete(`/api/v1/goals/${goalId}`)
  },

  /**
   * Contribute funds to a goal
   */
  contribute: async (goalId: string, amount: number): Promise<{
    goal: SavingsGoal
    contribution: GoalContribution
  }> => {
    return api.post(`/api/v1/goals/${goalId}/contribute`, { amount })
  },

  /**
   * Withdraw funds from a goal
   */
  withdraw: async (goalId: string, amount: number): Promise<{
    goal: SavingsGoal
    withdrawal: GoalContribution
  }> => {
    return api.post(`/api/v1/goals/${goalId}/withdraw`, { amount })
  },

  /**
   * Get contribution history for a goal
   */
  getContributions: async (goalId: string, params?: {
    page?: number
    limit?: number
  }): Promise<GoalContribution[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      const query = searchParams.toString()
      const response = await api.get<GoalContribution[]>(
        `/api/v1/goals/${goalId}/contributions${query ? `?${query}` : ''}`
      )
      return Array.isArray(response) ? response : []
    } catch {
      return []
    }
  },

  /**
   * Toggle auto-contribute for a goal
   */
  toggleAutoContribute: async (goalId: string, settings: {
    enabled: boolean
    amount?: number
    frequency?: 'weekly' | 'biweekly' | 'monthly'
  }): Promise<SavingsGoal> => {
    return api.put<SavingsGoal>(`/api/v1/goals/${goalId}/auto-contribute`, settings)
  },
}
