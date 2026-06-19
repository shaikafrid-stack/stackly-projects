import React, { useMemo, memo } from 'react';
import { mockProducts } from '../constants/mockData';
import type { ColumnDef } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { formatCurrency } from '../utils';

const TrendBadge = memo(({ trend }: { trend: string }) => {
  const map: Record<string, string> = { up: '▲ Up', down: '▼ Down', stable: '— Stable' };
  const cls: Record<string, string> = { up: 'badge-success', down: 'badge-danger', stable: 'badge-neutral' };
  return <span className={`badge ${cls[trend] ?? 'badge-neutral'}`}>{map[trend] ?? trend}</span>;
});

const Products = () => {
  const columns = useMemo((): ColumnDef<Record<string, unknown>>[] => [
    { key: 'id', label: 'ID', width: '100px' },
    { key: 'name', label: 'Product', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'price', label: 'Price', sortable: true, render: v => formatCurrency(Number(v)) },
    { key: 'stock', label: 'Stock', sortable: true },
    { key: 'sold', label: 'Sold', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true, render: v => formatCurrency(Number(v)) },
    { key: 'trend', label: 'Trend', render: v => <TrendBadge trend={String(v)} /> },
  ], []);

  const tableData = useMemo(() => mockProducts as unknown as Record<string, unknown>[], []);

  return (
    <div className="page-content">
      <DataTable data={tableData} columns={columns} title="Products"
        searchKeys={['name', 'category'] as (keyof Record<string, unknown>)[]}
        filename="products" />
    </div>
  );
};

export default Products;
