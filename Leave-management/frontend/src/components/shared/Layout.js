import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, FolderOpen, Users, Settings,
  CheckSquare, UserCheck, LogOut, Menu, X, BarChart3, ClipboardList
} from 'lucide-react';

const navItems = {
  EMPLOYEE: [
    { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employee/apply-leave', label: 'Apply Leave', icon: FileText },
    { path: '/employee/my-leaves', label: 'My Leaves', icon: ClipboardList },
    { path: '/employee/my-projects', label: 'My Projects', icon: FolderOpen },
  ],
  MANAGER: [
    { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/leave-approval', label: 'Leave Approvals', icon: CheckSquare },
    { path: '/manager/team-allocation', label: 'Team Allocation', icon: UserCheck },
    { path: '/employee/apply-leave', label: 'Apply Leave', icon: FileText },
    { path: '/employee/my-leaves', label: 'My Leaves', icon: ClipboardList },
  ],
  ADMIN: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/projects', label: 'Projects', icon: FolderOpen },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
    { path: '/manager/leave-approval', label: 'Leave Approvals', icon: CheckSquare },
    { path: '/manager/team-allocation', label: 'Team Allocation', icon: UserCheck },
  ],
};

const roleColors = { ADMIN: 'bg-purple-600', MANAGER: 'bg-green-600', EMPLOYEE: 'bg-blue-600' };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const items = navItems[user?.role] || navItems.EMPLOYEE;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center gap-3 border-b">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          {sidebarOpen && <span className="font-bold text-gray-800 text-sm">RLM System</span>}
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${roleColors[user?.role]} flex items-center justify-center text-white font-bold text-sm`}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-gray-800 text-sm truncate">{user?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleColors[user?.role]}`}>{user?.role}</span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-500 hover:bg-red-50 transition-colors text-sm"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
