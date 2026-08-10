import React from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
};

export default function Button({ variant = 'primary', children, loading, ...props }) {
  return (
    <button className={variants[variant] || variants.primary} disabled={loading || props.disabled} {...props}>
      {loading ? 'Please wait...' : children}
    </button>
  );
}
