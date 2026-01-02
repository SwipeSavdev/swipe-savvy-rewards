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
        'rounded-lg border border-[var(--ss-border)] bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 shadow-sm backdrop-blur-sm',
        hover && 'transition-all duration-200 hover:shadow-lg hover:border-[#235393]/25 hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
