import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navByRole = {
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tickets/new', label: 'Create Ticket' },
    { to: '/tickets', label: 'My Tickets' },
    { to: '/knowledge-base', label: 'Knowledge Base' },
  ],
  support_engineer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tickets', label: 'Assigned Tickets' },
    { to: '/knowledge-base', label: 'Knowledge Base' },
  ],
  admin: [
    { to: '/dashboard', label: 'Analytics' },
    { to: '/tickets', label: 'All Tickets' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/knowledge-base', label: 'Knowledge Base' },
  ],
};

const roleLabel = {
  employee: 'Employee',
  support_engineer: 'Support Engineer',
  admin: 'Admin',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const links = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 w-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-bold text-brand-600 dark:text-brand-400">Helpdesk</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Knowledge Base System</p>
        </div>
        <nav className="p-3 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/tickets'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`
            }
          >
            Profile
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabel[user?.role]}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn btn-secondary !px-3 !py-1.5 text-xs">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button onClick={handleLogout} className="btn btn-secondary !px-3 !py-1.5 text-xs">
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-5 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
