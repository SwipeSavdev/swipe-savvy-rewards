// Common API types

export interface ApiError {
  message: string
  status: number
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Account types
export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  currency: string
}

// Transaction types
export type TransactionType = 'payment' | 'transfer' | 'deposit' | 'reward' | 'withdrawal'
export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  amount: number
  currency: string
  status: TransactionStatus
  timestamp: string
  description?: string
  category?: string
  merchantLogo?: string
}

// Wallet types
export interface WalletBalance {
  available: number
  pending: number
  currency: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  lastFour: string
  brand?: string
  bankName?: string
  isDefault: boolean
  expiryDate?: string
}

// Rewards types
export type RewardTier = 'bronze' | 'silver' | 'gold'

export interface RewardsPoints {
  available: number
  donated: number
  tier: RewardTier
  tierProgress: number
  nextTierAt: number
}

export interface Boost {
  id: string
  title: string
  subtitle: string
  icon: string
  percent: string
  active: boolean
  expiresAt?: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  points: number
  avatar?: string
  tier: string
  isCurrentUser: boolean
}

// Analytics types
export interface SpendingCategory {
  category: string
  amount: number
  percentage: number
  color: string
  transactions: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  savings: number
}

export interface Analytics {
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  savingsRate: number
  spendingByCategory: SpendingCategory[]
  monthlyTrend: MonthlyTrend[]
  insights: string[]
}

// Goals types
export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: string
  icon: string
  color: string
  progress: number
  createdAt: string
}

export interface CreateGoalData {
  name: string
  targetAmount: number
  deadline?: string
  category: string
  icon: string
  color: string
}

// Budget types
export interface Budget {
  id: string
  category: string
  budgetAmount: number
  spentAmount: number
  remaining: number
  percentage: number
  period: 'monthly' | 'weekly'
  color: string
  icon: string
}

export interface CreateBudgetData {
  category: string
  budgetAmount: number
  period: 'monthly' | 'weekly'
  color: string
  icon: string
}

// Card types
export interface Card {
  id: string
  name: string
  type: 'credit' | 'debit'
  lastFour: string
  brand: string
  balance?: number
  limit?: number
  expiryDate: string
  isLocked: boolean
  color: string
}

// Linked Bank types
export interface LinkedBank {
  id: string
  bankName: string
  accountNumber: string
  status: 'connected' | 'needs_relink'
  lastVerified?: string
}

// Transfer types
export interface Recipient {
  id: string
  name: string
  email?: string
  phone?: string
  accountNumber?: string
  avatar?: string
  lastUsed?: string
}

export interface TransferRequest {
  recipientId: string
  amount: number
  note?: string
  paymentMethodId: string
}

// User types
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  accountNumber: string
  avatarUrl?: string
  tier: RewardTier
  createdAt: string
}

export interface UserPreferences {
  darkMode: boolean
  notificationsEnabled: boolean
  biometricsEnabled: boolean
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
}

export interface RefreshTokenResponse {
  token: string
}
