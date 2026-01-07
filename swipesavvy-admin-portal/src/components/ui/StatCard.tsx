import { cn } from '@/utils/cn'
import { formatCompactNumber, formatCurrency } from '@/utils/format'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

export type StatCardVariant = 'default' | 'gradient' | 'outlined'

export interface StatCardProps {
  readonly title?: string
  readonly value: number | string
  readonly format?: 'number' | 'currency' | 'compact' | 'none'
  readonly prefix?: string
  readonly suffix?: string
  readonly change?: {
    readonly value: number
    readonly trend: 'up' | 'down' | 'neutral'
    readonly label?: string
  }
  readonly icon?: ReactNode
  readonly variant?: StatCardVariant
  readonly action?: {
    readonly label: string
    readonly onClick: () => void
  }
  readonly sparklineData?: number[]
  readonly className?: string
  // Backward compatibility aliases
  /** @deprecated Use `title` instead */
  readonly label?: string
  /** @deprecated Use `change.value` instead */
  readonly trendPct?: number
  /** @deprecated Use `change.trend` instead */
  readonly trendDirection?: 'up' | 'down' | 'flat'
}

interface MiniSparklineProps {
  readonly data: number[]
  readonly className?: string
}

const variantStyles: Record<StatCardVariant, string> = {
  default: `
    bg-white dark:bg-ss-gray-800
    border border-[var(--ss-border)]
    hover:shadow-ss-md hover:border-[var(--ss-border-strong)]
  `,
  gradient: `
    bg-gradient-to-br from-ss-navy-500 to-ss-navy-700
    text-white
    shadow-ss-lg
  `,
  outlined: `
    bg-transparent
    border-2 border-ss-navy-200 dark:border-ss-navy-700
  `,
}

function MiniSparkline({ data, className }: MiniSparklineProps) {
  if (!data || data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 24
  const padding = 2

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((value - min) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
    </svg>
  )
}

function formatValue(val: number | string, format: string): string {
  if (typeof val === 'string') return val
  switch (format) {
    case 'currency':
      return formatCurrency(val)
    case 'number':
      return val.toLocaleString()
    case 'compact':
      return formatCompactNumber(val)
    default:
      return String(val)
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'neutral' | undefined) {
  if (trend === 'up') return TrendingUp
  if (trend === 'down') return TrendingDown
  return Minus
}

function getTrendColorClass(
  trend: 'up' | 'down' | 'neutral' | undefined,
  isGradient: boolean,
  textSecondaryClass: string
): string {
  if (trend === 'up') {
    return isGradient ? 'text-ss-green-300' : 'text-ss-green-500'
  }
  if (trend === 'down') {
    return isGradient ? 'text-ss-red-300' : 'text-ss-red-500'
  }
  return textSecondaryClass
}

function mapLegacyTrendDirection(direction: 'up' | 'down' | 'flat' | undefined): 'up' | 'down' | 'neutral' {
  if (direction === 'up') return 'up'
  if (direction === 'down') return 'down'
  return 'neutral'
}

function buildResolvedChange(
  change: { value: number; trend: 'up' | 'down' | 'neutral'; label?: string } | undefined,
  trendPct: number | undefined,
  trendDirection: 'up' | 'down' | 'flat' | undefined
): { value: number; trend: 'up' | 'down' | 'neutral'; label?: string } | undefined {
  if (change) return change
  if (trendPct === undefined) return undefined
  return {
    value: trendPct,
    trend: mapLegacyTrendDirection(trendDirection),
  }
}

export default function StatCard({
  title,
  value,
  format = 'compact',
  prefix,
  suffix,
  change,
  icon,
  variant = 'default',
  action,
  sparklineData,
  className,
  // Backward compatibility
  label,
  trendPct,
  trendDirection,
}: StatCardProps) {
  // Resolve backward-compatible props
  const resolvedTitle = title ?? label ?? ''

  // Build change object from legacy props if not provided
  const resolvedChange = buildResolvedChange(change, trendPct, trendDirection)

  const formattedValue = formatValue(value, format)
  const displayValue = `${prefix || ''}${formattedValue}${suffix || ''}`

  const isGradient = variant === 'gradient'
  const textPrimaryClass = isGradient ? 'text-white' : 'text-[var(--ss-text-primary)]'
  const textSecondaryClass = isGradient ? 'text-white/70' : 'text-[var(--ss-text-secondary)]'
  const iconBgClass = isGradient ? 'bg-white/20' : 'bg-ss-navy-100 dark:bg-ss-navy-900'
  const iconColorClass = isGradient ? 'text-white' : 'text-ss-navy-500'

  const TrendIcon = getTrendIcon(resolvedChange?.trend)
  const trendColorClass = getTrendColorClass(resolvedChange?.trend, isGradient, textSecondaryClass)

  return (
    <div
      className={cn(
        'rounded-ss-xl p-6 transition-all duration-base',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div className={cn('p-2.5 rounded-ss-lg', iconBgClass, iconColorClass)}>
            {icon}
          </div>
        )}

        {resolvedChange && (
          <div className={cn('flex items-center gap-1', trendColorClass)}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {resolvedChange.value > 0 ? '+' : ''}{resolvedChange.value.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <p className={cn('mt-4 text-sm font-medium', textSecondaryClass)}>
        {resolvedTitle}
      </p>

      <p className={cn('mt-1 text-3xl font-bold tracking-tight font-display', textPrimaryClass)}>
        {displayValue}
      </p>

      {sparklineData && sparklineData.length > 0 && (
        <div className={cn('mt-3', isGradient ? 'text-white/60' : 'text-ss-navy-400')}>
          <MiniSparkline data={sparklineData} />
        </div>
      )}

      {resolvedChange?.label && (
        <p className={cn('mt-2 text-xs', textSecondaryClass)}>
          {resolvedChange.label}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'mt-4 text-sm font-medium transition-colors',
            isGradient
              ? 'text-white/80 hover:text-white'
              : 'text-ss-navy-500 hover:text-ss-navy-700'
          )}
        >
          {action.label} →
        </button>
      )}
    </div>
  )
}

export { StatCard }
