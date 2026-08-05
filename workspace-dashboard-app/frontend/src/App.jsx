import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Profile from './pages/Profile.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

import WorkspaceManagement from './pages/admin/WorkspaceManagement.jsx';
import UserAssignment from './pages/admin/UserAssignment.jsx';
import WorkspaceStatistics from './pages/admin/WorkspaceStatistics.jsx';

import WorkspaceDashboard from './pages/manager/WorkspaceDashboard.jsx';
import MemberManagement from './pages/manager/MemberManagement.jsx';
import DashboardManagement from './pages/manager/DashboardManagement.jsx';

import MyWorkspaces from './pages/member/MyWorkspaces.jsx';
import DashboardList from './pages/member/DashboardList.jsx';
import ActivityHistory from './pages/member/ActivityHistory.jsx';

export default function App() {
  const { user, homeRouteForRole } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homeRouteForRole(user.role)} replace /> : <Login />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Administrator */}
      <Route
        path="/admin/workspaces"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <WorkspaceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <UserAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute roles={['Administrator']}>
            <WorkspaceStatistics />
          </ProtectedRoute>
        }
      />

      {/* Workspace Manager */}
      <Route
        path="/manager/dashboards"
        element={
          <ProtectedRoute roles={['Workspace Manager']}>
            <WorkspaceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/members"
        element={
          <ProtectedRoute roles={['Workspace Manager']}>
            <MemberManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/dashboard-management"
        element={
          <ProtectedRoute roles={['Workspace Manager']}>
            <DashboardManagement />
          </ProtectedRoute>
        }
      />

      {/* Member */}
      <Route
        path="/member/workspaces"
        element={
          <ProtectedRoute roles={['Member']}>
            <MyWorkspaces />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/dashboards"
        element={
          <ProtectedRoute roles={['Member']}>
            <DashboardList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/activity"
        element={
          <ProtectedRoute roles={['Member']}>
            <ActivityHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? <Navigate to={homeRouteForRole(user.role)} replace /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
