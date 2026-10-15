import React from 'react';
import { ChartIcon, HexIcon, ShieldIcon, ScaleIcon } from './Icons.jsx';

const features = [
  { icon: <ChartIcon />, title: 'Real-Time Analytics', desc: 'Monitor metrics and performance in real-time' },
  { icon: <HexIcon />, title: 'AI-Powered Insights', desc: 'Discover patterns and predict outcome' },
  { icon: <ShieldIcon />, title: 'Enterprise Security', desc: 'Bank-grade security and data governance' },
  { icon: <ScaleIcon />, title: 'Scalable Platform', desc: 'Build for performance and enterprise' },
];

export default function LeftPanel({ mode }) {
  const verb = mode === 'login' ? 'Log in' : 'Sign in';
  const para = [
    `${verb} to access your Enterprise Data Analytics & Business`,
    'Intelligence Platform and continue making data-driven decisions',
    'with confidence',
  ];
  return (
    <>
      <img src="/logo.png" alt="EDABIP" className="abs" style={{ left: 16, top: 17, width: 84, height: 34, mixBlendMode: 'screen' }} />

      <div className="ctr" style={{ left: 194.5, top: 120 - 15, fontSize: 26, lineHeight: '30px', fontWeight: 700 }}>
        Welcome to EDABIP
      </div>
      {para.map((t, i) => (
        <div key={i} className="ctr" style={{ left: 194, top: 155 + i * 14 - 7, fontSize: 11.9, lineHeight: '14px' }}>
          {t}
        </div>
      ))}

      {features.map((f, i) => (
        <React.Fragment key={f.title}>
          <div className="abs flex items-center justify-center bg-white"
            style={{ left: 30, top: 229 + i * 59, width: 34, height: 34, borderRadius: 5, boxShadow: '1px 2px 5px rgba(255,255,255,0.28)' }}>
            {f.icon}
          </div>
          <div className="abs" style={{ left: 75, top: 230.5 + i * 59, fontSize: 14, lineHeight: '17px', fontWeight: 700, whiteSpace: 'nowrap' }}>{f.title}</div>
          <div className="abs" style={{ left: 75, top: 252 + i * 59, fontSize: 9.5, lineHeight: '12px', whiteSpace: 'nowrap' }}>{f.desc}</div>
        </React.Fragment>
      ))}

      <div className="abs flex items-center" style={{ left: 30, top: 471, width: 194, height: 16, borderRadius: 3, background: '#dbe8ff', color: '#1a1a2e' }}>
        <span style={{ marginLeft: 6, lineHeight: 0 }}><ShieldIcon className="w-[11px] h-[11px]" color="#1a1a2e" /></span>
        <span style={{ marginLeft: 3, fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 8.2, whiteSpace: 'nowrap' }}>
          Trusted by leading Enterprises worldwide
        </span>
      </div>

      <div className="ctr" style={{ left: 188, top: 578 - 7, fontSize: 10.3, lineHeight: '14px' }}>Trusted by Fortune 500 companies worldwide</div>
      <div className="ctr" style={{ left: 188, top: 596 - 7, fontSize: 10.3, lineHeight: '14px' }}>
        © 2026 EDABIP. Enterprise Data Analytics &amp; Business Intelligence Platform.
      </div>
    </>
  );
}
