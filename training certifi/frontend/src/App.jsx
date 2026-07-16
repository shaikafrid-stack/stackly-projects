import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Trainings from './pages/Trainings';
import Enrollments from './pages/Enrollments';
import MyEnrollments from './pages/MyEnrollments';
import Certifications from './pages/Certifications';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
        <Route
          path="/enrollments"
          element={
            <ProtectedRoute allowedRoles={['trainer', 'admin']}>
              <Enrollments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-enrollments"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyEnrollments />
            </ProtectedRoute>
          }
        />
        <Route path="/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      </Routes>
    </>
  );
}

export default App;
