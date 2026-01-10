import { useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { useOutsideClick } from '@/utils/dom'
import Icon from './Icon'

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxProps {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  options: ComboboxOption[]
  value: string | null
  onChange: (_value: string | null) => void
  className?: string
}

export default function Combobox({
  label,
  hint,
  error,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  className,
}: ComboboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useOutsideClick(rootRef, () => setOpen(false), open)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const selected = options.find((o) => o.value === value) ?? null

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
        <span className={cn('truncate text-left', selected ? 'text-[var(--ss-text)]' : 'text-[var(--ss-text-muted)]')}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevron_down" className="h-4 w-4 text-[var(--ss-text-muted)]" />
      </button>

      {open ? (
        <div className="mt-2 rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] shadow-md">
          <div className="border-b border-[var(--ss-border)] p-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface)] px-3 text-sm focus:outline-none focus:border-[rgba(35,83,147,0.35)]"
            />
          </div>

          <div className="max-h-56 overflow-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[var(--ss-text-muted)]">No results</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-[var(--ss-surface-alt)]',
                    o.value === value && 'bg-[var(--ss-primary-soft)] text-[var(--ss-primary)]',
                  )}
                >
                  <span className="truncate text-left">{o.label}</span>
                  {o.value === value ? <Icon name="check_circle" className="h-4 w-4" /> : null}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-[var(--ss-border)] p-2">
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-sm text-[var(--ss-text-muted)] hover:bg-[var(--ss-surface-alt)]"
              onClick={() => {
                onChange(null)
                setOpen(false)
                setQuery('')
              }}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-1 text-xs text-[var(--ss-danger)]">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{hint}</p> : null}
    </div>
  )
}
