import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DatasetList from './pages/DatasetList';
import DatasetDetails from './pages/DatasetDetails';
import ColumnAnalysis from './pages/ColumnAnalysis';
import QualityIssues from './pages/QualityIssues';
import QualityRules from './pages/QualityRules';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/datasets" element={<ProtectedRoute><DatasetList /></ProtectedRoute>} />
      <Route path="/datasets/:id" element={<ProtectedRoute><DatasetDetails /></ProtectedRoute>} />
      <Route path="/datasets/:id/columns" element={<ProtectedRoute><ColumnAnalysis /></ProtectedRoute>} />
      <Route path="/datasets/:id/issues" element={<ProtectedRoute><QualityIssues /></ProtectedRoute>} />
      <Route path="/quality-issues" element={<ProtectedRoute><QualityIssues /></ProtectedRoute>} />
      <Route
        path="/quality-rules"
        element={
          <ProtectedRoute>
            <QualityRules />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
