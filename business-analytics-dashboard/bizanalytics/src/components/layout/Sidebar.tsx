import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { to: '/', icon: '⊞', label: 'Dashboard' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
  { to: '/reports', icon: '📋', label: 'Reports' },
  { to: '/customers', icon: '👥', label: 'Customers' },
  { to: '/orders', icon: '📦', label: 'Orders' },
  { to: '/products', icon: '🗂', label: 'Products' },
];

const Sidebar = memo(function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { state, dispatch } = useAppContext();
  const collapsed = !state.sidebarOpen;

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📈</div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">BizAnalytics</div>
              <div className="sidebar-logo-sub">Analytics Dashboard</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            {!collapsed && <div className="nav-group-label">Main</div>}
            {mainNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && <span className="nav-link-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-link w-full"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <span className="nav-link-icon">{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
