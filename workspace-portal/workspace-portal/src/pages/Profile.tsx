import React, { useState } from 'react';
import { User, Mail, Shield, Building, Clock, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Avatar, RoleBadge, StatusBadge, FormField } from '../components/ui';
import { formatDateTime } from '../utils/helpers';
import { ROLE_LABELS } from '../constants';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: appState, updateUser } = useApp();
  const user = authState.user!;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);

  const myActivities = appState.activities
    .filter(a => a.userId === user.id)
    .slice(0, 10);

  const myProjects = appState.projects.filter(
    p => p.ownerId === user.id || p.teamIds.includes(user.id)
  );

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    updateUser({ ...user, name: name.trim(), department: department.trim() }, user.id, user.name);
    toast.success('Profile updated');
    setEditing(false);
  };

  const handleCancel = () => {
    setName(user.name);
    setDepartment(user.department);
    setEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar initials={user.avatar} name={user.name} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{user.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary">
              <Edit2 size={14} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary">
                <Save size={14} /> Save
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                <X size={14} /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name">
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
                <User size={14} className="text-slate-400" /> {user.name}
              </div>
            )}
          </FormField>

          <FormField label="Email Address">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
              <Mail size={14} className="text-slate-400" /> {user.email}
            </div>
          </FormField>

          <FormField label="Role">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
              <Shield size={14} className="text-slate-400" /> {ROLE_LABELS[user.role]}
            </div>
          </FormField>

          <FormField label="Department">
            {editing ? (
              <input
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="input-field"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
                <Building size={14} className="text-slate-400" /> {user.department}
              </div>
            )}
          </FormField>

          <FormField label="Last Active">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
              <Clock size={14} className="text-slate-400" /> {formatDateTime(user.lastActive)}
            </div>
          </FormField>

          <FormField label="Member Since">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 py-2">
              <Clock size={14} className="text-slate-400" /> {formatDateTime(user.createdAt)}
            </div>
          </FormField>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Projects', value: myProjects.length },
          { label: 'Activities', value: myActivities.length },
          { label: 'Active Projects', value: myProjects.filter(p => p.status === 'active').length },
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">My Recent Activity</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {myActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No activity recorded yet</div>
          ) : (
            myActivities.map(activity => (
              <div key={activity.id} className="p-3.5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-700 dark:text-slate-300">{activity.description}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDateTime(activity.timestamp)}</div>
                </div>
                <span className="text-xs text-slate-400 capitalize">{activity.module}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
