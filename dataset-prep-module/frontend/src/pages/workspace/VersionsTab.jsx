import React, { useEffect, useState } from 'react';
import { Save, Eye, Trash2, Layers, Rows3, Columns3, User, Calendar } from 'lucide-react';
import { VersionAPI } from '../../api/endpoints';
import { Modal, ConfirmDialog, EmptyState, LoadingState } from '../../components/Overlay';
import StatusBadge from '../../components/StatusBadge';
import DataPreviewTable from '../../components/DataPreviewTable';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function VersionsTab({ dataset, refreshKey, onSaved }) {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canSave = hasRole('ADMIN', 'DATA_STEWARD');
  const canDelete = hasRole('ADMIN');

  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [detailVersion, setDetailVersion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    VersionAPI.list(dataset.id).then((res) => setVersions(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [dataset.id, refreshKey]);

  const handleSave = async () => {
    if (!versionName.trim()) { toast.error('Please enter a version name.'); return; }
    setSaving(true);
    try {
      await VersionAPI.create(dataset.id, { version_name: versionName, description });
      toast.success('Prepared version saved successfully!');
      setSaveOpen(false);
      setVersionName('');
      setDescription('');
      load();
      onSaved && onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prepared version.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (v) => {
    const res = await VersionAPI.get(dataset.id, v.id);
    setDetailVersion(res.data.data);
  };

  const handleDelete = async () => {
    try {
      await VersionAPI.remove(dataset.id, deleteTarget.id);
      toast.success('Prepared version deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete version.');
    }
  };

  if (loading) return <LoadingState label="Loading prepared versions..." />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">Prepared Dataset Versions</p>
          <p className="text-xs text-slate-400">The original dataset stays unchanged — each save creates a new version.</p>
        </div>
        <button className="btn-primary" onClick={() => setSaveOpen(true)} disabled={!canSave} title={!canSave ? 'Only Admins and Data Stewards can save versions' : ''}>
          <Save size={16} /> Save Prepared Version
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="card"><EmptyState icon={Layers} title="No versions yet" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {versions.map((v) => (
            <div key={v.id} className="card p-5 animate-fade-in flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="badge bg-brand-100 text-brand-700">Version {v.version_number}</span>
                <StatusBadge status={v.status} />
              </div>
              <p className="font-bold text-slate-800">{v.version_name}</p>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 flex-1">{v.description || 'No description provided.'}</p>

              <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><Rows3 size={13} className="text-brand-400" /> {v.row_count} rows</div>
                <div className="flex items-center gap-1.5"><Columns3 size={13} className="text-brand-400" /> {v.column_count} cols</div>
                <div className="flex items-center gap-1.5 col-span-2"><User size={13} className="text-brand-400" /> {v.created_by_name || '—'}</div>
                <div className="flex items-center gap-1.5 col-span-2"><Calendar size={13} className="text-brand-400" /> {new Date(v.created_at).toLocaleDateString()}</div>
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50">
                <button className="btn-secondary flex-1 !py-1.5 !text-xs" onClick={() => openDetail(v)}><Eye size={13} /> View</button>
                {v.version_number !== 1 && (
                  <button className="btn-ghost !py-1.5 !text-xs text-rose-500 hover:bg-rose-50 disabled:opacity-30" disabled={!canDelete} onClick={() => setDeleteTarget(v)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save version modal */}
      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save Prepared Version"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setSaveOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Version'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Version Name</label>
            <input className="input" value={versionName} onChange={(e) => setVersionName(e.target.value)} placeholder="e.g. Cleaned Dataset" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What changed in this version?" />
          </div>
          <p className="text-xs text-slate-400">This applies your current draft transformation steps to the original data and stores the result as a brand-new immutable version.</p>
        </div>
      </Modal>

      {/* Version detail modal */}
      <Modal open={!!detailVersion} onClose={() => setDetailVersion(null)} title={detailVersion ? `${detailVersion.version_name} (v${detailVersion.version_number})` : ''} size="xl">
        {detailVersion && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="font-extrabold text-slate-700">{detailVersion.row_count}</p><p className="text-[11px] text-slate-400">Rows</p></div>
              <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="font-extrabold text-slate-700">{detailVersion.column_count}</p><p className="text-[11px] text-slate-400">Columns</p></div>
              <div className="bg-slate-50 rounded-xl p-3 text-center"><StatusBadge status={detailVersion.status} /></div>
              {detailVersion.validation && <div className="bg-slate-50 rounded-xl p-3 text-center"><StatusBadge status={detailVersion.validation.validation_status} /></div>}
            </div>

            <div>
              <p className="font-bold text-slate-700 mb-2 text-sm">Applied Transformations</p>
              <div className="space-y-1.5">
                {detailVersion.transformations.length === 0 ? (
                  <p className="text-xs text-slate-400">No transformation steps recorded for this version.</p>
                ) : detailVersion.transformations.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-3 py-2">
                    <span className="font-bold text-brand-600">{i + 1}.</span>
                    <span className="font-semibold text-slate-600">{t.transformation_type.replace(/_/g, ' ')}</span>
                    {t.column_name && <span className="text-slate-400">on {t.column_name}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        danger
        title="Delete prepared version?"
        message={`This will permanently delete "${deleteTarget?.version_name}". This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
