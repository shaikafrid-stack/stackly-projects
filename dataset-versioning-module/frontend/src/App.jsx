import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DatasetList from './pages/DatasetList';
import DatasetOverview from './pages/DatasetOverview';
import VersionHistory from './pages/VersionHistory';
import VersionDetails from './pages/VersionDetails';
import VersionComparison from './pages/VersionComparison';
import DatasetLineage from './pages/DatasetLineage';
import ChangeHistory from './pages/ChangeHistory';

const TITLES = {
  '/': 'Dashboard',
  '/datasets': 'Datasets',
};

function pageTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.includes('/versions/')) return 'Version Details';
  if (pathname.endsWith('/versions')) return 'Version History';
  if (pathname.endsWith('/compare')) return 'Compare Versions';
  if (pathname.endsWith('/lineage')) return 'Dataset Lineage';
  if (pathname.endsWith('/changes')) return 'Change History';
  if (pathname.startsWith('/datasets/')) return 'Dataset Overview';
  return 'DataLineage Console';
}

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-brand-50/40">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={pageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/datasets" element={<ProtectedLayout><DatasetList /></ProtectedLayout>} />
      <Route path="/datasets/:datasetId" element={<ProtectedLayout><DatasetOverview /></ProtectedLayout>} />
      <Route path="/datasets/:datasetId/versions" element={<ProtectedLayout><VersionHistory /></ProtectedLayout>} />
      <Route path="/datasets/:datasetId/compare" element={<ProtectedLayout><VersionComparison /></ProtectedLayout>} />
      <Route path="/datasets/:datasetId/lineage" element={<ProtectedLayout><DatasetLineage /></ProtectedLayout>} />
      <Route path="/datasets/:datasetId/changes" element={<ProtectedLayout><ChangeHistory /></ProtectedLayout>} />
      <Route path="/versions/:versionId" element={<ProtectedLayout><VersionDetails /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
