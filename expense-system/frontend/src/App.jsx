import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeExpenses from './pages/EmployeeExpenses';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerExpenses from './pages/ManagerExpenses';
import AdminDashboard from './pages/AdminDashboard';
import AdminExpenses from './pages/AdminExpenses';
import AdminReports from './pages/AdminReports';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/employee"
        element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /></ProtectedRoute>}
      />
      <Route
        path="/employee/expenses"
        element={<ProtectedRoute allowedRoles={['employee']}><EmployeeExpenses /></ProtectedRoute>}
      />

      <Route
        path="/manager"
        element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/manager/expenses"
        element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerExpenses /></ProtectedRoute>}
      />

      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/expenses"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminExpenses /></ProtectedRoute>}
      />
      <Route
        path="/admin/reports"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>}
      />

      <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
      <Route path="*" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
    </Routes>
  );
}
