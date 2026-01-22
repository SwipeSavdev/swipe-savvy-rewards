/**
 * FIS Global Payment One - Card Management Service
 *
 * Handles all FIS card operations for the SwipeSavvy mobile app:
 * - Card issuance (virtual/physical)
 * - Card controls (lock, limits, channels)
 * - PIN management
 * - Transactions
 * - Digital wallet provisioning
 * - Fraud alerts
 */

import { dataService } from './DataService';

// =============================================================================
// TYPES
// =============================================================================

export interface FISCard {
  id: string;
  fisCardId: string;
  cardType: 'virtual' | 'physical';
  status: 'pending' | 'active' | 'locked' | 'frozen' | 'cancelled' | 'expired';
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  cardNetwork: 'visa' | 'mastercard';
  nickname?: string;
  isPrimary: boolean;
  pinSet: boolean;
  pinLocked: boolean;
  createdAt: string;
  activatedAt?: string;
  // Shipping for physical cards
  shippingStatus?: 'processing' | 'shipped' | 'in_transit' | 'delivered';
  trackingNumber?: string;
  shippingCarrier?: string;
}

export interface FISCardControls {
  cardId: string;
  // Spending limits
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;
  // Channel controls
  atmEnabled: boolean;
  posEnabled: boolean;
  ecommerceEnabled: boolean;
  contactlessEnabled: boolean;
  internationalEnabled: boolean;
  // Merchant controls
  blockedMccCodes: string[];
  allowedMccCodes?: string[];
  // Geographic controls
  allowedCountries: string[];
  blockedCountries: string[];
  // Alert preferences
  alertOnTransaction: boolean;
  alertOnDecline: boolean;
  alertOnInternational: boolean;
  alertThreshold?: number;
}

export interface FISTransaction {
  id: string;
  cardId: string;
  transactionType: 'purchase' | 'refund' | 'atm_withdrawal' | 'atm_deposit' | 'transfer' | 'fee';
  status: 'pending' | 'posted' | 'declined' | 'reversed' | 'disputed';
  amount: number;
  currency: string;
  merchantName?: string;
  merchantId?: string;
  mccCode?: string;
  mccDescription?: string;
  category?: string;
  channel: 'pos' | 'atm' | 'ecommerce' | 'contactless' | 'mobile';
  merchantCity?: string;
  merchantState?: string;
  merchantCountry?: string;
  isInternational: boolean;
  rewardsEarned?: number;
  notes?: string;
  timestamp: string;
  postedAt?: string;
}

export interface FISAlert {
  id: string;
  cardId: string;
  alertType: 'large_transaction' | 'international_transaction' | 'declined_transaction' | 'suspicious_activity' | 'pin_attempt_failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  amount?: number;
  merchantName?: string;
  createdAt: string;
}

export interface FISWalletToken {
  id: string;
  cardId: string;
  walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
  status: 'requested' | 'active' | 'suspended' | 'deleted';
  deviceId: string;
  deviceType: 'phone' | 'watch' | 'tablet';
  deviceName?: string;
  tokenSuffix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface TravelNotice {
  id: string;
  cardId: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  notes?: string;
  createdAt: string;
}

export interface IssueVirtualCardRequest {
  cardholderName: string;
  nickname?: string;
  setAsPrimary?: boolean;
}

export interface IssuePhysicalCardRequest {
  cardholderName: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  expedited?: boolean;
  nickname?: string;
  setAsPrimary?: boolean;
}

export interface SpendingLimits {
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;
}

export interface ChannelControls {
  atmEnabled?: boolean;
  posEnabled?: boolean;
  ecommerceEnabled?: boolean;
  contactlessEnabled?: boolean;
  internationalEnabled?: boolean;
}

// =============================================================================
// FIS CARD SERVICE
// =============================================================================

const API_BASE = 'https://api.swipesavvy.com/api/v1';

class FISCardService {
  private getHeaders(): HeadersInit {
    const token = dataService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }

      return data.data || data;
    } catch (error) {
      console.error(`FIS API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ===========================================================================
  // CARD ISSUANCE & LIFECYCLE
  // ===========================================================================

  /**
   * Get all FIS cards for the current user
   */
  async getCards(): Promise<FISCard[]> {
    return this.request<FISCard[]>('/cards');
  }

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<FISCard> {
    return this.request<FISCard>(`/cards/${cardId}`);
  }

  /**
   * Issue a new virtual card (instant)
   */
  async issueVirtualCard(request: IssueVirtualCardRequest): Promise<FISCard> {
    return this.request<FISCard>('/cards/issue/virtual', {
      method: 'POST',
      body: JSON.stringify({
        cardholder_name: request.cardholderName,
        nickname: request.nickname,
        set_as_primary: request.setAsPrimary || false,
      }),
    });
  }

  /**
   * Order a physical card (shipped)
   */
  async issuePhysicalCard(request: IssuePhysicalCardRequest): Promise<FISCard> {
    return this.request<FISCard>('/cards/issue/physical', {
      method: 'POST',
      body: JSON.stringify({
        cardholder_name: request.cardholderName,
        shipping_address: request.shippingAddress,
        expedited: request.expedited || false,
        nickname: request.nickname,
        set_as_primary: request.setAsPrimary || false,
      }),
    });
  }

  /**
   * Activate a card
   */
  async activateCard(cardId: string, lastFour: string, activationCode?: string): Promise<void> {
    await this.request(`/cards/${cardId}/activate`, {
      method: 'POST',
      body: JSON.stringify({
        last_four: lastFour,
        activation_code: activationCode,
      }),
    });
  }

  /**
   * Replace a card (lost, stolen, damaged)
   */
  async replaceCard(
    cardId: string,
    reason: 'lost' | 'stolen' | 'damaged' | 'expired',
    shippingAddress?: IssuePhysicalCardRequest['shippingAddress'],
    expedited?: boolean
  ): Promise<FISCard> {
    return this.request<FISCard>(`/cards/${cardId}/replace`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
        shipping_address: shippingAddress,
        expedited: expedited || false,
      }),
    });
  }

  /**
   * Cancel a card permanently
   */
  async cancelCard(cardId: string, reason: string): Promise<void> {
    await this.request(`/cards/${cardId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Get shipping status for a physical card
   */
  async getShippingStatus(cardId: string): Promise<{
    status: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }> {
    return this.request(`/cards/${cardId}/shipping`);
  }

  /**
   * Get sensitive card data (PAN, CVV) - requires PIN verification
   */
  async getSensitiveData(
    cardId: string,
    includePan?: boolean,
    includeCvv?: boolean
  ): Promise<{ pan?: string; cvv?: string; expiry?: string }> {
    const params = new URLSearchParams();
    if (includePan) params.append('include_pan', 'true');
    if (includeCvv) params.append('include_cvv', 'true');

    return this.request(`/cards/${cardId}/sensitive?${params.toString()}`);
  }

  // ===========================================================================
  // CARD CONTROLS
  // ===========================================================================

  /**
   * Lock a card temporarily
   */
  async lockCard(cardId: string, reason?: string): Promise<void> {
    await this.request(`/cards/${cardId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Unlock a card
   */
  async unlockCard(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/unlock`, {
      method: 'POST',
    });
  }

  /**
   * Freeze a card (for suspected fraud)
   */
  async freezeCard(cardId: string, reason?: string): Promise<void> {
    await this.request(`/cards/${cardId}/freeze`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Unfreeze a card
   */
  async unfreezeCard(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/unfreeze`, {
      method: 'POST',
    });
  }

  /**
   * Get all card controls
   */
  async getCardControls(cardId: string): Promise<FISCardControls> {
    return this.request<FISCardControls>(`/cards/${cardId}/controls`);
  }

  /**
   * Set spending limits
   */
  async setSpendingLimits(cardId: string, limits: SpendingLimits): Promise<void> {
    await this.request(`/cards/${cardId}/limits`, {
      method: 'PUT',
      body: JSON.stringify({
        daily_limit: limits.dailyLimit,
        weekly_limit: limits.weeklyLimit,
        monthly_limit: limits.monthlyLimit,
        per_transaction_limit: limits.perTransactionLimit,
      }),
    });
  }

  /**
   * Get spending limits
   */
  async getSpendingLimits(cardId: string): Promise<SpendingLimits> {
    return this.request<SpendingLimits>(`/cards/${cardId}/limits`);
  }

  /**
   * Remove all spending limits
   */
  async removeSpendingLimits(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/limits`, {
      method: 'DELETE',
    });
  }

  /**
   * Set channel controls (ATM, POS, eCommerce, etc.)
   */
  async setChannelControls(cardId: string, controls: ChannelControls): Promise<void> {
    await this.request(`/cards/${cardId}/controls/channels`, {
      method: 'PUT',
      body: JSON.stringify({
        atm_enabled: controls.atmEnabled,
        pos_enabled: controls.posEnabled,
        ecommerce_enabled: controls.ecommerceEnabled,
        contactless_enabled: controls.contactlessEnabled,
        international_enabled: controls.internationalEnabled,
      }),
    });
  }

  /**
   * Enable international transactions
   */
  async enableInternational(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/international/enable`, {
      method: 'POST',
    });
  }

  /**
   * Disable international transactions
   */
  async disableInternational(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/international/disable`, {
      method: 'POST',
    });
  }

  /**
   * Block a merchant category
   */
  async blockMerchantCategory(cardId: string, category: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/merchants/block`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  }

  /**
   * Unblock a merchant category
   */
  async unblockMerchantCategory(cardId: string, category: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/merchants/unblock`, {
      method: 'POST',
      body: JSON.stringify({ category }),
    });
  }

  /**
   * Block a country
   */
  async blockCountry(cardId: string, countryCode: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/geo/block`, {
      method: 'POST',
      body: JSON.stringify({ country_code: countryCode }),
    });
  }

  /**
   * Unblock a country
   */
  async unblockCountry(cardId: string, countryCode: string): Promise<void> {
    await this.request(`/cards/${cardId}/controls/geo/unblock`, {
      method: 'POST',
      body: JSON.stringify({ country_code: countryCode }),
    });
  }

  // ===========================================================================
  // PIN MANAGEMENT
  // ===========================================================================

  /**
   * Set initial PIN
   */
  async setPin(cardId: string, pin: string): Promise<void> {
    await this.request(`/cards/${cardId}/pin/set`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
  }

  /**
   * Change existing PIN
   */
  async changePin(cardId: string, currentPin: string, newPin: string): Promise<void> {
    await this.request(`/cards/${cardId}/pin/change`, {
      method: 'PUT',
      body: JSON.stringify({
        current_pin: currentPin,
        new_pin: newPin,
      }),
    });
  }

  /**
   * Get PIN status
   */
  async getPinStatus(cardId: string): Promise<{
    pinSet: boolean;
    pinLocked: boolean;
    failedAttempts: number;
  }> {
    return this.request(`/cards/${cardId}/pin/status`);
  }

  /**
   * Request OTP for PIN reset
   */
  async requestPinResetOtp(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/pin/reset/otp`, {
      method: 'POST',
    });
  }

  /**
   * Reset PIN with OTP verification
   */
  async resetPin(cardId: string, otp: string, newPin: string): Promise<void> {
    await this.request(`/cards/${cardId}/pin/reset`, {
      method: 'POST',
      body: JSON.stringify({
        verification_method: 'otp',
        verification_data: { otp_code: otp },
        new_pin: newPin,
      }),
    });
  }

  /**
   * Unlock PIN after failed attempts
   */
  async unlockPin(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/pin/unlock`, {
      method: 'POST',
    });
  }

  // ===========================================================================
  // TRANSACTIONS
  // ===========================================================================

  /**
   * Get transactions for a card
   */
  async getTransactions(
    cardId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      minAmount?: number;
      maxAmount?: number;
      transactionType?: string;
      status?: string;
      merchantName?: string;
      category?: string;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{ transactions: FISTransaction[]; total: number; page: number }> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.minAmount) params.append('min_amount', options.minAmount.toString());
    if (options?.maxAmount) params.append('max_amount', options.maxAmount.toString());
    if (options?.transactionType) params.append('transaction_type', options.transactionType);
    if (options?.status) params.append('status', options.status);
    if (options?.merchantName) params.append('merchant_name', options.merchantName);
    if (options?.category) params.append('category', options.category);
    if (options?.page) params.append('page', options.page.toString());
    if (options?.pageSize) params.append('page_size', options.pageSize.toString());

    return this.request(`/cards/${cardId}/transactions?${params.toString()}`);
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(cardId: string, limit: number = 10): Promise<FISTransaction[]> {
    return this.request(`/cards/${cardId}/transactions/recent?limit=${limit}`);
  }

  /**
   * Get pending transactions
   */
  async getPendingTransactions(cardId: string): Promise<FISTransaction[]> {
    return this.request(`/cards/${cardId}/transactions/pending`);
  }

  /**
   * Get transaction details
   */
  async getTransaction(cardId: string, transactionId: string): Promise<FISTransaction> {
    return this.request(`/cards/${cardId}/transactions/${transactionId}`);
  }

  /**
   * Get spending summary
   */
  async getSpendingSummary(
    cardId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalSpent: number;
    totalRefunds: number;
    transactionCount: number;
    averageTransaction: number;
  }> {
    return this.request(
      `/cards/${cardId}/transactions/summary?start_date=${startDate}&end_date=${endDate}`
    );
  }

  /**
   * Get spending by category
   */
  async getSpendingByCategory(
    cardId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ category: string; amount: number; count: number }>> {
    return this.request(
      `/cards/${cardId}/transactions/categories?start_date=${startDate}&end_date=${endDate}`
    );
  }

  /**
   * Initiate a dispute
   */
  async initiateDispute(
    cardId: string,
    transactionId: string,
    reason: string,
    description: string
  ): Promise<{ disputeId: string; status: string }> {
    return this.request(`/cards/${cardId}/transactions/${transactionId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  }

  // ===========================================================================
  // FRAUD & SECURITY
  // ===========================================================================

  /**
   * Get security alerts
   */
  async getAlerts(options?: {
    cardId?: string;
    status?: string;
    priority?: string;
  }): Promise<FISAlert[]> {
    const params = new URLSearchParams();
    if (options?.cardId) params.append('card_id', options.cardId);
    if (options?.status) params.append('status', options.status);
    if (options?.priority) params.append('priority', options.priority);

    return this.request(`/alerts?${params.toString()}`);
  }

  /**
   * Get unread alert count
   */
  async getUnreadAlertCount(cardId?: string): Promise<number> {
    const params = cardId ? `?card_id=${cardId}` : '';
    const data = await this.request<{ count: number }>(`/alerts/unread/count${params}`);
    return data.count;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.request(`/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    await this.request(`/alerts/${alertId}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolution, is_false_positive: false }),
    });
  }

  /**
   * Report fraud
   */
  async reportFraud(
    cardId: string,
    fraudType: string,
    description: string,
    transactionId?: string
  ): Promise<{ reportId: string }> {
    return this.request('/fraud/reports', {
      method: 'POST',
      body: JSON.stringify({
        card_id: cardId,
        fraud_type: fraudType,
        description,
        transaction_id: transactionId,
      }),
    });
  }

  /**
   * Set travel notice
   */
  async setTravelNotice(
    cardId: string,
    startDate: string,
    endDate: string,
    destinations: string[],
    notes?: string
  ): Promise<TravelNotice> {
    return this.request(`/cards/${cardId}/travel-notices`, {
      method: 'POST',
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        destinations,
        notes,
      }),
    });
  }

  /**
   * Get travel notices
   */
  async getTravelNotices(cardId: string): Promise<TravelNotice[]> {
    return this.request(`/cards/${cardId}/travel-notices`);
  }

  /**
   * Cancel travel notice
   */
  async cancelTravelNotice(cardId: string, noticeId: string): Promise<void> {
    await this.request(`/cards/${cardId}/travel-notices/${noticeId}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // DIGITAL WALLETS
  // ===========================================================================

  /**
   * Check Apple Pay eligibility
   */
  async checkApplePayEligibility(cardId: string): Promise<{ eligible: boolean; reason?: string }> {
    return this.request(`/cards/${cardId}/wallet/apple-pay/eligibility`);
  }

  /**
   * Check Google Pay eligibility
   */
  async checkGooglePayEligibility(cardId: string): Promise<{ eligible: boolean; reason?: string }> {
    return this.request(`/cards/${cardId}/wallet/google-pay/eligibility`);
  }

  /**
   * Get wallet tokens
   */
  async getWalletTokens(cardId: string): Promise<FISWalletToken[]> {
    return this.request(`/cards/${cardId}/wallet/tokens`);
  }

  /**
   * Suspend a wallet token
   */
  async suspendWalletToken(cardId: string, tokenId: string): Promise<void> {
    await this.request(`/cards/${cardId}/wallet/tokens/${tokenId}/suspend`, {
      method: 'POST',
    });
  }

  /**
   * Resume a wallet token
   */
  async resumeWalletToken(cardId: string, tokenId: string): Promise<void> {
    await this.request(`/cards/${cardId}/wallet/tokens/${tokenId}/resume`, {
      method: 'POST',
    });
  }

  /**
   * Delete a wallet token
   */
  async deleteWalletToken(cardId: string, tokenId: string): Promise<void> {
    await this.request(`/cards/${cardId}/wallet/tokens/${tokenId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Suspend all wallet tokens (for lost/stolen card)
   */
  async suspendAllWalletTokens(cardId: string): Promise<void> {
    await this.request(`/cards/${cardId}/wallet/tokens/suspend-all`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const fisCardService = new FISCardService();
export default fisCardService;
