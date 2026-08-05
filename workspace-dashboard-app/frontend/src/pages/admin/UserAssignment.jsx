import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import Layout from '../../components/Layout.jsx';
import Loader from '../../components/Loader.jsx';
import SearchBar from '../../components/SearchBar.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axios.js';

export default function UserAssignment() {
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [inviteModal, setInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [memberRole, setMemberRole] = useState('Member');
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, wsRes] = await Promise.all([
        api.get('/dashboard/users'),
        api.get('/workspaces', { params: { limit: 100 } }),
      ]);
      setUsers(usersRes.data);
      setWorkspaces(wsRes.data.data);
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.post(`/workspaces/${workspaceId}/members`, { email, member_role: memberRole });
      toast.success('User invited to workspace successfully.');
      setInviteModal(false);
      setEmail('');
      setWorkspaceId('');
      setMemberRole('Member');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite user.');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">User Assignment</h2>
        <button className="btn-primary" onClick={() => setInviteModal(true)}>
          <UserPlus size={16} /> Invite to Workspace
        </button>
      </div>

      <div className="w-64 mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="badge bg-primary-50 text-primary-700">{u.role}</span>
                  </td>
                  <td className="py-3">
                    <span className={`badge ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Invite User to Workspace"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setInviteModal(false)}>
              Cancel
            </button>
            <button className="btn-primary" form="invite-form" disabled={inviting}>
              {inviting ? 'Inviting...' : 'Invite'}
            </button>
          </>
        }
      >
        <form id="invite-form" onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="label">Workspace</label>
            <select className="input" required value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)}>
              <option value="">-- Select workspace --</option>
              {workspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.workspace_name}
                </option>
              ))}
            </select>
          </div>
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
            <label className="label">Role in Workspace</label>
            <select className="input" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
              <option value="Member">Member</option>
              <option value="Workspace Manager">Workspace Manager</option>
            </select>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
