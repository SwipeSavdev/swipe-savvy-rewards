import { cn } from '@/utils/cn'
import type { InputHTMLAttributes, ReactNode } from 'react'

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
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-[#235393] dark:text-[#7ACD56] uppercase tracking-wide">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'flex items-center gap-2 rounded-md border bg-gradient-to-r from-white to-slate-50/80 dark:from-slate-800 dark:to-slate-750 px-3 py-2 shadow-sm transition-all duration-200',
          error ? 'border-red-500' : 'border-[#235393]/20',
          'focus-within:ring-2 focus-within:ring-[#235393]/30 focus-within:shadow-md focus-within:border-[#235393] focus-within:bg-white dark:focus-within:bg-slate-800',
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
