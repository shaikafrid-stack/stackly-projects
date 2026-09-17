import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dpm_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('dpm_user', JSON.stringify(user));
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(email, password);
      localStorage.setItem('dpm_token', data.data.token);
      localStorage.setItem('dpm_user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dpm_token');
    localStorage.removeItem('dpm_user');
    setUser(null);
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
