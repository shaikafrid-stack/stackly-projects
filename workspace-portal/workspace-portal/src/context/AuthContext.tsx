import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../utils/mockData';

// ─── State ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE_SESSION'; payload: User };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'RESTORE_SESSION':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'workspace_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession) as User;
        dispatch({ type: 'RESTORE_SESSION', payload: user });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(r => setTimeout(r, 600)); // simulate network

    const authUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!authUser) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Invalid email or password' };
    }
    if (authUser.status === 'inactive') {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: 'Your account has been deactivated. Contact your administrator.' };
    }

    const { password: _pw, ...user } = authUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return { success: true };
  };

  const logout = (): void => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
