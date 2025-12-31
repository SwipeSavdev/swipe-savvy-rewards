export interface DashboardStat {
  label: string
  value: number
  trendPct?: number
  trendDirection?: 'up' | 'down' | 'flat'
}

export interface RecentActivityItem {
  id: string
  type: 'user' | 'transaction' | 'merchant' | 'support' | 'system'
  title: string
  description?: string
  createdAt: string // ISO
  status?: 'success' | 'warning' | 'error' | 'info'
}

export interface DashboardOverview {
  stats: {
    users: DashboardStat
    transactions: DashboardStat
    revenue: DashboardStat
    growth: DashboardStat
  }
  recentActivity: RecentActivityItem[]
}
