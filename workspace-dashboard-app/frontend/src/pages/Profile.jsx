import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout.jsx';
import Loader from '../components/Loader.jsx';
import api from '../api/axios.js';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/profile');
      setProfile(data);
      setName(data.name);
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', { name });
      toast.success('Profile updated successfully.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-5">My Profile</h2>
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSave} className="card max-w-lg space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={profile.email} disabled />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-gray-50" value={profile.role} disabled />
          </div>
          <div>
            <label className="label">Status</label>
            <input className="input bg-gray-50" value={profile.status} disabled />
          </div>
          <button className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </Layout>
  );
}
