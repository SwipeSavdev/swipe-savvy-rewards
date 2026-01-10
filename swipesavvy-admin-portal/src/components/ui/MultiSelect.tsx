import { useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { useOutsideClick } from '@/utils/dom'
import Icon from './Icon'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  options: MultiSelectOption[]
  values: string[]
  onChange: (_values: string[]) => void
  className?: string
}

export default function MultiSelect({
  label,
  hint,
  error,
  placeholder = 'Select...',
  options,
  values,
  onChange,
  className,
}: MultiSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  useOutsideClick(rootRef, () => setOpen(false), open)

  const labelText = useMemo(() => {
    if (values.length === 0) return placeholder
    const picked = options.filter((o) => values.includes(o.value)).map((o) => o.label)
    if (picked.length <= 2) return picked.join(', ')
    return `${picked.length} selected`
  }, [values, options, placeholder])

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <div className="w-full" ref={rootRef}>
      {label ? <p className="mb-1 text-sm font-medium text-[var(--ss-text)]">{label}</p> : null}

      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-[var(--ss-surface)] px-3 text-sm shadow-sm transition-colors',
          error ? 'border-[var(--ss-danger)]' : 'border-[var(--ss-border)]',
          'hover:bg-[var(--ss-surface-alt)]',
          className,
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={cn('truncate text-left', values.length ? 'text-[var(--ss-text)]' : 'text-[var(--ss-text-muted)]')}>
          {labelText}
        </span>
        <Icon name="chevron_down" className="h-4 w-4 text-[var(--ss-text-muted)]" />
      </button>

      {open ? (
        <div className="mt-2 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] shadow-md">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((o) => {
              const checked = values.includes(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-[var(--ss-surface-alt)]',
                    checked && 'bg-[var(--ss-primary-soft)]',
                  )}
                  onClick={() => toggleValue(o.value)}
                >
                  <input type="checkbox" readOnly checked={checked} className="h-4 w-4" />
                  <span className={cn('truncate text-left', checked ? 'text-[var(--ss-primary)]' : 'text-[var(--ss-text)]')}>
                    {o.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--ss-border)] p-2">
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]"
              onClick={() => onChange([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm text-[var(--ss-primary)] hover:bg-[var(--ss-surface-alt)]"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-1 text-xs text-[var(--ss-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
    </div>
  )
}
