import { create } from 'zustand'
import { rewardsApi } from '../services/api'
import type { RewardsPoints, Boost, LeaderboardEntry, Transaction } from '../types/api'

interface Charity {
  id: string
  name: string
  description: string
  logo?: string
}

interface RewardsState {
  points: RewardsPoints | null
  boosts: Boost[]
  leaderboard: LeaderboardEntry[]
  history: Transaction[]
  charities: Charity[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchPoints: () => Promise<void>
  fetchBoosts: () => Promise<void>
  fetchLeaderboard: (params?: { limit?: number; period?: 'weekly' | 'monthly' | 'all_time' }) => Promise<void>
  fetchHistory: (params?: { page?: number; limit?: number }) => Promise<void>
  fetchCharities: () => Promise<void>
  activateBoost: (boostId: string) => Promise<void>
  deactivateBoost: (boostId: string) => Promise<void>
  donatePoints: (amount: number, charityId?: string) => Promise<void>
  redeemPoints: (amount: number, rewardId: string) => Promise<void>
  updatePoints: (points: Partial<RewardsPoints>) => void
  clearError: () => void
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  points: null,
  boosts: [],
  leaderboard: [],
  history: [],
  charities: [],
  isLoading: false,
  error: null,

  fetchPoints: async () => {
    set({ isLoading: true, error: null })
    try {
      const points = await rewardsApi.getPoints()
      set({ points, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch points'
      set({ error: message, isLoading: false })
    }
  },

  fetchBoosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const boosts = await rewardsApi.getBoosts()
      set({ boosts, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch boosts'
      set({ error: message, isLoading: false })
    }
  },

  fetchLeaderboard: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const leaderboard = await rewardsApi.getLeaderboard(params)
      set({ leaderboard, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard'
      set({ error: message, isLoading: false })
    }
  },

  fetchHistory: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const history = await rewardsApi.getRewardsHistory(params)
      set({ history, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch history'
      set({ error: message, isLoading: false })
    }
  },

  fetchCharities: async () => {
    set({ isLoading: true, error: null })
    try {
      const charities = await rewardsApi.getCharities()
      set({ charities, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch charities'
      set({ error: message, isLoading: false })
    }
  },

  activateBoost: async (boostId: string) => {
    set({ isLoading: true, error: null })
    try {
      const updatedBoost = await rewardsApi.activateBoost(boostId)
      set({
        boosts: get().boosts.map((b) => (b.id === boostId ? updatedBoost : b)),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate boost'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  deactivateBoost: async (boostId: string) => {
    set({ isLoading: true, error: null })
    try {
      await rewardsApi.deactivateBoost(boostId)
      set({
        boosts: get().boosts.map((b) =>
          b.id === boostId ? { ...b, isActive: false } : b
        ),
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to deactivate boost'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  donatePoints: async (amount: number, charityId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await rewardsApi.donatePoints(amount, charityId)
      const currentPoints = get().points
      if (currentPoints) {
        set({
          points: {
            ...currentPoints,
            available: result.remaining,
          },
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to donate points'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  redeemPoints: async (amount: number, rewardId: string) => {
    set({ isLoading: true, error: null })
    try {
      const transaction = await rewardsApi.redeemPoints(amount, rewardId)
      const currentPoints = get().points
      if (currentPoints) {
        set({
          points: {
            ...currentPoints,
            available: currentPoints.available - amount,
          },
          history: [transaction, ...get().history],
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to redeem points'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  updatePoints: (pointsUpdate: Partial<RewardsPoints>) => {
    const currentPoints = get().points
    if (currentPoints) {
      set({
        points: { ...currentPoints, ...pointsUpdate },
      })
    }
  },

  clearError: () => set({ error: null }),
}))
