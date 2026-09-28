import React from 'react';

const STYLES = {
  Draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Archived: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Restored: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const DOTS = {
  Draft: 'bg-amber-500',
  Active: 'bg-emerald-500',
  Archived: 'bg-slate-400',
  Restored: 'bg-violet-500',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600 ring-slate-500/20';
  const dot = DOTS[status] || 'bg-slate-400';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${status === 'Active' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
