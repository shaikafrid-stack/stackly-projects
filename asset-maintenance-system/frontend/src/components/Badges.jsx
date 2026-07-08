import React from 'react';

const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-700',
  Assigned: 'bg-purple-100 text-purple-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-700',
  active: 'bg-green-100 text-green-700',
  in_maintenance: 'bg-amber-100 text-amber-700',
  retired: 'bg-gray-200 text-gray-700',
};

const PRIORITY_STYLES = {
  Low: 'bg-gray-100 text-gray-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge ${PRIORITY_STYLES[priority] || 'bg-gray-100 text-gray-700'}`}>
      {priority}
    </span>
  );
}
