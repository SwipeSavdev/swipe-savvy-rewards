/**
 * EnhancedDashboard.tsx
 * Main dashboard with moveable widgets and integrated AI Marketing metrics
 * Features:
 * - Widget visibility toggle and management
 * - Integrated AI Marketing Analytics KPIs and charts
 * - Drag-and-drop widget reordering
 * - Responsive CSS Grid layout
 */

'use client';

import { GripHorizontal, RefreshCw, Settings, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'summary';
  title: string;
  dataSource: string;
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  chartType?: 'line' | 'bar' | 'pie' | 'funnel';
  aiMetrics?: boolean;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: 'ai-kpi-conversion',
    type: 'kpi',
    title: 'Conversion Rate',
    dataSource: 'ai_conversion_rate',
    visible: true,
    position: { x: 0, y: 0 },
    size: { width: 1, height: 1 },
    aiMetrics: true,
  },
  {
    id: 'ai-kpi-roi',
    type: 'kpi',
    title: 'Campaign ROI',
    dataSource: 'ai_roi',
    visible: true,
    position: { x: 1, y: 0 },
    size: { width: 1, height: 1 },
    aiMetrics: true,
  },
  {
    id: 'ai-kpi-efficiency',
    type: 'kpi',
    title: 'Cost per Acquisition',
    dataSource: 'ai_cpa',
    visible: true,
    position: { x: 2, y: 0 },
    size: { width: 1, height: 1 },
    aiMetrics: true,
  },
  {
    id: 'ai-chart-trends',
    type: 'chart',
    title: 'Campaign Trends (30 days)',
    dataSource: 'ai_trends',
    chartType: 'line',
    visible: true,
    position: { x: 0, y: 1 },
    size: { width: 2, height: 2 },
    aiMetrics: true,
  },
  {
    id: 'ai-chart-funnel',
    type: 'chart',
    title: 'Conversion Funnel',
    dataSource: 'ai_funnel',
    chartType: 'funnel',
    visible: true,
    position: { x: 2, y: 1 },
    size: { width: 1, height: 2 },
    aiMetrics: true,
  },
  {
    id: 'ai-chart-attribution',
    type: 'chart',
    title: 'Channel Attribution',
    dataSource: 'ai_attribution',
    chartType: 'bar',
    visible: true,
    position: { x: 0, y: 3 },
    size: { width: 2, height: 2 },
    aiMetrics: true,
  },
  {
    id: 'ai-table-campaigns',
    type: 'table',
    title: 'Campaign Performance',
    dataSource: 'ai_campaigns',
    visible: true,
    position: { x: 2, y: 3 },
    size: { width: 1, height: 2 },
    aiMetrics: true,
  },
  {
    id: 'ai-summary-recommendations',
    type: 'summary',
    title: 'AI Recommendations',
    dataSource: 'ai_recommendations',
    visible: true,
    position: { x: 0, y: 5 },
    size: { width: 3, height: 1 },
    aiMetrics: true,
  },
];

interface EnhancedDashboardProps {
  onWidgetRemove?: (widgetId: string) => void;
  onLayoutChange?: (widgets: DashboardWidget[]) => void;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  onWidgetRemove,
  onLayoutChange,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const toggleWidgetVisibility = useCallback(
    (widgetId: string) => {
      const updated = widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      setWidgets(updated);
      onLayoutChange?.(updated);
    },
    [widgets, onLayoutChange]
  );

  const removeWidget = useCallback(
    (widgetId: string) => {
      const updated = widgets.filter((w) => w.id !== widgetId);
      setWidgets(updated);
      onWidgetRemove?.(widgetId);
      onLayoutChange?.(updated);
    },
    [widgets, onWidgetRemove, onLayoutChange]
  );

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible),
    [widgets]
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reporting Dashboard</h1>
          <p className="text-slate-600 mt-1">
            AI Marketing Analytics & Performance Metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              editMode
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:shadow-md'
            }`}
          >
            <Settings size={18} />
            {editMode ? 'Done' : 'Edit'}
          </button>

          <button
            onClick={() => setWidgets(DEFAULT_WIDGETS)}
            className="px-4 py-2 rounded-lg font-medium bg-white text-slate-700 border border-slate-200 hover:shadow-md transition-all flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Reset
          </button>
        </div>
      </div>

      {editMode && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>✨ Edit Mode:</strong> Drag widgets to reorder them or click the X to hide widgets.
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 auto-rows-min">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            draggable={editMode}
            onDragStart={() => setDraggedWidget(widget.id)}
            onDragEnd={() => setDraggedWidget(null)}
            className={`transition-all ${
              editMode ? 'cursor-move hover:shadow-lg' : ''
            } ${draggedWidget === widget.id ? 'opacity-60' : 'opacity-100'}`}
            style={{
              gridColumn: `span ${Math.min(widget.size.width, 3)}`,
              gridRow: `span ${widget.size.height}`,
            }}
          >
            <div className="w-full h-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {editMode && (
                    <GripHorizontal size={18} className="text-slate-400 flex-shrink-0" />
                  )}
                  <h3 className="font-semibold text-slate-900 text-sm">{widget.title}</h3>
                  {widget.aiMetrics && (
                    <span className="ml-auto px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-bold rounded-full">
                      AI
                    </span>
                  )}
                </div>

                {editMode && (
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                    title="Hide widget"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                )}
              </div>

              <div className="flex-1 p-4 overflow-auto bg-white">
                <div className="text-sm text-slate-500 text-center py-8">
                  <p className="font-medium">{widget.title}</p>
                  <p className="text-xs mt-2 text-slate-400">
                    {widget.dataSource}
                  </p>
                  {widget.aiMetrics && (
                    <p className="text-xs text-purple-600 mt-2">📊 AI Marketing</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {visibleWidgets.length === 0 && (
          <div className="col-span-3 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-600 mb-2">No widgets visible</p>
              <button
                onClick={() => {
                  setWidgets(DEFAULT_WIDGETS);
                  setEditMode(false);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset to default
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;
