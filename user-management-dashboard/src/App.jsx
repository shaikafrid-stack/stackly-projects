import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/layout/Dashboard';

function PlaceholderPage({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This section is under construction</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState('users');
  const [collapsed, setCollapsed] = useState(false);

  function renderContent() {
    switch (activeNav) {
      case 'users': return <Dashboard />;
      case 'dashboard': return <PlaceholderPage title="Dashboard Overview" />;
      case 'roles': return <PlaceholderPage title="Roles & Permissions" />;
      case 'analytics': return <PlaceholderPage title="Analytics" />;
      case 'notifications': return <PlaceholderPage title="Notifications" />;
      case 'settings': return <PlaceholderPage title="Settings" />;
      default: return <Dashboard />;
    }
  }

  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} collapsed={collapsed} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header toggleSidebar={() => setCollapsed(c => !c)} />
          <main className="flex-1 overflow-hidden flex flex-col">
            {renderContent()}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
