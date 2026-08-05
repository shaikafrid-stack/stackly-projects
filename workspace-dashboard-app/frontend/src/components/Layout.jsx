import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  BarChart3,
  Briefcase,
  ClipboardList,
  History,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navByRole = {
  Administrator: [
    { to: '/admin/workspaces', label: 'Workspace Management', icon: Briefcase },
    { to: '/admin/users', label: 'User Assignment', icon: Users },
    { to: '/admin/statistics', label: 'Workspace Statistics', icon: BarChart3 },
  ],
  'Workspace Manager': [
    { to: '/manager/dashboards', label: 'Workspace Dashboard', icon: LayoutGrid },
    { to: '/manager/members', label: 'Member Management', icon: Users },
    { to: '/manager/dashboard-management', label: 'Dashboard Management', icon: ClipboardList },
  ],
  Member: [
    { to: '/member/workspaces', label: 'My Workspaces', icon: Briefcase },
    { to: '/member/dashboards', label: 'Dashboard List', icon: LayoutGrid },
    { to: '/member/activity', label: 'Activity History', icon: History },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-200">
          <h1 className="text-lg font-bold text-primary-700">Workspace Manager</h1>
          <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <UserCircle size={18} />
            Profile
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-200">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
