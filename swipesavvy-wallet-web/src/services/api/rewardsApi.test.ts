import { describe, it, expect, beforeEach } from 'vitest'
import { rewardsApi } from './rewardsApi'
import { setToken, clearTokens } from './apiClient'

describe('rewardsApi', () => {
  beforeEach(() => {
    clearTokens()
    setToken('mock-jwt-token')
  })

  describe('getPoints', () => {
    it('should fetch rewards points', async () => {
      const points = await rewardsApi.getPoints()

      expect(points.available).toBe(5250)
      expect(points.donated).toBe(500)
      expect(points.tier).toBe('silver')
      expect(points.tierProgress).toBe(65)
    })
  })

  describe('getBoosts', () => {
    it('should fetch available boosts', async () => {
      const boosts = await rewardsApi.getBoosts()

      expect(Array.isArray(boosts)).toBe(true)
      expect(boosts.length).toBe(2)
      expect(boosts[0].title).toBeDefined()
      expect(boosts[0].percent).toBeDefined()
    })
  })

  describe('activateBoost', () => {
    it('should activate a boost', async () => {
      const boost = await rewardsApi.activateBoost('boost-1')

      expect(boost.active).toBe(true)
    })
  })

  describe('getLeaderboard', () => {
    it('should fetch leaderboard', async () => {
      const leaderboard = await rewardsApi.getLeaderboard({ period: 'weekly', limit: 10 })

      expect(Array.isArray(leaderboard)).toBe(true)
      expect(leaderboard.length).toBeGreaterThan(0)
      expect(leaderboard[0].rank).toBe(1)
      expect(leaderboard[0].points).toBeDefined()
    })

    it('should identify current user in leaderboard', async () => {
      const leaderboard = await rewardsApi.getLeaderboard()

      const currentUser = leaderboard.find(e => e.isCurrentUser)
      expect(currentUser).toBeDefined()
      expect(currentUser?.userId).toBe('user-123')
    })
  })

  describe('donatePoints', () => {
    it('should donate points successfully', async () => {
      const result = await rewardsApi.donatePoints(100)

      expect(result.donated).toBe(100)
      expect(result.remaining).toBeDefined()
    })

    it('should donate to specific charity', async () => {
      const result = await rewardsApi.donatePoints(100, 'charity-1')

      expect(result.donated).toBe(100)
    })
  })

  describe('getCharities', () => {
    it('should fetch available charities', async () => {
      const charities = await rewardsApi.getCharities()

      expect(Array.isArray(charities)).toBe(true)
      expect(charities.length).toBeGreaterThan(0)
      expect(charities[0].name).toBeDefined()
      expect(charities[0].description).toBeDefined()
    })
  })
})
