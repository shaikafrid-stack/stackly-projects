import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Spinner, EmptyState } from '../components/UI';

const toCSV = (rows) => {
  const header = ['Certificate Number', 'Employee', 'Training', 'Issued Date', 'Expiry Date'];
  const lines = rows.map((c) => [
    c.certificate_number,
    c.employee?.name || '',
    c.training?.title || '',
    c.issued_date || '',
    c.expiry_date || '',
  ].join(','));
  return [header.join(','), ...lines].join('\n');
};

const Certifications = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await api.get('/certifications', { params: { limit: 100 } });
        setCerts(data.data);
      } catch (err) {
        toast.error('Failed to load certifications');
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleExport = () => {
    const csv = toCSV(certs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certifications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {user.role === 'employee' ? 'My Certifications' : 'Certifications'}
          </h1>
          {certs.length > 0 && (
            <button
              onClick={handleExport}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : certs.length === 0 ? (
          <EmptyState message="No certifications found yet." />
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4">Certificate #</th>
                  {user.role !== 'employee' && <th className="py-3 px-4">Employee</th>}
                  <th className="py-3 px-4">Training</th>
                  <th className="py-3 px-4">Issued</th>
                  <th className="py-3 px-4">Expires</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-3 px-4 font-mono text-xs">{c.certificate_number}</td>
                    {user.role !== 'employee' && <td className="py-3 px-4">{c.employee?.name}</td>}
                    <td className="py-3 px-4">{c.training?.title}</td>
                    <td className="py-3 px-4">{c.issued_date}</td>
                    <td className="py-3 px-4">{c.expiry_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;
