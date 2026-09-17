import React, { useEffect, useState } from 'react';
import { RefreshCw, ArrowRight, Rows3, Columns3, PenSquare, Trash } from 'lucide-react';
import { TransformAPI } from '../../api/endpoints';
import DataPreviewTable from '../../components/DataPreviewTable';
import { LoadingState, EmptyState } from '../../components/Overlay';
import StatusBadge from '../../components/StatusBadge';

function StatTile({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <Icon size={18} className={`mx-auto mb-1.5 ${accent}`} />
      <p className="text-lg font-extrabold text-slate-700">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
    </div>
  );
}

export default function PreviewChangesTab({ dataset }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    TransformAPI.preview(dataset.id)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [dataset.id]);

  if (loading) return <LoadingState label="Computing transformation preview..." />;
  if (!data) return <EmptyState title="Nothing to preview" />;

  const { summary, stepResults, before, after } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-700">Transformation Preview</p>
          <p className="text-xs text-slate-400">Applies your draft steps to the original data without saving anything.</p>
        </div>
        <button className="btn-secondary" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <StatTile icon={Rows3} label="Original Records" value={summary.originalRecordCount} accent="text-slate-400" />
        <StatTile icon={Rows3} label="Updated Records" value={summary.updatedRecordCount} accent="text-brand-500" />
        <StatTile icon={Columns3} label="Original Columns" value={summary.originalColumnCount} accent="text-slate-400" />
        <StatTile icon={Columns3} label="Updated Columns" value={summary.updatedColumnCount} accent="text-brand-500" />
        <StatTile icon={PenSquare} label="Modified Values" value={summary.modifiedValues} accent="text-amber-500" />
        <StatTile icon={Trash} label="Removed Rows" value={summary.removedRows} accent="text-rose-500" />
      </div>

      {stepResults.length > 0 && (
        <div className="card p-5">
          <p className="font-bold text-slate-700 mb-3">Execution Log</p>
          <div className="space-y-2">
            {stepResults.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <StatusBadge status={s.status} />
                <span className="font-medium text-slate-600">{s.label || s.transformation_type}</span>
                <span className="text-slate-400 text-xs truncate">{s.log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <p className="font-bold text-slate-700 mb-3 flex items-center gap-2">Before <ArrowRight size={14} className="text-slate-300" /> After Sample</p>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Before</p>
            <DataPreviewTable columns={before.columns} rows={before.sample} dense />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">After</p>
            <DataPreviewTable columns={after.columns} rows={after.sample} dense />
          </div>
        </div>
      </div>
    </div>
  );
}
