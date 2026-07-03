import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLE_LABEL = {
  admin: 'Administrator',
  finance_manager: 'Finance Manager',
  vendor: 'Vendor',
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{ROLE_LABEL[user?.role]}</p>
        <p className="font-semibold text-slate-800">Welcome, {user?.name}</p>
      </div>
      <button onClick={handleLogout} className="btn btn-secondary">
        Logout
      </button>
    </header>
  );
}
