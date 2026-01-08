import { ReactNode } from 'react'
import Card from '@/components/ui/Card'
import Icon from '@/components/ui/Icon'
import { X, Maximize2 } from 'lucide-react'

export interface DashboardWidgetProps {
  id: string
  title: string
  subtitle?: string
  children: ReactNode
  onRemove?: () => void
  onExpand?: () => void
  isLoading?: boolean
  error?: string | null
}

export default function DashboardWidget({
  title,
  subtitle,
  children,
  onRemove,
  onExpand,
  isLoading,
  error,
}: DashboardWidgetProps) {
  return (
    <Card className="p-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-headline text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--ss-text-muted)]">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1 hover:bg-[var(--ss-surface-alt)] rounded transition-colors"
              title="Expand widget"
            >
              <Maximize2 className="w-4 h-4 text-[var(--ss-text-muted)]" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-[var(--ss-surface-alt)] rounded transition-colors"
              title="Remove widget"
            >
              <X className="w-4 h-4 text-[var(--ss-text-muted)]" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <Icon name="settings" className="h-6 w-6 text-[var(--ss-primary)]" />
              </div>
              <p className="mt-2 text-sm text-[var(--ss-text-muted)]">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Icon name="warning" className="h-6 w-6 text-[var(--ss-danger)] mx-auto" />
              <p className="mt-2 text-sm text-[var(--ss-danger)]">{error}</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  )
}
