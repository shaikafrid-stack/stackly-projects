import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm rounded-md ${isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900">Dataset Module</span>
        <div className="flex gap-1">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/datasets" className={linkClass}>Datasets</NavLink>
          {user?.role === 'ANALYST' && <NavLink to="/datasets/upload" className={linkClass}>Upload</NavLink>}
          <NavLink to="/profile" className={linkClass}>Profile</NavLink>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name} · {user?.role}</span>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
