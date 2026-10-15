import React from 'react';

export const EyeOffIcon = ({ className = 'w-[14px] h-[14px]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <path d="M3.5 3.5l17 17" strokeWidth="2.2" />
  </svg>
);

export const EyeIcon = ({ className = 'w-[14px] h-[14px]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const GoogleIcon = ({ className = 'w-[15px] h-[15px]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#134b4a" strokeWidth="2.8" strokeLinecap="butt">
    <path d="M19.6 7.6A9 9 0 1 0 21 12.4v-.4h-8.4" />
  </svg>
);

export const MicrosoftIcon = ({ className = 'w-[15px] h-[15px]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#8fb0ae" strokeWidth="1.1">
    <rect x="2.5" y="2.5" width="9" height="9" />
    <rect x="12.5" y="2.5" width="9" height="9" fill="#e6eeed" />
    <rect x="2.5" y="12.5" width="9" height="9" />
    <rect x="12.5" y="12.5" width="9" height="9" fill="#e6eeed" />
  </svg>
);

export const ChartIcon = () => (
  <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="#1d5c5a" stroke="none">
    <path d="M1.5 12.2l6-5.2 4.2 3.4 7-6.6-1.6-.1V1.6h5.6v5.4h-1.4l-.1-1.7-8.1 7.7-4.1-3.3-4.6 4.2z" />
    <rect x="1.5" y="15" width="3.2" height="7" />
    <rect x="7" y="14" width="3.2" height="8" />
    <rect x="12.5" y="11.5" width="3.2" height="10.5" />
    <rect x="18" y="9" width="3.2" height="13" />
    <rect x="1.5" y="18.4" width="19.7" height="1.1" fill="#fff" />
  </svg>
);

export const HexIcon = () => (
  <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="#5f9e9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 5.2L12 2.5l4.5 2.7" />
    <path d="M19 8.2v5.2" />
    <path d="M17.2 18l-2.2 1.3" />
    <path d="M9 19.3L6.8 18" />
    <path d="M5 13.4V8.2" />
  </svg>
);

export const ShieldIcon = ({ className = 'w-[13px] h-[13px]', color = '#134b4a' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 1.8l9 3.2v7.2c0 5-3.6 8.7-9 10.4-5.4-1.7-9-5.4-9-10.4V5z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 1.8L3 5v7.2c0 .2 0 .5.1.7H12z" fill={color} />
    <path d="M12 13v9.6c4.2-1.4 7-4.3 8.2-8.1.2-.5.3-1 .3-1.5z" fill={color} />
    <path d="M12 2v20.5M3 12.9h18" stroke={color} strokeWidth="1.2" />
  </svg>
);

export const ScaleIcon = () => (
  <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="#134b4a" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 1.8l8.8 5v10.4L12 22.2l-8.8-5V6.8z" />
    <circle cx="12" cy="9.6" r="2.3" />
    <path d="M6.8 16.4c.8-2.3 2.8-3.7 5.2-3.7s4.4 1.4 5.2 3.7" />
  </svg>
);
