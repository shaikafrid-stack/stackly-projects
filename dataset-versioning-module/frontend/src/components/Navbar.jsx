import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  Admin: 'bg-brand-600',
  'Data Steward': 'bg-emerald-600',
  'Data Analyst': 'bg-amber-500',
};

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur px-4 md:px-6 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1 hover:bg-slate-100 transition-colors"
        >
          <span
            className={`h-8 w-8 rounded-full ${ROLE_COLORS[user?.role] || 'bg-slate-500'} text-white text-xs font-bold flex items-center justify-center`}
          >
            {user?.displayName?.[0] || '?'}
          </span>
          <span className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-sm font-medium text-slate-800">{user?.displayName}</span>
            <span className="text-[11px] text-slate-400">{user?.role}</span>
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 card p-1.5 z-20">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full text-left rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
