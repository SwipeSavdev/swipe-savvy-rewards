/**
 * TableWidget Component
 * Displays sortable and paginated data tables
 */

import React, { useState } from 'react';

interface TableColumn {
  key: string;
  label: string;
}

interface TableRow {
  [key: string]: string | number;
}

interface TableWidgetProps {
  title: string;
  columns: string[] | TableColumn[];
  rows: TableRow[];
}

export default function TableWidget({ title, columns, rows }: TableWidgetProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const itemsPerPage = 10;

  // Normalize columns
  const normalizedColumns = columns.map(col =>
    typeof col === 'string' ? { key: col.toLowerCase().replace(/\s+/g, '_'), label: col } : col
  );

  // Sort rows
  const sortedRows = sortKey
    ? [...rows].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      })
    : rows;

  // Paginate rows
  const paginatedRows = sortedRows.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  if (rows.length === 0) {
    return (
      <div className="p-4 bg-slate-700 rounded-lg text-center text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-800 rounded-lg">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-700">
              {normalizedColumns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-200 cursor-pointer hover:bg-slate-600 transition-colors"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-2">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
              >
                {normalizedColumns.map(col => (
                  <td
                    key={`${idx}-${col.key}`}
                    className="px-4 py-3 text-sm text-slate-300"
                  >
                    {typeof row[col.key] === 'number'
                      ? row[col.key].toLocaleString('en-US')
                      : row[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm bg-slate-700 text-slate-200 rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1 text-sm bg-slate-700 text-slate-200 rounded disabled:opacity-50 hover:bg-slate-600 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
