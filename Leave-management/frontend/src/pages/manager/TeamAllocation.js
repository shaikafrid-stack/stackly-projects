import React, { useState, useEffect } from 'react';
import { assignAPI, userAPI, projectAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PageHeader, LoadingSpinner, EmptyState } from '../../components/shared/UIComponents';
import { Plus, UserCheck } from 'lucide-react';

export default function TeamAllocation() {
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ employeeId: '', projectId: '' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      assignAPI.getAll(),
      userAPI.getEmployees(),
      projectAPI.getAll({ size: 100 })
    ]).then(([a, e, p]) => {
      setAssignments(a.data);
      setEmployees(e.data);
      setProjects(p.data.content || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.projectId) { toast.error('Select employee and project'); return; }
    setSubmitting(true);
    try {
      await assignAPI.assign({ employeeId: Number(form.employeeId), projectId: Number(form.projectId) });
      toast.success('Employee assigned!');
      setForm({ employeeId: '', projectId: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Team Allocation"
        subtitle="Manage project assignments"
        action={
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Assign Employee
          </button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Assignment</h3>
          <form onSubmit={handleAssign} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select employee...</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                <UserCheck size={16} />
                {submitting ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">Current Assignments ({assignments.length})</h2>
        </div>
        {loading ? <LoadingSpinner /> : assignments.length === 0 ? <EmptyState message="No assignments yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['#', 'Employee', 'Project', 'Assigned Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments.map((a, i) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{a.employeeName}</td>
                    <td className="px-4 py-3 text-gray-600">{a.projectName}</td>
                    <td className="px-4 py-3 text-gray-500">{a.assignedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
