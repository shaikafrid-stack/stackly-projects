import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linksByRole = {
  Administrator: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/admin/workspaces', label: 'Workspace Management' },
    { to: '/admin/datasets', label: 'Dataset Overview' },
    { to: '/admin/users', label: 'User Assignment' },
  ],
  'Data Steward': [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/steward/datasets', label: 'Dataset Management' },
    { to: '/steward/activity', label: 'Activity Log' },
  ],
  'Data Analyst': [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/analyst/explorer', label: 'Dataset Explorer' },
    { to: '/analyst/search', label: 'Search & Filter' },
    { to: '/analyst/favorites', label: 'Favorites' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-screen hidden md:block">
      <div className="px-5 py-5 border-b border-slate-200">
        <p className="font-bold text-brand-600 text-lg leading-tight">Dataset & Metadata</p>
        <p className="text-xs text-slate-400">Management Module</p>
      </div>
      <nav className="p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          Profile
        </NavLink>
      </nav>
    </aside>
  );
}
