import React, { useMemo, memo } from 'react';
import { mockCustomers } from '../constants/mockData';
import type { ColumnDef } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { formatCurrency, formatDate, getStatusBadge } from '../utils';

const StatusBadge = memo(({ status }: { status: string }) => (
  <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
));

const Customers = () => {
  const columns = useMemo((): ColumnDef<Record<string, unknown>>[] => [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'segment', label: 'Segment', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: v => formatCurrency(Number(v)) },
    { key: 'orders', label: 'Orders', sortable: true },
    { key: 'joinedDate', label: 'Joined', sortable: true, render: v => formatDate(String(v)) },
    { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
  ], []);

  const tableData = useMemo(() => mockCustomers as unknown as Record<string, unknown>[], []);

  return (
    <div className="page-content">
      <DataTable data={tableData} columns={columns} title="Customers"
        searchKeys={['name', 'email', 'region', 'segment', 'status'] as (keyof Record<string, unknown>)[]}
        filename="customers" />
    </div>
  );
};

export default Customers;
