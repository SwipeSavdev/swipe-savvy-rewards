import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}

export default function Input({ label, hint, error, leftSlot, rightSlot, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-[var(--ss-text)]">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'flex items-center gap-2 rounded-md border bg-[var(--ss-surface)] px-3 py-2 shadow-sm transition-colors',
          error ? 'border-[var(--ss-danger)]' : 'border-[var(--ss-border)]',
          'focus-within:ring-0 focus-within:shadow-md focus-within:border-[rgba(35,83,147,0.35)]',
          className,
        )}
      >
        {leftSlot}
        <input
          id={inputId}
          className={cn(
            'w-full bg-transparent text-sm text-[var(--ss-text)] placeholder:text-[var(--ss-text-muted)] focus:outline-none',
          )}
          {...props}
        />
        {rightSlot}
      </div>

      {error ? <p className="mt-1 text-xs text-[var(--ss-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
    </div>
  )
}
