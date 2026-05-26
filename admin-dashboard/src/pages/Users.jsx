import { useState, useMemo } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner, ErrorBox, Badge } from '../components/ui/index';

const COMPANIES = ['All','Romaguera-Crona','Deckow-Crist','Romaguera-Jacobson','Robel-Corkery','Keebler LLC','Considine-Lockman','Johns Group','Abernathy Group','Yost and Sons','Hoeger LLC'];

const AVATAR_COLORS = [
  ['#e0e9ff','#1d4ed8'],['#d1fae5','#065f46'],['#fef3c7','#92400e'],
  ['#ede9fe','#5b21b6'],['#e0f2fe','#0369a1'],['#fce7f3','#9d174d'],
  ['#fff7ed','#9a3412'],['#f0fdf4','#14532d'],['#faf5ff','#6b21a8'],['#ecfeff','#155e75'],
];

export default function Users() {
  const { data: users, loading, error } = useApi('https://jsonplaceholder.typicode.com/users');
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState('All');
  const [status, setStatus] = useState('All');

  const usersWithStatus = useMemo(() =>
    (users || []).map((u, i) => ({ ...u, status: i % 3 === 0 ? 'Inactive' : 'Active' }))
  , [users]);

  const filtered = useMemo(() =>
    usersWithStatus.filter(u => {
      const ms = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const mc = company === 'All' || u.company.name === company;
      const mst = status === 'All' || u.status === status;
      return ms && mc && mst;
    })
  , [usersWithStatus, search, company, status]);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>All Users</h2>
            <span style={{ padding: '2px 10px', borderRadius: 99, background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>{filtered.length}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>Manage and monitor platform accounts</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: 'var(--primary)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, boxShadow: 'var(--shadow-blue)' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', fontSize: 13 }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={13} style={{ position: 'absolute', left: 10, color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <select value={company} onChange={e => setCompany(e.target.value)}
            style={{ padding: '9px 12px 9px 30px', fontSize: 13, minWidth: 180 }}>
            {COMPANIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ padding: '9px 12px', fontSize: 13, minWidth: 130 }}>
          {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || company !== 'All' || status !== 'All') && (
          <button onClick={() => { setSearch(''); setCompany('All'); setStatus('All'); }}
            style={{ padding: '9px 14px', borderRadius: 10, background: 'var(--bg-muted)', border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading && <LoadingSpinner text="Loading users from API…" />}
        {error && <div style={{ padding: 20 }}><ErrorBox message={`API Error: ${error}`} /></div>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  {['#', 'Name', 'Email', 'Company', 'Phone', 'City', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 18px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, borderBottom: '1.5px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 50, textAlign: 'center', color: 'var(--text-faint)' }}>
                      <div style={{ fontSize: 30, marginBottom: 8 }}>🔍</div>
                      <p style={{ fontWeight: 600 }}>No users match your filters</p>
                    </td>
                  </tr>
                ) : filtered.map((u, i) => {
                  const [bg, tc] = AVATAR_COLORS[u.id % AVATAR_COLORS.length];
                  return (
                    <tr key={u.id}
                      style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '13px 18px', color: 'var(--text-faint)', fontWeight: 700 }}>{String(u.id).padStart(2, '0')}</td>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: tc, flexShrink: 0 }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text-body)' }}>{u.company.name}</td>
                      <td style={{ padding: '13px 18px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{u.phone.split(' ')[0]}</td>
                      <td style={{ padding: '13px 18px', color: 'var(--text-muted)' }}>{u.address.city}</td>
                      <td style={{ padding: '13px 18px' }}><Badge status={u.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
