import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import Table from '../components/Table';
import {
  getDataset, previewDataset, getSchema, validateDataset,
  getValidationResults, processDataset, deleteDataset
} from '../api/datasets';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TABS = ['Overview', 'Preview', 'Schema', 'Validation Results', 'Processing Status'];

export default function DatasetDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Overview');
  const [busy, setBusy] = useState(false);

  const [preview, setPreview] = useState(null);
  const [schema, setSchema] = useState(null);
  const [validation, setValidation] = useState(null);

  const loadDataset = useCallback(() => {
    setLoading(true);
    getDataset(id)
      .then(setDataset)
      .catch(() => setError('Failed to load dataset'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadDataset(); }, [loadDataset]);

  useEffect(() => {
    if (!dataset) return;
    if (tab === 'Preview' && !preview) {
      previewDataset(id).then(setPreview).catch(() => showToast('Failed to load preview', 'error'));
    }
    if (tab === 'Schema' && !schema) {
      getSchema(id).then(setSchema).catch(() => showToast('Failed to load schema', 'error'));
    }
    if (tab === 'Validation Results') {
      getValidationResults(id).then(setValidation).catch(() => setValidation(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dataset]);

  const canValidate = user?.role === 'ANALYST' && dataset && ['UPLOADED', 'VALIDATION_FAILED', 'VALIDATED'].includes(dataset.status);
  const canProcess = user?.role === 'ANALYST' && dataset && dataset.status === 'VALIDATED';
  const canDelete = user?.role === 'ADMIN';

  const handleValidate = async () => {
    setBusy(true);
    try {
      await validateDataset(id);
      showToast('Validation completed', 'success');
      loadDataset();
      setValidation(null);
      setSchema(null);
      setTab('Validation Results');
    } catch (err) {
      showToast(err.response?.data?.message || 'Validation failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleProcess = async () => {
    setBusy(true);
    try {
      await processDataset(id);
      showToast('Dataset processed successfully', 'success');
      loadDataset();
      setTab('Processing Status');
    } catch (err) {
      showToast(err.response?.data?.message || 'Processing failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this dataset? This cannot be undone.')) return;
    try {
      await deleteDataset(id);
      showToast('Dataset deleted', 'success');
      navigate('/datasets');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) return (<div><Navbar /><div className="max-w-6xl mx-auto px-6"><LoadingState /></div></div>);
  if (error || !dataset) return (<div><Navbar /><div className="max-w-6xl mx-auto px-6 py-8"><ErrorState message={error || 'Not found'} /></div></div>);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{dataset.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{dataset.description || 'No description'}</p>
            <div className="mt-2"><StatusBadge status={dataset.status} /></div>
          </div>
          <div className="flex gap-2">
            {canValidate && (
              <button onClick={handleValidate} disabled={busy} className="text-sm px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? 'Working...' : 'Validate'}
              </button>
            )}
            {canProcess && (
              <button onClick={handleProcess} disabled={busy} className="text-sm px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                {busy ? 'Working...' : 'Process'}
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="text-sm px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50">
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm border-b-2 -mb-px ${tab === t ? 'border-brand-600 text-brand-700 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        {tab === 'Overview' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-2 gap-4 text-sm">
            <Info label="Dataset ID" value={dataset.id} />
            <Info label="Original File Name" value={dataset.original_file_name} />
            <Info label="File Type" value={dataset.file_type} />
            <Info label="File Size" value={`${(dataset.file_size / 1024).toFixed(1)} KB`} />
            <Info label="Uploaded By" value={dataset.uploader?.name} />
            <Info label="Upload Date" value={new Date(dataset.uploaded_at).toLocaleString()} />
            <Info label="Rows" value={dataset.row_count} />
            <Info label="Columns" value={dataset.column_count} />
            <Info label="Last Processed" value={dataset.processed_at ? new Date(dataset.processed_at).toLocaleString() : '-'} />
            <Info label="Category" value={dataset.category || '-'} />
          </div>
        )}

        {tab === 'Preview' && (
          preview ? (
            preview.preview_rows.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-3">{preview.total_rows} total rows · {preview.total_columns} columns</p>
                <Table
                  columns={preview.columns.map((c) => ({ key: c, label: c }))}
                  rows={preview.preview_rows.map((r, i) => ({ id: i, ...r }))}
                />
              </>
            ) : <EmptyState title="No rows to preview" />
          ) : <LoadingState label="Loading preview..." />
        )}

        {tab === 'Schema' && (
          schema ? (
            schema.length > 0 ? (
              <Table
                columns={[
                  { key: 'column_name', label: 'Column' },
                  { key: 'data_type', label: 'Detected Type' },
                  { key: 'nullable', label: 'Nullable', render: (r) => (r.nullable ? 'Yes' : 'No') }
                ]}
                rows={schema}
              />
            ) : <EmptyState title="No schema detected yet" subtitle="Run validation to detect the schema." />
          ) : <LoadingState label="Loading schema..." />
        )}

        {tab === 'Validation Results' && (
          validation ? (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Info label="Total Records" value={validation.total_records} />
                <Info label="Valid Records" value={validation.valid_records} />
                <Info label="Invalid Records" value={validation.invalid_records} />
                <Info label="Missing Values" value={validation.missing_values} />
                <Info label="Duplicate Records" value={validation.duplicate_records} />
              </div>
              <div className="mb-4"><StatusBadge status={validation.validation_status} /></div>

              {validation.errors?.length > 0 ? (
                <Table
                  columns={[
                    { key: 'row_number', label: 'Row' },
                    { key: 'column_name', label: 'Column' },
                    { key: 'invalid_value', label: 'Value' },
                    { key: 'error_message', label: 'Error' }
                  ]}
                  rows={validation.errors}
                />
              ) : <EmptyState title="No validation errors" />}
            </div>
          ) : <EmptyState title="No validation results yet" subtitle="Run validation to see results here." />
        )}

        {tab === 'Processing Status' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 grid grid-cols-2 gap-4 text-sm max-w-md">
            <Info label="Status" value={<StatusBadge status={dataset.status} />} />
            <Info label="Rows Processed" value={dataset.row_count} />
            <Info label="Last Processed" value={dataset.processed_at ? new Date(dataset.processed_at).toLocaleString() : 'Not yet processed'} />
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 mt-0.5">{value ?? '-'}</p>
    </div>
  );
}
