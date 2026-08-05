import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
      <ShieldAlert className="text-red-500" size={40} />
      <h1 className="text-xl font-bold">Access Denied</h1>
      <p className="text-gray-500 max-w-sm">You don't have permission to view this page.</p>
      <Link to="/login" className="btn-primary mt-2">
        Back to Login
      </Link>
    </div>
  );
}
