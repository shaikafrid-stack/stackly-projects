import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <p className="text-6xl">🔧</p>
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Go Home
      </Link>
    </div>
  );
}
