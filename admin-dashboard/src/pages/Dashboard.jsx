import { Users, ShoppingBag, ClipboardList, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../components/ui/StatCard';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner, ErrorBox } from '../components/ui/index';

const revenue = [
  { month:'Jan', revenue:42000, orders:180 },
  { month:'Feb', revenue:51000, orders:210 },
  { month:'Mar', revenue:47000, orders:195 },
  { month:'Apr', revenue:63000, orders:260 },
  { month:'May', revenue:58000, orders:240 },
  { month:'Jun', revenue:71000, orders:290 },
  { month:'Jul', revenue:69000, orders:275 },
  { month:'Aug', revenue:80000, orders:320 },
];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-md)' }}>
      <p style={{ color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.name === 'revenue' ? 'var(--primary)' : 'var(--emerald)', fontWeight: 700 }}>
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data: users, loading: uLoad, error: uErr } = useApi('https://jsonplaceholder.typicode.com/users');
  const { data: products, loading: pLoad, error: pErr } = useApi('https://fakestoreapi.com/products');
  const totalRev = products ? `$${(products.reduce((s, p) => s + p.price, 0) * 180 / 1000).toFixed(0)}K` : '…';

  const AVATAR_COLORS = [
    ['#e0e9ff','#1d4ed8'], ['#d1fae5','#065f46'], ['#fef3c7','#92400e'],
    ['#ede9fe','#5b21b6'], ['#e0f2fe','#0369a1'],
  ];

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg,var(--primary) 0%,#5b80f0 100%)',
        borderRadius: 18, padding: '26px 32px', marginBottom: 22,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 8px 32px rgba(53,99,233,0.25)',
      }}>
        <div style={{ position: 'absolute', top: -60, right: 100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -50, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>Good morning 👋</p>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 5 }}>Alex Rivera</h2>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 13 }}>Here's what's happening with your platform today.</p>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.16)', borderRadius: 14,
          padding: '14px 22px', textAlign: 'center',
          backdropFilter: 'blur(10px)', flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.25)',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{totalRev}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: 500 }}>Revenue This Month</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard title="Total Users"    value={uLoad ? '…' : uErr ? 'Err' : users?.length}  change="+12.4%" positive icon={Users}         color="blue"    sub="Registered accounts"  delay={0}  />
        <StatCard title="Total Products" value={pLoad ? '…' : pErr ? 'Err' : products?.length} change="+8.1%"  positive icon={ShoppingBag}   color="purple"  sub="Active listings"      delay={60} />
        <StatCard title="Active Orders"  value="1,284"                                          change="+23.6%" positive icon={ClipboardList} color="emerald" sub="This month"            delay={120}/>
        <StatCard title="Revenue"        value={pLoad ? '…' : totalRev}                        change="+18.3%" positive icon={TrendingUp}    color="amber"   sub="Monthly total"        delay={180}/>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 20 }}>
        <div className="card fade-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>Revenue Overview</h3>
              <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>Monthly trend · 2024</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: '#dcfce7', color: '#15803d' }}>↑ 18.3%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3563e9" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#3563e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-faint)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="revenue" stroke="#3563e9" strokeWidth={2.5} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card fade-up" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)', marginBottom: 4 }}>Monthly Orders</h3>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>Volume by month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-faint)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="orders" fill="#059669" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent users table */}
      <div className="card fade-up" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>Recent Users</h3>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>Latest registered accounts</p>
          </div>
          <a href="/users" style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', background: 'var(--primary-soft)', padding: '6px 14px', borderRadius: 8 }}>View all →</a>
        </div>
        {uLoad && <LoadingSpinner text="Fetching users…" />}
        {uErr && <div style={{ padding: 20 }}><ErrorBox message={`Failed to load: ${uErr}`} /></div>}
        {users && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)' }}>
                {['Name', 'Email', 'Company', 'City', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: 12, borderBottom: '1.5px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((u, i) => {
                const [bg, tc] = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const isActive = i % 3 !== 0;
                return (
                  <tr key={u.id}
                    style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: tc, flexShrink: 0 }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--text-body)' }}>{u.company.name}</td>
                    <td style={{ padding: '13px 20px', color: 'var(--text-muted)' }}>{u.address.city}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: isActive ? '#dcfce7' : '#f1f5f9', color: isActive ? '#15803d' : 'var(--text-muted)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#16a34a' : 'var(--text-faint)', display: 'inline-block' }} />
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
