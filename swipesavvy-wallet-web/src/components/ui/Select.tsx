import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full rounded-input border bg-white dark:bg-neutral-800',
              'text-neutral-900 dark:text-neutral-100',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'transition-colors duration-normal appearance-none',
              error
                ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500'
                : 'border-neutral-300 dark:border-neutral-600',
              'pl-3 pr-10 py-2.5 text-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50 dark:disabled:bg-neutral-900',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
        {error && <p className="text-sm text-danger-600 dark:text-danger-400">{error}</p>}
        {hint && !error && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
