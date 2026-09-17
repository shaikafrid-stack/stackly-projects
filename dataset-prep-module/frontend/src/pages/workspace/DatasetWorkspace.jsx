import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Info, Eye, Wand2, GitCompare, ShieldCheck, Layers, History } from 'lucide-react';
import { DatasetAPI } from '../../api/endpoints';
import { LoadingState, ErrorState } from '../../components/Overlay';
import StatusBadge from '../../components/StatusBadge';

import OverviewTab from './OverviewTab';
import PreviewTab from './PreviewTab';
import BuilderTab from './BuilderTab';
import PreviewChangesTab from './PreviewChangesTab';
import ValidationTab from './ValidationTab';
import VersionsTab from './VersionsTab';
import HistoryTab from './HistoryTab';

const TABS = [
  { key: 'details', label: 'Details', icon: Info },
  { key: 'preview', label: 'Data Preview', icon: Eye },
  { key: 'builder', label: 'Transformation Builder', icon: Wand2 },
  { key: 'changes', label: 'Preview Changes', icon: GitCompare },
  { key: 'validation', label: 'Validation', icon: ShieldCheck },
  { key: 'versions', label: 'Prepared Versions', icon: Layers },
  { key: 'history', label: 'History', icon: History }
];

export default function DatasetWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'details';

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDataset = useCallback(() => {
    setLoading(true);
    DatasetAPI.get(id)
      .then((res) => { setDataset(res.data.data); setError(''); })
      .catch(() => setError('Dataset not found or you do not have access.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(loadDataset, [loadDataset]);

  const bump = () => setRefreshKey((k) => k + 1);

  const setTab = (key) => setSearchParams({ tab: key });

  if (loading) return <LoadingState label="Loading dataset..." />;
  if (error) return <ErrorState message={error} />;
  if (!dataset) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/datasets')} className="btn-ghost !p-2 border border-slate-200">
          <ArrowLeft size={16} />
        </button>
        <div className="min-w-0">
          <p className="page-title truncate">{dataset.name}</p>
          <p className="page-subtitle">Dataset Preparation Workspace</p>
        </div>
        <StatusBadge status={dataset.status} className="ml-auto shrink-0" />
      </div>

      <div className="card p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === t.key ? 'bg-brand-gradient text-white shadow-glow' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className="animate-fade-in">
        {activeTab === 'details' && <OverviewTab dataset={dataset} />}
        {activeTab === 'preview' && <PreviewTab datasetId={dataset.id} refreshKey={refreshKey} />}
        {activeTab === 'builder' && <BuilderTab dataset={dataset} onChanged={bump} />}
        {activeTab === 'changes' && <PreviewChangesTab dataset={dataset} key={refreshKey} />}
        {activeTab === 'validation' && <ValidationTab dataset={dataset} onValidated={bump} />}
        {activeTab === 'versions' && <VersionsTab dataset={dataset} refreshKey={refreshKey} onSaved={() => { bump(); loadDataset(); }} />}
        {activeTab === 'history' && <HistoryTab datasetId={dataset.id} refreshKey={refreshKey} />}
      </div>
    </div>
  );
}
