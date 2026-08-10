import React from 'react';

export default function SummaryCard({ label, value, accent = 'text-brand-600' }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}
