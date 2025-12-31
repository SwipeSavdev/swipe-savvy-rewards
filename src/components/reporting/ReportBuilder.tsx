/**
 * ReportBuilder Component
 * Modal for creating new custom widgets
 */

import React, { useState } from 'react';

interface ReportBuilderProps {
  onAdd: (widget: any) => void;
  onClose: () => void;
}

// 14 data sources organized by category
const DATA_SOURCES = [
  // Transaction Data
  { value: 'revenue', label: 'Revenue Summary', category: 'Transactions' },
  { value: 'transaction_volume', label: 'Transaction Volume', category: 'Transactions' },
  { value: 'revenue_trend', label: 'Revenue Trend', category: 'Transactions' },
  { value: 'transaction_status', label: 'Transaction Status', category: 'Transactions' },
  { value: 'payment_methods', label: 'Payment Methods', category: 'Transactions' },

  // User Data
  { value: 'users', label: 'Active Users', category: 'Users' },
  { value: 'user_growth', label: 'User Growth', category: 'Users' },

  // Merchant Data
  { value: 'top_merchants', label: 'Top Merchants', category: 'Merchants' },
  { value: 'merchant_categories', label: 'Merchants by Category', category: 'Merchants' },
  { value: 'payment_methods', label: 'Payment Methods', category: 'Merchants' },

  // Account Data
  { value: 'linked_banks', label: 'Linked Banks', category: 'Accounts' },

  // Rewards & Incentives
  { value: 'rewards_metrics', label: 'Rewards Metrics', category: 'Rewards' },

  // AI Concierge
  { value: 'ai_metrics', label: 'AI Concierge Metrics', category: 'AI' },

  // Latest Transactions
  { value: 'latest_transactions', label: 'Latest Transactions', category: 'Tables' }
];

const WIDGET_TYPES = [
  { value: 'kpi', label: 'KPI Card', icon: '📊' },
  { value: 'chart', label: 'Chart', icon: '📈' },
  { value: 'table', label: 'Table', icon: '📋' },
  { value: 'summary', label: 'Summary', icon: '📌' }
];

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'pie', label: 'Pie Chart' }
];

export default function ReportBuilder({ onAdd, onClose }: ReportBuilderProps) {
  const [widgetType, setWidgetType] = useState<'kpi' | 'chart' | 'table' | 'summary'>('kpi');
  const [title, setTitle] = useState('');
  const [dataSource, setDataSource] = useState('revenue');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a widget title');
      return;
    }

    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title,
      dataSource,
      ...(widgetType === 'chart' && { chartType })
    };

    onAdd(newWidget);
  };

  const groupedSources = DATA_SOURCES.reduce(
    (acc, source) => {
      const category = source.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(source);
      return acc;
    },
    {} as Record<string, typeof DATA_SOURCES>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Create Widget</h2>
          <p className="text-slate-400 text-sm mt-1">Add a new widget to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Widget Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Widget Type</label>
            <div className="grid grid-cols-2 gap-2">
              {WIDGET_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setWidgetType(type.value as any)}
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    widgetType === type.value
                      ? 'border-blue-500 bg-blue-500 bg-opacity-10 text-white'
                      : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              Widget Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Daily Revenue"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Data Source Selection */}
          <div>
            <label htmlFor="dataSource" className="block text-sm font-medium text-slate-300 mb-2">
              Data Source
            </label>
            <select
              id="dataSource"
              value={dataSource}
              onChange={e => setDataSource(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(groupedSources).map(([category, sources]) => (
                <optgroup key={category} label={category}>
                  {sources.map(source => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Chart Type Selection (only for chart widgets) */}
          {widgetType === 'chart' && (
            <div>
              <label htmlFor="chartType" className="block text-sm font-medium text-slate-300 mb-2">
                Chart Type
              </label>
              <select
                id="chartType"
                value={chartType}
                onChange={e => setChartType(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CHART_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Widget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
