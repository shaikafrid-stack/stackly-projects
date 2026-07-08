import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LINKS = {
  admin: [
    { to: '/admin', label: 'Analytics' },
    { to: '/admin/assets', label: 'Assets' },
    { to: '/admin/requests', label: 'Service Requests' },
  ],
  maintenance_engineer: [
    { to: '/engineer', label: 'Dashboard' },
    { to: '/engineer/requests', label: 'Assigned Requests' },
  ],
  employee: [
    { to: '/employee', label: 'Dashboard' },
    { to: '/employee/new-request', label: 'Raise Request' },
    { to: '/employee/requests', label: 'My Requests' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = ROLE_LINKS[user.role] || [];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-brand-600 text-sm sm:text-base">🛠️ Asset Maintenance</span>
          <div className="hidden md:flex gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-gray-500">
            {user.name} <span className="text-gray-300">|</span>{' '}
            <span className="capitalize">{user.role.replace('_', ' ')}</span>
          </span>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
