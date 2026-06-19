import React, { useState, useMemo, useCallback, memo } from 'react';
import { mockReports } from '../constants/mockData';
import type { Report, ColumnDef } from '../types';
import { DataTable } from '../components/tables/DataTable';
import { formatDate, getStatusBadge } from '../utils';

const StatusBadge = memo(({ status }: { status: string }) => (
  <span className={`badge ${getStatusBadge(status)}`}>{status}</span>
));

const ReportDetail = memo(({ report, onClose }: { report: Report; onClose: () => void }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{report.name}</h2>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        <div className="detail-grid">
          <div><span className="detail-label">Type</span><span>{report.type}</span></div>
          <div><span className="detail-label">Status</span><StatusBadge status={report.status} /></div>
          <div><span className="detail-label">Created</span><span>{formatDate(report.createdDate)}</span></div>
          <div><span className="detail-label">Updated</span><span>{formatDate(report.updatedDate)}</span></div>
          <div><span className="detail-label">Created By</span><span>{report.createdBy}</span></div>
          <div><span className="detail-label">File Size</span><span>{report.size}</span></div>
        </div>
        <p className="detail-desc">{report.description}</p>
      </div>
    </div>
  </div>
));

const Reports = () => {
  const [selected, setSelected] = useState<Report | null>(null);

  const columns = useMemo((): ColumnDef<Record<string, unknown>>[] => [
    { key: 'id', label: 'ID', sortable: true, width: '100px' },
    { key: 'name', label: 'Report Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true, width: '120px' },
    { key: 'createdDate', label: 'Created', sortable: true, width: '120px',
      render: v => formatDate(String(v)) },
    { key: 'status', label: 'Status', sortable: true, width: '120px',
      render: v => <StatusBadge status={String(v)} /> },
    { key: 'createdBy', label: 'Author', sortable: true },
    { key: 'size', label: 'Size', width: '80px' },
    { key: 'id', label: 'Action', width: '80px',
      render: (_, row) => (
        <button className="btn-link" onClick={() => setSelected(row as unknown as Report)}>View</button>
      )},
  ], []);

  const tableData = useMemo(() => mockReports as unknown as Record<string, unknown>[], []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div className="page-content">
      <DataTable
        data={tableData}
        columns={columns}
        title="Reports Management"
        searchKeys={['name', 'type', 'createdBy', 'status'] as (keyof Record<string, unknown>)[]}
        filename="reports"
      />
      {selected && <ReportDetail report={selected} onClose={handleClose} />}
    </div>
  );
};

export default Reports;
