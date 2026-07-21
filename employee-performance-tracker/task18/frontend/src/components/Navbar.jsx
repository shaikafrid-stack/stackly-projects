import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg text-brand-600">PerformTrack</span>
          <div className="hidden sm:flex items-center gap-2">
            {user.role === 'employee' && (
              <>
                <NavLink to="/employee" className={linkClass} end>Dashboard</NavLink>
                <NavLink to="/employee/goals" className={linkClass}>My Goals</NavLink>
              </>
            )}
            {user.role === 'manager' && (
              <>
                <NavLink to="/manager" className={linkClass} end>Dashboard</NavLink>
                <NavLink to="/manager/goals" className={linkClass}>Team Goals</NavLink>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <NavLink to="/admin" className={linkClass} end>Dashboard</NavLink>
                <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
                <NavLink to="/admin/reports" className={linkClass}>Reports</NavLink>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="btn-secondary !px-3" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
            {user.name} <span className="capitalize text-gray-400">({user.role})</span>
          </span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
  );
}
