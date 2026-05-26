import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const data = [
  { month:'Jan', users:200, orders:180, revenue:42000 },
  { month:'Feb', users:280, orders:210, revenue:51000 },
  { month:'Mar', users:240, orders:195, revenue:47000 },
  { month:'Apr', users:350, orders:260, revenue:63000 },
  { month:'May', users:310, orders:240, revenue:58000 },
  { month:'Jun', users:410, orders:290, revenue:71000 },
  { month:'Jul', users:390, orders:275, revenue:69000 },
  { month:'Aug', users:460, orders:320, revenue:80000 },
];
const pie = [
  { name:'Electronics', value:35, color:'#3563e9' },
  { name:'Clothing',    value:28, color:'#059669' },
  { name:'Jewelry',     value:18, color:'#d97706' },
  { name:'Others',      value:19, color:'#7c3aed' },
];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1.5px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:13, boxShadow:'var(--shadow-md)' }}>
      <p style={{ color:'var(--text-muted)', fontWeight:600, marginBottom:4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color:p.color, fontWeight:700 }}>
          {p.name==='revenue' ? `$${p.value.toLocaleString()}` : p.value} {p.name}
        </p>
      ))}
    </div>
  );
};

const KPI = [
  { label:'Avg. Session',    value:'4m 32s', change:'+5%',   bg:'var(--primary-soft)', tc:'var(--primary)' },
  { label:'Bounce Rate',     value:'28.4%',  change:'-3%',   bg:'var(--emerald-soft)', tc:'var(--emerald)' },
  { label:'Conversion Rate', value:'6.8%',   change:'+1.2%', bg:'var(--amber-soft)',   tc:'var(--amber)'   },
  { label:'Page Views',      value:'48.2K',  change:'+22%',  bg:'var(--purple-soft)',  tc:'var(--purple)'  },
];

export default function Analytics() {
  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
        {KPI.map(k => (
          <div key={k.label} className="card" style={{ padding:'18px 20px' }}>
            <p style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600, marginBottom:10 }}>{k.label}</p>
            <p style={{ fontSize:24, fontWeight:800, color:'var(--text-heading)', letterSpacing:'-0.5px' }}>{k.value}</p>
            <span style={{ fontSize:12, fontWeight:700, padding:'3px 9px', borderRadius:99, background:k.bg, color:k.tc, marginTop:8, display:'inline-block' }}>{k.change}</span>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:14 }}>
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'var(--text-heading)' }}>User Growth</h3>
          <p style={{ fontSize:12, color:'var(--text-faint)', marginBottom:20, marginTop:2 }}>Monthly new user registrations</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#059669" stopOpacity={0.18}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)"/>
              <XAxis dataKey="month" tick={{ fill:'var(--text-faint)', fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'var(--text-faint)', fontSize:12 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="users" name="users" stroke="#059669" strokeWidth={2.5} fill="url(#ug)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'var(--text-heading)' }}>Sales by Category</h3>
          <p style={{ fontSize:12, color:'var(--text-faint)', marginBottom:16, marginTop:2 }}>Product distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pie} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4}>
                {pie.map(c => <Cell key={c.name} fill={c.color}/>)}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color:'var(--text-muted)', fontSize:12 }}>{v}</span>}/>
              <Tooltip formatter={v => [`${v}%`, 'Share']}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="card" style={{ padding:24 }}>
        <h3 style={{ fontSize:15, fontWeight:800, color:'var(--text-heading)' }}>Revenue vs Orders</h3>
        <p style={{ fontSize:12, color:'var(--text-faint)', marginBottom:20, marginTop:2 }}>Comparative monthly performance</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)"/>
            <XAxis dataKey="month" tick={{ fill:'var(--text-faint)', fontSize:12 }} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="left"  tick={{ fill:'var(--text-faint)', fontSize:12 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`}/>
            <YAxis yAxisId="right" orientation="right" tick={{ fill:'var(--text-faint)', fontSize:12 }} axisLine={false} tickLine={false}/>
            <Tooltip content={<Tip/>}/>
            <Line yAxisId="left"  type="monotone" dataKey="revenue" name="revenue" stroke="#3563e9" strokeWidth={2.5} dot={false}/>
            <Line yAxisId="right" type="monotone" dataKey="orders"  name="orders"  stroke="#d97706" strokeWidth={2.5} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
