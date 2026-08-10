import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="text-sm text-slate-500">
        Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="badge bg-brand-50 text-brand-700">{user?.role}</span>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
}
