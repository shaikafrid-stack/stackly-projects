import React from 'react';

const MAP = {
  Pending: 'badge-pending',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  Unpaid: 'badge-unpaid',
  'Partially Paid': 'badge-partial',
  Paid: 'badge-paid',
  active: 'badge-approved',
  inactive: 'badge-unpaid',
  blacklisted: 'badge-rejected',
  expired: 'badge-rejected',
  terminated: 'badge-rejected',
  draft: 'badge-pending',
};

export default function StatusBadge({ status }) {
  const cls = MAP[status] || 'badge-unpaid';
  return <span className={`badge ${cls}`}>{status}</span>;
}
