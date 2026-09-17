import React from 'react';
import { Rows3, Columns3, Star, Calendar, User, FileType2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function OverviewTab({ dataset }) {
  if (!dataset) return null;
  const stats = [
    { icon: Rows3, label: 'Rows', value: dataset.row_count },
    { icon: Columns3, label: 'Columns', value: dataset.column_count },
    { icon: Star, label: 'Quality Score', value: `${Number(dataset.quality_score).toFixed(0)}%` },
    { icon: FileType2, label: 'File Type', value: dataset.file_type }
  ];

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">{dataset.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{dataset.description}</p>
          </div>
          <StatusBadge status={dataset.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-4 text-center">
              <s.icon className="mx-auto text-brand-500 mb-1.5" size={18} />
              <p className="text-lg font-extrabold text-slate-700">{s.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <User size={15} className="text-brand-500" /> Created by <span className="font-semibold text-slate-700">{dataset.created_by_name || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar size={15} className="text-brand-500" /> Last updated <span className="font-semibold text-slate-700">{new Date(dataset.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-brand-50/40 border-brand-100">
        <p className="font-bold text-brand-800 mb-2">Workflow</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-700">
          {['Select Dataset', 'Inspect Data', 'Apply Transformations', 'Preview Changes', 'Validate', 'Save Prepared Version'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span className="bg-white rounded-full px-3 py-1.5 shadow-sm">{step}</span>
              {i < arr.length - 1 && <span className="text-brand-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
