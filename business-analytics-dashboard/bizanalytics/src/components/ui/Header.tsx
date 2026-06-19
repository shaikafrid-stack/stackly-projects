import React, { memo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/products': 'Products',
};

export const Header = memo(({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { state, dispatch } = useAppContext();
  const loc = useLocation();
  const title = titles[loc.pathname] ?? 'Dashboard';

  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">☰</button>
      <h1 className="page-title">{title}</h1>
      <div className="topbar-right">
        <span className="topbar-date">{new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })}</span>
        <button className="theme-btn" onClick={() => dispatch({ type: 'TOGGLE_THEME' })} title="Toggle theme">
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="avatar">AD</div>
      </div>
    </header>
  );
});
