/**
 * DateRangeFilter Component
 * Allows users to select custom date ranges or quick presets
 */

import React from 'react';
import { DateFilter } from '@/hooks/useReportingData';

interface DateRangeFilterProps {
  filters: DateFilter;
  onFiltersChange: (filters: DateFilter) => void;
}

export default function DateRangeFilter({ filters, onFiltersChange }: DateRangeFilterProps) {
  const today = new Date().toISOString().split('T')[0];

  const getDateNDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const quickRanges = [
    { label: '7 days', days: 7 },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 }
  ];

  const handleQuickRange = (days: number) => {
    onFiltersChange({
      startDate: getDateNDaysAgo(days),
      endDate: today
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value
    });
  };

  return (
    <div className="flex items-center gap-4 flex-wrap bg-slate-800 p-3 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-400 font-medium">Date Range:</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={handleStartDateChange}
          max={filters.endDate}
          className="px-3 py-1 bg-slate-700 text-slate-100 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-slate-400">to</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={handleEndDateChange}
          min={filters.startDate}
          max={today}
          className="px-3 py-1 bg-slate-700 text-slate-100 rounded border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">or</span>
        {quickRanges.map(range => (
          <button
            key={range.days}
            onClick={() => handleQuickRange(range.days)}
            className="px-3 py-1 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
}
