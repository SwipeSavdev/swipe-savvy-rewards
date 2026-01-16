import { cn } from '../../utils/cn'

export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const defaultHeight = {
    text: 'h-4',
    circular: 'h-10 w-10',
    rectangular: 'h-20',
  }

  return (
    <div
      className={cn(
        'animate-skeleton bg-neutral-200 dark:bg-neutral-700',
        variants[variant],
        !height && defaultHeight[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

// Pre-built skeleton patterns
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-card border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-24" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center gap-3 p-4">
      <Skeleton variant="circular" className="w-9 h-9" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-3" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="w-16 h-4 ml-auto" />
        <Skeleton className="w-12 h-3 ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonBalance() {
  return (
    <div className="bg-gradient-card rounded-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" className="w-9 h-9 bg-white/20" />
        <Skeleton className="w-20 h-3 bg-white/20" />
      </div>
      <Skeleton className="w-40 h-8 bg-white/20" />
      <Skeleton className="w-24 h-3 bg-white/20" />
    </div>
  )
}
