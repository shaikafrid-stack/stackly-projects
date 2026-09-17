import React from 'react';

const MAP = {
  PROCESSED: 'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-slate-100 text-slate-600',
  FAILED: 'bg-rose-100 text-rose-700',
  VALID: 'bg-emerald-100 text-emerald-700',
  WARNING: 'bg-amber-100 text-amber-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  PASSED: 'bg-emerald-100 text-emerald-700',
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  SKIPPED: 'bg-slate-100 text-slate-500',
  ADMIN: 'bg-fuchsia-100 text-fuchsia-700',
  DATA_STEWARD: 'bg-indigo-100 text-indigo-700',
  DATA_ANALYST: 'bg-sky-100 text-sky-700'
};

const LABELS = {
  DATA_STEWARD: 'Data Steward',
  DATA_ANALYST: 'Data Analyst'
};

export default function StatusBadge({ status, className = '' }) {
  const cls = MAP[status] || 'bg-slate-100 text-slate-600';
  return <span className={`badge ${cls} ${className}`}>{LABELS[status] || status?.replace(/_/g, ' ')}</span>;
}
