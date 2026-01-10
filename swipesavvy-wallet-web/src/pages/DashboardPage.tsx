import {
  Wallet,
  TrendingUp,
  CreditCard,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Send
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const accounts = [
    { id: 1, name: 'Checking Account', number: '****1234', balance: 5247.32, type: 'checking' },
    { id: 2, name: 'Savings Account', number: '****5678', balance: 12893.45, type: 'savings' },
  ]

  const recentTransactions = [
    { id: 1, name: 'Starbucks', amount: -5.75, date: '2026-01-06', type: 'expense', category: 'Food & Drink' },
    { id: 2, name: 'Salary Deposit', amount: 3250.00, date: '2026-01-05', type: 'income', category: 'Salary' },
    { id: 3, name: 'Amazon', amount: -89.99, date: '2026-01-04', type: 'expense', category: 'Shopping' },
    { id: 4, name: 'Gas Station', amount: -45.20, date: '2026-01-03', type: 'expense', category: 'Transportation' },
    { id: 5, name: 'Cashback Reward', amount: 12.50, date: '2026-01-02', type: 'income', category: 'Rewards' },
  ]

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 text-neutral-900 dark:text-neutral-50">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Here's what's happening with your accounts today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 dark:bg-warning-900/20 rounded-md">
          <Sparkles className="w-4 h-4 text-warning-500" />
          <span className="text-sm text-warning-700 dark:text-warning-300 font-medium">Rewards available</span>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance - Hero Card */}
        <div className="sm:col-span-2 lg:col-span-1 bg-gradient-card rounded-lg p-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-card-shine" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-md flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs text-white/70 font-medium">Total Balance</span>
            </div>
            <div className="text-2xl font-bold tracking-tight">
              ${formatCurrency(totalBalance)}
            </div>
            <div className="text-xs text-white/60 mt-1">Across all accounts</div>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-success-50 dark:bg-success-900/30 rounded-md flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success-600 dark:text-success-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">This Month</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">$487.23</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-medium text-success-600 dark:text-success-400">+12.3%</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">from last month</span>
          </div>
        </div>

        {/* Active Cards */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-md flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Cards Active</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">3</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">2 credit, 1 debit</div>
        </div>

        {/* Rewards */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-warning-50 dark:bg-warning-900/30 rounded-md flex items-center justify-center">
              <Gift className="w-4 h-4 text-warning-600 dark:text-warning-400" />
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Rewards</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">$124.50</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-medium text-warning-600 dark:text-warning-400">Available</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">to redeem</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Your Accounts</h2>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                    <Wallet className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-50 text-sm">{account.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{account.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-50">
                    ${formatCurrency(account.balance)}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{account.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors">
                <Send className="w-4 h-4" />
                Transfer
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Recent Activity</h2>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income'
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isIncome
                        ? 'bg-success-50 dark:bg-success-900/30'
                        : 'bg-danger-50 dark:bg-danger-900/30'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-4 h-4 text-success-600 dark:text-success-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-50 text-sm">{transaction.name}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">{transaction.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${
                      isIncome
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-neutral-900 dark:text-neutral-50'
                    }`}>
                      {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-neutral-100 dark:border-neutral-700">
            <Link
              to="/transactions"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            >
              View All Transactions
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
