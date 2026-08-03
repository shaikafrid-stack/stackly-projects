import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import DataSourcesList from "./pages/admin/DataSourcesList";
import DataSourceForm from "./pages/admin/DataSourceForm";
import ConnectionHistory from "./pages/admin/ConnectionHistory";

import AvailableDataSources from "./pages/analyst/AvailableDataSources";
import ConnectionDetails from "./pages/analyst/ConnectionDetails";
import ActivityHistory from "./pages/analyst/ActivityHistory";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: "13px", borderRadius: "10px" },
            success: { iconTheme: { primary: "#12B76A", secondary: "#fff" } },
            error: { iconTheme: { primary: "#F04438", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route
            path="/admin/data-sources"
            element={<ProtectedRoute roles={["ADMIN"]}><DataSourcesList /></ProtectedRoute>}
          />
          <Route
            path="/admin/data-sources/new"
            element={<ProtectedRoute roles={["ADMIN"]}><DataSourceForm /></ProtectedRoute>}
          />
          <Route
            path="/admin/data-sources/:id/edit"
            element={<ProtectedRoute roles={["ADMIN"]}><DataSourceForm /></ProtectedRoute>}
          />
          <Route
            path="/admin/history"
            element={<ProtectedRoute roles={["ADMIN"]}><ConnectionHistory /></ProtectedRoute>}
          />

          <Route
            path="/analyst/data-sources"
            element={<ProtectedRoute roles={["ANALYST", "ADMIN"]}><AvailableDataSources /></ProtectedRoute>}
          />
          <Route
            path="/analyst/data-sources/:id"
            element={<ProtectedRoute roles={["ANALYST", "ADMIN"]}><ConnectionDetails /></ProtectedRoute>}
          />
          <Route
            path="/analyst/history"
            element={<ProtectedRoute roles={["ANALYST", "ADMIN"]}><ActivityHistory /></ProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
