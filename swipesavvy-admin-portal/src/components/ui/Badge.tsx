/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - BADGE COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: STATUS COLORS FOR STATUS ONLY
 * - success: Green - positive outcomes, completed, healthy
 * - warning: Amber - attention required, pending, caution
 * - danger: Red - errors, critical, destructive
 * - info: Blue - informational, neutral highlight
 * - neutral: Gray - default, inactive, disabled
 *
 * NO decorative color usage. Badges are for status indication only.
 */

import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export type BadgeSize = 'sm' | 'md' | 'lg'
// Visual styling variants
export type BadgeStyleVariant = 'subtle' | 'solid' | 'outline'
// Legacy variants that map to status + style (backwards compatibility)
export type BadgeLegacyVariant = 'soft' | 'success' | 'warning' | 'danger' | 'neutral' | 'primary' | 'info'
export type BadgeVariant = BadgeStyleVariant | BadgeLegacyVariant

export interface BadgeProps {
  /** Status determines the color scheme */
  readonly status?: BadgeStatus
  /** Color scheme alias (backwards compatibility) */
  readonly colorScheme?: string
  /** Size preset */
  readonly size?: BadgeSize
  /** Visual variant */
  readonly variant?: BadgeVariant
  /** Shows status dot indicator */
  readonly dot?: boolean
  /** Badge content */
  readonly children: ReactNode
  /** Additional CSS classes */
  readonly className?: string
}

// =============================================================================
// STATUS STYLES - Using new design tokens
// =============================================================================

const subtleStatusStyles: Record<BadgeStatus, string> = {
  success: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-text)]',
  warning: 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)]',
  danger: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)]',
  info: 'bg-[var(--color-status-info-bg)] text-[var(--color-status-info-text)]',
  neutral: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
}

const solidStatusStyles: Record<BadgeStatus, string> = {
  success: 'bg-[var(--color-status-success-icon)] text-white',
  warning: 'bg-[var(--color-status-warning-icon)] text-white',
  danger: 'bg-[var(--color-status-danger-icon)] text-white',
  info: 'bg-[var(--color-status-info-icon)] text-white',
  neutral: 'bg-[var(--color-text-tertiary)] text-white',
}

const outlineStatusStyles: Record<BadgeStatus, string> = {
  success: 'bg-transparent border border-[var(--color-status-success-border)] text-[var(--color-status-success-text)]',
  warning: 'bg-transparent border border-[var(--color-status-warning-border)] text-[var(--color-status-warning-text)]',
  danger: 'bg-transparent border border-[var(--color-status-danger-border)] text-[var(--color-status-danger-text)]',
  info: 'bg-transparent border border-[var(--color-status-info-border)] text-[var(--color-status-info-text)]',
  neutral: 'bg-transparent border border-[var(--color-border-primary)] text-[var(--color-text-secondary)]',
}

const dotStyles: Record<BadgeStatus, string> = {
  success: 'bg-[var(--color-status-success-icon)]',
  warning: 'bg-[var(--color-status-warning-icon)]',
  danger: 'bg-[var(--color-status-danger-icon)]',
  info: 'bg-[var(--color-status-info-icon)]',
  neutral: 'bg-[var(--color-text-tertiary)]',
}

// =============================================================================
// SIZE STYLES
// =============================================================================

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-[var(--spacing-1-5)] text-[var(--font-size-2xs)] gap-[var(--spacing-1)]',
  md: 'h-6 px-[var(--spacing-2)] text-[var(--font-size-xs)] gap-[var(--spacing-1-5)]',
  lg: 'h-7 px-[var(--spacing-2-5)] text-[var(--font-size-sm)] gap-[var(--spacing-1-5)]',
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2 h-2',
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================

// Map legacy variants to status + style
function resolveLegacyVariant(variant: BadgeVariant, status: BadgeStatus): { resolvedStatus: BadgeStatus; resolvedStyle: BadgeStyleVariant } {
  // Legacy variants that are actually status colors
  const legacyStatusMap: Record<string, BadgeStatus> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    neutral: 'neutral',
    info: 'info',
    primary: 'info', // primary maps to info (blue)
  }

  // If variant is a legacy status name, use it as the status
  if (variant in legacyStatusMap) {
    return {
      resolvedStatus: legacyStatusMap[variant],
      resolvedStyle: 'subtle',
    }
  }

  // 'soft' is an alias for 'subtle'
  if (variant === 'soft') {
    return {
      resolvedStatus: status,
      resolvedStyle: 'subtle',
    }
  }

  // Standard style variants
  return {
    resolvedStatus: status,
    resolvedStyle: variant as BadgeStyleVariant,
  }
}

// Map colorScheme string to BadgeStatus
function resolveColorScheme(colorScheme: string | undefined): BadgeStatus | undefined {
  if (!colorScheme) return undefined
  const colorMap: Record<string, BadgeStatus> = {
    green: 'success',
    success: 'success',
    yellow: 'warning',
    amber: 'warning',
    orange: 'warning',
    warning: 'warning',
    red: 'danger',
    danger: 'danger',
    error: 'danger',
    blue: 'info',
    info: 'info',
    primary: 'info',
    gray: 'neutral',
    grey: 'neutral',
    neutral: 'neutral',
    purple: 'info',
    teal: 'success',
    cyan: 'info',
  }
  return colorMap[colorScheme.toLowerCase()] ?? 'neutral'
}

export default function Badge({
  status = 'neutral',
  colorScheme,
  size = 'md',
  variant = 'subtle',
  dot = false,
  children,
  className,
}: BadgeProps) {
  const styleVariants = {
    subtle: subtleStatusStyles,
    solid: solidStatusStyles,
    outline: outlineStatusStyles,
  }

  // colorScheme takes precedence if provided (backwards compatibility)
  const effectiveStatus = resolveColorScheme(colorScheme) ?? status
  const { resolvedStatus, resolvedStyle } = resolveLegacyVariant(variant, effectiveStatus)

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        'font-medium',
        'rounded-[var(--radius-sm)]',
        'whitespace-nowrap',
        'uppercase tracking-[var(--letter-spacing-wide)]',
        // Status styles
        styleVariants[resolvedStyle][resolvedStatus],
        // Size styles
        sizeStyles[size],
        className
      )}
    >
      {/* Status dot indicator */}
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            dotSizeStyles[size],
            dotStyles[resolvedStatus]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// =============================================================================
// SEMANTIC STATUS BADGE
// =============================================================================

export type StatusBadgeStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'error'
  | 'success'
  | 'warning'
  | 'draft'
  | 'archived'
  | 'processing'

interface StatusBadgeProps {
  readonly status: StatusBadgeStatus
  readonly children?: ReactNode
  readonly className?: string
  readonly dot?: boolean
}

const statusConfig: Record<StatusBadgeStatus, { badgeStatus: BadgeStatus; label: string }> = {
  active: { badgeStatus: 'success', label: 'Active' },
  inactive: { badgeStatus: 'neutral', label: 'Inactive' },
  pending: { badgeStatus: 'warning', label: 'Pending' },
  error: { badgeStatus: 'danger', label: 'Error' },
  success: { badgeStatus: 'success', label: 'Success' },
  warning: { badgeStatus: 'warning', label: 'Warning' },
  draft: { badgeStatus: 'neutral', label: 'Draft' },
  archived: { badgeStatus: 'neutral', label: 'Archived' },
  processing: { badgeStatus: 'info', label: 'Processing' },
}

export function StatusBadge({ status, children, className, dot = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge status={config.badgeStatus} dot={dot} className={className}>
      {children ?? config.label}
    </Badge>
  )
}

// =============================================================================
// COUNT BADGE
// =============================================================================

interface CountBadgeProps {
  readonly count: number
  readonly max?: number
  readonly status?: BadgeStatus
  readonly className?: string
}

export function CountBadge({ count, max = 99, status = 'danger', className }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()

  if (count === 0) return null

  return (
    <Badge status={status} variant="solid" size="sm" className={cn('min-w-5', className)}>
      {displayCount}
    </Badge>
  )
}

export { Badge }
