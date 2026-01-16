import { ArrowUpRight, ArrowDownLeft, ChevronRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency, formatRelativeDate } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Card, Skeleton, NoTransactions } from '../ui'
import type { Transaction } from '../../types/api'

interface RecentActivityProps {
  transactions: Transaction[]
  isLoading?: boolean
  limit?: number
  className?: string
}

const categoryIcons: Record<string, string> = {
  'food': '🍔',
  'shopping': '🛍️',
  'transport': '🚗',
  'entertainment': '🎬',
  'bills': '📄',
  'income': '💰',
  'transfer': '↔️',
  'other': '📦',
}

export function RecentActivity({
  transactions,
  isLoading,
  limit = 5,
  className,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  // Ensure transactions is an array before slicing
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  const displayTransactions = safeTransactions.slice(0, limit)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            Recent Activity
          </h2>
        </div>
        <Link
          to="/transactions"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {displayTransactions.length === 0 ? (
        <div className="p-6">
          <NoTransactions />
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {displayTransactions.map((transaction) => {
            const isIncome = transaction.type === 'deposit' || transaction.type === 'reward' || transaction.amount > 0
            const amount = Math.abs(transaction.amount)
            const category = transaction.category?.toLowerCase() || 'other'
            const emoji = categoryIcons[category] || categoryIcons.other

            return (
              <Link
                key={transaction.id}
                to={`/transactions?id=${transaction.id}`}
                className="flex items-center gap-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isIncome
                    ? 'bg-success-50 dark:bg-success-900/30'
                    : 'bg-neutral-100 dark:bg-neutral-700'
                )}>
                  {transaction.merchantLogo ? (
                    <img
                      src={transaction.merchantLogo}
                      alt={transaction.title}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <span className="text-lg">{emoji}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50 text-sm truncate">
                    {transaction.title || transaction.description}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {transaction.category || 'Transaction'}
                    </span>
                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatRelativeDate(transaction.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-semibold text-sm',
                    isIncome
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-neutral-900 dark:text-neutral-50'
                  )}>
                    {isIncome ? '+' : '-'}{formatCurrency(amount, transaction.currency)}
                  </span>
                  {isIncome ? (
                    <ArrowDownLeft className="w-4 h-4 text-success-500" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {displayTransactions.length > 0 && (
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          <Link
            to="/transactions"
            className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            View All Transactions
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  )
}
