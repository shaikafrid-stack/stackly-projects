import React from 'react';

/**
 * columns: [{ key, header, render?(row) }]
 */
export default function Table({ columns, rows, loading, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-x-auto card p-0">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="text-left font-semibold text-slate-500 px-4 py-3 uppercase text-xs tracking-wide">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                Loading...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row.id ?? idx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
