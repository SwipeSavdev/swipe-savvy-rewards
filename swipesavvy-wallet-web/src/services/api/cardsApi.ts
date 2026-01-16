import { api } from './apiClient'
import type { Card } from '../../types/api'

export interface CardDetails extends Card {
  cardNumber: string // Full card number (only returned for virtual cards or with additional auth)
  cvv: string
  expirationDate: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface CardSpendingLimits {
  daily: number | null
  weekly: number | null
  monthly: number | null
  perTransaction: number | null
}

export interface CardSettings {
  internationalTransactions: boolean
  onlineTransactions: boolean
  atmWithdrawals: boolean
  contactlessPayments: boolean
  spendingLimits: CardSpendingLimits
}

export const cardsApi = {
  /**
   * Get all cards
   */
  getCards: async (): Promise<Card[]> => {
    try {
      return await api.get<Card[]>('/api/v1/cards')
    } catch {
      // Endpoint may not exist - return empty array
      return []
    }
  },

  /**
   * Get a single card by ID
   */
  getCard: async (cardId: string): Promise<Card> => {
    return api.get<Card>(`/api/v1/cards/${cardId}`)
  },

  /**
   * Get full card details (requires additional verification)
   */
  getCardDetails: async (cardId: string): Promise<CardDetails> => {
    return api.get<CardDetails>(`/api/v1/cards/${cardId}/details`)
  },

  /**
   * Lock a card (temporary freeze)
   */
  lockCard: async (cardId: string): Promise<Card> => {
    return api.post<Card>(`/api/v1/cards/${cardId}/lock`)
  },

  /**
   * Unlock a card
   */
  unlockCard: async (cardId: string): Promise<Card> => {
    return api.post<Card>(`/api/v1/cards/${cardId}/unlock`)
  },

  /**
   * Freeze a card (permanent until unfrozen, blocks all transactions)
   */
  freezeCard: async (cardId: string, reason?: string): Promise<Card> => {
    return api.post<Card>(`/api/v1/cards/${cardId}/freeze`, { reason })
  },

  /**
   * Unfreeze a card
   */
  unfreezeCard: async (cardId: string): Promise<Card> => {
    return api.post<Card>(`/api/v1/cards/${cardId}/unfreeze`)
  },

  /**
   * Report card as lost or stolen
   */
  reportLostStolen: async (cardId: string, type: 'lost' | 'stolen'): Promise<{
    card: Card
    replacementRequested: boolean
  }> => {
    return api.post(`/api/v1/cards/${cardId}/report`, { type })
  },

  /**
   * Request a replacement card
   */
  requestReplacement: async (cardId: string, options?: {
    expedited?: boolean
    newAddress?: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }): Promise<{
    newCardId: string
    estimatedDelivery: string
    trackingNumber?: string
  }> => {
    return api.post(`/api/v1/cards/${cardId}/replace`, options)
  },

  /**
   * Update card settings
   */
  updateSettings: async (cardId: string, settings: Partial<CardSettings>): Promise<Card> => {
    return api.put<Card>(`/api/v1/cards/${cardId}/settings`, settings)
  },

  /**
   * Get card settings
   */
  getSettings: async (cardId: string): Promise<CardSettings> => {
    return api.get<CardSettings>(`/api/v1/cards/${cardId}/settings`)
  },

  /**
   * Update card PIN
   */
  updatePin: async (cardId: string, newPin: string): Promise<{ success: boolean }> => {
    return api.post(`/api/v1/cards/${cardId}/pin`, { pin: newPin })
  },

  /**
   * Activate a new card
   */
  activateCard: async (cardId: string, last4Digits: string): Promise<Card> => {
    return api.post<Card>(`/api/v1/cards/${cardId}/activate`, { last4: last4Digits })
  },

  /**
   * Request a new virtual card
   */
  createVirtualCard: async (options?: {
    nickname?: string
    spendingLimits?: CardSpendingLimits
  }): Promise<Card> => {
    return api.post<Card>('/api/v1/cards/virtual', options)
  },

  /**
   * Get card transactions
   */
  getCardTransactions: async (cardId: string, params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<{
    id: string
    amount: number
    merchant: string
    category: string
    status: string
    createdAt: string
  }[]> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.startDate) searchParams.set('start_date', params.startDate)
    if (params?.endDate) searchParams.set('end_date', params.endDate)

    const query = searchParams.toString()
    return api.get(`/api/v1/cards/${cardId}/transactions${query ? `?${query}` : ''}`)
  },
}
