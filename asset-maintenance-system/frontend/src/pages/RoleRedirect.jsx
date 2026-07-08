import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const ROLE_HOME = {
  admin: '/admin',
  maintenance_engineer: '/engineer',
  employee: '/employee',
};

export default function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <Loading full />;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}
