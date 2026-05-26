import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const now = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <header style={{
      height: 64, background: '#fff',
      borderBottom: '1.5px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Left: page title */}
      <div>
        <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-heading)' }}>
          {title}
        </h1>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 1 }}>{now}</p>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input
            placeholder="Quick search…"
            style={{ padding: '8px 14px 8px 32px', fontSize: 13, width: 210, background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
          />
        </div>

        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--bg-subtle)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <Bell size={16} />
          </button>
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, background: 'var(--rose)',
            borderRadius: '50%', border: '2px solid #fff',
          }} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '6px 10px', borderRadius: 11,
          border: '1.5px solid var(--border)', background: '#fff',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg,var(--primary),var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
            boxShadow: '0 2px 8px rgba(53,99,233,.3)',
          }}>
            {user?.avatar || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2, color: 'var(--text-heading)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)', lineHeight: 1.2 }}>{user?.role}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
            style={{
              marginLeft: 4, background: 'none', border: 'none',
              color: 'var(--text-faint)', padding: 4, borderRadius: 7,
              display: 'flex', transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
