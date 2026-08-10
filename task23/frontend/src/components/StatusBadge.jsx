import React from 'react';

const styles = {
  Draft: 'bg-amber-100 text-amber-700',
  Published: 'bg-emerald-100 text-emerald-700',
  Archived: 'bg-slate-200 text-slate-600',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}
