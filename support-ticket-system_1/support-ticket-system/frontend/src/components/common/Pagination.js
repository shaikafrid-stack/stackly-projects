import React from 'react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="px-3 py-1.5 rounded-md text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
      {nums.map(n => (
        <button key={n} onClick={() => onChange(n)} className={`px-3 py-1.5 rounded-md text-sm border ${n === page ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>{n}</button>
      ))}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="px-3 py-1.5 rounded-md text-sm border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
    </div>
  );
}
