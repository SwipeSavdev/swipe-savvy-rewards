/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - CARD COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - default: Standard surface card with subtle border
 * - outlined: Stronger border for emphasis
 * - elevated: Subtle shadow for modal-like hierarchy
 *
 * Accessibility:
 * - Clickable cards have proper role and keyboard support
 * - Focus indicators are WCAG 2.2 AA compliant
 */

import { cn } from '@/utils/cn'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type CardVariant = 'default' | 'outlined' | 'elevated'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant */
  readonly variant?: CardVariant
  /** Internal padding */
  readonly padding?: CardPadding
  /** Adds hover effect */
  readonly hoverable?: boolean
  /** Makes card interactive with role="button" */
  readonly clickable?: boolean
  readonly children: ReactNode
}

// =============================================================================
// STYLES
// =============================================================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-[var(--color-bg-primary)] border border-[var(--color-border-tertiary)]',
  outlined: 'bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)]',
  elevated: 'bg-[var(--color-bg-primary)] shadow-[var(--shadow-md)]',
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-[var(--spacing-3)]',
  md: 'p-[var(--spacing-5)]',
  lg: 'p-[var(--spacing-6)]',
}

// =============================================================================
// CARD COMPONENT
// =============================================================================

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = hoverable || clickable

    const handleKeyDown = clickable
      ? (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
          }
        }
      : undefined

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-[var(--radius-lg)]',
          'transition-all duration-[var(--duration-fast)]',
          // Variant styles
          variantStyles[variant],
          // Padding styles
          paddingStyles[padding],
          // Interactive styles
          isInteractive && [
            'hover:shadow-[var(--shadow-md)]',
            'hover:border-[var(--color-border-primary)]',
          ],
          clickable && [
            'cursor-pointer',
            'active:shadow-[var(--shadow-sm)]',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-[var(--color-border-focus)]',
            'focus-visible:ring-offset-2',
          ],
          className
        )}
        {...(clickable && {
          onClick,
          onKeyDown: handleKeyDown,
          role: 'button',
          tabIndex: 0,
        })}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// =============================================================================
// CARD HEADER
// =============================================================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  readonly title?: string
  readonly subtitle?: string
  readonly action?: ReactNode
  readonly children?: ReactNode
  readonly bordered?: boolean
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, bordered = false, className, ...props }, ref) => {
    // Custom children mode
    if (children) {
      return (
        <div
          ref={ref}
          className={cn(
            'mb-[var(--spacing-4)]',
            bordered && 'pb-[var(--spacing-4)] border-b border-[var(--color-border-primary)]',
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Title/subtitle mode
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-[var(--spacing-4)]',
          'mb-[var(--spacing-4)]',
          bordered && 'pb-[var(--spacing-4)] border-b border-[var(--color-border-primary)]',
          className
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text-primary)] leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] mt-[var(--spacing-1)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// =============================================================================
// CARD BODY
// =============================================================================

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

// =============================================================================
// CARD FOOTER
// =============================================================================

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode
  readonly align?: 'left' | 'center' | 'right' | 'between'
  readonly bordered?: boolean
}

const footerAlignStyles: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, align = 'right', bordered = true, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-[var(--spacing-3)]',
          'mt-[var(--spacing-4)]',
          bordered && 'pt-[var(--spacing-4)] border-t border-[var(--color-border-primary)]',
          footerAlignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

export default Card
export { Card }
