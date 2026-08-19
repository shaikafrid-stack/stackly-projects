import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Profile</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3 text-sm">
          <Row label="Name" value={user?.name} />
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={user?.role} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
