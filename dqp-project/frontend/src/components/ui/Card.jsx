import React from 'react';

export function Card({ children, className = '' }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, sublabel, icon, tone = 'default' }) {
  const toneMap = {
    default: 'text-slate-900',
    good: 'text-emerald-600',
    warning: 'text-amber-600',
    poor: 'text-rose-600',
  };
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`text-2xl font-semibold mt-1 ${toneMap[tone]}`}>{value}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
      </div>
      {icon && <div className="text-3xl opacity-80">{icon}</div>}
    </Card>
  );
}
