import React from 'react';

const statusClass = {
  Open: 'badge-open',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
  Closed: 'badge-closed',
};

const priorityClass = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
};

export function StatusBadge({ status }) {
  return <span className={`badge ${statusClass[status] || 'badge-open'}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge ${priorityClass[priority] || 'badge-low'}`}>{priority}</span>;
}
