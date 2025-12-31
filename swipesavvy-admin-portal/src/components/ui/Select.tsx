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
      {label ? <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-[var(--ss-text)]">{label}</label> : null}
      <select
        id={selectId}
        className={cn(
          'h-10 w-full rounded-md border bg-[var(--ss-surface)] px-3 text-sm shadow-sm transition-colors focus:outline-none focus:shadow-md focus:border-[rgba(35,83,147,0.35)]',
          error ? 'border-[var(--ss-danger)]' : 'border-[var(--ss-border)]',
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
      {error ? <p className="mt-1 text-xs text-[var(--ss-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
    </div>
  )
}
