import React from 'react';

const MAP = {
  GOOD: 'badge-good',
  PASSED: 'badge-good',
  WARNING: 'badge-warning',
  POOR: 'badge-poor',
  FAILED: 'badge-poor',
  HIGH: 'badge-poor',
  LOW: 'badge-neutral',
  ACTIVE: 'badge-good',
  INACTIVE: 'badge-neutral',
  COMPLETED: 'badge-good',
  PROCESSED: 'badge-good',
  FAILED_STATUS: 'badge-poor',
  IN_PROGRESS: 'badge-warning',
  NOT_STARTED: 'badge-neutral',
};

export default function Badge({ status, children }) {
  const cls = MAP[status] || 'badge-neutral';
  return <span className={`badge ${cls}`}>{children || status}</span>;
}
