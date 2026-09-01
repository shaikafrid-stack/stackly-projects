import React from 'react';

export default function Table({ columns, rows, onSort, sortBy, sortOrder, emptyMessage = 'No data available' }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-3 font-medium whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-slate-800' : ''}`}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span>{sortOrder === 'ASC' ? '▲' : '▼'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-slate-400 py-8">
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx} className="border-b border-slate-100 hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className="py-2.5 px-3 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
