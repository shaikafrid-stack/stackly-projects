import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Spinner, EmptyState } from '../components/UI';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { role: role || undefined, search: search || undefined, limit: 50 } });
      setUsers(data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (id, newRole) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Users</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <input
            className="flex-1 min-w-[180px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        defaultValue={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded border border-gray-300 dark:border-gray-600 bg-transparent px-2 py-1 text-xs"
                      >
                        <option value="admin">Admin</option>
                        <option value="trainer">Trainer</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => removeUser(u.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
