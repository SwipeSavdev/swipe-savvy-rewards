import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

export type BadgeVariant = 'solid' | 'soft' | 'outline'
export type BadgeColorScheme = 'navy' | 'green' | 'yellow' | 'red' | 'gray'
export type BadgeSize = 'sm' | 'md' | 'lg'

// Legacy variant names for backward compatibility
export type LegacyBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface BadgeProps {
  readonly variant?: BadgeVariant | LegacyBadgeVariant
  readonly colorScheme?: BadgeColorScheme
  readonly size?: BadgeSize
  readonly dot?: boolean
  readonly removable?: boolean
  readonly onRemove?: () => void
  readonly children: ReactNode
  readonly className?: string
}

// Map legacy variant names to colorScheme
const legacyVariantMap: Record<LegacyBadgeVariant, BadgeColorScheme> = {
  primary: 'navy',
  success: 'green',
  warning: 'yellow',
  danger: 'red',
  neutral: 'gray',
}

function isLegacyVariant(variant: string): variant is LegacyBadgeVariant {
  return variant in legacyVariantMap
}

function resolveVariantAndColorScheme(
  variant: BadgeVariant | LegacyBadgeVariant | undefined,
  colorScheme: BadgeColorScheme | undefined
): { resolvedVariant: BadgeVariant; resolvedColorScheme: BadgeColorScheme } {
  // If colorScheme is explicitly provided, use it with the variant (default to 'soft')
  if (colorScheme) {
    const resolvedVariant: BadgeVariant = variant && !isLegacyVariant(variant) ? variant : 'soft'
    return { resolvedVariant, resolvedColorScheme: colorScheme }
  }

  // If variant is a legacy semantic name, map it to colorScheme
  if (variant && isLegacyVariant(variant)) {
    return { resolvedVariant: 'soft', resolvedColorScheme: legacyVariantMap[variant] }
  }

  // Otherwise use the variant as-is (or default) with default colorScheme
  const resolvedVariant: BadgeVariant = variant && !isLegacyVariant(variant) ? variant : 'soft'
  return { resolvedVariant, resolvedColorScheme: 'gray' }
}

const colorSchemes: Record<BadgeColorScheme, Record<BadgeVariant, string>> = {
  navy: {
    solid: 'bg-ss-navy-500 text-white',
    soft: 'bg-ss-navy-100 text-ss-navy-700 dark:bg-ss-navy-900 dark:text-ss-navy-300',
    outline: 'border-ss-navy-500 text-ss-navy-500 dark:border-ss-navy-400 dark:text-ss-navy-400',
  },
  green: {
    solid: 'bg-ss-green-500 text-white',
    soft: 'bg-ss-green-100 text-ss-green-700 dark:bg-ss-green-900 dark:text-ss-green-300',
    outline: 'border-ss-green-500 text-ss-green-600 dark:border-ss-green-400 dark:text-ss-green-400',
  },
  yellow: {
    solid: 'bg-ss-yellow-500 text-ss-gray-900',
    soft: 'bg-ss-yellow-100 text-ss-yellow-700 dark:bg-ss-yellow-900 dark:text-ss-yellow-300',
    outline: 'border-ss-yellow-500 text-ss-yellow-600 dark:border-ss-yellow-400 dark:text-ss-yellow-400',
  },
  red: {
    solid: 'bg-ss-red-500 text-white',
    soft: 'bg-ss-red-100 text-ss-red-700 dark:bg-ss-red-900 dark:text-ss-red-300',
    outline: 'border-ss-red-500 text-ss-red-500 dark:border-ss-red-400 dark:text-ss-red-400',
  },
  gray: {
    solid: 'bg-ss-gray-500 text-white',
    soft: 'bg-ss-gray-100 text-ss-gray-700 dark:bg-ss-gray-800 dark:text-ss-gray-300',
    outline: 'border-ss-gray-400 text-ss-gray-600 dark:border-ss-gray-500 dark:text-ss-gray-400',
  },
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
  lg: 'px-3 py-1 text-sm gap-2',
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

export default function Badge({
  variant,
  colorScheme,
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
}: BadgeProps) {
  const { resolvedVariant, resolvedColorScheme } = resolveVariantAndColorScheme(variant, colorScheme)

  const baseStyles = 'inline-flex items-center font-medium rounded-ss-full transition-colors'
  const borderStyles = resolvedVariant === 'outline' ? 'border' : ''

  return (
    <span
      className={cn(
        baseStyles,
        borderStyles,
        colorSchemes[resolvedColorScheme][resolvedVariant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            dotSizeStyles[size],
            resolvedVariant === 'solid' ? 'bg-current opacity-70' : 'bg-current'
          )}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            'flex-shrink-0 ml-0.5 -mr-1 p-0.5 rounded-full transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current'
          )}
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

// Semantic badge aliases for common use cases
export type StatusBadgeStatus = 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning'

interface StatusBadgeProps {
  readonly status: StatusBadgeStatus
  readonly children?: ReactNode
  readonly className?: string
}

const statusConfig: Record<StatusBadgeStatus, { colorScheme: BadgeColorScheme; label: string }> = {
  active: { colorScheme: 'green', label: 'Active' },
  inactive: { colorScheme: 'gray', label: 'Inactive' },
  pending: { colorScheme: 'yellow', label: 'Pending' },
  error: { colorScheme: 'red', label: 'Error' },
  success: { colorScheme: 'green', label: 'Success' },
  warning: { colorScheme: 'yellow', label: 'Warning' },
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge colorScheme={config.colorScheme} variant="soft" dot className={className}>
      {children || config.label}
    </Badge>
  )
}

export { Badge }
