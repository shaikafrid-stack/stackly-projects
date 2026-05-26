import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/products': 'Products',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar title={title} />
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
