import { describe, it, expect, beforeEach } from 'vitest'
import { authApi } from './authApi'
import { getToken, clearTokens } from './apiClient'

describe('authApi', () => {
  beforeEach(() => {
    clearTokens()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result.user).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
      expect(result.token).toBe('mock-jwt-token')
      expect(getToken()).toBe('mock-jwt-token')
    })

    it('should throw error for invalid credentials', async () => {
      await expect(
        authApi.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow()
    })

    it('should store token in localStorage after successful login', async () => {
      await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(localStorage.getItem('wallet_auth_token')).toBe('mock-jwt-token')
    })
  })

  describe('logout', () => {
    it('should clear tokens on logout', async () => {
      await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(getToken()).toBe('mock-jwt-token')

      authApi.logout()
      expect(getToken()).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      // Login first to set token
      await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      })

      const user = await authApi.getCurrentUser()
      expect(user.id).toBe('user-123')
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
    })
  })
})
