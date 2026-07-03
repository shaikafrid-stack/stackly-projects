import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
