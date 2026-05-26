export function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 14 }}>
      <div style={{
        width: 38, height: 38,
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>{text}</p>
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div style={{
      background: 'var(--rose-soft)',
      border: '1.5px solid #fca5a5',
      borderRadius: 12, padding: '14px 18px',
      color: 'var(--rose)', fontSize: 13, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      ⚠ {message}
    </div>
  );
}

export function Badge({ status }) {
  const active = status?.toLowerCase() === 'active';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
      background: active ? '#dcfce7' : '#f1f5f9',
      color:      active ? '#15803d' : 'var(--text-muted)',
    }}>
      <span className={`dot ${active ? 'dot-active' : 'dot-inactive'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}
