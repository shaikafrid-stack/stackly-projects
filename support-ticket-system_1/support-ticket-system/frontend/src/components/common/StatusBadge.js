import React from 'react';

const statusStyles = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  on_hold: 'bg-gray-200 text-gray-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

const priorityStyles = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
    {status?.replace('_', ' ')}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${priorityStyles[priority] || 'bg-gray-100 text-gray-700'}`}>
    {priority}
  </span>
);
