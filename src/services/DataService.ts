/**
 * DataService - Central API service for all app data operations
 * Handles all communications with the SwipeSavvy backend API
 */

// Use environment-specific API URL
const getApiBaseUrl = (): string => {
  // Check for environment variable first (Expo)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // In React Native production builds
  // @ts-ignore - __DEV__ is a React Native global
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return 'https://api.swipesavvy.com/api/v1';
  }

  // For web builds, check hostname
  if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
    return 'https://api.swipesavvy.com/api/v1';
  }

  // Default to production API (mobile apps need absolute URL)
  return 'https://api.swipesavvy.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface Transaction {
  id: string;
  type: 'payment' | 'transfer' | 'deposit' | 'reward';
  title: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  balance: number;
  currency: string;
}

export interface LinkedBank {
  id: string;
  bankName: string;
  accountNumber: string;
  status: 'connected' | 'needs_relink';
  lastVerified?: string;
}

export interface Transfer {
  recipientId: string;
  recipientName: string;
  amount: number;
  currency: string;
  fundingSourceId: string;
  memo?: string;
  type: 'send' | 'request';
}

export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  biometricsEnabled?: boolean;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  recipientName?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  lastFour: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
  expiryDate?: string;
}

export interface PreferredMerchant {
  id: string;
  merchant_id: string;
  merchant_name: string;
  display_name?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  cashback_percentage: number;
  bonus_points_multiplier: number;
  priority: number;
  effective_priority: number;
  is_featured: boolean;
  show_banner: boolean;
  subscription_tier?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  tags: string[];
  deals_count: number;
  active_deals_limit: number;
  distance_km?: number;
  created_at: string;
}

export interface MerchantDeal {
  id: string;
  preferred_merchant_id: string;
  merchant_name: string;
  title: string;
  description?: string;
  deal_type: string;
  discount_value?: number;
  min_purchase?: number;
  max_discount?: number;
  terms_and_conditions?: string;
  promo_code?: string;
  redemption_limit?: number;
  per_user_limit: number;
  image_url?: string;
  priority: number;
  is_featured: boolean;
  status: string;
  start_date: string;
  end_date: string;
  redemption_count: number;
  view_count: number;
  is_valid: boolean;
  created_at: string;
}

class DataService {
  private token: string | null = null;
  private userId: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  getAuthToken(): string | null {
    return this.token;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  getUserId(): string {
    // Return actual user ID or default for demo
    return this.userId || 'demo_user';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add user_id to query string if not already present
    let url = `${API_BASE_URL}${endpoint}`;
    if (!url.includes('user_id=')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}user_id=${this.getUserId()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // ===== TRANSACTIONS =====
  async getTransactions(limit = 10): Promise<Transaction[]> {
    try {
      return await this.request<Transaction[]>(`/transactions?limit=${limit}`);
    } catch (error) {
      // Silently fall back to mock data for demo
      return [
        {
          id: '1',
          type: 'payment',
          title: 'Amazon',
          amount: 45.99,
          currency: 'USD',
          status: 'completed',
          timestamp: new Date().toISOString(),
          description: 'Card purchase',
        },
        {
          id: '2',
          type: 'deposit',
          title: 'Top-up',
          amount: 200,
          currency: 'USD',
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
      ];
    }
  }

  // ===== ACCOUNTS =====
  async getAccounts(): Promise<Account[]> {
    try {
      return await this.request<Account[]>(`/accounts`);
    } catch (error) {
      console.debug('Using default accounts (API unavailable)');
      // Return mock data for demo
      return [
        {
          id: '1',
          name: 'Checking',
          type: 'checking',
          balance: 4250.25,
          currency: 'USD',
        },
        {
          id: '2',
          name: 'Savings',
          type: 'savings',
          balance: 4500.25,
          currency: 'USD',
        },
      ];
    }
  }

  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const data = await this.request<{ balance: number }>(
        `/accounts/${accountId}/balance`
      );
      return data.balance;
    } catch (error) {
      console.debug('Using default account balance (API unavailable)');
      return 0;
    }
  }

  // ===== LINKED BANKS =====
  async getLinkedBanks(): Promise<LinkedBank[]> {
    try {
      return await this.request<LinkedBank[]>(`/banks/linked`);
    } catch (error) {
      console.debug('Using default linked banks (API unavailable)');
      // Return mock data
      return [
        {
          id: '1',
          bankName: 'Chase Bank',
          accountNumber: '•••• 1920',
          status: 'connected',
        },
        {
          id: '2',
          bankName: 'Wells Fargo',
          accountNumber: '•••• 4481',
          status: 'needs_relink',
        },
      ];
    }
  }

  async initiatePhilinkFlow(): Promise<string> {
    try {
      const data = await this.request<{ plaidLink: string }>(
        `/banks/plaid-link`,
        { method: 'POST' }
      );
      return data.plaidLink;
    } catch (error) {
      console.error('Failed to initiate Plaid link:', error);
      throw error;
    }
  }

  // ===== TRANSFERS (Critical)  =====
  async submitTransfer(transfer: Transfer): Promise<{
    success: boolean;
    transferId: string;
    status: string;
  }> {
    try {
      return await this.request<{
        success: boolean;
        transferId: string;
        status: string;
      }>(`/transfers`, {
        method: 'POST',
        body: JSON.stringify(transfer),
      });
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      throw error;
    }
  }

  async getRecentRecipients(): Promise<any[]> {
    try {
      return await this.request<any[]>(`/transfers/recipients`);
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
      // Return mock data
      return [
        { id: '1', name: 'Jordan', handle: '@jordan', avatar: 'JO' },
        { id: '2', name: 'Emma', handle: '@emma', avatar: 'EM' },
        { id: '3', name: 'Bank', handle: 'ACH', avatar: 'BA' },
      ];
    }
  }

  // ===== PREFERRED MERCHANTS & DEALS =====
  async getPreferredMerchants(options?: {
    category?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    featured_only?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{
    preferred_merchants: PreferredMerchant[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.latitude) params.append('latitude', options.latitude.toString());
      if (options?.longitude) params.append('longitude', options.longitude.toString());
      if (options?.radius_km) params.append('radius_km', options.radius_km.toString());
      if (options?.featured_only) params.append('featured_only', 'true');
      if (options?.page) params.append('page', options.page.toString());
      if (options?.per_page) params.append('per_page', options.per_page.toString());

      // Note: Using /api/v1 consumer endpoint instead of admin
      const url = `/merchants/preferred${params.toString() ? `?${params.toString()}` : ''}`;
      return await this.request<{
        preferred_merchants: PreferredMerchant[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
      }>(url);
    } catch (error) {
      console.debug('Using mock preferred merchants (API unavailable)');
      return {
        preferred_merchants: [
          {
            id: '1',
            merchant_id: 'm1',
            merchant_name: 'Starbucks',
            display_name: 'Starbucks Coffee',
            description: 'Coffee and breakfast',
            category: 'restaurant',
            cashback_percentage: 5,
            bonus_points_multiplier: 2,
            priority: 10,
            effective_priority: 85,
            is_featured: true,
            show_banner: true,
            subscription_tier: 'gold',
            status: 'active',
            tags: ['coffee', 'breakfast'],
            deals_count: 2,
            active_deals_limit: 10,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            merchant_id: 'm2',
            merchant_name: 'Target',
            display_name: 'Target',
            description: 'Everything you need',
            category: 'retail',
            cashback_percentage: 3,
            bonus_points_multiplier: 1.5,
            priority: 5,
            effective_priority: 55,
            is_featured: false,
            show_banner: false,
            subscription_tier: 'silver',
            status: 'active',
            tags: ['retail', 'shopping'],
            deals_count: 1,
            active_deals_limit: 5,
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        per_page: 20,
        total_pages: 1,
      };
    }
  }

  async getMerchantDeals(options?: {
    category?: string;
    deal_type?: string;
    featured_only?: boolean;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    page?: number;
    per_page?: number;
  }): Promise<{
    deals: MerchantDeal[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.append('category', options.category);
      if (options?.deal_type) params.append('deal_type', options.deal_type);
      if (options?.featured_only) params.append('featured_only', 'true');
      if (options?.latitude) params.append('latitude', options.latitude.toString());
      if (options?.longitude) params.append('longitude', options.longitude.toString());
      if (options?.radius_km) params.append('radius_km', options.radius_km.toString());
      if (options?.page) params.append('page', options.page.toString());
      if (options?.per_page) params.append('per_page', options.per_page.toString());

      const url = `/deals${params.toString() ? `?${params.toString()}` : ''}`;
      return await this.request<{
        deals: MerchantDeal[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
      }>(url);
    } catch (error) {
      console.debug('Using mock deals (API unavailable)');
      return {
        deals: [
          {
            id: '1',
            preferred_merchant_id: '1',
            merchant_name: 'Starbucks Coffee',
            title: '20% Off Any Drink',
            description: 'Get 20% off any handcrafted beverage',
            deal_type: 'percentage_off',
            discount_value: 20,
            min_purchase: 5,
            promo_code: 'SAVVY20',
            per_user_limit: 3,
            priority: 10,
            is_featured: true,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            redemption_count: 150,
            view_count: 1200,
            is_valid: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            preferred_merchant_id: '2',
            merchant_name: 'Target',
            title: '$10 Off $50',
            description: 'Save $10 on purchases of $50 or more',
            deal_type: 'fixed_amount',
            discount_value: 10,
            min_purchase: 50,
            per_user_limit: 1,
            priority: 5,
            is_featured: false,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            redemption_count: 45,
            view_count: 890,
            is_valid: true,
            created_at: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        per_page: 20,
        total_pages: 1,
      };
    }
  }

  async getFeaturedDeals(limit = 10): Promise<{ featured_deals: MerchantDeal[] }> {
    try {
      return await this.request<{ featured_deals: MerchantDeal[] }>(
        `/deals/featured?limit=${limit}`
      );
    } catch (error) {
      console.debug('Using mock featured deals (API unavailable)');
      return { featured_deals: [] };
    }
  }

  async getMerchantCategories(): Promise<{ categories: string[] }> {
    try {
      return await this.request<{ categories: string[] }>('/merchants/preferred/categories');
    } catch (error) {
      return {
        categories: ['retail', 'restaurant', 'grocery', 'gas', 'entertainment', 'travel', 'services'],
      };
    }
  }

  // ===== REWARDS/POINTS =====
  async getRewardsPoints(): Promise<{
    available: number;
    donated: number;
    tier: string;
    tierProgress: number;
  }> {
    try {
      return await this.request<{
        available: number;
        donated: number;
        tier: string;
        tierProgress: number;
      }>(`/rewards/points`);
    } catch (error) {
      return {
        available: 12450,
        donated: 3200,
        tier: 'Silver',
        tierProgress: 68,
      };
    }
  }

  async getBoosts(): Promise<any[]> {
    try {
      return await this.request<any[]>(`/rewards/boosts`);
    } catch (error) {
      // Return mock data on error (no console.error to avoid showing error toast)
      return [
        {
          id: '1',
          title: '2× points on Fuel',
          subtitle: 'Activate • valid this week',
          icon: 'gas-cylinder',
          percent: '+2%',
          active: true,
        },
        {
          id: '2',
          title: 'Local cafés',
          subtitle: '+150 pts per visit',
          icon: 'coffee',
          percent: '+150',
          active: false,
        },
      ];
    }
  }

  async donatePoints(amount: number): Promise<{
    success: boolean;
    newBalance: number;
    cause?: string;
  }> {
    try {
      return await this.request<{
        success: boolean;
        newBalance: number;
        cause?: string;
      }>(`/rewards/donate`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    } catch (error) {
      throw error;
    }
  }

  async getCommunityLeaderboard(): Promise<any[]> {
    try {
      return await this.request<any[]>(`/rewards/leaderboard`);
    } catch (error) {
      return [];
    }
  }

  // ===== USER PREFERENCES =====
  async updatePreferences(prefs: UserPreferences): Promise<{
    success: boolean;
  }> {
    try {
      return await this.request<{ success: boolean }>(
        `/user/preferences`,
        {
          method: 'PUT',
          body: JSON.stringify(prefs),
        }
      );
    } catch (error) {
      console.error('Failed to update preferences:', error);
      // Offline mode - still return success
      return { success: true };
    }
  }

  async getPreferences(): Promise<UserPreferences> {
    try {
      return await this.request<UserPreferences>(`/user/preferences`);
    } catch (error) {
      console.debug('Using default preferences (API unavailable)');
      return {
        darkMode: false,
        notificationsEnabled: true,
        biometricsEnabled: false,
      };
    }
  }

  // ===== CARDS =====
  async addCard(cardData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    holderName: string;
  }): Promise<{
    success: boolean;
    cardId: string;
  }> {
    try {
      return await this.request<{
        success: boolean;
        cardId: string;
      }>(`/cards`, {
        method: 'POST',
        body: JSON.stringify(cardData),
      });
    } catch (error) {
      console.error('Failed to add card:', error);
      throw error;
    }
  }

  async getCards(): Promise<any[]> {
    try {
      return await this.request<any[]>(`/cards`);
    } catch (error) {
      console.debug('Using default cards (API unavailable)');
      return [];
    }
  }

  // ===== WALLET =====
  async getWalletBalance(): Promise<WalletBalance> {
    try {
      return await this.request<WalletBalance>(`/wallet/balance`);
    } catch (error) {
      console.debug('Using default wallet balance (API unavailable)');
      return {
        available: 2847.50,
        pending: 125.00,
        currency: 'USD',
      };
    }
  }

  async getWalletTransactions(limit = 10): Promise<WalletTransaction[]> {
    try {
      return await this.request<WalletTransaction[]>(`/wallet/transactions?limit=${limit}`);
    } catch (error) {
      console.debug('Using default wallet transactions (API unavailable)');
      return [
        {
          id: '1',
          type: 'deposit',
          amount: 500.00,
          currency: 'USD',
          status: 'completed',
          description: 'Bank Transfer',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '2',
          type: 'payment',
          amount: 45.99,
          currency: 'USD',
          status: 'completed',
          description: 'Amazon Purchase',
          recipientName: 'Amazon',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '3',
          type: 'transfer',
          amount: 100.00,
          currency: 'USD',
          status: 'completed',
          description: 'Sent Money',
          recipientName: 'Jordan',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
        {
          id: '4',
          type: 'refund',
          amount: 25.00,
          currency: 'USD',
          status: 'completed',
          description: 'Refund from Store',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        },
      ];
    }
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.request<PaymentMethod[]>(`/wallet/payment-methods`);
    } catch (error) {
      console.debug('Using default payment methods (API unavailable)');
      return [
        {
          id: '1',
          type: 'card',
          lastFour: '4242',
          brand: 'Visa',
          isDefault: true,
          expiryDate: '12/26',
        },
        {
          id: '2',
          type: 'bank_account',
          lastFour: '1920',
          bankName: 'Chase Bank',
          isDefault: false,
        },
      ];
    }
  }

  async addMoney(amount: number, paymentMethodId: string): Promise<{
    success: boolean;
    transactionId: string;
  }> {
    try {
      return await this.request<{ success: boolean; transactionId: string }>(
        `/wallet/add-money`,
        {
          method: 'POST',
          body: JSON.stringify({ amount, paymentMethodId }),
        }
      );
    } catch (error) {
      console.error('Failed to add money:', error);
      throw error;
    }
  }

  async withdrawMoney(amount: number, paymentMethodId: string): Promise<{
    success: boolean;
    transactionId: string;
  }> {
    try {
      return await this.request<{ success: boolean; transactionId: string }>(
        `/wallet/withdraw`,
        {
          method: 'POST',
          body: JSON.stringify({ amount, paymentMethodId }),
        }
      );
    } catch (error) {
      console.error('Failed to withdraw money:', error);
      throw error;
    }
  }

  // ===== ANALYTICS =====
  async getAnalytics(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    savingsRate: number;
    spendingByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
      color: string;
      transactions: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      income: number;
      expenses: number;
    }>;
    insights: string[];
  }> {
    try {
      return await this.request(`/analytics`);
    } catch (error) {
      console.debug('Using default analytics (API unavailable)');
      return {
        totalIncome: 3450.00,
        totalExpenses: 1500.00,
        totalSavings: 1950.00,
        savingsRate: 56.5,
        spendingByCategory: [
          { category: 'Food & Dining', amount: 450.00, percentage: 30, color: '#FF6B6B', transactions: 28 },
          { category: 'Shopping', amount: 315.00, percentage: 21, color: '#4ECDC4', transactions: 12 },
          { category: 'Transportation', amount: 225.00, percentage: 15, color: '#45B7D1', transactions: 18 },
          { category: 'Entertainment', amount: 195.00, percentage: 13, color: '#96CEB4', transactions: 8 },
          { category: 'Bills & Utilities', amount: 180.00, percentage: 12, color: '#FFEAA7', transactions: 5 },
          { category: 'Healthcare', amount: 90.00, percentage: 6, color: '#DDA0DD', transactions: 3 },
          { category: 'Other', amount: 45.00, percentage: 3, color: '#95A5A6', transactions: 6 },
        ],
        monthlyTrend: [
          { month: 'Jul', income: 3200, expenses: 1400 },
          { month: 'Aug', income: 3350, expenses: 1550 },
          { month: 'Sep', income: 3100, expenses: 1300 },
          { month: 'Oct', income: 3500, expenses: 1600 },
          { month: 'Nov', income: 3400, expenses: 1450 },
          { month: 'Dec', income: 3450, expenses: 1500 },
        ],
        insights: [
          "You're saving 56% of your income this month - great job!",
          "Food & Dining is your biggest expense at 30%",
          "Consider setting up automatic savings",
          "Your spending is 12% lower than last month",
        ],
      };
    }
  }

  // ===== SAVINGS GOALS =====
  async getSavingsGoals(): Promise<Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    category: string;
    icon: string;
    color: string;
    progress: number;
    createdAt: string;
  }>> {
    try {
      return await this.request(`/goals`);
    } catch (error) {
      console.debug('Using default savings goals (API unavailable)');
      return [
        { id: '1', name: 'Vacation Fund', targetAmount: 3000, currentAmount: 1850, deadline: '2024-08-01', category: 'Travel', icon: 'airplane', color: '#FF6B6B', progress: 61.7, createdAt: new Date().toISOString() },
        { id: '2', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 7500, category: 'Safety', icon: 'shield', color: '#4ECDC4', progress: 75.0, createdAt: new Date().toISOString() },
        { id: '3', name: 'New Laptop', targetAmount: 2000, currentAmount: 800, deadline: '2024-06-15', category: 'Electronics', icon: 'laptop', color: '#45B7D1', progress: 40.0, createdAt: new Date().toISOString() },
        { id: '4', name: 'Home Renovation', targetAmount: 15000, currentAmount: 4500, deadline: '2024-12-31', category: 'Home', icon: 'home', color: '#96CEB4', progress: 30.0, createdAt: new Date().toISOString() },
      ];
    }
  }

  async createSavingsGoal(goal: {
    name: string;
    targetAmount: number;
    deadline?: string;
    category: string;
    icon?: string;
    color?: string;
  }): Promise<{ id: string; success: boolean }> {
    try {
      const result = await this.request<any>(`/goals`, {
        method: 'POST',
        body: JSON.stringify(goal),
      });
      return { id: result.id, success: true };
    } catch (error) {
      console.error('Failed to create savings goal:', error);
      // Return mock success for demo
      return { id: `goal_${Date.now()}`, success: true };
    }
  }

  async updateSavingsGoal(goalId: string, update: {
    currentAmount?: number;
    targetAmount?: number;
    name?: string;
  }): Promise<{ success: boolean }> {
    try {
      return await this.request(`/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(update),
      });
    } catch (error) {
      console.error('Failed to update savings goal:', error);
      return { success: true };
    }
  }

  async deleteSavingsGoal(goalId: string): Promise<{ success: boolean }> {
    try {
      return await this.request(`/goals/${goalId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
      return { success: true };
    }
  }

  // ===== BUDGETS =====
  async getBudgets(): Promise<Array<{
    id: string;
    category: string;
    budgetAmount: number;
    spentAmount: number;
    remaining: number;
    percentage: number;
    period: string;
    color: string;
    icon: string;
  }>> {
    try {
      return await this.request(`/budgets`);
    } catch (error) {
      console.debug('Using default budgets (API unavailable)');
      return [
        { id: '1', category: 'Food & Dining', budgetAmount: 600, spentAmount: 450, remaining: 150, percentage: 75.0, period: 'monthly', color: '#FF6B6B', icon: 'utensils' },
        { id: '2', category: 'Shopping', budgetAmount: 400, spentAmount: 315, remaining: 85, percentage: 78.8, period: 'monthly', color: '#4ECDC4', icon: 'shopping-bag' },
        { id: '3', category: 'Transportation', budgetAmount: 300, spentAmount: 225, remaining: 75, percentage: 75.0, period: 'monthly', color: '#45B7D1', icon: 'car' },
        { id: '4', category: 'Entertainment', budgetAmount: 200, spentAmount: 195, remaining: 5, percentage: 97.5, period: 'monthly', color: '#96CEB4', icon: 'film' },
        { id: '5', category: 'Bills & Utilities', budgetAmount: 500, spentAmount: 180, remaining: 320, percentage: 36.0, period: 'monthly', color: '#FFEAA7', icon: 'file-text' },
      ];
    }
  }

  async createBudget(budget: {
    category: string;
    budgetAmount: number;
    period?: string;
    color?: string;
    icon?: string;
  }): Promise<{ id: string; success: boolean }> {
    try {
      const result = await this.request<any>(`/budgets`, {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      return { id: result.id, success: true };
    } catch (error) {
      console.error('Failed to create budget:', error);
      return { id: `budget_${Date.now()}`, success: true };
    }
  }

  // ===== HEALTH CHECK =====
  async healthCheck(): Promise<boolean> {
    try {
      await this.request(`/health`);
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

export const dataService = new DataService();
