import React from 'react';

export default function EmptyState({ title = 'No data found', subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 rounded-lg bg-white">
      <p className="text-gray-700 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
