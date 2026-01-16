import { api } from './apiClient'
import type { RewardsPoints, Boost, LeaderboardEntry, Transaction, RewardTier } from '../../types/api'

// Tier thresholds for calculating nextTierAt
const TIER_THRESHOLDS: Record<RewardTier, number> = {
  bronze: 5000,
  silver: 15000,
  gold: 50000,
}

// Backend may return tier in different cases - normalize to lowercase
interface BackendRewardsPoints {
  available: number
  donated: number
  tier: string
  tierProgress: number
  nextTierAt?: number
}

function normalizeRewardsPoints(points: BackendRewardsPoints): RewardsPoints {
  const tier = points.tier.toLowerCase() as RewardTier
  const nextTierAt = points.nextTierAt || TIER_THRESHOLDS[tier] || 15000
  return {
    available: points.available,
    donated: points.donated,
    tier,
    tierProgress: points.tierProgress,
    nextTierAt,
  }
}

export const rewardsApi = {
  /**
   * Get rewards points and tier info
   */
  getPoints: async (): Promise<RewardsPoints> => {
    const response = await api.get<BackendRewardsPoints>('/api/v1/rewards/points')
    return normalizeRewardsPoints(response)
  },

  /**
   * Get available boosts
   */
  getBoosts: async (): Promise<Boost[]> => {
    try {
      const response = await api.get<Boost[]>('/api/v1/rewards/boosts')
      // Ensure we return an array
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist or return non-array - return empty array
      return []
    }
  },

  /**
   * Activate a boost
   */
  activateBoost: async (boostId: string): Promise<Boost> => {
    return api.post<Boost>(`/api/v1/rewards/boosts/${boostId}/activate`)
  },

  /**
   * Deactivate a boost
   */
  deactivateBoost: async (boostId: string): Promise<void> => {
    return api.post(`/api/v1/rewards/boosts/${boostId}/deactivate`)
  },

  /**
   * Get community leaderboard
   */
  getLeaderboard: async (params?: {
    limit?: number
    period?: 'weekly' | 'monthly' | 'all_time'
  }): Promise<LeaderboardEntry[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.period) searchParams.set('period', params.period)

      const query = searchParams.toString()
      const response = await api.get<LeaderboardEntry[]>(
        `/api/v1/rewards/leaderboard${query ? `?${query}` : ''}`
      )
      // Ensure we return an array
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist or return non-array - return empty array
      return []
    }
  },

  /**
   * Donate points to charity
   */
  donatePoints: async (amount: number, charityId?: string): Promise<{
    donated: number
    remaining: number
  }> => {
    return api.post('/api/v1/rewards/donate', { amount, charityId })
  },

  /**
   * Redeem points for rewards
   */
  redeemPoints: async (amount: number, rewardId: string): Promise<Transaction> => {
    return api.post<Transaction>('/api/v1/rewards/redeem', { amount, rewardId })
  },

  /**
   * Get rewards history
   */
  getRewardsHistory: async (params?: {
    page?: number
    limit?: number
  }): Promise<Transaction[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())

      const query = searchParams.toString()
      const response = await api.get<Transaction[]>(
        `/api/v1/rewards/history${query ? `?${query}` : ''}`
      )
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get available charities for donation
   */
  getCharities: async (): Promise<{
    id: string
    name: string
    description: string
    logo?: string
  }[]> => {
    try {
      const response = await api.get('/api/v1/rewards/charities')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },
}
