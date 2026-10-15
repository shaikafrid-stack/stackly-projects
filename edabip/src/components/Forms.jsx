import React, { useState } from 'react';
import Field from './Field.jsx';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const btn = (top, h, ok) => ({
  left: 53, top, width: 266, height: h, borderRadius: 4, border: 0, fontSize: 10.5, fontWeight: 400,
  background: ok ? '#134b4a' : '#d9d9d9', color: ok ? '#fff' : '#f4f4f4', cursor: ok ? 'pointer' : 'not-allowed',
  boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
});
const linkBtn = { color: '#134b4a', fontWeight: 700, fontSize: 'inherit', background: 'none', border: 0, padding: 0, cursor: 'pointer' };

export function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const errors = {
    email: !email ? 'Email is required' : !emailRe.test(email) ? 'Enter a valid email' : '',
    password: !password ? 'Password is required' : password.length < 6 ? 'Minimum 6 characters' : '',
  };
  const valid = !errors.email && !errors.password;
  const submit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (valid) setMessage(`Logged in as ${email}${remember ? ' (remembered)' : ''}`);
  };
  return (
    <form onSubmit={submit} noValidate>
      <Field top={180} type="email" placeholder="Enter Your Email" value={email} onChange={setEmail} onBlur={() => setTouched((t) => ({ ...t, email: true }))} error={touched.email && errors.email} autoComplete="email" />
      <Field top={223} h={29} password teal placeholder="Enter Your Password" value={password} onChange={setPassword} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={touched.password && errors.password} autoComplete="current-password" />
      <label className="abs flex items-center" style={{ left: 53, top: 262, height: 16, fontSize: 10.4, color: '#222', cursor: 'pointer' }}>
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 15, height: 15, margin: 0, accentColor: '#134b4a' }} />
        <span style={{ marginLeft: 7 }}>Remember me</span>
      </label>
      <button type="button" className="abs" style={{ right: 54, top: 261, fontSize: 10.2, color: '#134b4a', background: 'none', border: 0, padding: 0 }}>Forgot Password?</button>
      <button type="submit" disabled={!valid} className="abs" style={btn(293, 34, valid)}>Login</button>
      {message && <div className="ctr" style={{ left: 186, top: 330, fontSize: 9, color: '#134b4a' }}>{message}</div>}
      <div className="ctr" style={{ left: 186, top: 335, fontSize: 10.5, lineHeight: '16px', color: '#000', ...(message ? { top: 342 } : {}) }}>
        Don&apos;t have an account? <button type="button" onClick={onSwitch} style={linkBtn}>Sign up</button>
      </div>
    </form>
  );
}

export function SignupForm({ onSwitch }) {
  const [f, setF] = useState({ first: '', last: '', email: '', password: '', confirm: '' });
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState('');
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const errors = {
    first: !f.first.trim() ? 'First name is required' : '',
    last: !f.last.trim() ? 'Last name is required' : '',
    email: !f.email ? 'Email is required' : !emailRe.test(f.email) ? 'Enter a valid email' : '',
    password: !f.password ? 'Password is required' : f.password.length < 6 ? 'Minimum 6 characters' : '',
    confirm: !f.confirm ? 'Confirm your password' : f.confirm !== f.password ? 'Passwords do not match' : '',
  };
  const valid = Object.values(errors).every((e) => !e) && agree;
  const submit = (e) => {
    e.preventDefault();
    setTouched({ first: 1, last: 1, email: 1, password: 1, confirm: 1 });
    if (valid) setMessage(`Account created for ${f.first} ${f.last}`);
  };
  const tops = [161, 200, 239, 278, 317];
  return (
    <form onSubmit={submit} noValidate>
      <Field top={tops[0]} h={29} placeholder="Enter Your  First Name" value={f.first} onChange={set('first')} onBlur={blur('first')} error={touched.first && errors.first} autoComplete="given-name" />
      <Field top={tops[1]} h={29} placeholder="Enter Your Last Name" value={f.last} onChange={set('last')} onBlur={blur('last')} error={touched.last && errors.last} autoComplete="family-name" />
      <Field top={tops[2]} h={29} type="email" placeholder="Enter Your Email" value={f.email} onChange={set('email')} onBlur={blur('email')} error={touched.email && errors.email} autoComplete="email" />
      <Field top={tops[3]} h={29} password teal placeholder="Enter Your Password" value={f.password} onChange={set('password')} onBlur={blur('password')} error={touched.password && errors.password} autoComplete="new-password" />
      <Field top={tops[4]} h={29} password noEye teal placeholder="Confirm Your Password" value={f.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={touched.confirm && errors.confirm} autoComplete="new-password" />
      <label className="abs flex items-center" style={{ left: 54, top: 355, height: 16, fontSize: 9.2, color: '#134b4a', cursor: 'pointer' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 14, height: 14, margin: 0, accentColor: '#134b4a' }} />
        <span style={{ marginLeft: 7 }}>I agree to Terms &amp; Conditions</span>
      </label>
      <button type="submit" disabled={!valid} className="abs" style={btn(382, 35, valid)}>Create Account</button>
      {message && <div className="ctr" style={{ left: 186, top: 421, fontSize: 9, color: '#134b4a' }}>{message}</div>}
      <div className="ctr" style={{ left: 186, top: 425, fontSize: 10.5, lineHeight: '16px', color: '#000', ...(message ? { top: 432 } : {}) }}>
        Already have an account? <button type="button" onClick={onSwitch} style={linkBtn}>Login</button>
      </div>
    </form>
  );
}
