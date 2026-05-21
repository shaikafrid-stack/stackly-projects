import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import StatsCards from '../users/StatsCards';
import UserTable from '../users/UserTable';
import UserForm from '../users/UserForm';
import Modal from '../ui/Modal';

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  function handleEdit(user) {
    setEditUser(user);
  }

  function handleCloseEdit() {
    setEditUser(null);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            User Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage your team members, roles, and access permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <UserPlus size={16} />
          Add New User
        </button>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* User Table */}
      <UserTable onEdit={handleEdit} />

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        maxWidth="560px"
      >
        <UserForm onClose={() => setShowAddModal(false)} editUser={null} />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editUser}
        onClose={handleCloseEdit}
        title="Edit User"
        maxWidth="560px"
      >
        <UserForm onClose={handleCloseEdit} editUser={editUser} />
      </Modal>
    </div>
  );
}