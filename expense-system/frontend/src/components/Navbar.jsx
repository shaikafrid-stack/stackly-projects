import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = {
    employee: [{ to: '/employee', label: 'Dashboard' }, { to: '/employee/expenses', label: 'My Expenses' }],
    manager: [{ to: '/manager', label: 'Dashboard' }, { to: '/manager/expenses', label: 'Review Requests' }],
    admin: [
      { to: '/admin', label: 'Dashboard' },
      { to: '/admin/expenses', label: 'All Expenses' },
      { to: '/admin/reports', label: 'Reports' },
    ],
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-brand-700 text-lg">ExpenseFlow</span>
          <div className="hidden sm:flex gap-1">
            {links[user.role]?.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">
            {user.name} · <span className="capitalize">{user.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-secondary text-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
