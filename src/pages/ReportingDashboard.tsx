/**
 * ReportingDashboard Component
 * Main dashboard with drag-and-drop widgets, filters, and reporting capabilities
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useReportingData, type DateFilter } from '@/hooks/useReportingData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DateRangeFilter from '@/components/reporting/DateRangeFilter';
import KPIWidget from '@/components/reporting/KPIWidget';
import ChartWidget from '@/components/reporting/ChartWidget';
import TableWidget from '@/components/reporting/TableWidget';
import MetricsSummaryWidget from '@/components/reporting/MetricsSummaryWidget';
import ExportMenu from '@/components/reporting/ExportMenu';
import ReportBuilder from '@/components/reporting/ReportBuilder';

// Default 13 widgets covering all business areas
const DEFAULT_WIDGETS = [
  // Transaction Analytics (5 widgets)
  { id: 'kpi-revenue', type: 'kpi', title: 'Total Revenue', dataSource: 'revenue' },
  { id: 'kpi-transactions', type: 'kpi', title: 'Total Transactions', dataSource: 'transactions' },
  { id: 'chart-revenue-trend', type: 'chart', title: 'Revenue Trend', dataSource: 'revenue_trend', chartType: 'line' },
  { id: 'chart-payment-methods', type: 'chart', title: 'Payment Methods', dataSource: 'payment_methods', chartType: 'pie' },
  { id: 'chart-transaction-volume', type: 'chart', title: 'Transaction Volume', dataSource: 'transaction_volume', chartType: 'bar' },
  
  // User Analytics (3 widgets)
  { id: 'kpi-users', type: 'kpi', title: 'Active Users', dataSource: 'users' },
  { id: 'chart-user-growth', type: 'chart', title: 'User Growth', dataSource: 'user_growth', chartType: 'line' },
  
  // Merchant Analytics (3 widgets)
  { id: 'chart-top-merchants', type: 'chart', title: 'Top Merchants', dataSource: 'top_merchants', chartType: 'bar' },
  { id: 'chart-merchant-categories', type: 'chart', title: 'Merchants by Category', dataSource: 'merchant_categories', chartType: 'pie' },
  { id: 'chart-transaction-status', type: 'chart', title: 'Transaction Status', dataSource: 'transaction_status', chartType: 'pie' },
  
  // Accounts & Banking (1 widget)
  { id: 'chart-linked-banks', type: 'chart', title: 'Linked Banks', dataSource: 'linked_banks', chartType: 'bar' },
  
  // Rewards & AI (2 widgets)
  { id: 'summary-rewards', type: 'summary', title: 'Rewards Metrics', dataSource: 'rewards_metrics' },
  { id: 'summary-ai-metrics', type: 'summary', title: 'AI Concierge Performance', dataSource: 'ai_metrics' }
];

const PRESET_LAYOUTS = {
  default: DEFAULT_WIDGETS,
  compact: DEFAULT_WIDGETS.slice(0, 6),
  analytics: DEFAULT_WIDGETS.filter(w => w.type === 'chart')
};

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'summary';
  title: string;
  dataSource: string;
  chartType?: 'line' | 'bar' | 'pie';
  visible?: boolean;
}

export default function ReportingDashboard() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [filters, setFilters] = useState<DateFilter>({
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(today)
  });

  const [widgets, setWidgets] = useLocalStorage<Widget[]>('reporting-widgets', DEFAULT_WIDGETS as any);
  const [editMode, setEditMode] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'default' | 'compact' | 'analytics'>('default');

  const { data, loading, error, refetch } = useReportingData(filters);

  // Filter visible widgets
  const visibleWidgets = useMemo(
    () => widgets.filter(w => w.visible !== false),
    [widgets]
  );

  // Widget management functions
  const addWidget = useCallback((newWidget: Widget) => {
    setWidgets([...widgets, newWidget]);
    setShowBuilder(false);
  }, [widgets, setWidgets]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  }, [widgets, setWidgets]);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets(
      widgets.map(w =>
        w.id === id ? { ...w, visible: !w.visible } : w
      )
    );
  }, [widgets, setWidgets]);

  const applyLayout = useCallback((layoutName: 'default' | 'compact' | 'analytics') => {
    setWidgets(PRESET_LAYOUTS[layoutName] as any);
    setSelectedLayout(layoutName);
  }, [setWidgets]);

  const resetToDefault = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS as any);
    setSelectedLayout('default');
  }, [setWidgets]);

  // Render widget based on type
  const renderWidget = (widget: Widget) => {
    const widgetData = data[widget.dataSource];

    if (!widgetData) {
      return (
        <div className="p-4 bg-slate-700 rounded-lg flex items-center justify-center min-h-64">
          <p className="text-slate-400">No data available</p>
        </div>
      );
    }

    switch (widget.type) {
      case 'kpi':
        return (
          <KPIWidget
            title={widget.title}
            value={widgetData.value || 0}
            trend={widgetData.trend || 0}
          />
        );

      case 'chart':
        return (
          <ChartWidget
            title={widget.title}
            type={widget.chartType || 'line'}
            data={Array.isArray(widgetData) ? widgetData : []}
          />
        );

      case 'table':
        return (
          <TableWidget
            title={widget.title}
            columns={widgetData.columns || []}
            rows={widgetData.rows || []}
          />
        );

      case 'summary':
        return (
          <MetricsSummaryWidget
            title={widget.title}
            metrics={widgetData}
          />
        );

      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Reporting Dashboard</h1>
              <p className="text-slate-400 mt-1">Comprehensive analytics and reporting</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  editMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                {editMode ? '✓ Done Editing' : '✏️ Edit Layout'}
              </button>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
              >
                ➕ Add Widget
              </button>
              <ExportMenu data={data} />
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <DateRangeFilter
              filters={filters}
              onFiltersChange={setFilters}
            />

            <button
              onClick={refetch}
              disabled={loading}
              className="px-3 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '⟳ Loading...' : '🔄 Refresh'}
            </button>

            {/* Layout Presets */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Layouts:</span>
              {(['default', 'compact', 'analytics'] as const).map(layout => (
                <button
                  key={layout}
                  onClick={() => applyLayout(layout)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedLayout === layout
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  }`}
                >
                  {layout.charAt(0).toUpperCase() + layout.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={resetToDefault}
              className="px-3 py-2 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
            >
              ↺ Reset
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded text-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {visibleWidgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No widgets selected. Add some to get started!</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Widget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleWidgets.map(widget => (
              <div
                key={widget.id}
                className={`relative group ${editMode ? 'ring-2 ring-blue-500' : ''}`}
              >
                {editMode && (
                  <div className="absolute -top-3 -right-3 z-50 flex gap-2">
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="p-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      title="Hide widget"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Remove widget"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
                  </div>
                  <div className="p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-slate-400">Loading...</div>
                      </div>
                    ) : (
                      renderWidget(widget)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Widget Builder Modal */}
      {showBuilder && (
        <ReportBuilder
          onAdd={addWidget}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
