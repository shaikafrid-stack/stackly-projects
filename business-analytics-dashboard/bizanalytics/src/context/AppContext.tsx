import React, { createContext, useContext, useReducer, useMemo } from 'react';
import type { AppState, AppAction, AppContextValue, FilterState } from '../types';

const defaultFilters: FilterState = {
  dateRange: { from: '', to: '' },
  category: 'All',
  region: 'All',
  status: 'All',
  search: '',
};

const initialState: AppState = {
  theme: 'dark',
  sidebarOpen: true,
  filters: defaultFilters,
  notifications: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: defaultFilters };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const value = useMemo<AppContextValue>(() => ({ state, dispatch }), [state]);
  return (
    <AppContext.Provider value={value}>
      <div className={state.theme === 'dark' ? 'theme-dark' : 'theme-light'}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
