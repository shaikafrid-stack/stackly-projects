import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { getColumnProfiles, getDataset } from '../api/datasets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ColumnAnalysis() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('columnName');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [dataType, setDataType] = useState('');
  const [qualityStatus, setQualityStatus] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      getDataset(id),
      getColumnProfiles(id, { sortBy, order: sortOrder, dataType, qualityStatus, search }),
    ])
      .then(([dRes, cRes]) => {
        setDataset(dRes.data.data);
        setColumns(cRes.data.data);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load column analysis'))
      .finally(() => setLoading(false));
  }, [id, sortBy, sortOrder, dataType, qualityStatus, search]);

  useEffect(() => { load(); }, [load]);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(key);
      setSortOrder('ASC');
    }
  };

  const tableColumns = [
    { key: 'columnName', label: 'Column Name', sortable: true },
    { key: 'dataType', label: 'Data Type', sortable: true, render: (r) => <span className="uppercase text-xs font-semibold text-slate-500">{r.dataType}</span> },
    { key: 'nullValues', label: 'Null Count', render: (r) => r.nullValues },
    { key: 'nullPercentage', label: 'Null %', sortable: true, render: (r) => `${r.nullPercentage}%` },
    { key: 'uniqueValues', label: 'Unique Count', render: (r) => r.uniqueValues },
    { key: 'uniquePercentage', label: 'Unique %', sortable: true, render: (r) => `${r.uniquePercentage}%` },
    { key: 'qualityScore', label: 'Quality Score', sortable: true, render: (r) => `${r.qualityScore}%` },
    { key: 'qualityStatus', label: 'Status', render: (r) => <Badge status={r.qualityStatus} /> },
  ];

  return (
    <DashboardLayout title={dataset ? `Column Analysis — ${dataset.name}` : 'Column Analysis'}>
      <div className="mb-4">
        <Link to={`/datasets/${id}`} className="text-sm text-brand-600 hover:underline">← Back to dataset</Link>
      </div>

      {loading && <Loader label="Loading column analysis..." />}
      {error && <p className="text-rose-600 text-sm">{error}</p>}

      {!loading && !error && (
        <>
          {columns.length > 0 && (
            <Card className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-4">Null Values by Column</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={columns.map((c) => ({ name: c.columnName, value: c.nullPercentage }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis fontSize={11} unit="%" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {columns.map((c, i) => (
                      <Cell key={i} fill={c.nullPercentage >= 20 ? '#f43f5e' : c.nullPercentage >= 5 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input className="input max-w-xs" placeholder="Search columns..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="input max-w-[160px]" value={dataType} onChange={(e) => setDataType(e.target.value)}>
                <option value="">All Types</option>
                <option value="STRING">String</option>
                <option value="INTEGER">Integer</option>
                <option value="DECIMAL">Decimal</option>
                <option value="BOOLEAN">Boolean</option>
                <option value="DATE">Date</option>
              </select>
              <select className="input max-w-[160px]" value={qualityStatus} onChange={(e) => setQualityStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="GOOD">Good</option>
                <option value="WARNING">Warning</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
            {columns.length === 0 ? (
              <EmptyState title="No column results" description="Run profiling on this dataset first." />
            ) : (
              <Table columns={tableColumns} rows={columns} onSort={handleSort} sortBy={sortBy} sortOrder={sortOrder} />
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
