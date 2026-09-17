import React from 'react';

export default function DataPreviewTable({ columns, rows, highlightColumn, onSelectColumn, dense = false }) {
  if (!columns || columns.length === 0) return null;
  const cols = columns.map((c) => (typeof c === 'string' ? { name: c } : c));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="bg-slate-50">
            {cols.map((c) => (
              <th
                key={c.name}
                onClick={() => onSelectColumn && onSelectColumn(c.name)}
                className={`px-3.5 py-2.5 text-left font-semibold whitespace-nowrap border-b border-slate-100 ${
                  onSelectColumn ? 'cursor-pointer hover:bg-brand-100' : ''
                } ${highlightColumn === c.name ? 'bg-brand-100 text-brand-700' : 'text-slate-600'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span>{c.name}</span>
                  {c.dataType && <span className="text-[10px] font-normal text-slate-400 normal-case">{c.dataType}</span>}
                  {(c.nullCount !== undefined) && !dense && (
                    <span className="text-[10px] font-normal text-slate-400 normal-case">
                      {c.nullCount} nulls · {c.uniqueCount} unique
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70">
              {cols.map((c) => (
                <td key={c.name} className="px-3.5 py-2 whitespace-nowrap text-slate-600">
                  {row[c.name] === null || row[c.name] === undefined || row[c.name] === '' ? (
                    <span className="text-rose-400 italic text-xs">null</span>
                  ) : (
                    String(row[c.name])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
