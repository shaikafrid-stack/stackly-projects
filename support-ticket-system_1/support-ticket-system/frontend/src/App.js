import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CreateTicket from './pages/customer/CreateTicket';
import MyTickets from './pages/customer/MyTickets';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentTickets from './pages/agent/AgentTickets';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/AdminTickets';
import SLAMonitor from './pages/admin/SLAMonitor';
import UserManagement from './pages/admin/UserManagement';
import Analytics from './pages/admin/Analytics';

// Shared
import TicketDetail from './pages/TicketDetail';
import Layout from './components/common/Layout';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"/></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'agent') return <Navigate to="/agent/dashboard" />;
  return <Navigate to="/customer/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer */}
          <Route path="/customer" element={<ProtectedRoute roles={['customer']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="tickets/new" element={<CreateTicket />} />
          </Route>

          {/* Agent */}
          <Route path="/agent" element={<ProtectedRoute roles={['agent']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="tickets" element={<AgentTickets />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="sla" element={<SLAMonitor />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Shared ticket detail */}
          <Route path="/tickets/:id" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<TicketDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
