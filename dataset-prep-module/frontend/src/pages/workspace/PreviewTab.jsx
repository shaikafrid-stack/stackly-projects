import React, { useEffect, useState } from 'react';
import { DatasetAPI } from '../../api/endpoints';
import DataPreviewTable from '../../components/DataPreviewTable';
import { LoadingState, EmptyState } from '../../components/Overlay';

export default function PreviewTab({ datasetId, refreshKey }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    setLoading(true);
    DatasetAPI.preview(datasetId)
      .then((res) => setPreview(res.data.data))
      .finally(() => setLoading(false));
  }, [datasetId, refreshKey]);

  if (loading) return <LoadingState label="Loading preview..." />;
  if (!preview) return <EmptyState title="Preview unavailable" />;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="font-bold text-slate-700">Data Preview <span className="text-slate-400 font-normal">· first 20 of {preview.totalRows} records</span></p>
          {selectedColumn && (
            <span className="badge bg-brand-100 text-brand-700">Selected for transformation: {selectedColumn}</span>
          )}
        </div>
        <DataPreviewTable
          columns={preview.columns}
          rows={preview.records}
          highlightColumn={selectedColumn}
          onSelectColumn={setSelectedColumn}
        />
        <p className="text-xs text-slate-400 mt-3">Click a column header to select it — head to the Transformation Builder tab to apply an operation to it.</p>
      </div>
    </div>
  );
}
