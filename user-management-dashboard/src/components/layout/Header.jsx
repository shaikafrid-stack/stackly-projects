import { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, RefreshCw, User, ChevronDown } from 'lucide-react';
import { useUsers } from '../../context/UserContext';

export default function Header({ toggleSidebar, darkMode, toggleDark }) {
  const { setSearch, searchQuery, refetch, loading } = useUsers();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header
      className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
      style={{
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10,
      }}
    >
      {/* Toggle sidebar */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <span>UserManagement</span>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }} className="font-medium">User Management</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto md:ml-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'Sora, sans-serif',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={refetch}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}
          title="Refresh data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>

        <button
          className="p-2 rounded-lg relative transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#6366f1' }}
          />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
            >
              A
            </div>
            <span className="hidden sm:block text-sm font-medium">Admin</span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {showProfile && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 z-50 animate-fade-in"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Admin User
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  admin@forge.io
                </div>
              </div>
              {['Profile Settings', 'Account', 'Sign Out'].map(item => (
                <button
                  key={item}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{ color: item === 'Sign Out' ? '#f87171' : 'var(--text-muted)' }}
                  onMouseEnter={e => e.target.style.background = 'var(--bg-surface)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                  onClick={() => setShowProfile(false)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
