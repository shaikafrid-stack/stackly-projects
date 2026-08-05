import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';

export default function ActivityHistory() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/activity', { params: { page, limit } });
      setLogs(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load activity history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <Layout>
      <h2 className="text-xl font-bold mb-5">Activity History</h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => (
              <li key={log.id} className="py-3 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50 text-primary-600 mt-0.5">
                  <History size={15} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.user_name}</span> {log.activity}
                  </p>
                  <p className="text-xs text-gray-400">
                    {log.workspace_name || 'General'} &middot; {new Date(log.activity_time).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
            {logs.length === 0 && <p className="text-gray-400 text-center py-10">No activity yet.</p>}
          </ul>
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} />
        </div>
      )}
    </Layout>
  );
}
