import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABELS = {
  ADMINISTRATOR: 'Administrator',
  DATA_ANALYST: 'Data Analyst',
  DATA_STEWARD: 'Data Steward',
};

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-700">{user?.name}</p>
          <p className="text-xs text-slate-400">{ROLE_LABELS[user?.role] || user?.role}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
