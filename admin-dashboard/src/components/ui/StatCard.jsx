import { TrendingUp, TrendingDown } from 'lucide-react';

const PALETTE = {
  blue:    { bg: '#e0e9ff', iconBg: '#3563e9', icon: '#fff',    badge: '#dbeafe', badgeText: '#1d4ed8' },
  emerald: { bg: '#d1fae5', iconBg: '#059669', icon: '#fff',    badge: '#d1fae5', badgeText: '#065f46' },
  amber:   { bg: '#fef3c7', iconBg: '#d97706', icon: '#fff',    badge: '#fef3c7', badgeText: '#92400e' },
  purple:  { bg: '#ede9fe', iconBg: '#7c3aed', icon: '#fff',    badge: '#ede9fe', badgeText: '#5b21b6' },
};

export default function StatCard({ title, value, change, positive, icon: Icon, color = 'blue', delay = 0, sub }) {
  const p = PALETTE[color] || PALETTE.blue;
  return (
    <div className={`card fade-up`} style={{ padding: 22, animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: p.iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${p.iconBg}55`,
        }}>
          <Icon size={20} color={p.icon} />
        </div>
        {change && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 700,
            padding: '4px 9px', borderRadius: 99,
            background: positive ? '#dcfce7' : '#fee2e2',
            color: positive ? '#15803d' : 'var(--rose)',
          }}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
        )}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text-heading)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
