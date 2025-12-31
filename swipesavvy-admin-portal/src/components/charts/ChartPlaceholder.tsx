import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export default function ChartPlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-[var(--ss-text-muted)]">{subtitle}</p> : null}
        </div>
        <span className="text-xs text-[var(--ss-text-muted)]">Placeholder</span>
      </div>

      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </Card>
  )
}
