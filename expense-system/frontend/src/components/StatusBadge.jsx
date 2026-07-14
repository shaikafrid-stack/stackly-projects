import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
}
