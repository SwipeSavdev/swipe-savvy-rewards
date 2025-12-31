export interface TimeseriesPoint {
  date: string // YYYY-MM-DD
  value: number
}

export interface AnalyticsOverview {
  activeUsers: TimeseriesPoint[]
  transactions: TimeseriesPoint[]
  revenue: TimeseriesPoint[]
}
