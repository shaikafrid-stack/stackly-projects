import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons.jsx';

export default function Field({ top, h = 28, type = 'text', placeholder, value, onChange, onBlur, error, password = false, noEye = false, teal = false, autoComplete }) {
  const [show, setShow] = useState(false);
  const border = error ? '#dc2626' : teal ? '#134b4a' : '#000';
  return (
    <div className="abs" style={{ left: 53, top, width: 266, height: h }}>
      <input
        type={password && show ? 'text' : type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="placeholder:text-[#134b4a]"
        style={{
          width: '100%', height: '100%', boxSizing: 'border-box', border: `1.3px solid ${border}`, borderRadius: 4,
          background: '#fff', padding: password && !noEye ? '0 36px 0 13px' : '0 13px', fontSize: 10, color: '#000', outline: 'none',
        }}
      />
      {password && !noEye && (
        <button type="button" tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}
          className="abs" style={{ right: 11, top: '50%', transform: 'translateY(-50%)', color: '#134b4a', lineHeight: 0 }}>
          {show ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      )}
      {error && <div className="abs" style={{ left: 2, top: h + 1, fontSize: 7.5, lineHeight: '9px', color: '#dc2626', whiteSpace: 'nowrap' }}>{error}</div>}
    </div>
  );
}
