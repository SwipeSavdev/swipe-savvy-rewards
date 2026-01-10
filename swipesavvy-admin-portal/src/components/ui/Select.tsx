import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption[]
}

export default function Select({ label, hint, error, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="w-full">
      {label ? <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">{label}</label> : null}
      <select
        id={selectId}
        className={cn(
          'h-10 w-full rounded-md border bg-[var(--color-bg-primary)] px-3 text-sm text-[var(--color-text-primary)] shadow-sm transition-colors focus:outline-none focus:shadow-md focus:border-[var(--color-action-primary-bg)]',
          error ? 'border-[var(--color-status-danger-border)]' : 'border-[var(--color-border-primary)]',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-[var(--color-status-danger-text)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">{hint}</p> : null}
    </div>
  )
}
