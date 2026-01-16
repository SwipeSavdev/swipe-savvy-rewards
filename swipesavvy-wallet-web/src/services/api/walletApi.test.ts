import { describe, it, expect, beforeEach } from 'vitest'
import { walletApi } from './walletApi'
import { setToken, clearTokens } from './apiClient'

describe('walletApi', () => {
  beforeEach(() => {
    clearTokens()
    setToken('mock-jwt-token')
  })

  describe('getAccounts', () => {
    it('should fetch user accounts', async () => {
      const accounts = await walletApi.getAccounts()

      expect(accounts).toHaveLength(2)
      expect(accounts[0].name).toBe('Main Checking')
      expect(accounts[0].balance).toBe(5000)
      expect(accounts[1].name).toBe('Savings')
    })
  })

  describe('getWalletBalance', () => {
    it('should fetch wallet balance', async () => {
      const balance = await walletApi.getWalletBalance()

      expect(balance.available).toBe(1500.50)
      expect(balance.pending).toBe(125.00)
      expect(balance.currency).toBe('USD')
    })
  })

  describe('getWalletTransactions', () => {
    it('should fetch wallet transactions', async () => {
      const transactions = await walletApi.getWalletTransactions()

      // Returns paginated response, data contains array
      expect(transactions).toBeDefined()
    })

    it('should support pagination parameters', async () => {
      const transactions = await walletApi.getWalletTransactions({ limit: 10, offset: 0 })

      expect(transactions).toBeDefined()
    })
  })

  describe('getPaymentMethods', () => {
    it('should fetch payment methods', async () => {
      const methods = await walletApi.getPaymentMethods()

      expect(methods).toHaveLength(2)
      expect(methods[0].type).toBe('card')
      expect(methods[0].isDefault).toBe(true)
    })
  })
})
