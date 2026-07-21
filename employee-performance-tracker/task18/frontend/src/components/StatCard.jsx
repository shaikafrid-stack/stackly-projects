import React from 'react';

export default function StatCard({ label, value, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };
  return (
    <div className="card">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accents[accent] || accents.brand}`}>{value}</p>
    </div>
  );
}
