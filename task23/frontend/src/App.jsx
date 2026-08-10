import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Forbidden from './pages/Forbidden.jsx';

import WorkspaceManagement from './pages/admin/WorkspaceManagement.jsx';
import DatasetOverview from './pages/admin/DatasetOverview.jsx';
import UserAssignment from './pages/admin/UserAssignment.jsx';

import DatasetManagement from './pages/steward/DatasetManagement.jsx';
import MetadataEditor from './pages/steward/MetadataEditor.jsx';
import VersionHistory from './pages/steward/VersionHistory.jsx';
import ActivityLog from './pages/steward/ActivityLog.jsx';

import DatasetExplorer from './pages/analyst/DatasetExplorer.jsx';
import DatasetDetails from './pages/analyst/DatasetDetails.jsx';
import SearchFilter from './pages/analyst/SearchFilter.jsx';
import Favorites from './pages/analyst/Favorites.jsx';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function Private({ roles, children }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/403" element={<Forbidden />} />

        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />

        {/* Administrator */}
        <Route
          path="/admin/workspaces"
          element={<Private roles={['Administrator']}><WorkspaceManagement /></Private>}
        />
        <Route
          path="/admin/datasets"
          element={<Private roles={['Administrator']}><DatasetOverview /></Private>}
        />
        <Route
          path="/admin/users"
          element={<Private roles={['Administrator']}><UserAssignment /></Private>}
        />

        {/* Data Steward */}
        <Route
          path="/steward/datasets"
          element={<Private roles={['Administrator', 'Data Steward']}><DatasetManagement /></Private>}
        />
        <Route
          path="/steward/datasets/:id/metadata"
          element={<Private roles={['Administrator', 'Data Steward']}><MetadataEditor /></Private>}
        />
        <Route
          path="/steward/datasets/:id/versions"
          element={<Private roles={['Administrator', 'Data Steward']}><VersionHistory /></Private>}
        />
        <Route
          path="/steward/activity"
          element={<Private roles={['Administrator', 'Data Steward']}><ActivityLog /></Private>}
        />

        {/* Data Analyst */}
        <Route
          path="/analyst/explorer"
          element={<Private roles={['Administrator', 'Data Steward', 'Data Analyst']}><DatasetExplorer /></Private>}
        />
        <Route
          path="/analyst/datasets/:id"
          element={<Private roles={['Administrator', 'Data Steward', 'Data Analyst']}><DatasetDetails /></Private>}
        />
        <Route
          path="/analyst/search"
          element={<Private roles={['Administrator', 'Data Steward', 'Data Analyst']}><SearchFilter /></Private>}
        />
        <Route
          path="/analyst/favorites"
          element={<Private roles={['Administrator', 'Data Steward', 'Data Analyst']}><Favorites /></Private>}
        />

        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}
