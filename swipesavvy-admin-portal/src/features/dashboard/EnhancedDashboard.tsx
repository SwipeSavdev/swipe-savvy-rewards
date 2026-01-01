/**
 * EnhancedDashboard.tsx
 * Main dashboard with moveable widgets and integrated AI Marketing metrics
 * Features:
 * - Widget visibility toggle and management
 * - Integrated AI Marketing Analytics KPIs and charts
 * - Drag-and-drop widget reordering
 * - Responsive CSS Grid layout
 * - Mock data for demo purposes
 */

'use client';

import { GripHorizontal, RefreshCw, Settings, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock Data
const MOCK_DATA = {
  ai_conversion_rate: {
    value: 3.24,
    change: 0.45,
    trend: 'up',
  },
  ai_roi: {
    value: 245.8,
    change: 12.5,
    trend: 'up',
    unit: '%',
  },
  ai_cpa: {
    value: 24.5,
    change: -5.2,
    trend: 'down',
    unit: '$',
  },
  ai_trends: [
    { date: 'Dec 1', conversions: 120, revenue: 2400, clicks: 2210 },
    { date: 'Dec 5', conversions: 155, revenue: 2910, clicks: 2290 },
    { date: 'Dec 9', conversions: 128, revenue: 2000, clicks: 2000 },
    { date: 'Dec 13', conversions: 198, revenue: 2181, clicks: 2500 },
    { date: 'Dec 17', conversions: 167, revenue: 2500, clicks: 2100 },
    { date: 'Dec 21', conversions: 214, revenue: 2100, clicks: 2800 },
    { date: 'Dec 25', conversions: 245, revenue: 2200, clicks: 2590 },
    { date: 'Dec 29', conversions: 287, revenue: 2300, clicks: 2760 },
  ],
  ai_funnel: [
    { stage: 'Awareness', value: 45000, dropoff: 0 },
    { stage: 'Interest', value: 32400, dropoff: 28 },
    { stage: 'Consideration', value: 21600, dropoff: 33 },
    { stage: 'Decision', value: 12960, dropoff: 40 },
    { stage: 'Purchase', value: 2592, dropoff: 80 },
  ],
  ai_attribution: [
    { channel: 'Paid Search', value: 8500, percentage: 35 },
    { channel: 'Social Media', value: 6200, percentage: 26 },
    { channel: 'Email', value: 4800, percentage: 20 },
    { channel: 'Organic', value: 2800, percentage: 12 },
    { channel: 'Referral', value: 1700, percentage: 7 },
  ],
  ai_campaigns: [
    { id: 1, name: 'Summer Sale 2025', status: 'Active', impressions: 2500000, clicks: 125000, conversions: 4050, roi: 287 },
    { id: 2, name: 'Black Friday Prep', status: 'Active', impressions: 1800000, clicks: 98000, conversions: 2940, roi: 245 },
    { id: 3, name: 'Holiday Special', status: 'Scheduled', impressions: 0, clicks: 0, conversions: 0, roi: 0 },
    { id: 4, name: 'Spring Collection', status: 'Completed', impressions: 3200000, clicks: 156000, conversions: 5616, roi: 342 },
  ],
  ai_recommendations: [
    '🎯 Increase budget allocation to Paid Search - highest ROI at 287%',
    '📈 Email campaigns show steady growth; consider A/B testing subject lines',
    '⚡ Social Media engagement up 23% - expand video content strategy',
    '🔍 Optimize landing pages for mobile - 64% of traffic is mobile',
    '💡 Predictive model suggests 15% conversion increase with personalization',
  ],
};

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
                {widget.type === 'kpi' && (
                  <div className="flex flex-col justify-center h-full">
                    {widget.dataSource === 'ai_conversion_rate' && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{MOCK_DATA.ai_conversion_rate.value}%</div>
                        <div className={`text-sm mt-2 ${MOCK_DATA.ai_conversion_rate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {MOCK_DATA.ai_conversion_rate.trend === 'up' ? '↑' : '↓'} {Math.abs(MOCK_DATA.ai_conversion_rate.change)}%
                        </div>
                        <p className="text-xs text-slate-500 mt-2">30-day average</p>
                      </div>
                    )}
                    {widget.dataSource === 'ai_roi' && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">{MOCK_DATA.ai_roi.value}{MOCK_DATA.ai_roi.unit}</div>
                        <div className={`text-sm mt-2 ${MOCK_DATA.ai_roi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {MOCK_DATA.ai_roi.trend === 'up' ? '↑' : '↓'} {Math.abs(MOCK_DATA.ai_roi.change)}%
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Return on Ad Spend</p>
                      </div>
                    )}
                    {widget.dataSource === 'ai_cpa' && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600">{MOCK_DATA.ai_cpa.unit}{MOCK_DATA.ai_cpa.value}</div>
                        <div className={`text-sm mt-2 ${MOCK_DATA.ai_cpa.trend === 'down' ? 'text-green-600' : 'text-red-600'}`}>
                          {MOCK_DATA.ai_cpa.trend === 'down' ? '↓' : '↑'} {Math.abs(MOCK_DATA.ai_cpa.change)}%
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Cost per Acquisition</p>
                      </div>
                    )}
                  </div>
                )}

                {widget.type === 'chart' && widget.chartType === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DATA.ai_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="conversions" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="clicks" stroke="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {widget.type === 'chart' && widget.chartType === 'funnel' && (
                  <div className="space-y-3 flex flex-col justify-center">
                    {MOCK_DATA.ai_funnel.map((stage, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{stage.stage}</span>
                          <span className="text-slate-600">{stage.value.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                            style={{ width: `${(stage.value / MOCK_DATA.ai_funnel[0].value) * 100}%` }}
                          />
                        </div>
                        {stage.dropoff > 0 && (
                          <div className="text-xs text-red-600">
                            {stage.dropoff}% drop-off
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {widget.type === 'chart' && widget.chartType === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DATA.ai_attribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {widget.type === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-2 px-2 font-semibold text-slate-700">Campaign</th>
                          <th className="text-right py-2 px-2 font-semibold text-slate-700">Conversions</th>
                          <th className="text-right py-2 px-2 font-semibold text-slate-700">ROI</th>
                          <th className="text-center py-2 px-2 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MOCK_DATA.ai_campaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-2 font-medium text-slate-900 truncate">{campaign.name}</td>
                            <td className="text-right py-2 px-2 text-slate-700">{campaign.conversions.toLocaleString()}</td>
                            <td className="text-right py-2 px-2 font-semibold text-green-600">{campaign.roi}%</td>
                            <td className="text-center py-2 px-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                campaign.status === 'Active' ? 'bg-green-100 text-green-700' :
                                campaign.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {campaign.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {widget.type === 'summary' && (
                  <div className="space-y-2 flex flex-col justify-center h-full">
                    {MOCK_DATA.ai_recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="text-sm text-slate-700 leading-snug">{rec}</div>
                      </div>
                    ))}
                  </div>
                )}

                {!widget.type && (
                  <div className="text-sm text-slate-500 text-center py-8">
                    <p className="font-medium">{widget.title}</p>
                    <p className="text-xs mt-2 text-slate-400">
                      {widget.dataSource}
                    </p>
                    {widget.aiMetrics && (
                      <p className="text-xs text-purple-600 mt-2">📊 AI Marketing</p>
                    )}
                  </div>
                )}
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
