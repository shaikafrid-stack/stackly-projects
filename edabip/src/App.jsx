import React, { useEffect, useState } from 'react';
import LeftPanel from './components/LeftPanel.jsx';
import { LoginForm, SignupForm } from './components/Forms.jsx';
import { GoogleIcon, MicrosoftIcon } from './components/Icons.jsx';

const W = 1134;
const H = 638;

function useScale() {
  const get = () => Math.min(window.innerWidth / W, window.innerHeight / H);
  const [s, setS] = useState(get);
  useEffect(() => {
    const on = () => setS(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return s;
}

const L = {
  login: { h: 477, title: 39, sub: [78, 103], tabs: 131, or: 373, social: 395, help: 449 },
  signup: { h: 544, title: 34, sub: [70, 94], tabs: 117, or: 458, social: 475, help: 524 },
};

export default function App() {
  const [mode, setMode] = useState('login');
  const s = useScale();
  const isLogin = mode === 'login';
  const c = L[mode];

  useEffect(() => {
    document.title = isLogin ? 'EDABIP | Login' : 'EDABIP | Sign up';
  }, [isLogin]);

  const sub = isLogin
    ? ['Log in into continue to your EDABIP dashboard and accelerate', 'your analytics journey']
    : ['Sign into continue to your EDABIP dashboard and accelerate your', 'analytics journey'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <div
        className="artboard"
        style={{ left: (window.innerWidth - W * s) / 2, top: (window.innerHeight - H * s) / 2, transform: `scale(${s})` }}
      >
        <LeftPanel mode={mode} />

        <div
          className="abs"
          style={{ left: 381, top: (H - c.h) / 2, width: 372, height: c.h, background: '#fff', borderRadius: 14, color: '#000', boxShadow: '0 8px 30px rgba(0,0,0,0.45)' }}
        >
          <div className="ctr" style={{ left: 186, top: c.title - 16, fontSize: 26, lineHeight: '32px', fontWeight: 700 }}>Welcome Back</div>
          {sub.map((t, i) => (
            <div key={i} className="ctr" style={{ left: 186, top: c.sub[i] - 12, fontSize: 11.9, lineHeight: '24px' }}>{t}</div>
          ))}

          <div className="abs" style={{ left: 53, top: c.tabs, width: 266, height: 32, background: '#d9d9d9', borderRadius: 4 }}>
            {[['signup', 'Sign up', 12], ['login', 'Log in', 138]].map(([key, label, x]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className="abs"
                style={{
                  left: x, top: 3, width: 118, height: 26, borderRadius: 4, border: 0, fontSize: 10.9, fontWeight: 700,
                  background: mode === key ? '#134b4a' : 'transparent', color: mode === key ? '#fff' : '#000', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {isLogin ? <LoginForm onSwitch={() => setMode('signup')} /> : <SignupForm onSwitch={() => setMode('login')} />}

          <div className="abs" style={{ left: 28, top: c.or, width: 116, height: 1, background: '#bbb' }} />
          <div className="abs" style={{ left: 228, top: c.or, width: 116, height: 1, background: '#bbb' }} />
          <div className="ctr" style={{ left: 186, top: c.or - 8, fontSize: 10.4, lineHeight: '16px' }}>or sign up with</div>

          {[['Google', <GoogleIcon />, 142], ['Microsoft', <MicrosoftIcon />, 191]].map(([name, icon, x]) => (
            <button
              key={name}
              type="button"
              aria-label={`Sign up with ${name}`}
              className="abs flex items-center justify-center hover:bg-[#e9f3f2]"
              style={{ left: x, top: c.social, width: 40, height: 33, border: '1.3px solid #7a9a99', borderRadius: 4, background: '#fff' }}
            >
              {icon}
            </button>
          ))}

          <div className="ctr" style={{ left: 186, top: c.help - 6, fontSize: 7.75, lineHeight: '12px' }}>
            Need help ? <a href="#support" style={{ color: '#134b4a' }}>Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
