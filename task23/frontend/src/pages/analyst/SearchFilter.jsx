import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import Pagination from '../../components/Pagination.jsx';
import FormInput from '../../components/FormInput.jsx';
import Button from '../../components/Button.jsx';

export default function SearchFilter() {
  const [filters, setFilters] = useState({ search: '', category: '', status: '', owner_id: '' });
  const [owners, setOwners] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').catch(() => ({ data: [] })).then((res) => setOwners(res?.data || []));
  }, []);

  const runSearch = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/datasets', {
        params: {
          page,
          limit: 8,
          search: filters.search || undefined,
          category: filters.category || undefined,
          status: filters.status || undefined,
          owner_id: filters.owner_id || undefined,
        },
      });
      setDatasets(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Search & Filter</h1>

      <div className="card grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <FormInput
          label="Search"
          placeholder="Dataset name or description"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <FormInput
          label="Category"
          placeholder="e.g. Sales"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <FormInput
          label="Status"
          as="select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: '', label: 'All' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Published', label: 'Published' },
            { value: 'Archived', label: 'Archived' },
          ]}
        />
        <FormInput
          label="Owner"
          as="select"
          value={filters.owner_id}
          onChange={(e) => setFilters({ ...filters, owner_id: e.target.value })}
          options={[{ value: '', label: 'All' }, ...owners.map((o) => ({ value: o.id, label: o.name }))]}
        />
        <Button onClick={() => runSearch(1)} className="md:col-span-4 w-fit">Apply Filters</Button>
      </div>

      <Table
        loading={loading}
        rows={datasets}
        columns={[
          { key: 'dataset_name', header: 'Dataset', render: (r) => (
              <Link to={`/analyst/datasets/${r.id}`} className="text-brand-600 hover:underline font-medium">
                {r.dataset_name}
              </Link>
            ) },
          { key: 'category', header: 'Category', render: (r) => r.category || '—' },
          { key: 'owner_name', header: 'Owner', render: (r) => r.owner_name || '—' },
          { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={runSearch} />
    </div>
  );
}
