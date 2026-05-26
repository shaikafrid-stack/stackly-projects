import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, TrendingUp, ArrowRight, BarChart3, Users, ShoppingBag } from 'lucide-react';

const FEATURES = [
  { icon: BarChart3, label: 'Live analytics and revenue charts' },
  { icon: Users,    label: 'Full user management & filters' },
  { icon: ShoppingBag, label: 'Product catalog with search' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setApiError(''); setLoading(true);
    setTimeout(() => {
      const res = login(form.email, form.password);
      if (res.success) navigate('/dashboard');
      else { setApiError(res.error); setLoading(false); }
    }, 900);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>

      {/* ── Left panel (brand) ── */}
      <div style={{
        flex: 1, minWidth: 0,
        background: 'linear-gradient(150deg, #1e3fbf 0%, #3563e9 55%, #5b80f0 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '52px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        {[
          { top: -100, right: -80,  size: 380, opacity: 0.10 },
          { top:  200, left: -100, size: 300, opacity: 0.07 },
          { bottom: -80, right: 60,  size: 240, opacity: 0.08 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            background: `rgba(255,255,255,${b.opacity})`,
            width: b.size, height: b.size,
            top: b.top, right: b.right, bottom: b.bottom, left: b.left,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 13,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={22} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '-0.4px' }}>Nexus</span>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontWeight: 800, fontSize: 40, color: '#fff',
            lineHeight: 1.12, letterSpacing: '-0.8px', marginBottom: 18,
          }}>
            Your business<br />command center.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15, lineHeight: 1.75, maxWidth: 340, marginBottom: 40 }}>
            Monitor users, track revenue, and manage your products — all in one professional workspace.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={15} color="#fff" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 36, marginTop: 48 }}>
            {[['10K+','Active Users'],['$2.4M','Revenue Tracked'],['98%','Uptime SLA']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div style={{
        width: '100%', maxWidth: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 52px', background: '#fff',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="fade-up">

          <div style={{ marginBottom: 38 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13, marginBottom: 24,
              background: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={22} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-heading)', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to your admin workspace</p>
          </div>

          {/* API error */}
          {apiError && (
            <div style={{
              background: 'var(--rose-soft)', border: '1.5px solid #fca5a5',
              borderRadius: 10, padding: '12px 14px', marginBottom: 20,
              fontSize: 13, color: 'var(--rose)', fontWeight: 500,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 7, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                <input
                  type="email" placeholder="admin@nexus.io" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px 11px 38px', borderColor: errors.email ? 'var(--rose)' : undefined }}
                />
              </div>
              {errors.email && <p style={{ color: 'var(--rose)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 7, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ width: '100%', padding: '11px 40px 11px 38px', borderColor: errors.password ? 'var(--rose)' : undefined }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-faint)', padding: 4 }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--rose)', fontSize: 12, marginTop: 5, fontWeight: 500 }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none',
              background: loading ? '#93c5fd' : 'var(--primary)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: loading ? 'none' : 'var(--shadow-blue)',
              transition: 'background .2s, box-shadow .2s',
            }}>
              {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Demo creds */}
          <div style={{
            marginTop: 28, padding: '14px 16px',
            background: 'var(--primary-soft)',
            border: '1.5px dashed #93c5fd',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Demo Credentials</p>
            <p style={{ fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500 }}>admin@nexus.io &nbsp;·&nbsp; admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
