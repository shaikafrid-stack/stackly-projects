import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/datasets', label: 'Datasets', icon: '🗂️' },
  { to: '/quality-issues', label: 'Quality Issues', icon: '⚠️' },
  { to: '/quality-rules', label: 'Quality Rules', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <p className="font-bold text-brand-600 text-lg leading-tight">DataQuality<span className="text-slate-800">Pro</span></p>
        <p className="text-xs text-slate-400">Profiling &amp; Quality Analysis</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-300 border-t border-slate-100">v1.0.0</div>
    </aside>
  );
}
