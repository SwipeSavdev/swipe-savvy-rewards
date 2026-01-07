import {
  Wallet,
  TrendingUp,
  CreditCard,
  Gift,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Sparkles
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
          <h1 className="text-display-2 text-neutral-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-neutral-600 mt-1">
            Here's what's happening with your accounts today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>You have rewards to claim!</span>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance - Hero Card */}
        <div className="sm:col-span-2 lg:col-span-1 bg-gradient-card rounded-card p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-card-shine" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-sm text-white/80">Total Balance</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              ${formatCurrency(totalBalance)}
            </div>
            <div className="text-sm text-white/70 mt-1">Across all accounts</div>
          </div>
        </div>

        {/* Monthly Savings */}
        <div className="bg-white rounded-card p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-neutral-500">This Month</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">$487.23</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm font-medium text-success">+12.3%</span>
            <span className="text-sm text-neutral-500">from last month</span>
          </div>
        </div>

        {/* Active Cards */}
        <div className="bg-white rounded-card p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-500" />
            </div>
            <span className="text-sm text-neutral-500">Cards Active</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">3</div>
          <div className="text-sm text-neutral-500 mt-1">2 credit, 1 debit</div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-card p-6 shadow-card border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-neutral-500">Rewards</span>
          </div>
          <div className="text-2xl font-bold text-neutral-900">$124.50</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-sm font-medium text-warning">Available</span>
            <span className="text-sm text-neutral-500">to redeem</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts List */}
        <div className="lg:col-span-2 bg-white rounded-card shadow-card border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="text-heading-3 text-neutral-900">Your Accounts</h2>
            <Link
              to="/accounts"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Wallet className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{account.name}</h3>
                    <p className="text-sm text-neutral-500">{account.number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-neutral-900 text-lg">
                    ${formatCurrency(account.balance)}
                  </div>
                  <div className="text-sm text-neutral-500 capitalize">{account.type}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-100">
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                Transfer Money
              </button>
              <button className="px-4 py-2 bg-white text-neutral-700 text-sm font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                Add Account
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-card shadow-card border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="text-heading-3 text-neutral-900">Recent Activity</h2>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income'
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isIncome ? 'bg-success-50' : 'bg-danger-50'
                    }`}>
                      {isIncome ? (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 text-sm">{transaction.name}</div>
                      <div className="text-xs text-neutral-500">{transaction.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${isIncome ? 'text-success' : 'text-neutral-900'}`}>
                      {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-neutral-100">
            <Link
              to="/transactions"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
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
