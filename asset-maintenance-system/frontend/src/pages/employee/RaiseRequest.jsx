import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assetService } from '../../services/assetService';
import { serviceRequestService } from '../../services/serviceRequestService';
import Loading from '../../components/Loading';

export default function RaiseRequest() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    asset_id: '',
    issue_title: '',
    issue_description: '',
    priority: 'Medium',
  });

  useEffect(() => {
    assetService
      .getAll({ limit: 100 })
      .then((res) => setAssets(res.data.data))
      .catch(() => toast.error('Failed to load your assets.'))
      .finally(() => setLoadingAssets(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.asset_id) errs.asset_id = 'Please select an asset';
    if (!form.issue_title.trim()) errs.issue_title = 'Issue title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await serviceRequestService.create(form);
      toast.success('Service request raised successfully!');
      navigate('/employee/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise service request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAssets) return <Loading full />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Raise Service Request</h1>
      <p className="text-gray-500 text-sm mb-6">Report an issue with an asset assigned to you.</p>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Asset</label>
          <select
            className="input"
            value={form.asset_id}
            onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
          >
            <option value="">Select an asset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.asset_name} ({a.asset_code})
              </option>
            ))}
          </select>
          {assets.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No assets are currently assigned to you.</p>
          )}
          {errors.asset_id && <p className="text-xs text-red-500 mt-1">{errors.asset_id}</p>}
        </div>

        <div>
          <label className="label">Issue Title</label>
          <input
            className="input"
            value={form.issue_title}
            onChange={(e) => setForm({ ...form, issue_title: e.target.value })}
            placeholder="e.g. Laptop screen flickering"
          />
          {errors.issue_title && <p className="text-xs text-red-500 mt-1">{errors.issue_title}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={4}
            value={form.issue_description}
            onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div>
          <label className="label">Priority</label>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
