import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WidgetType = 'stat-card' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'area-chart' | 'table'

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  order: number
  visible: boolean
  size: 'small' | 'medium' | 'large'
  dataKey?: string
}

interface DashboardWidgetState {
  mainDashboardWidgets: DashboardWidget[]
  supportDashboardWidgets: DashboardWidget[]
  setMainDashboardWidgets: (_widgets: DashboardWidget[]) => void
  setSupportDashboardWidgets: (_widgets: DashboardWidget[]) => void
  toggleWidgetVisibility: (_dashboard: 'mainDashboard' | 'supportDashboard', _widgetId: string) => void
  reorderWidgets: (_dashboard: 'mainDashboard' | 'supportDashboard', _widgets: DashboardWidget[]) => void
  resetToDefaults: (_dashboard: 'mainDashboard' | 'supportDashboard') => void
}

const defaultMainWidgets: DashboardWidget[] = [
  { id: '1', type: 'stat-card', title: 'Users', order: 1, visible: true, size: 'small' },
  { id: '2', type: 'stat-card', title: 'Transactions', order: 2, visible: true, size: 'small' },
  { id: '3', type: 'stat-card', title: 'Revenue', order: 3, visible: true, size: 'small' },
  { id: '4', type: 'stat-card', title: 'Growth', order: 4, visible: true, size: 'small' },
  { id: '5', type: 'line-chart', title: 'Transactions Volume (30 days)', order: 5, visible: true, size: 'medium', dataKey: 'transactions' },
  { id: '6', type: 'area-chart', title: 'Revenue Trend (30 days)', order: 6, visible: true, size: 'medium', dataKey: 'revenue' },
  { id: '7', type: 'bar-chart', title: 'Top Merchants', order: 7, visible: true, size: 'large', dataKey: 'merchants' },
  { id: '8', type: 'pie-chart', title: 'Transaction Distribution', order: 8, visible: true, size: 'medium', dataKey: 'distribution' },
]

const defaultSupportWidgets: DashboardWidget[] = [
  { id: '1', type: 'stat-card', title: 'Open tickets', order: 1, visible: true, size: 'small' },
  { id: '2', type: 'stat-card', title: 'In progress', order: 2, visible: true, size: 'small' },
  { id: '3', type: 'stat-card', title: 'Resolved today', order: 3, visible: true, size: 'small' },
  { id: '4', type: 'stat-card', title: 'First response', order: 4, visible: true, size: 'small' },
  { id: '5', type: 'bar-chart', title: 'Tickets by Priority', order: 5, visible: true, size: 'medium', dataKey: 'priority' },
  { id: '6', type: 'line-chart', title: 'Resolution Time Trend', order: 6, visible: true, size: 'medium', dataKey: 'resolutionTime' },
  { id: '7', type: 'pie-chart', title: 'Ticket Status Distribution', order: 7, visible: true, size: 'medium', dataKey: 'statusDistribution' },
  { id: '8', type: 'bar-chart', title: 'SLA Compliance', order: 8, visible: true, size: 'large', dataKey: 'slaCompliance' },
]

export const useDashboardWidgetStore = create<DashboardWidgetState>()(
  persist(
    (set) => ({
      mainDashboardWidgets: defaultMainWidgets,
      supportDashboardWidgets: defaultSupportWidgets,

      setMainDashboardWidgets: (widgets) => set({ mainDashboardWidgets: widgets }),
      setSupportDashboardWidgets: (widgets) => set({ supportDashboardWidgets: widgets }),

      toggleWidgetVisibility: (dashboard, widgetId) => {
        set((state) => {
          const widgets = dashboard === 'mainDashboard' ? state.mainDashboardWidgets : state.supportDashboardWidgets
          const updated = widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
          return dashboard === 'mainDashboard'
            ? { mainDashboardWidgets: updated }
            : { supportDashboardWidgets: updated }
        })
      },

      reorderWidgets: (dashboard, widgets) => {
        set(
          dashboard === 'mainDashboard'
            ? { mainDashboardWidgets: widgets }
            : { supportDashboardWidgets: widgets },
        )
      },

      resetToDefaults: (dashboard) => {
        set(
          dashboard === 'mainDashboard'
            ? { mainDashboardWidgets: defaultMainWidgets }
            : { supportDashboardWidgets: defaultSupportWidgets },
        )
      },
    }),
    {
      name: 'dashboard-widgets',
    },
  ),
)
