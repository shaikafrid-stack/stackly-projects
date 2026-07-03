import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';

import AdminDashboard from './pages/admin/AdminDashboard';
import VendorManagement from './pages/admin/VendorManagement';
import ContractManagement from './pages/admin/ContractManagement';

import FinanceOverview from './pages/finance/FinanceOverview';
import InvoiceApprovals from './pages/finance/InvoiceApprovals';
import PaymentManagement from './pages/finance/PaymentManagement';

import VendorDashboard from './pages/vendor/VendorDashboard';
import MyContracts from './pages/vendor/MyContracts';
import UploadInvoice from './pages/vendor/UploadInvoice';
import InvoiceHistory from './pages/vendor/InvoiceHistory';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  finance_manager: '/finance/dashboard',
  vendor: '/vendor/dashboard',
};

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner full />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['admin']}><VendorManagement /></ProtectedRoute>} />
      <Route path="/admin/contracts" element={<ProtectedRoute allowedRoles={['admin']}><ContractManagement /></ProtectedRoute>} />

      {/* Finance Manager */}
      <Route path="/finance/dashboard" element={<ProtectedRoute allowedRoles={['finance_manager']}><FinanceOverview /></ProtectedRoute>} />
      <Route path="/finance/approvals" element={<ProtectedRoute allowedRoles={['finance_manager']}><InvoiceApprovals /></ProtectedRoute>} />
      <Route path="/finance/payments" element={<ProtectedRoute allowedRoles={['finance_manager']}><PaymentManagement /></ProtectedRoute>} />

      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/contracts" element={<ProtectedRoute allowedRoles={['vendor']}><MyContracts /></ProtectedRoute>} />
      <Route path="/vendor/upload" element={<ProtectedRoute allowedRoles={['vendor']}><UploadInvoice /></ProtectedRoute>} />
      <Route path="/vendor/invoices" element={<ProtectedRoute allowedRoles={['vendor']}><InvoiceHistory /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
