import { Wallet, PiggyBank, CreditCard, Building2, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Card, Skeleton } from '../ui'
import type { Account } from '../../types/api'

interface AccountSummaryProps {
  accounts: Account[]
  isLoading?: boolean
  className?: string
}

const accountIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  external: Building2,
}

const accountColors = {
  checking: {
    bg: 'bg-primary-50 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
  },
  savings: {
    bg: 'bg-success-50 dark:bg-success-900/30',
    icon: 'text-success-600 dark:text-success-400',
  },
  credit: {
    bg: 'bg-warning-50 dark:bg-warning-900/30',
    icon: 'text-warning-600 dark:text-warning-400',
  },
  external: {
    bg: 'bg-info-50 dark:bg-info-900/30',
    icon: 'text-info-600 dark:text-info-400',
  },
}

export function AccountSummary({ accounts, isLoading, className }: AccountSummaryProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          Your Accounts
        </h2>
        <Link
          to="/banks"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          Manage
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.map((account) => {
          const type = account.type as keyof typeof accountIcons
          const Icon = accountIcons[type] || Wallet
          const colors = accountColors[type] || accountColors.checking

          return (
            <Card
              key={account.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  colors.bg
                )}>
                  <Icon className={cn('w-5 h-5', colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-50 text-sm truncate">
                    {account.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                    {account.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-50">
                    {formatCurrency(account.balance, account.currency)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <Card className="p-6 text-center">
          <Building2 className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            No accounts linked yet
          </p>
          <Link
            to="/banks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Link a Bank Account
          </Link>
        </Card>
      )}
    </div>
  )
}
