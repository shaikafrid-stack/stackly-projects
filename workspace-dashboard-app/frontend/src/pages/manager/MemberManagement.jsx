import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import api from '../../api/axios.js';

export default function MemberManagement() {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [adding, setAdding] = useState(false);

  const [confirmRemove, setConfirmRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/workspaces', { params: { limit: 100 } });
      setWorkspaces(data.data);
      if (data.data.length > 0) setWorkspaceId(String(data.data[0].id));
    } catch (err) {
      toast.error('Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (id) => {
    if (!id) return;
    setMembersLoading(true);
    try {
      const { data } = await api.get(`/workspaces/${id}/members`);
      setMembers(data);
    } catch (err) {
      toast.error('Failed to load members.');
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaceId) loadMembers(workspaceId);
  }, [workspaceId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, { email, member_role: memberRole });
      toast.success('Member added successfully.');
      setAddModal(false);
      setEmail('');
      setMemberRole('Member');
      loadMembers(workspaceId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${confirmRemove.id}`);
      toast.success('Member removed successfully.');
      setConfirmRemove(null);
      loadMembers(workspaceId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold">Member Management</h2>
        <button className="btn-primary" onClick={() => setAddModal(true)} disabled={!workspaceId}>
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      <div className="w-72 mb-4">
        <select className="input" value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)}>
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.workspace_name}
            </option>
          ))}
        </select>
      </div>

      {membersLoading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-medium">{m.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{m.email}</td>
                  <td className="py-3 pr-4">
                    <span className="badge bg-primary-50 text-primary-700">{m.member_role}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{new Date(m.joined_at).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button className="btn-danger !px-2" onClick={() => setConfirmRemove(m)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No members in this workspace yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Add Member"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddModal(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="add-member-form" disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </>
        }
      >
        <form id="add-member-form" onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="label">User Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Workspace Manager">Workspace Manager</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove Member"
        message={`Remove ${confirmRemove?.name} from this workspace?`}
      />
    </Layout>
  );
}
