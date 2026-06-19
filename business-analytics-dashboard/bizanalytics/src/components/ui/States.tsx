import React from 'react';

export const LoadingSpinner = React.memo(({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const s = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  return (
    <div className="spinner-wrap" style={{ width: s, height: s }}>
      <svg width={s} height={s} viewBox="0 0 50 50" className="spinner">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" className="spinner-track"/>
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" className="spinner-arc"
          strokeDasharray="80 40" strokeLinecap="round"/>
      </svg>
    </div>
  );
});

export const PageLoader = React.memo(() => (
  <div className="page-loader">
    <LoadingSpinner size="lg" />
    <p className="loader-text">Loading…</p>
  </div>
));

export const SkeletonBlock = React.memo(({ w = '100%', h = 16 }: { w?: string; h?: number }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: 4 }} />
));

export const SkeletonCard = React.memo(() => (
  <div className="kpi-card">
    <SkeletonBlock w="60%" h={14} />
    <div style={{ margin: '8px 0' }} />
    <SkeletonBlock w="80%" h={28} />
    <div style={{ margin: '8px 0' }} />
    <SkeletonBlock w="40%" h={12} />
  </div>
));

export const EmptyState = React.memo(({ message = 'No data found', icon = '📭' }: { message?: string; icon?: string }) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <p>{message}</p>
  </div>
));
