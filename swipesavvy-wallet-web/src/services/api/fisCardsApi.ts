/**
 * FIS Cards API - FIS Global Payment One Integration
 *
 * This extends the base cardsApi with FIS-specific endpoints:
 * - Digital wallet provisioning (Apple Pay, Google Pay)
 * - Fraud reporting and alerts
 * - Travel notices
 * - Advanced card controls
 */

import { api } from './apiClient'

// =============================================================================
// TYPES
// =============================================================================

export interface FISCard {
  id: string
  userId: string
  cardType: 'virtual' | 'physical'
  cardNetwork: 'visa' | 'mastercard'
  status: 'pending' | 'active' | 'locked' | 'frozen' | 'cancelled' | 'expired'
  lastFour: string
  cardholderName: string
  expiryMonth: number
  expiryYear: number
  isPrimary: boolean
  nickname?: string
  pinSet: boolean
  pinLocked: boolean
  createdAt: string
  activatedAt?: string
}

export interface FISCardControls {
  atmEnabled: boolean
  posEnabled: boolean
  ecommerceEnabled: boolean
  contactlessEnabled: boolean
  internationalEnabled: boolean
  spendingLimits: SpendingLimits
  merchantControls: MerchantControls
  geoControls: GeoControls
}

export interface SpendingLimits {
  dailyLimit: number | null
  weeklyLimit: number | null
  monthlyLimit: number | null
  perTransactionLimit: number | null
}

export interface MerchantControls {
  blockedCategories: string[]
  allowedCategories: string[]
}

export interface GeoControls {
  blockedCountries: string[]
  allowedCountries: string[]
}

export interface FISTransaction {
  id: string
  cardId: string
  transactionType: 'purchase' | 'refund' | 'atm_withdrawal' | 'transfer' | 'fee'
  amount: number
  currency: string
  merchantName: string
  merchantCategory: string
  status: 'pending' | 'posted' | 'declined' | 'reversed'
  channel: 'pos' | 'atm' | 'ecommerce' | 'contactless'
  timestamp: string
  location?: {
    city: string
    state: string
    country: string
  }
}

export interface FISAlert {
  id: string
  cardId: string
  alertType: 'large_transaction' | 'international_transaction' | 'card_not_present' |
             'declined_transaction' | 'suspicious_activity' | 'multiple_declines' |
             'unusual_location' | 'pin_attempt_failed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'acknowledged' | 'resolved'
  title: string
  description: string
  transactionId?: string
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
}

export interface FISWalletToken {
  id: string
  cardId: string
  walletType: 'apple_pay' | 'google_pay' | 'samsung_pay'
  deviceName: string
  deviceType: string
  status: 'active' | 'suspended' | 'deleted'
  lastUsed?: string
  createdAt: string
}

export interface TravelNotice {
  id: string
  cardId: string
  destinations: string[]
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'cancelled'
  createdAt: string
}

export interface FraudReport {
  id: string
  cardId: string
  fraudType: 'unauthorized_transaction' | 'card_not_present' | 'counterfeit_card' |
             'lost_stolen' | 'account_takeover' | 'identity_theft'
  status: 'submitted' | 'investigating' | 'resolved' | 'rejected'
  description: string
  transactionId?: string
  createdAt: string
  resolvedAt?: string
}

export interface IssueVirtualCardRequest {
  cardholderName: string
  nickname?: string
  setAsPrimary?: boolean
}

export interface IssuePhysicalCardRequest {
  cardholderName: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  expedited?: boolean
  nickname?: string
  setAsPrimary?: boolean
}

// =============================================================================
// FIS CARDS API
// =============================================================================

export const fisCardsApi = {
  // ===========================================================================
  // CARD ISSUANCE & LIFECYCLE
  // ===========================================================================

  getCards: async (): Promise<FISCard[]> => {
    try {
      return await api.get<FISCard[]>('/api/v1/cards')
    } catch {
      return []
    }
  },

  getCard: async (cardId: string): Promise<FISCard> => {
    return api.get<FISCard>(`/api/v1/cards/${cardId}`)
  },

  getSensitiveData: async (cardId: string): Promise<{
    pan: string
    cvv: string
    expiryDate: string
  }> => {
    return api.get(`/api/v1/cards/${cardId}/sensitive`)
  },

  issueVirtualCard: async (request: IssueVirtualCardRequest): Promise<FISCard> => {
    return api.post<FISCard>('/api/v1/cards/issue/virtual', request)
  },

  issuePhysicalCard: async (request: IssuePhysicalCardRequest): Promise<FISCard> => {
    return api.post<FISCard>('/api/v1/cards/issue/physical', request)
  },

  activateCard: async (cardId: string, lastFour: string, activationCode?: string): Promise<FISCard> => {
    return api.post<FISCard>(`/api/v1/cards/${cardId}/activate`, {
      last_four: lastFour,
      activation_code: activationCode,
    })
  },

  replaceCard: async (cardId: string, reason: 'lost' | 'stolen' | 'damaged' | 'expired'): Promise<FISCard> => {
    return api.post<FISCard>(`/api/v1/cards/${cardId}/replace`, { reason })
  },

  cancelCard: async (cardId: string, reason: string): Promise<void> => {
    return api.delete(`/api/v1/cards/${cardId}?reason=${encodeURIComponent(reason)}`)
  },

  getShippingStatus: async (cardId: string): Promise<{
    status: string
    trackingNumber?: string
    estimatedDelivery?: string
    carrier?: string
  }> => {
    return api.get(`/api/v1/cards/${cardId}/shipping`)
  },

  // ===========================================================================
  // CARD CONTROLS
  // ===========================================================================

  lockCard: async (cardId: string, reason?: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/lock`, { reason })
  },

  unlockCard: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/unlock`)
  },

  freezeCard: async (cardId: string, reason?: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/freeze`, { reason })
  },

  unfreezeCard: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/unfreeze`)
  },

  getCardControls: async (cardId: string): Promise<FISCardControls> => {
    return api.get<FISCardControls>(`/api/v1/cards/${cardId}/controls`)
  },

  setSpendingLimits: async (cardId: string, limits: SpendingLimits): Promise<void> => {
    return api.put(`/api/v1/cards/${cardId}/limits`, limits)
  },

  removeSpendingLimits: async (cardId: string): Promise<void> => {
    return api.delete(`/api/v1/cards/${cardId}/limits`)
  },

  setChannelControls: async (cardId: string, controls: Partial<{
    atmEnabled: boolean
    posEnabled: boolean
    ecommerceEnabled: boolean
    contactlessEnabled: boolean
  }>): Promise<void> => {
    return api.put(`/api/v1/cards/${cardId}/controls/channels`, controls)
  },

  enableInternational: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/controls/international/enable`)
  },

  disableInternational: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/controls/international/disable`)
  },

  blockMerchantCategory: async (cardId: string, category: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/controls/merchants/block`, { category })
  },

  unblockMerchantCategory: async (cardId: string, category: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/controls/merchants/unblock`, { category })
  },

  setGeoControls: async (cardId: string, controls: GeoControls): Promise<void> => {
    return api.put(`/api/v1/cards/${cardId}/controls/geo`, controls)
  },

  // ===========================================================================
  // PIN MANAGEMENT
  // ===========================================================================

  setPin: async (cardId: string, pin: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/pin/set`, { pin })
  },

  changePin: async (cardId: string, currentPin: string, newPin: string): Promise<void> => {
    return api.put(`/api/v1/cards/${cardId}/pin/change`, {
      current_pin: currentPin,
      new_pin: newPin,
    })
  },

  resetPin: async (cardId: string, otp: string, newPin: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/pin/reset`, {
      otp,
      new_pin: newPin,
    })
  },

  requestPinResetOtp: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/pin/reset/otp`)
  },

  getPinStatus: async (cardId: string): Promise<{
    pinSet: boolean
    pinLocked: boolean
    failedAttempts: number
  }> => {
    return api.get(`/api/v1/cards/${cardId}/pin/status`)
  },

  unlockPin: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/pin/unlock`)
  },

  // ===========================================================================
  // TRANSACTIONS
  // ===========================================================================

  getTransactions: async (cardId: string, options?: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
    transactionType?: string
    status?: string
  }): Promise<{
    transactions: FISTransaction[]
    total: number
    page: number
    pageSize: number
  }> => {
    const params = new URLSearchParams()
    if (options?.page) params.set('page', options.page.toString())
    if (options?.pageSize) params.set('page_size', options.pageSize.toString())
    if (options?.startDate) params.set('start_date', options.startDate)
    if (options?.endDate) params.set('end_date', options.endDate)
    if (options?.transactionType) params.set('transaction_type', options.transactionType)
    if (options?.status) params.set('status', options.status)

    const query = params.toString()
    return api.get(`/api/v1/cards/${cardId}/transactions${query ? `?${query}` : ''}`)
  },

  getRecentTransactions: async (cardId: string, limit: number = 10): Promise<FISTransaction[]> => {
    return api.get<FISTransaction[]>(`/api/v1/cards/${cardId}/transactions/recent?limit=${limit}`)
  },

  getPendingTransactions: async (cardId: string): Promise<FISTransaction[]> => {
    return api.get<FISTransaction[]>(`/api/v1/cards/${cardId}/transactions/pending`)
  },

  getTransactionDetails: async (cardId: string, transactionId: string): Promise<FISTransaction> => {
    return api.get<FISTransaction>(`/api/v1/cards/${cardId}/transactions/${transactionId}`)
  },

  getSpendingSummary: async (cardId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<{
    totalSpent: number
    totalRefunded: number
    transactionCount: number
    averageTransaction: number
    largestTransaction: number
  }> => {
    return api.get(`/api/v1/cards/${cardId}/transactions/summary?period=${period}`)
  },

  getSpendingByCategory: async (cardId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<{
    category: string
    amount: number
    percentage: number
    transactionCount: number
  }[]> => {
    return api.get(`/api/v1/cards/${cardId}/transactions/categories?period=${period}`)
  },

  // ===========================================================================
  // DISPUTES
  // ===========================================================================

  initiateDispute: async (cardId: string, transactionId: string, reason: string, description: string): Promise<{
    disputeId: string
    status: string
  }> => {
    return api.post(`/api/v1/cards/${cardId}/transactions/${transactionId}/dispute`, {
      reason,
      description,
    })
  },

  getDisputes: async (cardId: string): Promise<{
    id: string
    transactionId: string
    reason: string
    status: string
    amount: number
    createdAt: string
  }[]> => {
    return api.get(`/api/v1/cards/${cardId}/disputes`)
  },

  getDisputeDetails: async (cardId: string, disputeId: string): Promise<{
    id: string
    transactionId: string
    reason: string
    description: string
    status: string
    amount: number
    resolution?: string
    createdAt: string
    resolvedAt?: string
  }> => {
    return api.get(`/api/v1/cards/${cardId}/disputes/${disputeId}`)
  },

  // ===========================================================================
  // FRAUD & ALERTS
  // ===========================================================================

  getAlerts: async (options?: {
    cardId?: string
    status?: 'new' | 'acknowledged' | 'resolved'
    severity?: 'low' | 'medium' | 'high' | 'critical'
  }): Promise<FISAlert[]> => {
    const params = new URLSearchParams()
    if (options?.cardId) params.set('card_id', options.cardId)
    if (options?.status) params.set('status', options.status)
    if (options?.severity) params.set('severity', options.severity)

    const query = params.toString()
    return api.get<FISAlert[]>(`/api/v1/alerts${query ? `?${query}` : ''}`)
  },

  getUnreadAlertCount: async (cardId?: string): Promise<number> => {
    const query = cardId ? `?card_id=${cardId}` : ''
    const response = await api.get<{ count: number }>(`/api/v1/alerts/unread/count${query}`)
    return response.count
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    return api.put(`/api/v1/alerts/${alertId}/acknowledge`)
  },

  resolveAlert: async (alertId: string, resolution: string): Promise<void> => {
    return api.put(`/api/v1/alerts/${alertId}/resolve`, { resolution })
  },

  reportFraud: async (cardId: string, fraudType: string, description: string, transactionId?: string): Promise<{
    reportId: string
  }> => {
    return api.post('/api/v1/fraud/reports', {
      card_id: cardId,
      fraud_type: fraudType,
      description,
      transaction_id: transactionId,
    })
  },

  getFraudReports: async (cardId?: string): Promise<FraudReport[]> => {
    const query = cardId ? `?card_id=${cardId}` : ''
    return api.get<FraudReport[]>(`/api/v1/fraud/reports${query}`)
  },

  getRiskScore: async (cardId: string): Promise<{
    score: number
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }> => {
    return api.get(`/api/v1/cards/${cardId}/risk-score`)
  },

  // ===========================================================================
  // TRAVEL NOTICES
  // ===========================================================================

  setTravelNotice: async (cardId: string, startDate: string, endDate: string, destinations: string[]): Promise<TravelNotice> => {
    return api.post<TravelNotice>(`/api/v1/cards/${cardId}/travel-notices`, {
      start_date: startDate,
      end_date: endDate,
      destinations,
    })
  },

  getTravelNotices: async (cardId: string): Promise<TravelNotice[]> => {
    return api.get<TravelNotice[]>(`/api/v1/cards/${cardId}/travel-notices`)
  },

  cancelTravelNotice: async (cardId: string, noticeId: string): Promise<void> => {
    return api.delete(`/api/v1/cards/${cardId}/travel-notices/${noticeId}`)
  },

  // ===========================================================================
  // DIGITAL WALLETS
  // ===========================================================================

  checkApplePayEligibility: async (cardId: string): Promise<{
    eligible: boolean
    reason?: string
  }> => {
    return api.get(`/api/v1/cards/${cardId}/wallet/apple-pay/eligibility`)
  },

  provisionApplePay: async (cardId: string, deviceId: string, certificates: string[]): Promise<{
    activationData: string
    encryptedPassData: string
    ephemeralPublicKey: string
  }> => {
    return api.post(`/api/v1/cards/${cardId}/wallet/apple-pay/provision`, {
      device_id: deviceId,
      certificates,
    })
  },

  checkGooglePayEligibility: async (cardId: string): Promise<{
    eligible: boolean
    reason?: string
  }> => {
    return api.get(`/api/v1/cards/${cardId}/wallet/google-pay/eligibility`)
  },

  provisionGooglePay: async (cardId: string, walletId: string): Promise<{
    opaquePaymentCard: string
  }> => {
    return api.post(`/api/v1/cards/${cardId}/wallet/google-pay/provision`, {
      wallet_id: walletId,
    })
  },

  getWalletTokens: async (cardId: string): Promise<FISWalletToken[]> => {
    return api.get<FISWalletToken[]>(`/api/v1/cards/${cardId}/wallet/tokens`)
  },

  suspendWalletToken: async (cardId: string, tokenId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/wallet/tokens/${tokenId}/suspend`)
  },

  resumeWalletToken: async (cardId: string, tokenId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/wallet/tokens/${tokenId}/resume`)
  },

  deleteWalletToken: async (cardId: string, tokenId: string): Promise<void> => {
    return api.delete(`/api/v1/cards/${cardId}/wallet/tokens/${tokenId}`)
  },

  suspendAllWalletTokens: async (cardId: string): Promise<void> => {
    return api.post(`/api/v1/cards/${cardId}/wallet/tokens/suspend-all`)
  },

  // ===========================================================================
  // ALERT PREFERENCES
  // ===========================================================================

  getAlertPreferences: async (cardId: string): Promise<{
    largeTransactionThreshold: number
    declineAlerts: boolean
    internationalAlerts: boolean
    onlineTransactionAlerts: boolean
    atmAlerts: boolean
    emailEnabled: boolean
    pushEnabled: boolean
    smsEnabled: boolean
  }> => {
    return api.get(`/api/v1/cards/${cardId}/alerts/preferences`)
  },

  setAlertPreferences: async (cardId: string, preferences: {
    largeTransactionThreshold?: number
    declineAlerts?: boolean
    internationalAlerts?: boolean
    onlineTransactionAlerts?: boolean
    atmAlerts?: boolean
    emailEnabled?: boolean
    pushEnabled?: boolean
    smsEnabled?: boolean
  }): Promise<void> => {
    return api.put(`/api/v1/cards/${cardId}/alerts/preferences`, preferences)
  },
}

export default fisCardsApi
