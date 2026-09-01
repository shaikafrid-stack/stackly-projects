import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, StatCard } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { getDataset, getProfile, runProfiling } from '../api/datasets';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function DatasetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profiling, setProfiling] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getDataset(id), getProfile(id).catch(() => null)])
      .then(([dRes, pRes]) => {
        setDataset(dRes.data.data);
        setProfile(pRes ? pRes.data.data : null);
      })
      .catch(() => setError('Failed to load dataset details'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleProfile = async () => {
    setProfiling(true);
    try {
      await runProfiling(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Profiling failed');
    } finally {
      setProfiling(false);
    }
  };

  if (loading) return <DashboardLayout title="Dataset Details"><Loader /></DashboardLayout>;
  if (error) return <DashboardLayout title="Dataset Details"><p className="text-rose-600">{error}</p></DashboardLayout>;
  if (!dataset) return null;

  const radarData = profile
    ? [
        { dimension: 'Completeness', score: profile.completenessScore },
        { dimension: 'Validity', score: profile.validityScore },
        { dimension: 'Uniqueness', score: profile.uniquenessScore },
        { dimension: 'Consistency', score: profile.consistencyScore },
      ]
    : [];

  return (
    <DashboardLayout title={dataset.name}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Badge status={dataset.status} />
          <Badge status={dataset.profileStatus} />
        </div>
        <div className="flex gap-2">
          {dataset.status === 'PROCESSED' && (
            <button className="btn btn-primary" disabled={profiling} onClick={handleProfile}>
              {profiling ? 'Profiling...' : profile ? 'Re-Run Profiling' : 'Run Profiling'}
            </button>
          )}
          {profile && (
            <>
              <Link className="btn btn-secondary" to={`/datasets/${id}/columns`}>Column Analysis</Link>
              <Link className="btn btn-secondary" to={`/datasets/${id}/issues`}>Quality Issues</Link>
            </>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-slate-400">File Name</p><p className="font-medium text-slate-700">{dataset.fileName}</p></div>
          <div><p className="text-slate-400">File Type</p><p className="font-medium text-slate-700">{dataset.fileType}</p></div>
          <div><p className="text-slate-400">Rows</p><p className="font-medium text-slate-700">{dataset.rowCount?.toLocaleString()}</p></div>
          <div><p className="text-slate-400">Columns</p><p className="font-medium text-slate-700">{dataset.columnCount}</p></div>
        </div>
      </Card>

      {!profile && (
        <EmptyState
          title="No profiling results yet"
          description="Run profiling to generate dataset-level and column-level statistics along with data quality checks."
        />
      )}

      {profile && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Rows" value={profile.totalRows.toLocaleString()} />
            <StatCard label="Total Columns" value={profile.totalColumns} />
            <StatCard label="Missing Values" value={profile.missingValues.toLocaleString()} tone="warning" />
            <StatCard label="Duplicate Rows" value={profile.duplicateRows.toLocaleString()} tone={profile.duplicateRows > 0 ? 'poor' : 'default'} />
            <StatCard
              label="Quality Score"
              value={`${profile.qualityScore}%`}
              tone={profile.qualityScore >= 85 ? 'good' : profile.qualityScore >= 60 ? 'warning' : 'poor'}
            />
          </div>

          <Card>
            <h3 className="font-semibold text-slate-700 mb-4">Quality by Dimension</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" fontSize={12} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                <Radar name="Score" dataKey="score" stroke="#3b5fe0" fill="#3b5fe0" fillOpacity={0.35} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
