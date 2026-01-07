import { cn } from '@/utils/cn'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export type InputVariant = 'default' | 'filled' | 'flushed'
export type InputSize = 'sm' | 'md' | 'lg'
export type InputState = 'default' | 'error' | 'success'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  readonly variant?: InputVariant
  readonly size?: InputSize
  readonly state?: InputState
  readonly label?: string
  readonly helperText?: string
  readonly errorText?: string
  readonly successText?: string
  readonly leftIcon?: ReactNode
  readonly rightIcon?: ReactNode
  readonly isRequired?: boolean
  // Backward compatibility aliases
  /** @deprecated Use `leftIcon` instead */
  readonly leftSlot?: ReactNode
  /** @deprecated Use `rightIcon` instead */
  readonly rightSlot?: ReactNode
  /** @deprecated Use `errorText` instead */
  readonly error?: string
  /** @deprecated Use `helperText` instead */
  readonly hint?: string
}

const baseStyles = `
  w-full bg-transparent
  text-[var(--ss-text-primary)]
  placeholder:text-[var(--ss-text-tertiary)]
  focus:outline-none
  disabled:cursor-not-allowed disabled:opacity-50
  transition-colors duration-base
`

const variantStyles: Record<InputVariant, string> = {
  default: `
    border border-[var(--ss-border)]
    rounded-ss-lg
    bg-white dark:bg-ss-gray-800
    focus:border-ss-navy-500 focus:ring-2 focus:ring-ss-navy-500/20
  `,
  filled: `
    border border-transparent
    rounded-ss-lg
    bg-ss-gray-100 dark:bg-ss-gray-800
    focus:bg-white dark:focus:bg-ss-gray-700
    focus:border-ss-navy-500 focus:ring-2 focus:ring-ss-navy-500/20
  `,
  flushed: `
    border-0 border-b-2 border-[var(--ss-border)]
    rounded-none
    bg-transparent
    focus:border-ss-navy-500
    px-0
  `,
}

const sizeStyles: Record<InputSize, { wrapper: string; input: string; icon: string }> = {
  sm: {
    wrapper: 'h-8',
    input: 'px-2.5 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    wrapper: 'h-10',
    input: 'px-3 py-2 text-sm',
    icon: 'w-5 h-5',
  },
  lg: {
    wrapper: 'h-12',
    input: 'px-4 py-3 text-base',
    icon: 'w-5 h-5',
  },
}

const stateStyles: Record<InputState, { wrapper: string; text: string }> = {
  default: {
    wrapper: '',
    text: '',
  },
  error: {
    wrapper: 'border-ss-red-500 focus:border-ss-red-500 focus:ring-ss-red-500/20',
    text: 'text-ss-red-500',
  },
  success: {
    wrapper: 'border-ss-green-500 focus:border-ss-green-500 focus:ring-ss-green-500/20',
    text: 'text-ss-green-500',
  },
}

const labelSizeStyles: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

function getActualState(
  errorText: string | undefined,
  successText: string | undefined,
  state: InputState
): InputState {
  if (errorText) return 'error'
  if (successText) return 'success'
  return state
}

function getAriaDescribedBy(
  inputId: string | undefined,
  showError: boolean,
  showHelper: boolean
): string | undefined {
  if (showError) return `${inputId}-error`
  if (showHelper) return `${inputId}-helper`
  return undefined
}

function getIconPadding(
  hasIcon: boolean,
  variant: InputVariant,
  side: 'left' | 'right'
): string {
  if (!hasIcon) return ''
  if (variant === 'flushed') {
    return side === 'left' ? 'pl-6' : 'pr-6'
  }
  return side === 'left' ? 'pl-10' : 'pr-10'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      state = 'default',
      label,
      helperText,
      errorText,
      successText,
      leftIcon,
      rightIcon,
      isRequired,
      // Backward compatibility
      leftSlot,
      rightSlot,
      error,
      hint,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // Merge backward-compatible props with new props
    const resolvedLeftIcon = leftIcon ?? leftSlot
    const resolvedRightIcon = rightIcon ?? rightSlot
    const resolvedErrorText = errorText ?? error
    const resolvedHelperText = helperText ?? hint

    const inputId = id ?? props.name
    const actualState = getActualState(resolvedErrorText, successText, state)
    const showError = actualState === 'error' && Boolean(resolvedErrorText)
    const showSuccess = actualState === 'success' && Boolean(successText)
    const showHelper = !showError && !showSuccess && Boolean(resolvedHelperText)

    const wrapperClasses = cn(
      'relative flex items-center',
      sizeStyles[size].wrapper,
      variantStyles[variant],
      stateStyles[actualState].wrapper,
      disabled && 'opacity-50 cursor-not-allowed'
    )

    const inputClasses = cn(
      baseStyles,
      sizeStyles[size].input,
      getIconPadding(Boolean(resolvedLeftIcon), variant, 'left'),
      getIconPadding(Boolean(resolvedRightIcon), variant, 'right'),
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-1.5 block font-medium text-[var(--ss-text-primary)]',
              labelSizeStyles[size]
            )}
          >
            {label}
            {isRequired && <span className="ml-1 text-ss-red-500">*</span>}
          </label>
        )}

        <div className={wrapperClasses}>
          {resolvedLeftIcon && (
            <span
              className={cn(
                'absolute left-3 flex items-center text-[var(--ss-text-tertiary)]',
                variant === 'flushed' && 'left-0',
                sizeStyles[size].icon
              )}
            >
              {resolvedLeftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={actualState === 'error'}
            aria-describedby={getAriaDescribedBy(inputId, showError, showHelper)}
            className={inputClasses}
            {...props}
          />

          {resolvedRightIcon && (
            <span
              className={cn(
                'absolute right-3 flex items-center text-[var(--ss-text-tertiary)]',
                variant === 'flushed' && 'right-0',
                sizeStyles[size].icon
              )}
            >
              {resolvedRightIcon}
            </span>
          )}
        </div>

        {showError && (
          <p
            id={`${inputId}-error`}
            className={cn('mt-1.5 text-xs', stateStyles.error.text)}
          >
            {resolvedErrorText}
          </p>
        )}

        {showSuccess && (
          <p
            id={`${inputId}-success`}
            className={cn('mt-1.5 text-xs', stateStyles.success.text)}
          >
            {successText}
          </p>
        )}

        {showHelper && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-[var(--ss-text-tertiary)]"
          >
            {resolvedHelperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

export { Input }
