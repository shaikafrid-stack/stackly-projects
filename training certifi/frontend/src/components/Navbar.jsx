import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/trainings', label: 'Trainings' },
    { to: '/users', label: 'Users' },
    { to: '/certifications', label: 'Certifications' },
  ],
  trainer: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/trainings', label: 'My Trainings' },
    { to: '/enrollments', label: 'Enrollments' },
    { to: '/certifications', label: 'Certifications' },
  ],
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/trainings', label: 'Browse Trainings' },
    { to: '/my-enrollments', label: 'My Enrollments' },
    { to: '/certifications', label: 'My Certifications' },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = linksByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-bold text-lg text-primary-600">
          TrainCert
        </Link>
        <div className="hidden md:flex gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:inline">
          {user.name} <span className="uppercase text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full ml-1">{user.role}</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
