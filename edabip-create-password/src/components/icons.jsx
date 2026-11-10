export const EyeIcon = ({ className = "h-[15px] w-[15px]" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ className = "h-[15px] w-[15px]" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <path d="m1 1 22 22" />
  </svg>
);

/** Circle with "!" used inside the error banner */
export const AlertIcon = ({ className = "h-[13px] w-[13px]" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7.5v5.5" />
    <path d="M12 16.5h.01" />
  </svg>
);

/* Feature icons (small, dark teal on a white tile) */
export const ChartIcon = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 20h18" />
    <path d="M6 16v-3M10 16V9M14 16v-5M18 16V6" />
    <path d="m4 9 5-4 4 3 6-4" strokeWidth="1.4" />
  </svg>
);

export const HexOutlineIcon = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
    <path d="M12 5.5 17.6 8.7v6.6L12 18.5 6.4 15.3V8.7L12 5.5Z" />
  </svg>
);

export const ShieldFilledIcon = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill="currentColor" />
    <circle cx="12" cy="11" r="2.4" fill="#fff" />
  </svg>
);

export const HexBadgeIcon = ({ className = "h-3 w-3" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 2.5 20 7v10l-8 4.500L4 17V7l8-4.500Z" fill="currentColor" />
    <path d="M12 7.500 16.500 10v4L12 16.500 7.500 14v-4L12 7.500Z" fill="none" stroke="#fff" strokeWidth="1.6" />
  </svg>
);

/** Small filled shield used inside the "Trusted by" pill */
export const PillShieldIcon = ({ className = "h-[12px] w-[12px]" }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path d="M12 1.500 3.500 5v6.500c0 5.200 3.600 9.800 8.500 11.500 4.900-1.700 8.500-6.300 8.500-11.500V5L12 1.500Z" fill="#111" />
    <path d="m8.200 12 2.800 2.800 4.800-5.200" fill="none" stroke="#fff" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
