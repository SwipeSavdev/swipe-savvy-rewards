import { http, HttpResponse } from 'msw'

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '+1234567890',
  accountNumber: '1234567890',
  tier: 'silver' as const,
  createdAt: '2024-01-01T00:00:00Z',
}

const mockAccounts = [
  { id: 'acc-1', name: 'Main Checking', type: 'checking', balance: 5000, currency: 'USD' },
  { id: 'acc-2', name: 'Savings', type: 'savings', balance: 10000, currency: 'USD' },
]

const mockWalletBalance = {
  available: 1500.50,
  pending: 125.00,
  currency: 'USD',
}

const mockTransactions = [
  {
    id: 'tx-1',
    type: 'payment',
    title: 'Starbucks Coffee',
    amount: -5.75,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    category: 'Food & Drink',
  },
  {
    id: 'tx-2',
    type: 'deposit',
    title: 'Salary Deposit',
    amount: 3000.00,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-01-14T09:00:00Z',
    category: 'Income',
  },
  {
    id: 'tx-3',
    type: 'transfer',
    title: 'Transfer to Savings',
    amount: -500.00,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-01-13T14:00:00Z',
    category: 'Transfer',
  },
]

const mockRewardsPoints = {
  available: 5250,
  donated: 500,
  tier: 'silver' as const,
  tierProgress: 65,
  nextTierAt: 10000,
}

const mockBoosts = [
  {
    id: 'boost-1',
    title: 'Coffee Boost',
    subtitle: 'Get 5% back on coffee purchases',
    icon: '☕',
    percent: '5% back',
    active: false,
    expiresAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'boost-2',
    title: 'Gas Boost',
    subtitle: 'Get 3% back on gas stations',
    icon: '⛽',
    percent: '3% back',
    active: true,
    expiresAt: '2024-02-20T00:00:00Z',
  },
]

const mockAnalyticsOverview = {
  totalIncome: 8500.00,
  totalExpenses: 3200.00,
  totalSavings: 5300.00,
  savingsRate: 62.4,
  spendingByCategory: [],
  monthlyTrend: [],
  insights: [],
}

const mockSpendingByCategory = [
  { category: 'Food & Drink', amount: 450, percentage: 14.1, color: '#3B82F6', transactions: 25 },
  { category: 'Shopping', amount: 800, percentage: 25.0, color: '#10B981', transactions: 12 },
  { category: 'Transportation', amount: 350, percentage: 10.9, color: '#F59E0B', transactions: 8 },
  { category: 'Bills', amount: 1200, percentage: 37.5, color: '#EF4444', transactions: 5 },
  { category: 'Entertainment', amount: 400, percentage: 12.5, color: '#8B5CF6', transactions: 15 },
]

const mockMonthlyTrends = [
  { month: 'Oct', income: 7000, expenses: 2800, savings: 4200 },
  { month: 'Nov', income: 7500, expenses: 3000, savings: 4500 },
  { month: 'Dec', income: 8000, expenses: 3500, savings: 4500 },
  { month: 'Jan', income: 8500, expenses: 3200, savings: 5300 },
]

const mockGoals = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2024-12-31',
    category: 'savings',
    icon: '🛡️',
    color: '#3B82F6',
    progress: 65,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'goal-2',
    name: 'Vacation',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: '2024-06-30',
    category: 'travel',
    icon: '✈️',
    color: '#10B981',
    progress: 40,
    createdAt: '2024-01-01T00:00:00Z',
  },
]

const mockBudgets = [
  {
    id: 'budget-1',
    category: 'Food & Dining',
    budgetAmount: 500,
    spentAmount: 350,
    remaining: 150,
    percentage: 70,
    period: 'monthly',
    color: '#3B82F6',
    icon: '🍔',
  },
  {
    id: 'budget-2',
    category: 'Entertainment',
    budgetAmount: 200,
    spentAmount: 180,
    remaining: 20,
    percentage: 90,
    period: 'monthly',
    color: '#F59E0B',
    icon: '🎬',
  },
]

const mockBudgetSummary = {
  totalBudgeted: 1500,
  totalSpent: 1100,
  totalRemaining: 400,
  budgetsOverLimit: 0,
  budgetsNearLimit: 1,
}

const mockCards = [
  {
    id: 'card-1',
    name: 'Visa Platinum',
    type: 'credit',
    lastFour: '4532',
    brand: 'Visa',
    balance: 1234.56,
    limit: 5000,
    expiryDate: '12/26',
    isLocked: false,
    color: '#1a1a2e',
  },
]

const mockLinkedBanks = [
  {
    id: 'bank-1',
    bankName: 'Chase Bank',
    accountNumber: '1234',
    status: 'connected',
    lastVerified: '2024-01-10T00:00:00Z',
  },
]

const mockRecipients = [
  {
    id: 'recipient-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    lastUsed: '2024-01-10T00:00:00Z',
  },
]

const mockLeaderboard = [
  { rank: 1, userId: 'user-1', name: 'Alice', points: 25000, tier: 'gold', isCurrentUser: false },
  { rank: 2, userId: 'user-2', name: 'Bob', points: 20000, tier: 'gold', isCurrentUser: false },
  { rank: 3, userId: 'user-123', name: 'Test User', points: 5250, tier: 'silver', isCurrentUser: true },
]

const mockInsights = [
  {
    id: 'insight-1',
    type: 'saving_opportunity',
    title: 'You could save $50/month',
    description: 'Reduce dining out by 2 meals per week',
    amount: 50,
    createdAt: '2024-01-15T00:00:00Z',
  },
]

export const handlers = [
  // Auth endpoints
  http.post('/api/v1/auth/wallet/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      })
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  http.get('/api/v1/user/me', () => {
    return HttpResponse.json(mockUser)
  }),

  // Wallet endpoints
  http.get('/api/v1/accounts', () => {
    return HttpResponse.json(mockAccounts)
  }),

  http.get('/api/v1/wallet/balance', () => {
    return HttpResponse.json(mockWalletBalance)
  }),

  http.get('/api/v1/wallet/transactions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    return HttpResponse.json({
      data: mockTransactions,
      total: mockTransactions.length,
      page,
      limit,
      hasMore: false,
    })
  }),

  http.get('/api/v1/wallet/payment-methods', () => {
    return HttpResponse.json([
      { id: 'pm-1', type: 'card', lastFour: '4532', brand: 'Visa', isDefault: true },
      { id: 'pm-2', type: 'bank_account', lastFour: '1234', bankName: 'Chase', isDefault: false },
    ])
  }),

  // Transactions endpoints
  http.get('/api/v1/transactions/:id', ({ params }) => {
    const transaction = mockTransactions.find(t => t.id === params.id)
    if (transaction) {
      return HttpResponse.json(transaction)
    }
    return HttpResponse.json({ message: 'Transaction not found' }, { status: 404 })
  }),

  http.get('/api/v1/transactions/categories', () => {
    return HttpResponse.json(['Food & Drink', 'Shopping', 'Transportation', 'Bills', 'Entertainment'])
  }),

  // Rewards endpoints
  http.get('/api/v1/rewards/points', () => {
    return HttpResponse.json(mockRewardsPoints)
  }),

  http.get('/api/v1/rewards/boosts', () => {
    return HttpResponse.json(mockBoosts)
  }),

  http.post('/api/v1/rewards/boosts/:id/activate', ({ params }) => {
    const boost = mockBoosts.find(b => b.id === params.id)
    if (boost) {
      return HttpResponse.json({ ...boost, active: true })
    }
    return HttpResponse.json({ message: 'Boost not found' }, { status: 404 })
  }),

  http.get('/api/v1/rewards/leaderboard', () => {
    return HttpResponse.json(mockLeaderboard)
  }),

  http.get('/api/v1/rewards/history', () => {
    return HttpResponse.json(mockTransactions.slice(0, 3))
  }),

  http.get('/api/v1/rewards/charities', () => {
    return HttpResponse.json([
      { id: 'charity-1', name: 'Red Cross', description: 'Humanitarian aid organization' },
      { id: 'charity-2', name: 'UNICEF', description: "Children's emergency fund" },
    ])
  }),

  http.post('/api/v1/rewards/donate', async ({ request }) => {
    const body = await request.json() as { amount: number }
    return HttpResponse.json({
      donated: body.amount,
      remaining: mockRewardsPoints.available - body.amount,
    })
  }),

  // Analytics endpoints
  http.get('/api/v1/analytics', () => {
    return HttpResponse.json(mockAnalyticsOverview)
  }),

  http.get('/api/v1/analytics/spending/categories', () => {
    return HttpResponse.json(mockSpendingByCategory)
  }),

  http.get('/api/v1/analytics/trends/monthly', () => {
    return HttpResponse.json(mockMonthlyTrends)
  }),

  http.get('/api/v1/analytics/insights', () => {
    return HttpResponse.json(mockInsights)
  }),

  http.get('/api/v1/analytics/merchants/top', () => {
    return HttpResponse.json([
      { merchantId: 'm-1', merchantName: 'Amazon', totalSpent: 500, transactionCount: 15, category: 'Shopping' },
      { merchantId: 'm-2', merchantName: 'Starbucks', totalSpent: 150, transactionCount: 30, category: 'Food & Drink' },
    ])
  }),

  // Goals endpoints
  http.get('/api/v1/goals', () => {
    return HttpResponse.json(mockGoals)
  }),

  http.get('/api/v1/goals/:id', ({ params }) => {
    const goal = mockGoals.find(g => g.id === params.id)
    if (goal) {
      return HttpResponse.json(goal)
    }
    return HttpResponse.json({ message: 'Goal not found' }, { status: 404 })
  }),

  http.post('/api/v1/goals', async ({ request }) => {
    const body = await request.json() as { name: string; targetAmount: number }
    return HttpResponse.json({
      id: 'goal-new',
      name: body.name,
      targetAmount: body.targetAmount,
      currentAmount: 0,
      progress: 0,
      category: 'savings',
      icon: '🎯',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    })
  }),

  http.delete('/api/v1/goals/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/v1/goals/:id/contribute', async ({ params, request }) => {
    const body = await request.json() as { amount: number }
    const goal = mockGoals.find(g => g.id === params.id)
    if (goal) {
      return HttpResponse.json({
        goal: { ...goal, currentAmount: goal.currentAmount + body.amount },
        contribution: {
          id: 'contrib-new',
          goalId: goal.id,
          amount: body.amount,
          type: 'manual',
          createdAt: new Date().toISOString(),
        },
      })
    }
    return HttpResponse.json({ message: 'Goal not found' }, { status: 404 })
  }),

  // Budgets endpoints
  http.get('/api/v1/budgets', () => {
    return HttpResponse.json(mockBudgets)
  }),

  http.get('/api/v1/budgets/summary', () => {
    return HttpResponse.json(mockBudgetSummary)
  }),

  http.get('/api/v1/budgets/alerts', () => {
    return HttpResponse.json([
      {
        budgetId: 'budget-2',
        category: 'Entertainment',
        type: 'near_limit',
        percentUsed: 90,
        spent: 180,
        limit: 200,
        message: 'Entertainment budget is 90% used',
      },
    ])
  }),

  http.post('/api/v1/budgets', async ({ request }) => {
    const body = await request.json() as { category: string; amount: number; period: string }
    return HttpResponse.json({
      id: 'budget-new',
      category: body.category,
      budgetAmount: body.amount,
      spentAmount: 0,
      remaining: body.amount,
      percentage: 0,
      period: body.period,
      color: '#3B82F6',
      icon: '📦',
    })
  }),

  http.delete('/api/v1/budgets/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Cards endpoints
  http.get('/api/v1/cards', () => {
    return HttpResponse.json(mockCards)
  }),

  http.post('/api/v1/cards/:id/lock', ({ params }) => {
    const card = mockCards.find(c => c.id === params.id)
    if (card) {
      return HttpResponse.json({ ...card, isLocked: true })
    }
    return HttpResponse.json({ message: 'Card not found' }, { status: 404 })
  }),

  // Banks endpoints
  http.get('/api/v1/banks', () => {
    return HttpResponse.json(mockLinkedBanks)
  }),

  http.post('/api/v1/banks/plaid/link-token', () => {
    return HttpResponse.json({
      linkToken: 'link-sandbox-token',
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
  }),

  http.delete('/api/v1/banks/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Transfers endpoints
  http.get('/api/v1/transfers/recipients', () => {
    return HttpResponse.json(mockRecipients)
  }),

  http.post('/api/v1/transfers', async ({ request }) => {
    const body = await request.json() as { amount: number; type: string }
    return HttpResponse.json({
      id: 'transfer-new',
      type: body.type,
      status: 'pending',
      amount: body.amount,
      fee: 0,
      currency: 'USD',
      fromAccountId: 'acc-1',
      fromAccountName: 'Main Checking',
      createdAt: new Date().toISOString(),
    })
  }),

  http.post('/api/v1/transfers/quote', async ({ request }) => {
    const body = await request.json() as { amount: number }
    return HttpResponse.json({
      amount: body.amount,
      fee: 0,
      total: body.amount,
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  }),
]
