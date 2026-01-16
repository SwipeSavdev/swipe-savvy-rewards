import { useEffect } from 'react'
import { Sparkles, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore, useWalletStore, useTransactionStore, useAnalyticsStore, useRewardsStore } from '../store'
import {
  BalanceCard,
  QuickActions,
  AccountSummary,
  RecentActivity,
  SpendingChart,
} from '../components/dashboard'
import { Card, Badge } from '../components/ui'
import { formatCurrency, formatNumber } from '../utils/format'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { accounts, balance, isLoading: walletLoading, fetchAccounts, fetchBalance } = useWalletStore()
  const { transactions, isLoading: transactionsLoading, fetchTransactions } = useTransactionStore()
  const { spendingByCategory, overview, isLoading: analyticsLoading, fetchAll: fetchAnalytics } = useAnalyticsStore()
  const { points, fetchPoints } = useRewardsStore()

  useEffect(() => {
    fetchAccounts()
    fetchBalance()
    fetchTransactions()
    fetchAnalytics('30d')
    fetchPoints()
  }, [fetchAccounts, fetchBalance, fetchTransactions, fetchAnalytics, fetchPoints])

  const firstName = user?.name?.split(' ')[0] || 'User'

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Welcome back, {firstName}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
            Here&apos;s what&apos;s happening with your accounts today.
          </p>
        </div>

        {/* Rewards Preview */}
        {points && points.available > 0 && (
          <Link
            to="/rewards"
            className="flex items-center gap-2 px-4 py-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-900/30 transition-colors group"
          >
            <Sparkles className="w-4 h-4 text-warning-500" />
            <span className="text-sm text-warning-700 dark:text-warning-300 font-medium">
              {formatNumber(points.available)} points available
            </span>
            <Badge variant="warning" size="sm">
              {points.tier}
            </Badge>
          </Link>
        )}
      </div>

      {/* Hero Section - Balance Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BalanceCard
            available={balance?.available || 0}
            pending={balance?.pending || 0}
            currency={balance?.currency || 'USD'}
            isLoading={walletLoading}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Savings */}
          <Card className="p-4">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              Monthly Savings
            </div>
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
              {formatCurrency(overview?.totalSavings || 0)}
            </div>
            {overview?.savingsRate && overview.savingsRate > 0 && (
              <div className="text-xs text-success-600 dark:text-success-400 mt-1">
                {overview.savingsRate.toFixed(1)}% rate
              </div>
            )}
          </Card>

          {/* Rewards */}
          <Card className="p-4">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
              Rewards
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-warning-500" />
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                {formatNumber(points?.available || 0)}
              </span>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              points
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Accounts Summary */}
      <AccountSummary accounts={accounts} isLoading={walletLoading} />

      {/* Main Content Grid - Activity + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity
            transactions={transactions}
            isLoading={transactionsLoading}
            limit={5}
          />
        </div>

        {/* Spending Chart */}
        <SpendingChart
          data={spendingByCategory}
          totalSpent={overview?.totalExpenses || 0}
          period="This Month"
          isLoading={analyticsLoading}
        />
      </div>
    </div>
  )
}
