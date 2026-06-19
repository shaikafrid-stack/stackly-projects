import React, { useMemo, memo } from 'react';
import { mockOrders } from '../constants/mockData';
import type { ColumnDef } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { formatCurrency, formatDate, getStatusBadge } from '../utils';

const StatusBadge = memo(({ status }: { status: string }) => (
  <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
));

const Orders = () => {
  const columns = useMemo((): ColumnDef<Record<string, unknown>>[] => [
    { key: 'id', label: 'Order ID', width: '110px' },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'product', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'quantity', label: 'Qty', sortable: true, width: '60px' },
    { key: 'unitPrice', label: 'Unit Price', sortable: true, render: v => formatCurrency(Number(v)) },
    { key: 'totalAmount', label: 'Total', sortable: true, render: v => formatCurrency(Number(v)) },
    { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: v => formatDate(String(v)) },
  ], []);

  const tableData = useMemo(() => mockOrders as unknown as Record<string, unknown>[], []);

  return (
    <div className="page-content">
      <DataTable data={tableData} columns={columns} title="Orders"
        searchKeys={['customerName', 'product', 'category', 'status', 'region'] as (keyof Record<string, unknown>)[]}
        filename="orders" />
    </div>
  );
};

export default Orders;
