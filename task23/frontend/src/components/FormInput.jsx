import React from 'react';

export default function FormInput({ label, error, as = 'input', options, className = '', ...props }) {
  const Tag = as;
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {as === 'select' ? (
        <select className="input" {...props}>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea className="input" rows={4} {...props} />
      ) : (
        <Tag className="input" {...props} />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
