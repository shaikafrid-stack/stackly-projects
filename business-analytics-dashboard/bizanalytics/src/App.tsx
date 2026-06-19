import React, { Suspense, lazy, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageLoader } from './components/ui/States';
import Sidebar from './components/layout/Sidebar';
import { Header } from './components/ui/Header';

// Lazy-loaded pages: each route is its own chunk, so the initial bundle only
// ships the Dashboard. Recharts (heavy) is only pulled in when Analytics or
// Dashboard render, and Reports/Customers/Orders/Products split out further.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Customers = lazy(() => import('./pages/Customers'));
const Orders = lazy(() => import('./pages/Orders'));
const Products = lazy(() => import('./pages/Products'));

function Shell() {
  const { state } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={closeMobile} />
      <div className={`main-content${state.sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/products" element={<Products />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
