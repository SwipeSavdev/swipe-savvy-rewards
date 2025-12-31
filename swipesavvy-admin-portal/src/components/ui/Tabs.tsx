import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type TabsVariant = 'default' | 'pills' | 'underline'

export interface TabItem {
  key: string
  label: string
  content: ReactNode
  badge?: number
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  onChange?: (key: string) => void
  variant?: TabsVariant
  className?: string
}

export default function Tabs({ items, value, onChange, variant = 'default', className }: TabsProps) {
  const [internal, setInternal] = useState(items[0]?.key)
  const active = value ?? internal

  const setActive = (key: string) => {
    onChange?.(key)
    if (!onChange) setInternal(key)
  }

  const tabStyle: Record<TabsVariant, string> = {
    default: 'rounded-md border border-[var(--ss-border)] bg-[var(--ss-surface)] p-1',
    pills: 'rounded-[var(--ss-radius-pill)] bg-[var(--ss-surface-alt)] p-1',
    underline: 'border-b border-[var(--ss-border)]',
  }

  const buttonBase = 'text-sm font-medium transition-colors'

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex items-center gap-1', tabStyle[variant])}>
        {items.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                buttonBase,
                variant === 'underline'
                  ? cn(
                      'relative px-3 py-2 text-[var(--ss-text-muted)] hover:text-[var(--ss-text)]',
                      isActive && 'text-[var(--ss-primary)]',
                    )
                  : cn(
                      'rounded-md px-3 py-2',
                      isActive
                        ? 'bg-[var(--ss-primary-soft)] text-[var(--ss-primary)]'
                        : 'text-[var(--ss-text-muted)] hover:text-[var(--ss-text)] hover:bg-[var(--ss-surface-alt)]',
                    ),
              )}
              aria-current={isActive}
            >
              <span className="inline-flex items-center gap-2">
                {t.label}
                {typeof t.badge === 'number' ? (
                  <span className="rounded-[var(--ss-radius-pill)] bg-[var(--ss-surface)] px-2 py-0.5 text-xs text-[var(--ss-text-muted)]">
                    {t.badge}
                  </span>
                ) : null}
              </span>
              {variant === 'underline' && isActive ? (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--ss-primary)]" />
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-4">
        {items.map((t) => (t.key === active ? <div key={t.key}>{t.content}</div> : null))}
      </div>
    </div>
  )
}
