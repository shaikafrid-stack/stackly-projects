import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { getQualityRules, createQualityRule, updateQualityRule, deleteQualityRule } from '../api/datasets';
import { useAuth } from '../context/AuthContext';

const RULE_TYPES = ['COMPLETENESS', 'UNIQUENESS', 'VALIDITY', 'CONSISTENCY'];

export default function QualityRules() {
  const { user } = useAuth();
  const canManage = ['ADMINISTRATOR', 'DATA_STEWARD'].includes(user?.role);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ruleName: '', ruleType: 'COMPLETENESS', threshold: 90, severity: 'WARNING', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getQualityRules()
      .then((res) => setRules(res.data.data))
      .catch(() => setError('Failed to load quality rules'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ruleName: '', ruleType: 'COMPLETENESS', threshold: 90, severity: 'WARNING', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (rule) => {
    setEditing(rule);
    setForm({ ruleName: rule.ruleName, ruleType: rule.ruleType, threshold: rule.threshold, severity: rule.severity, status: rule.status });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateQualityRule(editing.id, form);
      } else {
        await createQualityRule(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rule) => {
    if (!confirm(`Delete rule "${rule.ruleName}"?`)) return;
    try {
      await deleteQualityRule(rule.id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete rule');
    }
  };

  const columns = [
    { key: 'ruleName', label: 'Rule Name' },
    { key: 'ruleType', label: 'Type', render: (r) => <span className="uppercase text-xs font-semibold text-slate-500">{r.ruleType}</span> },
    { key: 'threshold', label: 'Threshold', render: (r) => `${r.threshold}%` },
    { key: 'severity', label: 'Severity', render: (r) => <Badge status={r.severity} /> },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    ...(canManage ? [{
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary !px-2 !py-1 text-xs" onClick={() => openEdit(r)}>Edit</button>
          <button className="btn btn-danger !px-2 !py-1 text-xs" onClick={() => remove(r)}>Delete</button>
        </div>
      )
    }] : []),
  ];

  return (
    <DashboardLayout title="Quality Rules Configuration">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Thresholds used to evaluate Completeness, Uniqueness, Validity, and Consistency checks against profiled datasets.
          </p>
          {canManage && <button className="btn btn-primary" onClick={openCreate}>+ New Rule</button>}
        </div>
        {loading && <Loader label="Loading rules..." />}
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        {!loading && !error && rules.length === 0 && (
          <EmptyState title="No quality rules configured" description="Default thresholds (90/85/90/80) are used until custom rules are added." />
        )}
        {!loading && rules.length > 0 && <Table columns={columns} rows={rules} />}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Quality Rule' : 'New Quality Rule'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={saving || !form.ruleName} onClick={save}>{saving ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-600">Rule Name</label>
            <input className="input mt-1" value={form.ruleName} onChange={(e) => setForm({ ...form, ruleName: e.target.value })} placeholder="e.g. Email Completeness Rule" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Rule Type</label>
              <select className="input mt-1" value={form.ruleType} onChange={(e) => setForm({ ...form, ruleType: e.target.value })}>
                {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Threshold (%)</label>
              <input type="number" min="0" max="100" className="input mt-1" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Severity</label>
              <select className="input mt-1" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="WARNING">Warning</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <select className="input mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
