export function StatusBadge({ status }) {
  const config = {
    Active: {
      bg: 'rgba(16,185,129,0.12)',
      color: '#34d399',
      border: 'rgba(16,185,129,0.25)',
      dot: '#10b981',
    },
    Inactive: {
      bg: 'rgba(244,63,94,0.12)',
      color: '#fb7185',
      border: 'rgba(244,63,94,0.25)',
      dot: '#f43f5e',
    },
    Pending: {
      bg: 'rgba(245,158,11,0.12)',
      color: '#fbbf24',
      border: 'rgba(245,158,11,0.25)',
      dot: '#f59e0b',
    },
  };
  const c = config[status] || config.Inactive;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }}
      />
      {status}
    </span>
  );
}

export function RoleBadge({ role }) {
  const config = {
    Admin: { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
    Editor: { bg: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: 'rgba(6,182,212,0.25)' },
    Viewer: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
    Manager: { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', border: 'rgba(168,85,247,0.25)' },
    Developer: { bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.25)' },
  };
  const c = config[role] || config.Viewer;

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {role}
    </span>
  );
}

export function Avatar({ name, size = 8 }) {
  const colors = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    'linear-gradient(135deg, #10b981, #06b6d4)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #f43f5e, #ec4899)',
    'linear-gradient(135deg, #8b5cf6, #6366f1)',
  ];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{
        background: colors[idx],
        fontSize: size <= 8 ? '12px' : '14px',
        boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
      }}
    >
      {initials}
    </div>
  );
}
