/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - BUTTON COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - Primary: Main page action (one per view)
 * - Secondary: Alternative actions, outlined style
 * - Ghost: Tertiary actions, minimal visual weight
 * - Danger: Destructive actions (always require confirmation)
 *
 * Accessibility:
 * - WCAG 2.2 AA compliant focus indicators
 * - Keyboard navigable
 * - aria-busy state for loading
 * - Minimum 44px touch target (lg size)
 */

import { cn } from '@/utils/cn'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-outline'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  readonly variant?: ButtonVariant
  /** Size preset */
  readonly size?: ButtonSize
  /** Shows loading spinner and disables interactions */
  readonly loading?: boolean
  /** Icon displayed before children */
  readonly leftIcon?: ReactNode
  /** Icon displayed after children */
  readonly rightIcon?: ReactNode
  /** Expands to full container width */
  readonly fullWidth?: boolean
  /** Renders as icon-only button (square) */
  readonly iconOnly?: boolean
}

// =============================================================================
// STYLES
// =============================================================================

const baseStyles = [
  'inline-flex items-center justify-center',
  'font-medium',
  'rounded-[var(--radius-sm)]',
  'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
].join(' ')

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-action-primary-bg)]',
    '!text-white',
    'hover:bg-[var(--color-action-primary-bg-hover)]',
    'active:bg-[var(--color-action-primary-bg-active)]',
  ].join(' '),

  secondary: [
    'bg-[var(--color-action-secondary-bg)]',
    'text-[var(--color-action-secondary-text)]',
    'border border-[var(--color-action-secondary-border)]',
    'hover:bg-[var(--color-action-secondary-bg-hover)]',
    'active:bg-[var(--color-action-secondary-bg-active)]',
  ].join(' '),

  // Alias for secondary (backwards compatibility)
  outline: [
    'bg-[var(--color-action-secondary-bg)]',
    'text-[var(--color-action-secondary-text)]',
    'border border-[var(--color-action-secondary-border)]',
    'hover:bg-[var(--color-action-secondary-bg-hover)]',
    'active:bg-[var(--color-action-secondary-bg-active)]',
  ].join(' '),

  ghost: [
    'bg-[var(--color-action-ghost-bg)]',
    'text-[var(--color-action-ghost-text)]',
    'hover:bg-[var(--color-action-ghost-bg-hover)]',
    'hover:text-[var(--color-text-primary)]',
    'active:bg-[var(--color-action-ghost-bg-active)]',
  ].join(' '),

  danger: [
    'bg-[var(--color-action-danger-bg)]',
    '!text-white',
    'hover:bg-[var(--color-action-danger-bg-hover)]',
    'active:bg-[var(--color-action-danger-bg-active)]',
  ].join(' '),

  'danger-outline': [
    'bg-transparent',
    'text-[var(--color-status-danger-text)]',
    'border border-[var(--color-status-danger-border)]',
    'hover:bg-[var(--color-status-danger-bg)]',
    'active:bg-[var(--color-status-danger-bg)]',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-[var(--component-height-xs)] px-[var(--spacing-2)] text-[var(--font-size-xs)] gap-[var(--spacing-1)]',
  sm: 'h-[var(--component-height-sm)] px-[var(--spacing-3)] text-[var(--font-size-sm)] gap-[var(--spacing-1-5)]',
  md: 'h-[var(--component-height-md)] px-[var(--spacing-4)] text-[var(--font-size-sm)] gap-[var(--spacing-2)]',
  lg: 'h-[var(--component-height-lg)] px-[var(--spacing-5)] text-[var(--font-size-base)] gap-[var(--spacing-2)]',
}

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: 'h-[var(--component-height-xs)] w-[var(--component-height-xs)] p-0',
  sm: 'h-[var(--component-height-sm)] w-[var(--component-height-sm)] p-0',
  md: 'h-[var(--component-height-md)] w-[var(--component-height-md)] p-0',
  lg: 'h-[var(--component-height-lg)] w-[var(--component-height-lg)] p-0',
}

const spinnerSizes: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

// =============================================================================
// LOADING SPINNER
// =============================================================================

function LoadingSpinner({ size }: Readonly<{ size: ButtonSize }>) {
  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// =============================================================================
// BUTTON COMPONENT
// =============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      iconOnly = false,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && <LoadingSpinner size={size} />}

        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {/* Button text */}
        {!iconOnly && children && (
          <span className={cn(loading && 'sr-only')}>{children}</span>
        )}

        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
export { Button }
