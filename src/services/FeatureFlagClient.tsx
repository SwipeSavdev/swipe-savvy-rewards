/**
 * Feature Flag Client Service
 * Mobile app integration with backend feature flag system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeatureFlagCheckResponse {
  flag_key: string;
  enabled: boolean;
  variant: string;
  rollout_percentage: number;
}

interface FeatureFlagConfig {
  [key: string]: boolean;
}

export class FeatureFlagClient {
  private static instance: FeatureFlagClient;
  private flags: FeatureFlagConfig = {};
  private cacheKey = '@feature_flags_cache';
  private cacheTimestampKey = '@feature_flags_cache_timestamp';
  private cacheTTL = 300000; // 5 minutes in milliseconds
  private apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  private constructor() {}

  static getInstance(): FeatureFlagClient {
    if (!FeatureFlagClient.instance) {
      FeatureFlagClient.instance = new FeatureFlagClient();
    }
    return FeatureFlagClient.instance;
  }

  /**
   * Initialize feature flags from backend
   */
  async initialize(): Promise<void> {
    try {
      // Check cache first
      const cached = await this.getFromCache();
      if (cached) {
        this.flags = cached;
        return;
      }

      // Fetch from backend
      const response = await fetch(`${this.apiBaseUrl}/api/features/all`);
      if (!response.ok) {
        throw new Error(`Failed to fetch feature flags: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract enabled status for each flag
      this.flags = Object.entries(data).reduce((acc, [key, flag]: [string, any]) => {
        acc[key] = flag.enabled;
        return acc;
      }, {} as FeatureFlagConfig);

      // Cache the flags
      await this.setCache(this.flags);
    } catch (error) {
      console.error('Error initializing feature flags:', error);
      // Fall back to default config if fetch fails
      this.flags = this.getDefaultConfig();
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagKey: string): boolean {
    return this.flags[flagKey] ?? false;
  }

  /**
   * Check multiple features at once
   */
  checkMultiple(flagKeys: string[]): Record<string, boolean> {
    return flagKeys.reduce((acc, key) => {
      acc[key] = this.isEnabled(key);
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * Get variant for A/B testing
   */
  async getVariant(flagKey: string, userId?: string): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      }

      const response = await fetch(
        `${this.apiBaseUrl}/api/features/check/${flagKey}?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to get variant for flag ${flagKey}`);
      }

      const data: FeatureFlagCheckResponse = await response.json();
      return data.variant;
    } catch (error) {
      console.error(`Error getting variant for ${flagKey}:`, error);
      return 'control';
    }
  }

  /**
   * Track feature usage
   */
  async trackUsage(
    flagKey: string,
    action: string = 'view',
    userId?: string,
    deviceType: string = 'mobile'
  ): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/api/features/${flagKey}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          user_id: userId,
          device_type: deviceType,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn(`Failed to track usage for ${flagKey}:`, error);
    }
  }

  /**
   * Refresh flags from backend
   */
  async refresh(): Promise<void> {
    await this.clearCache();
    await this.initialize();
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlagConfig {
    return { ...this.flags };
  }

  /**
   * Get cache TTL remaining (in milliseconds)
   */
  async getCacheTTLRemaining(): Promise<number> {
    const timestamp = await AsyncStorage.getItem(this.cacheTimestampKey);
    if (!timestamp) {
      return 0;
    }

    const cacheTime = parseInt(timestamp, 10);
    const elapsed = Date.now() - cacheTime;
    return Math.max(0, this.cacheTTL - elapsed);
  }

  // Private methods

  private async getFromCache(): Promise<FeatureFlagConfig | null> {
    try {
      const timestamp = await AsyncStorage.getItem(this.cacheTimestampKey);
      const cached = await AsyncStorage.getItem(this.cacheKey);

      if (!timestamp || !cached) {
        return null;
      }

      const cacheTime = parseInt(timestamp, 10);
      const elapsed = Date.now() - cacheTime;

      if (elapsed > this.cacheTTL) {
        await this.clearCache();
        return null;
      }

      return JSON.parse(cached);
    } catch (error) {
      console.error('Error reading feature flags from cache:', error);
      return null;
    }
  }

  private async setCache(flags: FeatureFlagConfig): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.cacheKey, JSON.stringify(flags)],
        [this.cacheTimestampKey, Date.now().toString()],
      ]);
    } catch (error) {
      console.error('Error caching feature flags:', error);
    }
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.cacheKey, this.cacheTimestampKey]);
    } catch (error) {
      console.error('Error clearing feature flags cache:', error);
    }
  }

  private getDefaultConfig(): FeatureFlagConfig {
    // Safe defaults - features disabled by default for rollout safety
    return {
      tier_progress_bar: true,
      amount_chip_selector: true,
      platform_goal_meter: true,
      social_sharing: true,
      receipt_generation: true,
      community_feed: false,
      ai_concierge_chat: true,
      dark_mode: true,
      notification_center: false,
      advanced_analytics: false,
    };
  }
}

// Export singleton instance
export const featureFlagClient = FeatureFlagClient.getInstance();

// React Hook for using feature flags
import { useEffect, useState } from 'react';

export const useFeatureFlag = (flagKey: string): boolean => {
  const [isEnabled, setIsEnabled] = useState(() =>
    featureFlagClient.isEnabled(flagKey)
  );

  useEffect(() => {
    setIsEnabled(featureFlagClient.isEnabled(flagKey));
  }, [flagKey]);

  return isEnabled;
};

export const useFeatureFlags = (flagKeys: string[]): Record<string, boolean> => {
  const [flags, setFlags] = useState(() =>
    featureFlagClient.checkMultiple(flagKeys)
  );

  useEffect(() => {
    setFlags(featureFlagClient.checkMultiple(flagKeys));
  }, [flagKeys]);

  return flags;
};

// HOC for feature-gated components
export const withFeatureFlag = (
  Component: React.ComponentType<any>,
  flagKey: string,
  fallback?: React.ReactNode
) => {
  return (props: any) => {
    const isEnabled = useFeatureFlag(flagKey);

    if (!isEnabled) {
      return fallback ?? null;
    }

    return <Component {...props} />;
  };
};
