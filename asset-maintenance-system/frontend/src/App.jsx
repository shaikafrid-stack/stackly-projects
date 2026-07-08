import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import RoleRedirect from './pages/RoleRedirect';
import NotFound from './pages/NotFound';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RaiseRequest from './pages/employee/RaiseRequest';
import MyRequests from './pages/employee/MyRequests';

import EngineerDashboard from './pages/engineer/EngineerDashboard';
import AssignedRequests from './pages/engineer/AssignedRequests';

import AdminDashboard from './pages/admin/AdminDashboard';
import AssetManagement from './pages/admin/AssetManagement';
import AdminServiceRequests from './pages/admin/AdminServiceRequests';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/new-request"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <RaiseRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/requests"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* Maintenance Engineer routes */}
        <Route
          path="/engineer"
          element={
            <ProtectedRoute allowedRoles={['maintenance_engineer']}>
              <EngineerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/engineer/requests"
          element={
            <ProtectedRoute allowedRoles={['maintenance_engineer']}>
              <AssignedRequests />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assets"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AssetManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminServiceRequests />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
