// API Client
export { api } from './apiClient'

// Auth API
export { authApi } from './authApi'

// Wallet API
export { walletApi } from './walletApi'

// Transactions API
export { transactionsApi } from './transactionsApi'
export type { TransactionFilters } from './transactionsApi'

// Rewards API
export { rewardsApi } from './rewardsApi'

// Analytics API
export { analyticsApi } from './analyticsApi'
export type { AnalyticsParams, SpendingInsight } from './analyticsApi'

// Goals API
export { goalsApi } from './goalsApi'
export type { CreateGoalPayload, UpdateGoalPayload, GoalContribution } from './goalsApi'

// Budgets API
export { budgetsApi } from './budgetsApi'
export type { CreateBudgetPayload, UpdateBudgetPayload, BudgetSummary } from './budgetsApi'

// Cards API
export { cardsApi } from './cardsApi'
export type { CardSettings, CardSpendingLimits } from './cardsApi'

// Banks API
export { banksApi } from './banksApi'

// Transfers API
export { transfersApi } from './transfersApi'
