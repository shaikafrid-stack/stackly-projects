import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api
      .get('/profile')
      .then(({ data }) => setProfile(data))
      .catch(() => toast.error('Failed to load profile.'));
  }, []);

  if (!profile) return <p className="text-slate-400">Loading profile...</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      <div className="card space-y-3">
        <div>
          <p className="label">Name</p>
          <p className="text-slate-800">{profile.name}</p>
        </div>
        <div>
          <p className="label">Email</p>
          <p className="text-slate-800">{profile.email}</p>
        </div>
        <div>
          <p className="label">Role</p>
          <p className="text-slate-800">{profile.role}</p>
        </div>
        <div>
          <p className="label">Status</p>
          <p className="text-slate-800">{profile.status}</p>
        </div>
        <div>
          <p className="label">Member Since</p>
          <p className="text-slate-800">{new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
