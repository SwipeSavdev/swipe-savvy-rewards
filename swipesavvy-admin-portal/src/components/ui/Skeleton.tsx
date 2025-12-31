import { cn } from '@/utils/cn'

export interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-[var(--ss-surface-alt)]', className)} />
}
