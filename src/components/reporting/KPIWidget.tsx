/**
 * KPIWidget Component
 * Displays key performance indicators with trend indicators
 */

import React from 'react';

interface KPIWidgetProps {
  title: string;
  value: number;
  trend: number;
  formatValue?: (value: number) => string;
}

export default function KPIWidget({
  title,
  value,
  trend,
  formatValue
}: KPIWidgetProps) {
  // Default formatter for large numbers
  const defaultFormatter = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const formatter = formatValue || defaultFormatter;
  const isPositive = trend >= 0;

  return (
    <div className="h-full bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{formatter(value)}</p>
        </div>
        <div className={`text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <div className="text-2xl font-semibold">
            {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-400 mt-1">vs last period</p>
        </div>
      </div>
    </div>
  );
}
