import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Database, History, User, LogOut, Sparkles, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/datasets', label: 'Datasets', icon: Database },
  { to: '/history', label: 'Transformation History', icon: History },
  { to: '/profile', label: 'Profile', icon: User }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-white border-r border-slate-100 shadow-xl lg:shadow-none transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="px-6 py-6 flex items-center gap-2">
            <div className="bg-brand-gradient p-2 rounded-xl shadow-glow">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 leading-tight">DataPrep</p>
              <p className="text-[11px] text-slate-400 -mt-0.5">Transformation Studio</p>
            </div>
            <button className="ml-auto lg:hidden text-slate-400" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1 mt-2">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-glow'
                      : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p>
                <StatusBadge status={user?.role} className="mt-0.5" />
              </div>
            </div>
            <button onClick={handleLogout} className="btn-ghost w-full justify-start mt-2 text-rose-500 hover:bg-rose-50">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <p className="font-bold text-slate-800">DataPrep</p>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
