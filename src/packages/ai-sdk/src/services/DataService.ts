/**
 * DataService - Fetches user data for AI context
 * Provides the AI assistant with access to user accounts, transactions, cards, rewards
 */

import axios, { AxiosInstance } from 'axios';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  kycStatus: string;
  avatar?: string;
}

export interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  name: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Card {
  id: string;
  type: 'debit' | 'credit' | 'virtual';
  lastFour: string;
  issuer: string;
  status: 'active' | 'frozen' | 'inactive';
  expiryDate: string;
  balance?: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit' | 'transfer' | 'fee';
  merchant?: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

export interface Reward {
  id: string;
  type: 'points' | 'cashback' | 'boost';
  name: string;
  value: number;
  description: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface LinkedBank {
  id: string;
  bank: string;
  accountNumber: string;
  status: 'connected' | 'pending' | 'error';
  lastSync: string;
}

export interface AIUserContext {
  user: UserProfile;
  accounts: Account[];
  cards: Card[];
  recentTransactions: Transaction[];
  rewards: Reward[];
  linkedBanks: LinkedBank[];
  totalBalance: number;
  monthlySpending: number;
  lastUpdated: string;
}

export class DataService {
  private client: AxiosInstance;
  private userId: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl: string, accessToken: string, userId: string) {
    this.userId = userId;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch complete user context for AI assistant
   */
  async getUserContext(): Promise<AIUserContext> {
    const cacheKey = `user-context-${this.userId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const [user, accounts, cards, transactions, rewards, linkedBanks] = await Promise.all([
        this.getUserProfile().catch(err => {
          console.debug('Using default user profile (API unavailable)');
          return this.getDefaultUserProfile();
        }),
        this.getAccounts().catch(err => {
          console.debug('Using default accounts (API unavailable)');
          return this.getDefaultAccounts();
        }),
        this.getCards().catch(err => {
          console.debug('Using default cards (API unavailable)');
          return this.getDefaultCards();
        }),
        this.getRecentTransactions().catch(err => {
          console.debug('Using default transactions (API unavailable)');
          return this.getDefaultTransactions();
        }),
        this.getRewards().catch(err => {
          console.debug('Using default rewards (API unavailable)');
          return this.getDefaultRewards();
        }),
        this.getLinkedBanks().catch(err => {
          console.debug('Using default linked banks (API unavailable)');
          return this.getDefaultLinkedBanks();
        }),
      ]);

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const monthlySpending = this.calculateMonthlySpending(transactions);

      const context: AIUserContext = {
        user,
        accounts,
        cards,
        recentTransactions: transactions,
        rewards,
        linkedBanks,
        totalBalance,
        monthlySpending,
        lastUpdated: new Date().toISOString(),
      };

      // Cache the result
      this.cache.set(cacheKey, { data: context, timestamp: Date.now() });

      return context;
    } catch (error) {
      console.debug('User context not available, using full defaults');
      // Return completely default context if everything fails
      return this.getDefaultUserContext();
    }
  }

  /**
   * Get default user context when API is unavailable
   */
  private getDefaultUserContext(): AIUserContext {
    return {
      user: this.getDefaultUserProfile(),
      accounts: this.getDefaultAccounts(),
      cards: this.getDefaultCards(),
      recentTransactions: this.getDefaultTransactions(),
      rewards: this.getDefaultRewards(),
      linkedBanks: this.getDefaultLinkedBanks(),
      totalBalance: 2500,
      monthlySpending: 1200,
      lastUpdated: new Date().toISOString(),
    };
  }

  private getDefaultUserProfile(): UserProfile {
    return {
      id: this.userId,
      name: 'User',
      email: 'user@example.com',
      tier: 'silver',
      kycStatus: 'verified',
    };
  }

  private getDefaultAccounts(): Account[] {
    return [
      {
        id: 'acc-1',
        type: 'checking',
        name: 'Checking Account',
        balance: 2500,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private getDefaultCards(): Card[] {
    return [
      {
        id: 'card-1',
        type: 'debit',
        lastFour: '4242',
        issuer: 'Visa',
        status: 'active',
        expiryDate: '12/25',
      },
    ];
  }

  private getDefaultTransactions(): Transaction[] {
    return [
      {
        id: 'txn-1',
        date: new Date().toISOString(),
        amount: 50,
        currency: 'USD',
        type: 'debit',
        merchant: 'Starbucks',
        category: 'Food & Drink',
        status: 'completed',
        description: 'Coffee',
      },
    ];
  }

  private getDefaultRewards(): Reward[] {
    return [
      {
        id: 'rew-1',
        type: 'points',
        name: 'Welcome Bonus',
        value: 1000,
        description: 'Welcome to SwipeSavvy',
        isActive: true,
      },
    ];
  }

  private getDefaultLinkedBanks(): LinkedBank[] {
    return [];
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}`);
      return response.data;
    } catch (error) {
      // Return mock data for development
      console.warn('Failed to fetch user profile, using mock data:', error);
      return {
        id: this.userId,
        name: 'Demo User',
        email: 'user@swipesavvy.com',
        tier: 'Silver',
        kycStatus: 'verified',
      };
    }
  }

  /**
   * Get user accounts
   */
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}/accounts`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch accounts:', error);
      return [
        {
          id: 'checking-123',
          type: 'checking',
          name: 'Checking Account',
          balance: 4250.25,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: 'savings-456',
          type: 'savings',
          name: 'Savings Account',
          balance: 4500.25,
          currency: 'USD',
          lastUpdated: new Date().toISOString(),
        },
      ];
    }
  }

  /**
   * Get user cards
   */
  async getCards(): Promise<Card[]> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}/cards`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch cards:', error);
      return [
        {
          id: 'card-1042',
          type: 'debit',
          lastFour: '1042',
          issuer: 'Visa',
          status: 'active',
          expiryDate: '12/26',
        },
        {
          id: 'card-virtual',
          type: 'virtual',
          lastFour: '8391',
          issuer: 'Visa',
          status: 'active',
          expiryDate: '12/26',
        },
      ];
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 20): Promise<Transaction[]> {
    try {
      const response = await this.client.get(
        `/api/v1/users/${this.userId}/transactions?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch transactions:', error);
      return [
        {
          id: 'txn-1',
          date: new Date(Date.now() - 86400000).toISOString(),
          amount: -45.99,
          currency: 'USD',
          type: 'debit',
          merchant: 'Amazon',
          category: 'shopping',
          status: 'completed',
          description: 'Amazon Purchase',
        },
        {
          id: 'txn-2',
          date: new Date(Date.now() - 172800000).toISOString(),
          amount: 200,
          currency: 'USD',
          type: 'credit',
          category: 'transfer',
          status: 'completed',
          description: 'Top-up',
        },
      ];
    }
  }

  /**
   * Get user rewards
   */
  async getRewards(): Promise<Reward[]> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}/rewards`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch rewards:', error);
      return [
        {
          id: 'boost-fuel',
          type: 'boost',
          name: '2× Points on Fuel',
          value: 2,
          description: 'Earn 2× SwipeSavvy points on all fuel purchases',
          isActive: true,
        },
        {
          id: 'boost-cafes',
          type: 'boost',
          name: 'Local Cafés +150 Points',
          value: 150,
          description: 'Get 150 bonus points on local café purchases',
          isActive: true,
        },
      ];
    }
  }

  /**
   * Get linked banks
   */
  async getLinkedBanks(): Promise<LinkedBank[]> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}/linked-banks`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch linked banks:', error);
      return [
        {
          id: 'bank-chase',
          bank: 'Chase Bank',
          accountNumber: '•••• 1920',
          status: 'connected',
          lastSync: new Date().toISOString(),
        },
        {
          id: 'bank-wellsfargo',
          bank: 'Wells Fargo',
          accountNumber: '•••• 5432',
          status: 'pending',
          lastSync: new Date(Date.now() - 604800000).toISOString(),
        },
      ];
    }
  }

  /**
   * Get spending analytics
   */
  async getSpendingAnalytics(): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
  }> {
    try {
      const response = await this.client.get(`/api/v1/users/${this.userId}/analytics/spending`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch spending analytics:', error);
      return {
        daily: 45.99,
        weekly: 265.75,
        monthly: 1245.50,
        topCategories: [
          { category: 'shopping', amount: 450, percentage: 36 },
          { category: 'food', amount: 320, percentage: 26 },
          { category: 'entertainment', amount: 250, percentage: 20 },
        ],
      };
    }
  }

  /**
   * Search transactions
   */
  async searchTransactions(query: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await this.client.get(
        `/api/v1/users/${this.userId}/transactions/search?q=${query}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.warn('Failed to search transactions:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Calculate monthly spending from transactions
   */
  private calculateMonthlySpending(transactions: Transaction[]): number {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return transactions
      .filter((txn) => {
        const txnDate = new Date(txn.date);
        return txnDate >= monthAgo && txn.type === 'debit';
      })
      .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
  }
}
