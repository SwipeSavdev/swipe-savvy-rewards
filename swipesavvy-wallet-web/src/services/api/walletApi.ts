import { api } from './apiClient'
import type { Account, WalletBalance, PaymentMethod, Transaction } from '../../types/api'

export const walletApi = {
  /**
   * Get all user accounts
   */
  getAccounts: async (): Promise<Account[]> => {
    try {
      const response = await api.get<Account[]>('/api/v1/accounts')
      return Array.isArray(response) ? response : []
    } catch {
      return []
    }
  },

  /**
   * Get specific account balance
   */
  getAccountBalance: async (accountId: string): Promise<{ balance: number }> => {
    return api.get<{ balance: number }>(`/api/v1/accounts/${accountId}/balance`)
  },

  /**
   * Get wallet balance (available + pending)
   */
  getWalletBalance: async (): Promise<WalletBalance> => {
    try {
      return await api.get<WalletBalance>('/api/v1/wallet/balance')
    } catch {
      return { available: 0, pending: 0, currency: 'USD' }
    }
  },

  /**
   * Get wallet transactions
   */
  getWalletTransactions: async (params?: {
    limit?: number
    offset?: number
  }): Promise<Transaction[]> => {
    try {
      const searchParams = new URLSearchParams()
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.offset) searchParams.set('offset', params.offset.toString())

      const query = searchParams.toString()
      const response = await api.get<Transaction[]>(`/api/v1/wallet/transactions${query ? `?${query}` : ''}`)
      return Array.isArray(response) ? response : []
    } catch {
      return []
    }
  },

  /**
   * Get payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await api.get<PaymentMethod[]>('/api/v1/wallet/payment-methods')
      return Array.isArray(response) ? response : []
    } catch {
      return []
    }
  },

  /**
   * Add money to wallet
   */
  addMoney: async (amount: number, paymentMethodId: string): Promise<Transaction> => {
    return api.post<Transaction>('/api/v1/wallet/add-money', {
      amount,
      paymentMethodId,
    })
  },

  /**
   * Withdraw money from wallet
   */
  withdraw: async (amount: number, paymentMethodId: string): Promise<Transaction> => {
    return api.post<Transaction>('/api/v1/wallet/withdraw', {
      amount,
      paymentMethodId,
    })
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    return api.put('/api/v1/wallet/payment-methods/default', { paymentMethodId })
  },

  /**
   * Remove payment method
   */
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    return api.delete(`/api/v1/wallet/payment-methods/${paymentMethodId}`)
  },
}
