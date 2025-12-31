import type { FormHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

const gapMap = {
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-6',
} as const

export default function Form({ children, className, spacing = 'md', ...props }: FormProps) {
  return (
    <form className={cn(gapMap[spacing], className)} {...props}>
      {children}
    </form>
  )
}
