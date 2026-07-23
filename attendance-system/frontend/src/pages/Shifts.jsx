import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export default function Shifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ shift_name: '', start_time: '', end_time: '', grace_minutes: 15 });

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts');
      setShifts(res.data);
    } catch (err) {
      toast.error('Failed to load shifts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ shift_name: '', start_time: '', end_time: '', grace_minutes: 15 });
    setModalOpen(true);
  };

  const openEdit = (shift) => {
    setEditing(shift);
    setForm({
      shift_name: shift.shift_name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      grace_minutes: shift.grace_minutes,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.shift_name || !form.start_time || !form.end_time) {
      toast.error('Please fill all required fields.');
      return;
    }
    try {
      if (editing) {
        await api.put(`/shifts/${editing.id}`, form);
        toast.success('Shift updated.');
      } else {
        await api.post('/shifts', form);
        toast.success('Shift created.');
      }
      setModalOpen(false);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shift.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      toast.success('Shift deleted.');
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete shift.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shift Management</h1>
        {user?.role === 'admin' && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> New Shift
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <Loading />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Shift Name</th>
                <th className="px-6 py-3">Start Time</th>
                <th className="px-6 py-3">End Time</th>
                <th className="px-6 py-3">Grace (min)</th>
                {user?.role === 'admin' && <th className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-medium">{s.shift_name}</td>
                  <td className="px-6 py-3">{s.start_time}</td>
                  <td className="px-6 py-3">{s.end_time}</td>
                  <td className="px-6 py-3">{s.grace_minutes}</td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-3 flex gap-3">
                      <button onClick={() => openEdit(s)} className="text-primary-600 hover:underline text-xs flex items-center gap-1">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-xs flex items-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No shifts configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editing ? 'Edit Shift' : 'New Shift'}</h3>
              <button onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Shift Name</label>
                <input
                  type="text"
                  value={form.shift_name}
                  onChange={(e) => setForm({ ...form, shift_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Start Time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">End Time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Grace Period (minutes)</label>
                <input
                  type="number"
                  value={form.grace_minutes}
                  onChange={(e) => setForm({ ...form, grace_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
