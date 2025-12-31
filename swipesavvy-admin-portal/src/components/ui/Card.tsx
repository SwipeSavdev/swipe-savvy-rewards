import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface)] shadow-sm',
        hover && 'transition-shadow hover:shadow-md hover:border-[rgba(35,83,147,0.25)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
