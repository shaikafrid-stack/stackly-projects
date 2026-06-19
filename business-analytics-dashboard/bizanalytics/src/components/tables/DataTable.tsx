import React, { useState, useMemo, useCallback, memo } from 'react';
import type { ColumnDef } from '../../types';
import { useSearch } from '../../hooks/useSearch';
import { useSort } from '../../hooks/useSort';
import { usePagination } from '../../hooks/usePagination';
import { useCSVExport } from '../../hooks/useCSVExport';
import { EmptyState } from '../ui/States';

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  searchKeys?: (keyof T)[];
  filename?: string;
}

function DataTableInner<T extends Record<string, unknown>>({
  data, columns, title, searchKeys = [], filename = 'export',
}: DataTableProps<T>) {
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(columns.map(c => String(c.key))));
  const [showColMenu, setShowColMenu] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const { search, setSearch, filtered: searched } = useSearch(data, searchKeys);
  const { sort, sorted, toggleSort } = useSort(searched as Record<string, unknown>[]);
  const { page, totalPages, total, paginated, goToPage, hasNext, hasPrev } = usePagination(sorted as T[], pageSize);
  const { exportToCSV } = useCSVExport();

  const visibleColumns = useMemo(() => columns.filter(c => visibleCols.has(String(c.key))), [columns, visibleCols]);

  const toggleColumn = useCallback((key: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(data, filename, visibleColumns.map(c => ({ key: c.key, label: c.label })));
  }, [data, filename, visibleColumns, exportToCSV]);

  return (
    <div className="datatable-wrap">
      <div className="datatable-toolbar">
        {title && <h3 className="datatable-title">{title}</h3>}
        <div className="datatable-controls">
          <input className="search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ position: 'relative' }}>
            <button className="btn-secondary" onClick={() => setShowColMenu(v => !v)}>Columns ▾</button>
            {showColMenu && (
              <div className="col-menu">
                {columns.map(c => (
                  <label key={String(c.key)} className="col-menu-item">
                    <input type="checkbox" checked={visibleCols.has(String(c.key))} onChange={() => toggleColumn(String(c.key))} />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <button className="btn-secondary" onClick={handleExport}>⬇ Export CSV</button>
          <select className="select-sm" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); }}>
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {visibleColumns.map(col => (
                <th key={String(col.key)} className={col.sortable ? 'sortable' : ''} style={col.width ? { width: col.width } : {}}
                  onClick={() => col.sortable && toggleSort(col.key as keyof Record<string, unknown>)}>
                  {col.label}
                  {col.sortable && <span className="sort-icon">{sort.key === col.key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0
              ? <tr><td colSpan={visibleColumns.length}><EmptyState /></td></tr>
              : paginated.map((row, i) => (
                <tr key={i}>
                  {visibleColumns.map(col => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span className="table-info">Showing {paginated.length ? (page-1)*pageSize+1 : 0}–{Math.min(page*pageSize,total)} of {total}</span>
        <div className="pagination">
          <button className="page-btn" disabled={!hasPrev} onClick={() => goToPage(1)}>«</button>
          <button className="page-btn" disabled={!hasPrev} onClick={() => goToPage(page - 1)}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
            return p <= totalPages ? <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => goToPage(p)}>{p}</button> : null;
          })}
          <button className="page-btn" disabled={!hasNext} onClick={() => goToPage(page + 1)}>›</button>
          <button className="page-btn" disabled={!hasNext} onClick={() => goToPage(totalPages)}>»</button>
        </div>
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
