/**
 * Marketing API Service
 * 
 * Provides integration between mobile app and Marketing AI backend
 * Handles campaign fetching, user segmentation, and conversion tracking
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Campaign {
  campaign_id: number;
  campaign_name: string;
  campaign_type: string;
  description: string;
  offer_type: string;
  offer_value: number;
  offer_unit: string;
  target_pattern: string;
  target_location?: string;
  status: string;
  created_at: string;
  duration_days: number;
}

interface UserSegment {
  pattern: string;
  size: number;
  total_spending: number;
  avg_spending: number;
  avg_transactions: number;
  percentage: number;
}

interface SegmentDetails {
  pattern: string;
  segment_size: number;
  user_ids: string[];
  metrics: {
    total_spending: number;
    avg_spending: number;
    avg_transactions: number;
    total_transactions: number;
  };
  top_categories: Array<{ category: string; count: number }>;
  top_locations: Array<{ location: string; count: number }>;
}

interface MarketingAnalytics {
  summary: {
    active_campaigns: number;
    total_targets: number;
    converted_users: number;
    conversion_rate: number;
  };
  campaign_types: Array<{ campaign_type: string; count: number }>;
  top_campaigns: Array<any>;
}

interface MarketingStatus {
  service_status: string;
  last_analysis: string;
  campaigns: {
    active: number;
    expired: number;
    paused: number;
  };
}

class MarketingAPIService {
  private apiClient: AxiosInstance;
  private baseURL: string;
  private cacheExpiry: number = 15 * 60 * 1000; // 15 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private offlineQueue: any[] = [];
  private userId?: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add interceptors
    this.apiClient.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );

    this.loadUserContext();
  }

  /**
   * Set current user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Load cached user context from device storage
   */
  private async loadUserContext() {
    try {
      const userId = await AsyncStorage.getItem('marketingUserId');
      if (userId) {
        this.userId = userId;
      }
    } catch (error) {
      console.warn('Error loading user context:', error);
    }
  }

  /**
   * Fetch active campaigns for current user
   */
  async getActiveCampaigns(limit: number = 5): Promise<Campaign[]> {
    try {
      const cacheKey = `campaigns_active_${limit}`;
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)?.data || [];
      }

      const response = await this.apiClient.get('/api/marketing/campaigns', {
        params: {
          status: 'active',
          limit,
          offset: 0
        }
      });

      const campaigns = response.data.campaigns || [];
      this.setCacheValue(cacheKey, campaigns);
      
      return campaigns;
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      return this.getOfflineData('campaigns') || [];
    }
  }

  /**
   * Fetch all campaigns with filters
   */
  async getCampaigns(
    status?: string,
    campaignType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    try {
      const response = await this.apiClient.get('/api/marketing/campaigns', {
        params: {
          status,
          campaign_type: campaignType,
          limit,
          offset
        }
      });

      return {
        campaigns: response.data.campaigns,
        total: response.data.total
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { campaigns: [], total: 0 };
    }
  }

  /**
   * Get detailed campaign information
   */
  async getCampaignDetails(campaignId: number): Promise<Campaign | null> {
    try {
      const cacheKey = `campaign_${campaignId}`;
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)?.data || null;
      }

      const response = await this.apiClient.get(`/api/marketing/campaigns/${campaignId}`);
      
      if (response.data.campaign) {
        this.setCacheValue(cacheKey, response.data.campaign);
        return response.data.campaign;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      return null;
    }
  }

  /**
   * Fetch user segments based on behavior
   */
  async getUserSegments(minSize: number = 0, limit: number = 50): Promise<UserSegment[]> {
    try {
      const cacheKey = `segments_${minSize}_${limit}`;
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)?.data || [];
      }

      const response = await this.apiClient.get('/api/marketing/segments', {
        params: {
          min_size: minSize,
          limit
        }
      });

      const segments = response.data.segments || [];
      this.setCacheValue(cacheKey, segments);
      
      return segments;
    } catch (error) {
      console.error('Error fetching user segments:', error);
      return [];
    }
  }

  /**
   * Get detailed segment information including top users
   */
  async getSegmentDetails(pattern: string): Promise<SegmentDetails | null> {
    try {
      const cacheKey = `segment_${pattern}`;
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)?.data || null;
      }

      const response = await this.apiClient.get(`/api/marketing/segments/${pattern}`);
      
      if (response.data) {
        this.setCacheValue(cacheKey, response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching segment details:', error);
      return null;
    }
  }

  /**
   * Get marketing analytics
   */
  async getAnalytics(): Promise<MarketingAnalytics | null> {
    try {
      const cacheKey = 'marketing_analytics';
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey)?.data || null;
      }

      const response = await this.apiClient.get('/api/marketing/analytics');
      
      if (response.data) {
        this.setCacheValue(cacheKey, response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  /**
   * Get marketing system status
   */
  async getSystemStatus(): Promise<MarketingStatus | null> {
    try {
      const response = await this.apiClient.get('/api/marketing/status');
      return response.data || null;
    } catch (error) {
      console.error('Error fetching system status:', error);
      return null;
    }
  }

  /**
   * Record campaign view
   */
  async recordCampaignView(campaignId: number): Promise<boolean> {
    try {
      if (!this.userId) {
        console.warn('User ID not set for tracking');
        return false;
      }

      const payload = {
        campaign_id: campaignId,
        user_id: this.userId,
        action: 'view',
        timestamp: new Date().toISOString()
      };

      if (!this.isOnline()) {
        this.offlineQueue.push(payload);
        await this.saveOfflineQueue();
        return true;
      }

      await this.apiClient.post(
        `/api/marketing/campaigns/${campaignId}/view`,
        payload
      );

      return true;
    } catch (error) {
      console.error('Error recording campaign view:', error);
      return false;
    }
  }

  /**
   * Record campaign conversion (purchase)
   */
  async recordCampaignConversion(
    campaignId: number,
    amount: number,
    items?: any[]
  ): Promise<boolean> {
    try {
      if (!this.userId) {
        console.warn('User ID not set for tracking');
        return false;
      }

      const payload = {
        campaign_id: campaignId,
        user_id: this.userId,
        action: 'conversion',
        amount,
        items,
        timestamp: new Date().toISOString()
      };

      if (!this.isOnline()) {
        this.offlineQueue.push(payload);
        await this.saveOfflineQueue();
        return true;
      }

      await this.apiClient.post(
        `/api/marketing/campaigns/${campaignId}/convert`,
        payload
      );

      return true;
    } catch (error) {
      console.error('Error recording campaign conversion:', error);
      return false;
    }
  }

  /**
   * Create manual campaign (admin only)
   */
  async createCampaign(campaignData: {
    name: string;
    type: string;
    description: string;
    offer_type: string;
    offer_value: number;
    offer_unit: string;
    criteria?: any;
  }): Promise<number | null> {
    try {
      const response = await this.apiClient.post(
        '/api/marketing/campaigns/manual',
        campaignData
      );

      if (response.data.campaign_id) {
        this.clearCache();
        return response.data.campaign_id;
      }

      return null;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return null;
    }
  }

  /**
   * Trigger marketing analysis immediately
   */
  async triggerAnalysis(): Promise<any> {
    try {
      const response = await this.apiClient.post('/api/marketing/analysis/run-now');
      this.clearCache();
      return response.data;
    } catch (error) {
      console.error('Error triggering analysis:', error);
      return null;
    }
  }

  /**
   * Sync offline queue when connection is restored
   */
  async syncOfflineQueue(): Promise<boolean> {
    try {
      if (this.offlineQueue.length === 0) {
        return true;
      }

      for (const item of this.offlineQueue) {
        if (item.action === 'view') {
          await this.recordCampaignView(item.campaign_id);
        } else if (item.action === 'conversion') {
          await this.recordCampaignConversion(
            item.campaign_id,
            item.amount,
            item.items
          );
        }
      }

      this.offlineQueue = [];
      await this.saveOfflineQueue();
      
      return true;
    } catch (error) {
      console.error('Error syncing offline queue:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Refresh campaign cache
   */
  async refreshCampaigns(): Promise<Campaign[]> {
    this.clearCacheKey('campaigns_active_5');
    return this.getActiveCampaigns();
  }

  /**
   * Get recommended campaigns for current user
   */
  async getRecommendedCampaigns(): Promise<Campaign[]> {
    try {
      const campaigns = await this.getActiveCampaigns(3);
      return campaigns.slice(0, 3);
    } catch (error) {
      console.error('Error getting recommended campaigns:', error);
      return [];
    }
  }

  /**
   * Check if user is eligible for campaign
   */
  async isEligibleForCampaign(campaignId: number): Promise<boolean> {
    try {
      if (!this.userId) return false;

      const campaign = await this.getCampaignDetails(campaignId);
      if (!campaign) return false;

      // Implement eligibility logic based on campaign criteria
      // This is a simplified version - expand based on needs
      return campaign.status === 'active';
    } catch (error) {
      console.error('Error checking campaign eligibility:', error);
      return false;
    }
  }

  // ==================== PRIVATE METHODS ====================

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isValid = Date.now() - cached.timestamp < this.cacheExpiry;
    if (!isValid) {
      this.cache.delete(key);
    }

    return isValid;
  }

  private setCacheValue(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private handleError(error: any): Promise<never> {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }

  private isOnline(): boolean {
    // Implement actual network status check
    // This is a placeholder
    return true;
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'marketingOfflineQueue',
        JSON.stringify(this.offlineQueue)
      );
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async getOfflineData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(`marketing_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const marketingAPI = new MarketingAPIService();

// Export types
export type {
  Campaign,
  UserSegment,
  SegmentDetails,
  MarketingAnalytics,
  MarketingStatus
};
