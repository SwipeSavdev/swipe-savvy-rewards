import { Wallet, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Skeleton } from '../ui'

interface BalanceCardProps {
  available: number
  pending: number
  currency?: string
  isLoading?: boolean
  className?: string
}

export function BalanceCard({
  available,
  pending,
  currency = 'USD',
  isLoading = false,
  className,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true)

  if (isLoading) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl p-6 text-white relative overflow-hidden',
        className
      )}>
        <div className="relative z-10">
          <Skeleton className="h-5 w-32 bg-white/20 mb-4" />
          <Skeleton className="h-10 w-48 bg-white/20 mb-2" />
          <Skeleton className="h-4 w-36 bg-white/20" />
        </div>
      </div>
    )
  }

  const total = available + pending

  return (
    <div className={cn(
      'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl p-6 text-white relative overflow-hidden',
      className
    )}>
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-white/80">Total Balance</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-white/70" />
            ) : (
              <EyeOff className="w-5 h-5 text-white/70" />
            )}
          </button>
        </div>

        {/* Main Balance */}
        <div className="mb-4">
          <div className="text-4xl font-bold tracking-tight">
            {showBalance ? formatCurrency(total, currency) : '••••••'}
          </div>
          <div className="text-sm text-white/60 mt-1">
            {currency} Account
          </div>
        </div>

        {/* Available / Pending */}
        <div className="flex items-center gap-6 pt-4 border-t border-white/10">
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Available</div>
            <div className="text-lg font-semibold">
              {showBalance ? formatCurrency(available, currency) : '••••'}
            </div>
          </div>
          {pending > 0 && (
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Pending</div>
              <div className="text-lg font-semibold text-warning-300">
                {showBalance ? formatCurrency(pending, currency) : '••••'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
