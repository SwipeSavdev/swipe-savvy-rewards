import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'neutral'
}

export function Spinner({ className, size = 'md', color = 'primary' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    neutral: 'text-neutral-500',
  }

  return (
    <Loader2
      className={cn('animate-spin', sizes[size], colors[color], className)}
    />
  )
}

// Full page loading spinner
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-modal">
      <div className="text-center space-y-3">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        )}
      </div>
    </div>
  )
}

// Inline loading indicator
export function LoadingInline({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Spinner />
    </div>
  )
}
