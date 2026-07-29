import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import api from '../../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile(data)).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-xl font-bold mb-4">My Profile</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="card max-w-md">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
              <p className="font-medium capitalize">{profile.role.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
