/**
 * DataService - Central API service for all app data operations
 * Handles all communications with backend at port 8002
 */

const API_BASE_URL = 'http://localhost:8002/api';

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

class DataService {
  private token: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
      console.error('Failed to fetch accounts:', error);
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
      console.error('Failed to fetch account balance:', error);
      return 0;
    }
  }

  // ===== LINKED BANKS =====
  async getLinkedBanks(): Promise<LinkedBank[]> {
    try {
      return await this.request<LinkedBank[]>(`/banks/linked`);
    } catch (error) {
      console.error('Failed to fetch linked banks:', error);
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
      console.error('Failed to fetch preferences:', error);
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
      console.error('Failed to fetch cards:', error);
      return [];
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
