import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = {
  admin: [
    { to: '/admin/dashboard', label: 'Analytics Dashboard', icon: '📊' },
    { to: '/admin/vendors', label: 'Vendor Management', icon: '🏢' },
    { to: '/admin/contracts', label: 'Contract Management', icon: '📄' },
  ],
  finance_manager: [
    { to: '/finance/dashboard', label: 'Overview', icon: '📈' },
    { to: '/finance/approvals', label: 'Invoice Approvals', icon: '✅' },
    { to: '/finance/payments', label: 'Payment Management', icon: '💳' },
  ],
  vendor: [
    { to: '/vendor/dashboard', label: 'Overview', icon: '🏠' },
    { to: '/vendor/contracts', label: 'My Contracts', icon: '📄' },
    { to: '/vendor/invoices', label: 'Invoice History', icon: '🧾' },
    { to: '/vendor/upload', label: 'Upload Invoice', icon: '⬆️' },
  ],
};

export default function Sidebar({ role }) {
  const links = LINKS[role] || [];
  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen hidden md:block">
      <div className="p-5 border-b border-slate-200">
        <h1 className="text-lg font-bold text-primary-700">VCIMS</h1>
        <p className="text-xs text-slate-400 mt-0.5">Vendor & Invoice Management</p>
      </div>
      <nav className="p-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
