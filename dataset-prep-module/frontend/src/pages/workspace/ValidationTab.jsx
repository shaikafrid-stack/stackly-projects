import React, { useEffect, useState } from 'react';
import { ShieldCheck, PlayCircle, AlertOctagon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TransformAPI } from '../../api/endpoints';
import { LoadingState, EmptyState } from '../../components/Overlay';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

function Tile({ label, value, tone }) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700'
  };
  return (
    <div className={`rounded-xl p-4 text-center ${tones[tone]}`}>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[11px] font-medium opacity-70 mt-0.5">{label}</p>
    </div>
  );
}

const STATUS_ICON = { PASSED: CheckCircle2, WARNING: AlertTriangle, FAILED: AlertOctagon };

export default function ValidationTab({ dataset, onValidated }) {
  const toast = useToast();
  const { hasRole } = useAuth();
  const canValidate = hasRole('ADMIN', 'DATA_STEWARD');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = () => {
    setLoading(true);
    TransformAPI.validationResults(dataset.id)
      .then((res) => setHistory(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [dataset.id]);

  const runValidation = async () => {
    setRunning(true);
    try {
      await TransformAPI.validate(dataset.id, []);
      toast.success('Validation completed.');
      load();
      onValidated && onValidated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Validation failed to run.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <LoadingState label="Loading validation results..." />;

  const latest = history[0];
  const Icon = latest ? STATUS_ICON[latest.validation_status] || ShieldCheck : ShieldCheck;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">Validation</p>
          <p className="text-xs text-slate-400">Runs basic checks against the current draft transformation pipeline.</p>
        </div>
        <button className="btn-primary" onClick={runValidation} disabled={running || !canValidate} title={!canValidate ? 'Only Admins and Data Stewards can run validation' : ''}>
          <PlayCircle size={16} /> {running ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {!latest ? (
        <div className="card"><EmptyState icon={ShieldCheck} title="No validation run yet" subtitle="Run validation to check for missing values, duplicates, and data consistency issues before saving a version." /></div>
      ) : (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className={`rounded-2xl p-3 ${latest.validation_status === 'PASSED' ? 'bg-emerald-100 text-emerald-600' : latest.validation_status === 'FAILED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="font-extrabold text-slate-800">Validation {latest.validation_status === 'PASSED' ? 'Passed' : latest.validation_status === 'FAILED' ? 'Failed' : 'Completed with Warnings'}</p>
              <p className="text-xs text-slate-400">Run at {new Date(latest.created_at).toLocaleString()}</p>
            </div>
            <StatusBadge status={latest.validation_status} className="ml-auto" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Tile label="Total Records" value={latest.total_records} tone="slate" />
            <Tile label="Valid Records" value={latest.valid_records} tone="emerald" />
            <Tile label="Invalid Records" value={latest.invalid_records} tone="rose" />
            <Tile label="Remaining Nulls" value={latest.null_values} tone="amber" />
            <Tile label="Duplicate Records" value={latest.duplicate_records} tone="rose" />
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className="card p-5">
          <p className="font-bold text-slate-700 mb-3 text-sm">Previous Runs</p>
          <div className="space-y-2">
            {history.slice(1).map((h) => (
              <div key={h.id} className="flex items-center gap-3 text-xs text-slate-500 border-b border-slate-50 pb-2 last:border-0">
                <StatusBadge status={h.validation_status} />
                <span>{new Date(h.created_at).toLocaleString()}</span>
                <span className="ml-auto">{h.valid_records}/{h.total_records} valid</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
