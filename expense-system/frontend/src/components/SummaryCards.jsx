import React from 'react';

export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Submitted', value: summary.totalSubmitted, color: 'text-gray-800' },
    { label: 'Pending', value: summary.pending, color: 'text-amber-600' },
    { label: 'Approved', value: summary.approved, color: 'text-emerald-600' },
    { label: 'Rejected', value: summary.rejected, color: 'text-red-500' },
    {
      label: 'Total Reimbursed',
      value: `₹${Number(summary.totalReimbursed || 0).toLocaleString('en-IN')}`,
      color: 'text-brand-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="card !p-4">
          <div className="text-xs text-gray-500 mb-1">{c.label}</div>
          <div className={`text-xl font-semibold ${c.color}`}>{c.value ?? 0}</div>
        </div>
      ))}
    </div>
  );
}
