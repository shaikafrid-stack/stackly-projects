import React from 'react';

export default function Card({ title, value, subtitle, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-5 ${className}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
