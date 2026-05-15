import type {
    MerchantBreakdownItem,
    RedemptionFunnelStage,
    RewardsActivitySummary,
    RewardsAnalyticsFilters,
    TierDistributionItem,
    TopEarner,
} from '@/types/rewardsAnalytics'
import { apiClient } from './apiClient'

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

export class RewardsAnalyticsApiError extends Error {
    status: number
    details?: Record<string, unknown>

    constructor(message: string, status = 0, details?: Record<string, unknown>) {
        super(message)
        this.name = 'RewardsAnalyticsApiError'
        this.status = status
        this.details = details
    }
}

function buildQueryString(params?: RewardsAnalyticsFilters): string {
    if (!params) return ''
    const searchParams = new URLSearchParams()
    searchParams.set('startDate', params.startDate)
    searchParams.set('endDate', params.endDate)
    if (params.merchantIds.length) {
        searchParams.set('merchantIds', params.merchantIds.join(','))
    }
    if (params.tiers.length) {
        searchParams.set('tiers', params.tiers.join(','))
    }
    return `?${searchParams.toString()}`
}

function normalizeError(error: any): RewardsAnalyticsApiError {
    if (error instanceof RewardsAnalyticsApiError) {
        return error
    }

    if (error?.message) {
        return new RewardsAnalyticsApiError(error.message, error.status || 0, error.details || undefined)
    }

    return new RewardsAnalyticsApiError('Unknown rewards analytics error')
}

async function getMockApi() {
    return import('./mockApi') as Promise<{
        getRewardsActivitySummary: (params?: RewardsAnalyticsFilters) => Promise<RewardsActivitySummary>
        getTopEarners: (params?: RewardsAnalyticsFilters) => Promise<TopEarner[]>
        getRedemptionFunnel: (params?: RewardsAnalyticsFilters) => Promise<RedemptionFunnelStage[]>
        getTierDistribution: (params?: RewardsAnalyticsFilters) => Promise<TierDistributionItem[]>
        getMerchantBreakdown: (params?: RewardsAnalyticsFilters) => Promise<MerchantBreakdownItem[]>
    }>
}

export async function getRewardsActivitySummary(
    params?: RewardsAnalyticsFilters,
): Promise<RewardsActivitySummary> {
    if (USE_MOCK_API) {
        const mockApi = await getMockApi()
        return mockApi.getRewardsActivitySummary(params)
    }

    try {
        const response = await apiClient.get(`/api/v1/admin/rewards/performance/summary${buildQueryString(params)}`)
        return response.data as RewardsActivitySummary
    } catch (error) {
        throw normalizeError(error)
    }
}

export async function getTopEarners(
    params?: RewardsAnalyticsFilters,
): Promise<TopEarner[]> {
    if (USE_MOCK_API) {
        const mockApi = await getMockApi()
        return mockApi.getTopEarners(params)
    }

    try {
        const response = await apiClient.get(`/api/v1/admin/rewards/performance/top-earners${buildQueryString(params)}`)
        return response.data as TopEarner[]
    } catch (error) {
        throw normalizeError(error)
    }
}

export async function getRedemptionFunnel(
    params?: RewardsAnalyticsFilters,
): Promise<RedemptionFunnelStage[]> {
    if (USE_MOCK_API) {
        const mockApi = await getMockApi()
        return mockApi.getRedemptionFunnel(params)
    }

    try {
        const response = await apiClient.get(`/api/v1/admin/rewards/performance/redemption-funnel${buildQueryString(params)}`)
        return response.data as RedemptionFunnelStage[]
    } catch (error) {
        throw normalizeError(error)
    }
}

export async function getTierDistribution(
    params?: RewardsAnalyticsFilters,
): Promise<TierDistributionItem[]> {
    if (USE_MOCK_API) {
        const mockApi = await getMockApi()
        return mockApi.getTierDistribution(params)
    }

    try {
        const response = await apiClient.get(`/api/v1/admin/rewards/performance/tier-distribution${buildQueryString(params)}`)
        return response.data as TierDistributionItem[]
    } catch (error) {
        throw normalizeError(error)
    }
}

export async function getMerchantBreakdown(
    params?: RewardsAnalyticsFilters,
): Promise<MerchantBreakdownItem[]> {
    if (USE_MOCK_API) {
        const mockApi = await getMockApi()
        return mockApi.getMerchantBreakdown(params)
    }

    try {
        const response = await apiClient.get(`/api/v1/admin/rewards/performance/merchant-breakdown${buildQueryString(params)}`)
        return response.data as MerchantBreakdownItem[]
    } catch (error) {
        throw normalizeError(error)
    }
}
