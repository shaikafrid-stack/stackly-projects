import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/projects': 'Project Management',
  '/activity': 'Activity Logs',
  '/profile': 'Profile Settings',
};

const Header: React.FC = () => {
  const { state: appState, dispatch } = useApp();
  const { state: authState } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Workspace';

  const unreadActivities = appState.activities
    .filter(a => a.status === 'error' || a.status === 'warning').length;

  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-xs text-slate-400 hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Notifications */}
        {authState.user && (
          <div className="relative">
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <Bell size={18} />
              {unreadActivities > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        )}
        {/* Theme toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          title={appState.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {appState.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
