import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useUsers } from '../../context/UserContext';

const cardConfig = [
  {
    key: 'total',
    label: 'Total Users',
    icon: Users,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(99,102,241,0.25)',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    key: 'active',
    label: 'Active Users',
    icon: UserCheck,
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    glow: 'rgba(16,185,129,0.25)',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    key: 'inactive',
    label: 'Inactive Users',
    icon: UserX,
    gradient: 'linear-gradient(135deg, #f43f5e, #fb923c)',
    glow: 'rgba(244,63,94,0.25)',
    bg: 'rgba(244,63,94,0.08)',
  },
  {
    key: 'pending',
    label: 'Pending Users',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    glow: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.08)',
  },
];

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton w-24 h-4" />
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <div className="skeleton w-16 h-8 mb-2" />
      <div className="skeleton w-20 h-3" />
    </div>
  );
}

export default function StatsCards() {
  const { stats, loading } = useUsers();

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map(({ key, label, icon: Icon, gradient, glow, bg }, idx) => (
        <div
          key={key}
          className="stat-card rounded-2xl p-5 glow-border animate-fade-in"
          style={{
            background: 'var(--bg-card)',
            animationDelay: `${idx * 60}ms`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {label}
            </span>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg, boxShadow: `0 0 16px ${glow}` }}
            >
              <Icon size={18} style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            </div>
          </div>
          <div
            className="text-3xl font-bold mb-1"
            style={{
              background: gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {stats[key]}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {key === 'total' ? 'All registered users' :
             key === 'active' ? `${Math.round((stats.active / (stats.total || 1)) * 100)}% of total` :
             key === 'inactive' ? 'Requires attention' : 'Awaiting approval'}
          </div>
        </div>
      ))}
    </div>
  );
}
