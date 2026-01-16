import { create } from 'zustand'
import { goalsApi, type CreateGoalPayload, type UpdateGoalPayload, type GoalContribution } from '../services/api'
import type { SavingsGoal } from '../types/api'

interface GoalsState {
  goals: SavingsGoal[]
  selectedGoal: SavingsGoal | null
  contributions: GoalContribution[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchGoals: () => Promise<void>
  fetchGoal: (goalId: string) => Promise<void>
  createGoal: (payload: CreateGoalPayload) => Promise<SavingsGoal>
  updateGoal: (goalId: string, payload: UpdateGoalPayload) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  contribute: (goalId: string, amount: number) => Promise<void>
  withdraw: (goalId: string, amount: number) => Promise<void>
  fetchContributions: (goalId: string) => Promise<void>
  toggleAutoContribute: (goalId: string, settings: { enabled: boolean; amount?: number; frequency?: 'weekly' | 'biweekly' | 'monthly' }) => Promise<void>
  selectGoal: (goal: SavingsGoal | null) => void
  updateGoalProgress: (goalId: string, currentAmount: number) => void
  clearError: () => void
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  selectedGoal: null,
  contributions: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null })
    try {
      const goals = await goalsApi.getGoals()
      set({ goals, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch goals'
      set({ error: message, isLoading: false })
    }
  },

  fetchGoal: async (goalId: string) => {
    set({ isLoading: true, error: null })
    try {
      const goal = await goalsApi.getGoal(goalId)
      set({ selectedGoal: goal, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch goal'
      set({ error: message, isLoading: false })
    }
  },

  createGoal: async (payload: CreateGoalPayload) => {
    set({ isLoading: true, error: null })
    try {
      const newGoal = await goalsApi.createGoal(payload)
      set({
        goals: [...get().goals, newGoal],
        isLoading: false,
      })
      return newGoal
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create goal'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateGoal: async (goalId: string, payload: UpdateGoalPayload) => {
    set({ isLoading: true, error: null })
    try {
      const updatedGoal = await goalsApi.updateGoal(goalId, payload)
      set({
        goals: get().goals.map((g) => (g.id === goalId ? updatedGoal : g)),
        selectedGoal: get().selectedGoal?.id === goalId ? updatedGoal : get().selectedGoal,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update goal'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isLoading: true, error: null })
    try {
      await goalsApi.deleteGoal(goalId)
      set({
        goals: get().goals.filter((g) => g.id !== goalId),
        selectedGoal: get().selectedGoal?.id === goalId ? null : get().selectedGoal,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete goal'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  contribute: async (goalId: string, amount: number) => {
    set({ isLoading: true, error: null })
    try {
      const { goal, contribution } = await goalsApi.contribute(goalId, amount)
      set({
        goals: get().goals.map((g) => (g.id === goalId ? goal : g)),
        selectedGoal: get().selectedGoal?.id === goalId ? goal : get().selectedGoal,
        contributions: [contribution, ...get().contributions],
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to contribute'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  withdraw: async (goalId: string, amount: number) => {
    set({ isLoading: true, error: null })
    try {
      const { goal, withdrawal } = await goalsApi.withdraw(goalId, amount)
      set({
        goals: get().goals.map((g) => (g.id === goalId ? goal : g)),
        selectedGoal: get().selectedGoal?.id === goalId ? goal : get().selectedGoal,
        contributions: [withdrawal, ...get().contributions],
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to withdraw'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  fetchContributions: async (goalId: string) => {
    set({ isLoading: true, error: null })
    try {
      const contributions = await goalsApi.getContributions(goalId)
      set({ contributions, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch contributions'
      set({ error: message, isLoading: false })
    }
  },

  toggleAutoContribute: async (goalId: string, settings) => {
    set({ isLoading: true, error: null })
    try {
      const updatedGoal = await goalsApi.toggleAutoContribute(goalId, settings)
      set({
        goals: get().goals.map((g) => (g.id === goalId ? updatedGoal : g)),
        selectedGoal: get().selectedGoal?.id === goalId ? updatedGoal : get().selectedGoal,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update auto-contribute'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  selectGoal: (goal: SavingsGoal | null) => {
    set({ selectedGoal: goal, contributions: [] })
  },

  updateGoalProgress: (goalId: string, currentAmount: number) => {
    set({
      goals: get().goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount } : g
      ),
      selectedGoal:
        get().selectedGoal?.id === goalId
          ? { ...get().selectedGoal!, currentAmount }
          : get().selectedGoal,
    })
  },

  clearError: () => set({ error: null }),
}))
