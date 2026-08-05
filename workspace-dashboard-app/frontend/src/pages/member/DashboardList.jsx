import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import Pagination from '../../components/Pagination.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import api from '../../api/axios.js';

export default function DashboardList() {
  const [dashboards, setDashboards] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 9;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboards', {
        params: { search, category, status: 'Active', page, limit },
      });
      setDashboards(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load dashboards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page]);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-5">Dashboard List</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Search dashboards..." />
        </div>
        <input
          className="input w-48"
          placeholder="Filter by category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.map((d) => (
              <div key={d.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <span className="badge bg-primary-50 text-primary-700">{d.category}</span>
                  <StatusBadge status={d.status} />
                </div>
                <h3 className="font-semibold">{d.dashboard_name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{d.description}</p>
                <p className="text-xs text-gray-400 mt-3">{d.workspace_name}</p>
              </div>
            ))}
            {dashboards.length === 0 && (
              <p className="text-gray-400 col-span-full text-center py-10">No dashboards found.</p>
            )}
          </div>
          <div className="card mt-4">
            <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
          </div>
        </>
      )}
    </Layout>
  );
}
