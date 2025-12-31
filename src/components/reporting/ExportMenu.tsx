/**
 * ExportMenu Component
 * Provides export functionality for multiple formats
 */

import React, { useState } from 'react';

interface ExportMenuProps {
  data: Record<string, any>;
}

export default function ExportMenu({ data }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const exportJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(
      jsonContent,
      `report-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
  };

  const exportCSV = () => {
    let csv = 'Data Export\n';
    csv += `Generated: ${new Date().toISOString()}\n\n`;

    Object.entries(data).forEach(([key, value]) => {
      csv += `${key}\n`;
      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([k, v]) => {
          csv += `${k},${v}\n`;
        });
      } else if (Array.isArray(value) && value.length > 0) {
        const headers = Object.keys(value[0]).join(',');
        csv += `${headers}\n`;
        value.forEach((row: any) => {
          csv += `${Object.values(row).join(',')}\n`;
        });
      }
      csv += '\n';
    });

    downloadFile(
      csv,
      `report-${new Date().toISOString().split('T')[0]}.csv`,
      'text/csv'
    );
  };

  const exportHTML = () => {
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
            h1 { color: #333; }
            h2 { color: #666; margin-top: 20px; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; background: white; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #4CAF50; }
          </style>
        </head>
        <body>
          <h1>Report Export</h1>
          <p>Generated: ${new Date().toISOString()}</p>
    `;

    Object.entries(data).forEach(([key, value]) => {
      html += `<h2>${key}</h2>`;

      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.entries(value).forEach(([k, v]) => {
          html += `<div class="metric"><strong>${k}:</strong> ${v}</div>`;
        });
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        html += '<table>';
        html += `<tr>${Object.keys(value[0])
          .map(k => `<th>${k}</th>`)
          .join('')}</tr>`;
        value.forEach((row: any) => {
          html += `<tr>${Object.values(row)
            .map(v => `<td>${v}</td>`)
            .join('')}</tr>`;
        });
        html += '</table>';
      }
    });

    html += `
        </body>
      </html>
    `;

    downloadFile(html, `report-${new Date().toISOString().split('T')[0]}.html`, 'text/html');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
      >
        📥 Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
          <button
            onClick={exportJSON}
            className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-700 rounded-t-lg first:rounded-t-lg flex items-center gap-2"
          >
            📄 Export as JSON
          </button>
          <button
            onClick={exportCSV}
            className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
          >
            📊 Export as CSV
          </button>
          <button
            onClick={exportHTML}
            className="w-full text-left px-4 py-2 text-slate-200 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
          >
            🌐 Export as HTML
          </button>
        </div>
      )}
    </div>
  );
}
