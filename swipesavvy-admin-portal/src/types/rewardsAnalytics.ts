export interface RewardsAnalyticsFilters {
    startDate: string
    endDate: string
    merchantIds: string[]
    tiers: string[]
}

export interface IssuedRedeemedPoint {
    date: string
    issued: number
    redeemed: number
}

export interface RewardsActivitySummary {
    totals: {
        pointsIssued: number
        pointsRedeemed: number
        activeEarners: number
        activeRedeemers: number
        redemptionRate: number
    }
    trend: IssuedRedeemedPoint[]
}

export interface TopEarner {
    id: string
    name: string
    tier: string
    merchant: string
    pointsBalance: number
    pointsEarned: number
    pointsRedeemed: number
}

export interface RedemptionFunnelStage {
    stage: string
    value: number
}

export interface TierDistributionItem {
    tier: string
    count: number
    share: number
}

export interface MerchantBreakdownItem {
    merchantId: string
    merchantName: string
    tier: string
    pointsIssued: number
    pointsRedeemed: number
    redemptionRate: number
}

export interface RewardsAnalyticsPageData {
    summary: RewardsActivitySummary
    topEarners: TopEarner[]
    redemptionFunnel: RedemptionFunnelStage[]
    tierDistribution: TierDistributionItem[]
    merchantBreakdown: MerchantBreakdownItem[]
}
