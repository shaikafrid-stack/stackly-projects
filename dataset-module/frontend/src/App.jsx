import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DatasetList from './pages/DatasetList';
import UploadDataset from './pages/UploadDataset';
import DatasetDetails from './pages/DatasetDetails';
import Profile from './pages/Profile';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/datasets" element={<ProtectedRoute><DatasetList /></ProtectedRoute>} />
      <Route
        path="/datasets/upload"
        element={<ProtectedRoute roles={['ANALYST']}><UploadDataset /></ProtectedRoute>}
      />
      <Route path="/datasets/:id" element={<ProtectedRoute><DatasetDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
