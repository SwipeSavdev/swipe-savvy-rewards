import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  showCount?: boolean
  maxCount?: number
}

export default function TextArea({
  label,
  hint,
  error,
  showCount,
  maxCount,
  className,
  id,
  value,
  ...props
}: TextAreaProps) {
  const text = typeof value === 'string' ? value : ''
  const taId = id ?? props.name

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={taId} className="mb-1 block text-sm font-medium text-[var(--ss-text)]">
          {label}
        </label>
      ) : null}

      <textarea
        id={taId}
        value={value}
        className={cn(
          'min-h-[96px] w-full rounded-md border bg-[var(--ss-surface)] px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:shadow-md focus:border-[rgba(35,83,147,0.35)]',
          error ? 'border-[var(--ss-danger)]' : 'border-[var(--ss-border)]',
          className,
        )}
        {...props}
      />

      <div className="mt-1 flex items-center justify-between">
        <div>
          {error ? <p className="text-xs text-[var(--ss-danger)]">{error}</p> : null}
          {!error && hint ? <p className="text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
        </div>

        {showCount ? (
          <p className="text-xs text-[var(--ss-text-muted)]">
            {text.length}
            {typeof maxCount === 'number' ? ` / ${maxCount}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  )
}
