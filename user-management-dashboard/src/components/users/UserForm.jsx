import { useState, useEffect } from 'react';
import { UserPlus, Save } from 'lucide-react';
import { useUsers } from '../../context/UserContext';

const ROLES = ['Admin', 'Editor', 'Viewer', 'Manager', 'Developer'];
const STATUSES = ['Active', 'Inactive', 'Pending'];

const defaultForm = { name: '', email: '', role: '', status: '' };

function InputField({ label, type = 'text', value, onChange, placeholder, error, required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${error ? '#f43f5e' : 'var(--border)'}`,
          color: 'var(--text-primary)',
          fontFamily: 'Sora, sans-serif',
        }}
        onFocus={e => {
          if (!error) {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
          }
        }}
        onBlur={e => {
          if (!error) {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }
        }}
      />
      {error && <p className="text-xs mt-1" style={{ color: '#f43f5e' }}>{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, error, required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${error ? '#f43f5e' : 'var(--border)'}`,
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'Sora, sans-serif',
          cursor: 'pointer',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)';
          e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? '#f43f5e' : 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt} style={{ background: 'var(--bg-card)' }}>{opt}</option>
        ))}
      </select>
      {error && <p className="text-xs mt-1" style={{ color: '#f43f5e' }}>{error}</p>}
    </div>
  );
}

export default function UserForm({ editUser, onClose }) {
  const { addUser, updateUser } = useUsers();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || '',
        email: editUser.email || '',
        role: editUser.role || '',
        status: editUser.status || '',
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [editUser]);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.role) errs.role = 'Please select a role';
    if (!form.status) errs.status = 'Please select a status';
    return errs;
  }

  function handleChange(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
    };
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500)); // Simulate async
    if (editUser) {
      updateUser({ ...editUser, ...form });
    } else {
      addUser(form);
    }
    setSubmitting(false);
    setForm(defaultForm);
    onClose?.();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Full Name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="John Doe"
          error={errors.name}
          required
        />
        <InputField
          label="Email Address"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          placeholder="john@example.com"
          error={errors.email}
          required
        />
        <SelectField
          label="Role"
          value={form.role}
          onChange={handleChange('role')}
          options={ROLES}
          placeholder="Select role"
          error={errors.role}
          required
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={handleChange('status')}
          options={STATUSES}
          placeholder="Select status"
          error={errors.status}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            background: submitting ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white',
            boxShadow: submitting ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : editUser ? (
            <><Save size={16} /> Save Changes</>
          ) : (
            <><UserPlus size={16} /> Add User</>
          )}
        </button>
      </div>
    </div>
  );
}
