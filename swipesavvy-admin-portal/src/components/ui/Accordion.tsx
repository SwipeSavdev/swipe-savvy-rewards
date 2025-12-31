import { useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Icon from './Icon'

export interface AccordionItem {
  key: string
  title: string
  content: ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
  defaultOpenKeys?: string[]
  className?: string
}

export default function Accordion({ items, multiple, defaultOpenKeys = [], className }: AccordionProps) {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys)

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const isOpen = prev.includes(key)
      if (multiple) {
        return isOpen ? prev.filter((k) => k !== key) : [...prev, key]
      }
      return isOpen ? [] : [key]
    })
  }

  return (
    <div className={cn('divide-y divide-[var(--ss-border)] rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)]', className)}>
      {items.map((item) => {
        const open = openKeys.includes(item.key)
        return (
          <div key={item.key}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[var(--ss-text)] hover:bg-[var(--ss-surface-alt)]"
              onClick={() => toggle(item.key)}
              aria-expanded={open}
            >
              <span>{item.title}</span>
              <Icon name={open ? 'minus' : 'plus'} className="h-4 w-4 text-[var(--ss-text-muted)]" />
            </button>
            {open ? <div className="px-4 pb-4 text-sm text-[var(--ss-text-muted)]">{item.content}</div> : null}
          </div>
        )
      })}
    </div>
  )
}
