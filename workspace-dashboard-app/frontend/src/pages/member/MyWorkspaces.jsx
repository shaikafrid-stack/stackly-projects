import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Briefcase, Users, LayoutGrid } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

export default function MyWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workspaces', { params: { search, limit: 50 } });
      setWorkspaces(data.data);
    } catch (err) {
      toast.error('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-5">My Workspaces</h2>

      <div className="w-64 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search workspaces..." />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-primary-50 text-primary-600">
                  <Briefcase size={20} />
                </div>
                <StatusBadge status={ws.status} />
              </div>
              <h3 className="font-semibold">{ws.workspace_name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ws.description}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={13} /> {ws.member_count} members
                </span>
                <span className="flex items-center gap-1">
                  <LayoutGrid size={13} /> {ws.dashboard_count} dashboards
                </span>
              </div>
            </div>
          ))}
          {workspaces.length === 0 && (
            <p className="text-gray-400 col-span-full text-center py-10">You are not assigned to any workspaces yet.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
