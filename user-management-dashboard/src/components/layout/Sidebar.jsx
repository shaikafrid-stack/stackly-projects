import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  BarChart3,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', badge: null },
  { icon: Users, label: 'User Management', id: 'users', badge: null },
  { icon: Shield, label: 'Roles & Permissions', id: 'roles', badge: null },
  { icon: BarChart3, label: 'Analytics', id: 'analytics', badge: 'New' },
  { icon: Bell, label: 'Notifications', id: 'notifications', badge: '3' },
  { icon: Settings, label: 'Settings', id: 'settings', badge: null },
];

export default function Sidebar({ activeNav, setActiveNav, collapsed }) {
  return (
    <aside
      className="flex flex-col h-full transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, #111827 0%, #0d1424 100%)',
        borderRight: '1px solid var(--border)',
        width: collapsed ? '72px' : '240px',
        minWidth: collapsed ? '72px' : '240px',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}
        >
          <Zap size={20} color="white" fill="white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
              UserManager
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              v2.1.0
            </div>
          </div>
        )}
      </div>

      {/* Nav Section Label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Main Menu
          </span>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-2 space-y-1">
        {navItems.map(({ icon: Icon, label, id, badge }) => {
          const isActive = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`sidebar-item w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              } ${isActive ? 'active' : ''}`}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(6,182,212,0.08))'
                  : 'transparent',
                color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
              }}
              title={collapsed ? label : ''}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium text-left">{label}</span>
                  {badge && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: badge === 'New'
                          ? 'linear-gradient(135deg,#6366f1,#06b6d4)'
                          : 'rgba(99,102,241,0.25)',
                        color: 'white',
                        fontSize: '10px',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  {isActive && !badge && (
                    <ChevronRight size={14} style={{ color: '#6366f1' }} />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className={`w-full flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200 ${
            collapsed ? 'justify-center px-0' : 'px-3'
          }`}
          style={{ color: 'var(--text-muted)' }}
        >
          <HelpCircle size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Help & Support</span>}
        </button>
        <button
          className={`w-full flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200 ${
            collapsed ? 'justify-center px-0' : 'px-3'
          }`}
          style={{ color: '#f87171' }}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
