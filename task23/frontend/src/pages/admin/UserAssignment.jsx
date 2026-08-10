import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/Table.jsx';
import FormInput from '../../components/FormInput.jsx';

const ROLES = ['Administrator', 'Data Steward', 'Data Analyst'];

export default function UserAssignment() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (user, role) => {
    try {
      await api.put(`/users/${user.id}`, { role, status: user.status });
      toast.success(`${user.name}'s role updated to ${role}.`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleStatusToggle = async (user) => {
    const status = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/users/${user.id}`, { role: user.role, status });
      toast.success(`${user.name} is now ${status}.`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">User Assignment</h1>
      <p className="text-sm text-slate-500">Assign roles (including Data Stewards) and manage account status.</p>

      <Table
        loading={loading}
        rows={users}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'email', header: 'Email' },
          {
            key: 'role',
            header: 'Role',
            render: (u) => (
              <FormInput
                as="select"
                value={u.role}
                onChange={(e) => handleRoleChange(u, e.target.value)}
                className="w-44"
                options={ROLES.map((r) => ({ value: r, label: r }))}
              />
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (u) => (
              <button
                className={`badge cursor-pointer ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}
                onClick={() => handleStatusToggle(u)}
              >
                {u.status}
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
