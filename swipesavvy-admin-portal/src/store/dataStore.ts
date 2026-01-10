/**
 * Data Store - Centralized data cache for cross-module sharing
 *
 * This store caches commonly used data (stats, counts, etc.) so that
 * different pages can share data without making duplicate API calls.
 */

import { create } from 'zustand'
import { Api } from '@/services/api'

// Stats interfaces
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalMerchants: number
  activeMerchants: number
  totalTransactions: number
  totalRevenue: number
  openTickets: number
  avgResponseTime: string
  pendingCharities: number
  activeCampaigns: number
}

export interface MerchantStats {
  total: number
  active: number
  suspended: number
  pending: number
  monthlyVolume: number
  avgSuccessRate: number
}

export interface CharityStats {
  total: number
  approved: number
  pending: number
  rejected: number
  incomplete: number
}

export interface SupportStats {
  openTickets: number
  inProgress: number
  resolved: number
  avgResponseTime: string
  slaBreaches: number
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalAdmins: number
}

export interface CampaignStats {
  total: number
  active: number
  draft: number
  completed: number
  totalReach: number
  avgRoi: number
}

interface DataState {
  // Cached data
  dashboardStats: DashboardStats | null
  merchantStats: MerchantStats | null
  charityStats: CharityStats | null
  supportStats: SupportStats | null
  userStats: UserStats | null
  campaignStats: CampaignStats | null

  // Loading states
  loading: {
    dashboard: boolean
    merchants: boolean
    charities: boolean
    support: boolean
    users: boolean
    campaigns: boolean
  }

  // Last fetch timestamps (for cache invalidation)
  lastFetched: {
    dashboard: number | null
    merchants: number | null
    charities: number | null
    support: number | null
    users: number | null
    campaigns: number | null
  }

  // Actions
  fetchDashboardStats: (force?: boolean) => Promise<void>
  fetchMerchantStats: (force?: boolean) => Promise<void>
  fetchCharityStats: (force?: boolean) => Promise<void>
  fetchSupportStats: (force?: boolean) => Promise<void>
  fetchUserStats: (force?: boolean) => Promise<void>
  fetchCampaignStats: (force?: boolean) => Promise<void>
  refreshAll: () => Promise<void>
  invalidateCache: (key: keyof DataState['lastFetched']) => void
  invalidateAll: () => void
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000

export const useDataStore = create<DataState>()((set, get) => ({
  dashboardStats: null,
  merchantStats: null,
  charityStats: null,
  supportStats: null,
  userStats: null,
  campaignStats: null,

  loading: {
    dashboard: false,
    merchants: false,
    charities: false,
    support: false,
    users: false,
    campaigns: false,
  },

  lastFetched: {
    dashboard: null,
    merchants: null,
    charities: null,
    support: null,
    users: null,
    campaigns: null,
  },

  fetchDashboardStats: async (force = false) => {
    const { lastFetched, loading } = get()

    // Check cache validity
    if (
      !force &&
      lastFetched.dashboard &&
      Date.now() - lastFetched.dashboard < CACHE_DURATION
    ) {
      return
    }

    if (loading.dashboard) return

    set((state) => ({
      loading: { ...state.loading, dashboard: true },
    }))

    try {
      const [dashboardRes, supportRes] = await Promise.all([
        Api.dashboardApi.getAnalyticsOverview().catch(() => null),
        Api.supportApi.getStats().catch(() => null),
      ])

      const stats: DashboardStats = {
        totalUsers: dashboardRes?.total_users || dashboardRes?.activeUsers || 0,
        activeUsers: dashboardRes?.active_users || 0,
        totalMerchants: dashboardRes?.total_merchants || 0,
        activeMerchants: dashboardRes?.active_merchants || 0,
        totalTransactions: dashboardRes?.total_transactions || 0,
        totalRevenue: dashboardRes?.total_revenue || dashboardRes?.revenue || 0,
        openTickets: supportRes?.open_tickets || supportRes?.openTickets || 0,
        avgResponseTime: supportRes?.avg_response_time || supportRes?.avgResponseTime || '0',
        pendingCharities: 0,
        activeCampaigns: 0,
      }

      set({
        dashboardStats: stats,
        lastFetched: { ...get().lastFetched, dashboard: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch dashboard stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, dashboard: false },
      }))
    }
  },

  fetchMerchantStats: async (force = false) => {
    const { lastFetched, loading } = get()

    if (
      !force &&
      lastFetched.merchants &&
      Date.now() - lastFetched.merchants < CACHE_DURATION
    ) {
      return
    }

    if (loading.merchants) return

    set((state) => ({
      loading: { ...state.loading, merchants: true },
    }))

    try {
      const res = await Api.merchantsApi.getStats()

      const stats: MerchantStats = {
        total: res?.total_merchants || 0,
        active: res?.active_merchants || 0,
        suspended: res?.suspended_merchants || 0,
        pending: res?.pending_merchants || 0,
        monthlyVolume: res?.total_monthly_volume || 0,
        avgSuccessRate: res?.avg_success_rate || 0,
      }

      set({
        merchantStats: stats,
        lastFetched: { ...get().lastFetched, merchants: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch merchant stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, merchants: false },
      }))
    }
  },

  fetchCharityStats: async (force = false) => {
    const { lastFetched, loading } = get()

    if (
      !force &&
      lastFetched.charities &&
      Date.now() - lastFetched.charities < CACHE_DURATION
    ) {
      return
    }

    if (loading.charities) return

    set((state) => ({
      loading: { ...state.loading, charities: true },
    }))

    try {
      const res = await Api.charityApi.listCharities({ limit: 1000 })
      const charities = Array.isArray(res) ? res : res?.charities || []

      const stats: CharityStats = {
        total: charities.length,
        approved: charities.filter((c: any) => c.status === 'approved').length,
        pending: charities.filter((c: any) => c.status === 'pending').length,
        rejected: charities.filter((c: any) => c.status === 'rejected').length,
        incomplete: charities.filter((c: any) => c.status === 'incomplete').length,
      }

      set({
        charityStats: stats,
        lastFetched: { ...get().lastFetched, charities: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch charity stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, charities: false },
      }))
    }
  },

  fetchSupportStats: async (force = false) => {
    const { lastFetched, loading } = get()

    if (
      !force &&
      lastFetched.support &&
      Date.now() - lastFetched.support < CACHE_DURATION
    ) {
      return
    }

    if (loading.support) return

    set((state) => ({
      loading: { ...state.loading, support: true },
    }))

    try {
      const res = await Api.supportApi.getStats()

      const stats: SupportStats = {
        openTickets: res?.open_tickets || res?.openTickets || 0,
        inProgress: res?.in_progress || res?.inProgress || 0,
        resolved: res?.resolved || 0,
        avgResponseTime: res?.avg_response_time || res?.avgResponseTime || '0',
        slaBreaches: res?.sla_breaches || res?.slaBreaches || 0,
      }

      set({
        supportStats: stats,
        lastFetched: { ...get().lastFetched, support: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch support stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, support: false },
      }))
    }
  },

  fetchUserStats: async (force = false) => {
    const { lastFetched, loading } = get()

    if (
      !force &&
      lastFetched.users &&
      Date.now() - lastFetched.users < CACHE_DURATION
    ) {
      return
    }

    if (loading.users) return

    set((state) => ({
      loading: { ...state.loading, users: true },
    }))

    try {
      const res = await Api.usersApi.getStats()

      const stats: UserStats = {
        totalUsers: res?.total_users || 0,
        activeUsers: res?.active_users || 0,
        suspendedUsers: res?.suspended_users || 0,
        totalAdmins: res?.total_admins || 0,
      }

      set({
        userStats: stats,
        lastFetched: { ...get().lastFetched, users: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch user stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, users: false },
      }))
    }
  },

  fetchCampaignStats: async (force = false) => {
    const { lastFetched, loading } = get()

    if (
      !force &&
      lastFetched.campaigns &&
      Date.now() - lastFetched.campaigns < CACHE_DURATION
    ) {
      return
    }

    if (loading.campaigns) return

    set((state) => ({
      loading: { ...state.loading, campaigns: true },
    }))

    try {
      const res = await Api.aiCampaignsApi.listCampaigns(1, 1000)
      const campaigns = res?.campaigns || res || []

      const stats: CampaignStats = {
        total: campaigns.length,
        active: campaigns.filter((c: any) => c.status === 'active' || c.status === 'running').length,
        draft: campaigns.filter((c: any) => c.status === 'draft').length,
        completed: campaigns.filter((c: any) => c.status === 'completed').length,
        totalReach: campaigns.reduce((sum: number, c: any) => sum + (c.reach || 0), 0),
        avgRoi: campaigns.length > 0
          ? campaigns.reduce((sum: number, c: any) => sum + (c.roi || 0), 0) / campaigns.length
          : 0,
      }

      set({
        campaignStats: stats,
        lastFetched: { ...get().lastFetched, campaigns: Date.now() },
      })
    } catch (error) {
      console.error('[DataStore] Failed to fetch campaign stats:', error)
    } finally {
      set((state) => ({
        loading: { ...state.loading, campaigns: false },
      }))
    }
  },

  refreshAll: async () => {
    const state = get()
    await Promise.all([
      state.fetchDashboardStats(true),
      state.fetchMerchantStats(true),
      state.fetchCharityStats(true),
      state.fetchSupportStats(true),
      state.fetchUserStats(true),
      state.fetchCampaignStats(true),
    ])
  },

  invalidateCache: (key) => {
    set((state) => ({
      lastFetched: { ...state.lastFetched, [key]: null },
    }))
  },

  invalidateAll: () => {
    set({
      lastFetched: {
        dashboard: null,
        merchants: null,
        charities: null,
        support: null,
        users: null,
        campaigns: null,
      },
    })
  },
}))

// Hook to auto-refresh data on event bus events
import { useEffect } from 'react'
import { useEventBusStore, type EventType } from './eventBusStore'

export function useDataRefreshOnEvents() {
  const invalidateCache = useDataStore((s) => s.invalidateCache)
  const subscribe = useEventBusStore((s) => s.subscribe)

  useEffect(() => {
    const unsubscribers: (() => void)[] = []

    // Merchant events invalidate merchant stats
    const merchantEvents: EventType[] = [
      'merchant:created',
      'merchant:updated',
      'merchant:deleted',
      'merchant:status_changed',
      'merchant:onboarding_completed',
    ]
    merchantEvents.forEach((event) => {
      unsubscribers.push(
        subscribe(event, () => invalidateCache('merchants'))
      )
    })

    // Charity events invalidate charity stats
    const charityEvents: EventType[] = [
      'charity:created',
      'charity:updated',
      'charity:deleted',
      'charity:approved',
      'charity:rejected',
    ]
    charityEvents.forEach((event) => {
      unsubscribers.push(
        subscribe(event, () => invalidateCache('charities'))
      )
    })

    // Support events invalidate support stats
    const supportEvents: EventType[] = [
      'ticket:created',
      'ticket:status_changed',
      'ticket:resolved',
      'ticket:closed',
    ]
    supportEvents.forEach((event) => {
      unsubscribers.push(
        subscribe(event, () => invalidateCache('support'))
      )
    })

    // User events invalidate user stats
    const userEvents: EventType[] = [
      'user:created',
      'user:deleted',
      'user:status_changed',
      'admin_user:created',
      'admin_user:deleted',
    ]
    userEvents.forEach((event) => {
      unsubscribers.push(
        subscribe(event, () => invalidateCache('users'))
      )
    })

    // Campaign events invalidate campaign stats
    const campaignEvents: EventType[] = [
      'campaign:created',
      'campaign:published',
      'campaign:deleted',
    ]
    campaignEvents.forEach((event) => {
      unsubscribers.push(
        subscribe(event, () => invalidateCache('campaigns'))
      )
    })

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [invalidateCache, subscribe])
}
