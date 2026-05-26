import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag,
  BarChart2, Settings, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users',     icon: Users,            label: 'Users' },
  { to: '/products',  icon: ShoppingBag,      label: 'Products' },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics' },
  { to: '/settings',  icon: Settings,         label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const W = collapsed ? 72 : 248;
  return (
    <aside style={{
      width: W, minHeight: '100vh', flexShrink: 0,
      background: '#fff',
      borderRight: '1.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.24s ease',
      overflow: 'hidden',
      boxShadow: '2px 0 16px rgba(10,22,60,0.04)',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 18px',
        borderBottom: '1.5px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-blue)',
        }}>
          <TrendingUp size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{
            fontWeight: 800, fontSize: 19, letterSpacing: '-0.4px',
            color: 'var(--text-heading)', whiteSpace: 'nowrap',
          }}>Nexus</span>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div style={{
          padding: '18px 18px 6px',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
          color: 'var(--text-faint)', textTransform: 'uppercase',
        }}>Main Menu</div>
      )}

      {/* Nav */}
      <nav style={{ padding: collapsed ? '10px 8px' : '4px 10px', flex: 1 }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '12px 0' : '10px 12px',
            borderRadius: 11, marginBottom: 3, textDecoration: 'none',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.15s',
            background: isActive ? 'var(--primary-soft)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: isActive ? 700 : 500,
            fontSize: 14,
          })}>
            <Icon size={17} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          margin: '10px', padding: '10px',
          borderRadius: 11, background: 'var(--bg-subtle)',
          border: '1.5px solid var(--border)', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, fontSize: 13, fontWeight: 500,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
      >
        {collapsed
          ? <ChevronRight size={15} />
          : <><ChevronLeft size={15} /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
