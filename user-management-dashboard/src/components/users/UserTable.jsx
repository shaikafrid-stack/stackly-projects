import { useState } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, Mail, Building2, MoreHorizontal } from 'lucide-react';
import { useUsers } from '../../context/UserContext';
import { StatusBadge, RoleBadge, Avatar } from '../ui/Badge';

function SkeletonRow() {
  return (
    <tr>
      {Array(5).fill(0).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="skeleton h-4 rounded" style={{ width: ['140px','160px','80px','80px','80px'][i] }} />
        </td>
      ))}
    </tr>
  );
}

function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <th
      className="px-5 py-3.5 text-left cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-semibold uppercase tracking-wider transition-colors"
          style={{ color: active ? '#a5b4fc' : 'var(--text-muted)' }}
        >
          {label}
        </span>
        <div className="flex flex-col" style={{ color: active ? '#6366f1' : 'var(--text-muted)', opacity: 0.6 }}>
          <ChevronUp size={10} style={{ marginBottom: -2, opacity: active && sortDir === 'asc' ? 1 : 0.4 }} />
          <ChevronDown size={10} style={{ opacity: active && sortDir === 'desc' ? 1 : 0.4 }} />
        </div>
      </div>
    </th>
  );
}

export default function UserTable({ onEdit }) {
  const { filteredUsers, loading, deleteUser, filterRole, setFilterRole, filterStatus, setFilterStatus } = useUsers();
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 6;

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  }

  const sorted = [...filteredUsers].sort((a, b) => {
    const av = a[sortField]?.toLowerCase?.() ?? a[sortField] ?? '';
    const bv = b[sortField]?.toLowerCase?.() ?? b[sortField] ?? '';
    return sortDir === 'asc' ? av > bv ? 1 : -1 : av < bv ? 1 : -1;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  function handleDelete(id) {
    deleteUser(id);
    setDeleteConfirm(null);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden glow-border"
      style={{ background: 'var(--bg-card)' }}
    >
      {/* Table toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            All Users
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Role filter */}
          <select
            value={filterRole}
            onChange={e => { setFilterRole(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-xs outline-none appearance-none cursor-pointer"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            <option value="all">All Roles</option>
            {['Admin','Editor','Viewer','Manager','Developer'].map(r => (
              <option key={r} value={r} style={{ background: 'var(--bg-card)' }}>{r}</option>
            ))}
          </select>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg text-xs outline-none appearance-none cursor-pointer"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'Sora, sans-serif',
            }}
          >
            <option value="all">All Status</option>
            {['Active','Inactive','Pending'].map(s => (
              <option key={s} value={s} style={{ background: 'var(--bg-card)' }}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ background: 'rgba(99,102,241,0.04)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <SortHeader label="Name" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Email" field="email" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Role" field="role" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <SortHeader label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              <th className="px-5 py-3.5 text-right">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">🔍</div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No users found</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((user, i) => (
                <tr
                  key={user.id}
                  className="animate-fade-in transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(99,102,241,0.06)',
                    animationDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size={9} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </div>
                        {user.company && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 size={10} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Mail size={13} />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Confirm?</span>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185' }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(user)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: '#a5b4fc', background: 'rgba(99,102,241,0.08)' }}
                            title="Edit user"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: '#fb7185', background: 'rgba(244,63,94,0.08)' }}
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages} · {sorted.length} total
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: p === page ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-surface)',
                  color: p === page ? 'white' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: p === page ? 'transparent' : 'var(--border)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
