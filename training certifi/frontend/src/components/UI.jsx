import React from 'react';

export const StatCard = ({ label, value, accent = 'primary' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{value}</p>
  </div>
);

export const Badge = ({ status }) => {
  const colors = {
    completed: 'bg-green-100 text-green-700',
    active: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    upcoming: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    not_marked: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export const Spinner = () => (
  <div className="flex items-center justify-center py-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

export const EmptyState = ({ message }) => (
  <div className="text-center py-10 text-gray-400 text-sm">{message}</div>
);
