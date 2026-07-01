import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navByRole = {
  customer: [
    { to: '/customer/dashboard', label: 'Dashboard' },
    { to: '/customer/tickets', label: 'My Tickets' },
    { to: '/customer/tickets/new', label: 'New Ticket' },
  ],
  agent: [
    { to: '/agent/dashboard', label: 'Dashboard' },
    { to: '/agent/tickets', label: 'Assigned Tickets' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/tickets', label: 'All Tickets' },
    { to: '/admin/sla', label: 'SLA Monitor' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/analytics', label: 'Analytics' },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const links = navByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg text-primary-700 tracking-tight">SupportDesk</span>
            <nav className="hidden md:flex gap-1">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} className={({isActive}) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`
                }>{l.label}</NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-gray-600">{user?.name} <span className="text-xs uppercase text-gray-400">({user?.role})</span></span>
            <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition">Logout</button>
            <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t border-gray-200 px-4 py-2 flex flex-col gap-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({isActive}) =>
                `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'}`
              }>{l.label}</NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
