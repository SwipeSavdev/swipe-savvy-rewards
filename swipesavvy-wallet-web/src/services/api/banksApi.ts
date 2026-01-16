import { api } from './apiClient'
import type { LinkedBank } from '../../types/api'

export interface PlaidLinkToken {
  linkToken: string
  expiration: string
}

export interface PlaidPublicToken {
  publicToken: string
  metadata: {
    institution: {
      name: string
      institutionId: string
    }
    accounts: {
      id: string
      name: string
      mask: string
      type: string
      subtype: string
    }[]
  }
}

export interface BankVerificationStatus {
  bankId: string
  status: 'pending' | 'verified' | 'failed'
  method: 'instant' | 'micro_deposits'
  microDepositsExpireAt?: string
}

export const banksApi = {
  /**
   * Get all linked banks
   */
  getLinkedBanks: async (): Promise<LinkedBank[]> => {
    try {
      const response = await api.get<LinkedBank[]>('/api/v1/banks')
      return Array.isArray(response) ? response : []
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get a single linked bank
   */
  getLinkedBank: async (bankId: string): Promise<LinkedBank> => {
    return api.get<LinkedBank>(`/api/v1/banks/${bankId}`)
  },

  /**
   * Get Plaid Link token for connecting a new bank
   */
  getPlaidLinkToken: async (): Promise<PlaidLinkToken> => {
    return api.post<PlaidLinkToken>('/api/v1/banks/plaid/link-token')
  },

  /**
   * Exchange Plaid public token for access token and link bank
   */
  exchangePlaidToken: async (publicToken: string, metadata: PlaidPublicToken['metadata']): Promise<LinkedBank> => {
    return api.post<LinkedBank>('/api/v1/banks/plaid/exchange', {
      publicToken,
      metadata,
    })
  },

  /**
   * Manually add a bank account (for micro-deposit verification)
   */
  addBankManually: async (bankDetails: {
    routingNumber: string
    accountNumber: string
    accountType: 'checking' | 'savings'
    accountHolderName: string
    bankName?: string
  }): Promise<LinkedBank> => {
    return api.post<LinkedBank>('/api/v1/banks/manual', bankDetails)
  },

  /**
   * Verify bank with micro-deposits
   */
  verifyMicroDeposits: async (bankId: string, amounts: [number, number]): Promise<LinkedBank> => {
    return api.post<LinkedBank>(`/api/v1/banks/${bankId}/verify`, { amounts })
  },

  /**
   * Get verification status for a bank
   */
  getVerificationStatus: async (bankId: string): Promise<BankVerificationStatus> => {
    return api.get<BankVerificationStatus>(`/api/v1/banks/${bankId}/verification-status`)
  },

  /**
   * Set a bank as primary for transfers
   */
  setPrimary: async (bankId: string): Promise<LinkedBank> => {
    return api.post<LinkedBank>(`/api/v1/banks/${bankId}/set-primary`)
  },

  /**
   * Remove a linked bank
   */
  removeBank: async (bankId: string): Promise<void> => {
    return api.delete(`/api/v1/banks/${bankId}`)
  },

  /**
   * Refresh bank account data (balance, transactions)
   */
  refreshBank: async (bankId: string): Promise<LinkedBank> => {
    return api.post<LinkedBank>(`/api/v1/banks/${bankId}/refresh`)
  },

  /**
   * Re-authenticate a bank (when connection expires)
   */
  reauthenticate: async (bankId: string): Promise<PlaidLinkToken> => {
    return api.post<PlaidLinkToken>(`/api/v1/banks/${bankId}/reauth`)
  },

  /**
   * Get bank account balance
   */
  getBalance: async (bankId: string): Promise<{
    available: number
    current: number
    limit?: number
    lastUpdated: string
  }> => {
    return api.get(`/api/v1/banks/${bankId}/balance`)
  },
}
