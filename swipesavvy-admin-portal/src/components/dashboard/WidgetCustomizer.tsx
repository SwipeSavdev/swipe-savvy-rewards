import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import type { DashboardWidget } from '@/store/dashboardWidgetStore'
import { useDashboardWidgetStore } from '@/store/dashboardWidgetStore'

interface WidgetCustomizerProps {
  dashboard: 'mainDashboard' | 'supportDashboard'
  onClose: () => void
}

export default function WidgetCustomizer({ dashboard, onClose }: WidgetCustomizerProps) {
  const widgets = dashboard === 'mainDashboard' 
    ? useDashboardWidgetStore((s) => s.mainDashboardWidgets)
    : useDashboardWidgetStore((s) => s.supportDashboardWidgets)
  
  const toggleVisibility = useDashboardWidgetStore((s) => s.toggleWidgetVisibility)
  const resetToDefaults = useDashboardWidgetStore((s) => s.resetToDefaults)

  const visibleCount = widgets.filter(w => w.visible).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-[var(--ss-surface)] p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--ss-text)]">Customize Dashboard</h2>
          <button onClick={onClose} className="text-[var(--ss-text-muted)] hover:text-[var(--ss-text)]">
            <Icon name="search" className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 text-sm text-[var(--ss-text-muted)]">
          Showing {visibleCount} of {widgets.length} widgets
        </div>

        <div className="mb-6 max-h-96 space-y-2 overflow-y-auto">
          {widgets
            .sort((a, b) => a.order - b.order)
            .map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between rounded-lg border border-[var(--ss-border)] bg-[var(--ss-surface-alt)] p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--ss-text)]">{widget.title}</p>
                  <p className="text-xs text-[var(--ss-text-muted)]">{widget.type}</p>
                </div>
                <button
                  onClick={() => toggleVisibility(dashboard, widget.id)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                    widget.visible
                      ? 'bg-blue-500/20 text-blue-600'
                      : 'bg-gray-500/20 text-gray-600'
                  }`}
                >
                  {widget.visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => resetToDefaults(dashboard)} className="flex-1">
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
