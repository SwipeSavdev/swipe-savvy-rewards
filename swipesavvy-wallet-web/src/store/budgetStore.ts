import { create } from 'zustand'
import { budgetsApi, type CreateBudgetPayload, type UpdateBudgetPayload, type BudgetSummary } from '../services/api'
import type { Budget } from '../types/api'

interface BudgetAlert {
  budgetId: string
  category: string
  type: 'over_limit' | 'near_limit'
  percentUsed: number
  spent: number
  limit: number
  message: string
}

interface BudgetState {
  budgets: Budget[]
  selectedBudget: Budget | null
  summary: BudgetSummary | null
  alerts: BudgetAlert[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchBudgets: () => Promise<void>
  fetchBudget: (budgetId: string) => Promise<void>
  createBudget: (payload: CreateBudgetPayload) => Promise<Budget>
  updateBudget: (budgetId: string, payload: UpdateBudgetPayload) => Promise<void>
  deleteBudget: (budgetId: string) => Promise<void>
  fetchSummary: () => Promise<void>
  fetchAlerts: () => Promise<void>
  resetBudget: (budgetId: string) => Promise<void>
  selectBudget: (budget: Budget | null) => void
  updateBudgetSpending: (budgetId: string, spent: number) => void
  clearError: () => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  selectedBudget: null,
  summary: null,
  alerts: [],
  isLoading: false,
  error: null,

  fetchBudgets: async () => {
    set({ isLoading: true, error: null })
    try {
      const budgets = await budgetsApi.getBudgets()
      set({ budgets, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch budgets'
      set({ error: message, isLoading: false })
    }
  },

  fetchBudget: async (budgetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const budget = await budgetsApi.getBudget(budgetId)
      set({ selectedBudget: budget, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch budget'
      set({ error: message, isLoading: false })
    }
  },

  createBudget: async (payload: CreateBudgetPayload) => {
    set({ isLoading: true, error: null })
    try {
      const newBudget = await budgetsApi.createBudget(payload)
      set({
        budgets: [...get().budgets, newBudget],
        isLoading: false,
      })
      return newBudget
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create budget'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updateBudget: async (budgetId: string, payload: UpdateBudgetPayload) => {
    set({ isLoading: true, error: null })
    try {
      const updatedBudget = await budgetsApi.updateBudget(budgetId, payload)
      set({
        budgets: get().budgets.map((b) => (b.id === budgetId ? updatedBudget : b)),
        selectedBudget: get().selectedBudget?.id === budgetId ? updatedBudget : get().selectedBudget,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update budget'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deleteBudget: async (budgetId: string) => {
    set({ isLoading: true, error: null })
    try {
      await budgetsApi.deleteBudget(budgetId)
      set({
        budgets: get().budgets.filter((b) => b.id !== budgetId),
        selectedBudget: get().selectedBudget?.id === budgetId ? null : get().selectedBudget,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete budget'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true, error: null })
    try {
      const summary = await budgetsApi.getSummary()
      set({ summary, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch summary'
      set({ error: message, isLoading: false })
    }
  },

  fetchAlerts: async () => {
    set({ isLoading: true, error: null })
    try {
      const alerts = await budgetsApi.getAlerts()
      set({ alerts, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch alerts'
      set({ error: message, isLoading: false })
    }
  },

  resetBudget: async (budgetId: string) => {
    set({ isLoading: true, error: null })
    try {
      const resetBudget = await budgetsApi.resetBudget(budgetId)
      set({
        budgets: get().budgets.map((b) => (b.id === budgetId ? resetBudget : b)),
        selectedBudget: get().selectedBudget?.id === budgetId ? resetBudget : get().selectedBudget,
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset budget'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  selectBudget: (budget: Budget | null) => {
    set({ selectedBudget: budget })
  },

  updateBudgetSpending: (budgetId: string, spent: number) => {
    set({
      budgets: get().budgets.map((b) =>
        b.id === budgetId ? { ...b, spentAmount: spent } : b
      ),
      selectedBudget:
        get().selectedBudget?.id === budgetId
          ? { ...get().selectedBudget!, spentAmount: spent }
          : get().selectedBudget,
    })
  },

  clearError: () => set({ error: null }),
}))
