/**
 * ============================================================================
 * SWIPESAVVY ADMIN PORTAL - INPUT COMPONENT V5
 * COMPLETE RESET - Built from scratch
 * ============================================================================
 *
 * Design Philosophy: PRECISION OVER DELIGHT
 * - Clear label positioning above input
 * - Helper text for guidance
 * - Error state with danger status color
 * - Disabled state with proper visual feedback
 * - WCAG 2.2 AA compliant focus indicators
 *
 * Accessibility:
 * - aria-invalid for error states
 * - aria-describedby for helper/error text
 * - Required field indication
 * - Proper label association
 */

import { cn } from '@/utils/cn'
import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type InputSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size preset */
  readonly size?: InputSize
  /** Visual state */
  readonly state?: InputState
  /** Label text displayed above input */
  readonly label?: string
  /** Helper text displayed below input */
  readonly helperText?: string
  /** Error message (sets state to error automatically) */
  readonly errorText?: string
  /** Error message alias (backwards compatibility) */
  readonly error?: string
  /** Icon displayed on the left side */
  readonly leftIcon?: ReactNode
  /** Icon displayed on the right side */
  readonly rightIcon?: ReactNode
  /** Right slot alias (backwards compatibility) */
  readonly rightSlot?: ReactNode
  /** Marks field as required */
  readonly isRequired?: boolean
  /** Full-width container */
  readonly fullWidth?: boolean
}

// =============================================================================
// SIZE STYLES
// =============================================================================

const sizeConfig: Record<InputSize, { wrapper: string; input: string; icon: string; label: string }> = {
  sm: {
    wrapper: 'h-[var(--component-height-sm)]',
    input: 'px-[var(--spacing-3)] text-[var(--font-size-sm)]',
    icon: 'w-4 h-4',
    label: 'text-[var(--font-size-xs)]',
  },
  md: {
    wrapper: 'h-[var(--component-height-md)]',
    input: 'px-[var(--spacing-3)] text-[var(--font-size-base)]',
    icon: 'w-4 h-4',
    label: 'text-[var(--font-size-sm)]',
  },
  lg: {
    wrapper: 'h-[var(--component-height-lg)]',
    input: 'px-[var(--spacing-4)] text-[var(--font-size-base)]',
    icon: 'w-5 h-5',
    label: 'text-[var(--font-size-sm)]',
  },
}

// =============================================================================
// STATE STYLES
// =============================================================================

const stateStyles: Record<InputState, string> = {
  default: [
    'border-[var(--color-border-primary)]',
    'hover:border-[var(--color-border-secondary)]',
    'focus:border-[var(--color-border-focus)]',
    'focus:ring-[var(--color-border-focus)]',
  ].join(' '),
  error: [
    'border-[var(--color-status-danger-border)]',
    'focus:border-[var(--color-status-danger-border)]',
    'focus:ring-[var(--color-status-danger-icon)]',
  ].join(' '),
  success: [
    'border-[var(--color-status-success-border)]',
    'focus:border-[var(--color-status-success-border)]',
    'focus:ring-[var(--color-status-success-icon)]',
  ].join(' '),
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getAriaDescribedBy(
  inputId: string,
  showError: boolean,
  showHelper: boolean
): string | undefined {
  if (showError) return `${inputId}-error`
  if (showHelper) return `${inputId}-helper`
  return undefined
}

function getIconPadding(hasIcon: boolean, side: 'left' | 'right'): string {
  if (!hasIcon) return ''
  return side === 'left' ? 'pl-10' : 'pr-10'
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorText,
      error, // backwards compatibility alias
      leftIcon,
      rightIcon,
      rightSlot, // backwards compatibility alias
      isRequired,
      fullWidth = true,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    // Support both errorText and error props
    const resolvedErrorText = errorText ?? error
    // Support both rightIcon and rightSlot props
    const resolvedRightIcon = rightIcon ?? rightSlot

    // Error text automatically sets state to error
    const actualState = resolvedErrorText ? 'error' : state
    const showError = actualState === 'error' && Boolean(resolvedErrorText)
    const showHelper = !showError && Boolean(helperText)

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-[var(--spacing-1-5)] block font-medium text-[var(--color-text-secondary)]',
              sizeConfig[size].label
            )}
          >
            {label}
            {isRequired && (
              <span className="ml-0.5 text-[var(--color-status-danger-text)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className={cn('relative flex items-center', sizeConfig[size].wrapper)}>
          {/* Left icon */}
          {leftIcon && (
            <span
              className={cn(
                'absolute left-[var(--spacing-3)] flex items-center',
                'text-[var(--color-text-tertiary)] pointer-events-none',
                sizeConfig[size].icon
              )}
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={actualState === 'error'}
            aria-required={isRequired}
            aria-describedby={getAriaDescribedBy(inputId, showError, showHelper)}
            className={cn(
              // Base styles
              'w-full h-full',
              'bg-[var(--color-bg-primary)]',
              'text-[var(--color-text-primary)]',
              'placeholder:text-[var(--color-text-tertiary)]',
              'border rounded-[var(--radius-sm)]',
              'transition-colors duration-[var(--duration-fast)]',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-opacity-20',
              // Disabled styles
              'disabled:bg-[var(--color-bg-secondary)]',
              'disabled:text-[var(--color-text-tertiary)]',
              'disabled:cursor-not-allowed',
              'disabled:opacity-60',
              // Size-specific styles
              sizeConfig[size].input,
              // State styles
              stateStyles[actualState],
              // Icon padding
              getIconPadding(Boolean(leftIcon), 'left'),
              getIconPadding(Boolean(resolvedRightIcon), 'right'),
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {resolvedRightIcon && (
            <span
              className={cn(
                'absolute right-[var(--spacing-3)] flex items-center',
                'text-[var(--color-text-tertiary)] pointer-events-none',
                sizeConfig[size].icon
              )}
              aria-hidden="true"
            >
              {resolvedRightIcon}
            </span>
          )}
        </div>

        {/* Error text */}
        {showError && (
          <p
            id={`${inputId}-error`}
            className="mt-[var(--spacing-1-5)] text-[var(--font-size-xs)] text-[var(--color-status-danger-text)]"
            role="alert"
          >
            {resolvedErrorText}
          </p>
        )}

        {/* Helper text */}
        {showHelper && (
          <p
            id={`${inputId}-helper`}
            className="mt-[var(--spacing-1-5)] text-[var(--font-size-xs)] text-[var(--color-text-tertiary)]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
export { Input }
