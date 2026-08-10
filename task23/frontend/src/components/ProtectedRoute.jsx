import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Wraps a route so it requires authentication, and optionally restricts
 * access to a set of roles. Redirects unauthenticated users to /login and
 * unauthorized users to a 403 page.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;

  return children;
}
