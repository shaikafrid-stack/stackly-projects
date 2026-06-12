import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Edit2, Power, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { usePermissions, usePagination, useSearch } from '../hooks';
import { User, UserRole, UserStatus } from '../types';
import {
  Modal, ConfirmDialog, Avatar, RoleBadge, StatusBadge,
  Pagination, SearchInput, FormField, EmptyState, Skeleton,
} from '../components/ui';
import { createUserSchema, CreateUserFormValues } from '../utils/validation';
import { formatRelativeTime } from '../utils/helpers';
import { ROLE_LABELS } from '../constants';
import toast from 'react-hot-toast';

const Users: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: appState, addUser, updateUser, toggleUserStatus } = useApp();
  const perms = usePermissions();
  const user = authState.user!;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  const { query, setQuery, filtered: searchFiltered } = useSearch(
    appState.users, ['name', 'email', 'department']
  );

  const filtered = useMemo(() => {
    let result = searchFiltered;
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') result = result.filter(u => u.status === statusFilter);
    return result;
  }, [searchFiltered, roleFilter, statusFilter]);

  const { paginatedItems, pagination, totalPages, setPage, setPageSize } = usePagination(filtered);

  // Form
  const {
    register, handleSubmit, reset, setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  const openEdit = (u: User) => {
    setEditingUser(u);
    setValue('name', u.name);
    setValue('email', u.email);
    setValue('role', u.role);
    setValue('department', u.department);
    setValue('password', '********');
  };

  const onSubmit = async (data: CreateUserFormValues) => {
    await new Promise(r => setTimeout(r, 400));
    if (editingUser) {
      updateUser({ ...editingUser, name: data.name, email: data.email, role: data.role, department: data.department }, user.id, user.name);
      toast.success('User updated successfully');
      setEditingUser(null);
    } else {
      addUser(data, user.id, user.name);
      toast.success('User added successfully');
      setShowAddModal(false);
    }
    reset();
  };

  const handleClose = () => {
    setShowAddModal(false);
    setEditingUser(null);
    reset();
  };

  const roleOptions = Object.entries(ROLE_LABELS) as [UserRole, string][];

  const UserForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Full Name" error={errors.name?.message as string | undefined} required>
          <input {...register('name')} className="input-field" placeholder="Jane Smith" />
        </FormField>
        <FormField label="Email" error={errors.email?.message as string | undefined} required>
          <input {...register('email')} type="email" className="input-field" placeholder="jane@workspace.io" />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Role" error={errors.role?.message as string | undefined} required>
          <select {...register('role')} className="input-field">
            <option value="">Select role</option>
            {roleOptions.filter(([r]) => perms.canManageRoles || r !== 'super_admin').map(([r, l]) => (
              <option key={r} value={r}>{l}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Department" error={errors.department?.message as string | undefined} required>
          <input {...register('department')} className="input-field" placeholder="Engineering" />
        </FormField>
      </div>
      {!editingUser && (
        <FormField label="Password" error={errors.password?.message as string | undefined} required>
          <input {...register('password')} type="password" className="input-field" placeholder="Min. 6 characters" />
        </FormField>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={handleClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : editingUser ? 'Save Changes' : 'Add User'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput value={query} onChange={setQuery} placeholder="Search users…" />
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Roles</option>
              {roleOptions.map(([r, l]) => <option key={r} value={r}>{l}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as UserStatus | 'all')} className="input-field py-2 text-xs w-auto">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        {perms.canCreateUser && (
          <button className="btn-primary shrink-0" onClick={() => { reset(); setShowAddModal(true); }}>
            <UserPlus size={15} />Add User
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="table-header">User</th>
                <th className="table-header">Role</th>
                <th className="table-header hidden md:table-cell">Department</th>
                <th className="table-header">Status</th>
                <th className="table-header hidden lg:table-cell">Last Active</th>
                {(perms.canEditUser || perms.canDeactivateUser) && (
                  <th className="table-header text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.avatar} name={u.name} size="sm" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><RoleBadge role={u.role} /></td>
                  <td className="table-cell hidden md:table-cell text-slate-500">{u.department}</td>
                  <td className="table-cell"><StatusBadge status={u.status} /></td>
                  <td className="table-cell hidden lg:table-cell text-slate-500">{formatRelativeTime(u.lastActive)}</td>
                  {(perms.canEditUser || perms.canDeactivateUser) && (
                    <td className="table-cell text-right">
                      <div className="flex items-center gap-1 justify-end">
                        {perms.canEditUser && (
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Edit user"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                        {perms.canDeactivateUser && u.id !== user.id && (
                          <button
                            onClick={() => setConfirmToggle(u)}
                            className={`p-1.5 rounded transition-colors ${
                              u.status === 'active'
                                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500'
                                : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-500'
                            }`}
                            title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            <Power size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<Search size={24} />}
                      title="No users found"
                      description="Try adjusting your search or filter criteria."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          pagination={pagination} totalPages={totalPages}
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={handleClose} title="Add New User">
        <UserForm />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingUser} onClose={handleClose} title="Edit User">
        <UserForm />
      </Modal>

      {/* Confirm toggle */}
      <ConfirmDialog
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => {
          if (confirmToggle) {
            toggleUserStatus(confirmToggle.id, user.id, user.name);
            toast.success(`User ${confirmToggle.status === 'active' ? 'deactivated' : 'activated'}`);
          }
        }}
        title={confirmToggle?.status === 'active' ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmToggle?.status === 'active' ? 'deactivate' : 'activate'} ${confirmToggle?.name}?`}
        confirmLabel={confirmToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={confirmToggle?.status === 'active' ? 'danger' : 'warning'}
      />
    </div>
  );
};

export default Users;
