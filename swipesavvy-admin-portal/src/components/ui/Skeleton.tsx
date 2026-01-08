/**
 * SwipeSavvy Admin Portal - Bank-Grade Skeleton Component
 * Version: 4.0
 */

import { cn } from '@/utils/cn'

export interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-sm bg-bg-muted',
        className
      )}
    />
  )
}
