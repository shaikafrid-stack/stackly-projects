import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FolderOpen, Activity, Settings,
  LogOut, ChevronLeft, ChevronRight, Shield, Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui';
import { ROLE_LABELS, PERMISSIONS } from '../../constants';
import toast from 'react-hot-toast';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  show: boolean;
}

const Sidebar: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const { state: appState, dispatch } = useApp();
  const navigate = useNavigate();
  const user = authState.user!;
  const perms = PERMISSIONS[user.role];
  const collapsed = appState.sidebarCollapsed;

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/dashboard', show: true },
    { icon: <Users size={18} />, label: 'Users', path: '/users', show: perms.canViewUsers },
    { icon: <FolderOpen size={18} />, label: 'Projects', path: '/projects', show: perms.canViewProjects },
    { icon: <Activity size={18} />, label: 'Activity', path: '/activity', show: perms.canViewActivity },
    { icon: <Settings size={18} />, label: 'Profile', path: '/profile', show: true },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 bg-slate-900 dark:bg-slate-950 flex flex-col transition-all duration-200 h-screen sticky top-0`}>
      {/* Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-4'} py-4 border-b border-slate-800`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">WorkSpace</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 size={14} className="text-white" />
          </div>
        )}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role indicator */}
      {!collapsed && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Shield size={11} />
            <span>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.filter(item => item.show).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-800 p-2 space-y-0.5">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg">
            <Avatar initials={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <Avatar initials={user.avatar} name={user.name} size="sm" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
