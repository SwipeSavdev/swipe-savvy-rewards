/**
 * MetricsSummaryWidget Component
 * Displays multiple metrics in a compact summary format
 */

import React from 'react';

interface MetricsSummaryWidgetProps {
  title: string;
  metrics: Record<string, number | string>;
}

export default function MetricsSummaryWidget({ title, metrics }: MetricsSummaryWidgetProps) {
  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="p-4 bg-slate-700 rounded-lg text-center text-slate-400">
        No data available
      </div>
    );
  }

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      if (value < 1 && value > 0) return value.toFixed(1);
      return Math.round(value).toLocaleString('en-US');
    }
    return String(value);
  };

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="h-full bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400 font-medium">{formatLabel(key)}</p>
            <p className="text-lg font-semibold text-white mt-1">
              {formatValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
