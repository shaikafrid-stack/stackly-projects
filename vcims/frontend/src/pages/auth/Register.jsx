import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../components/ErrorMessage';

const ROLE_HOME = {
  admin: '/admin/dashboard',
  finance_manager: '/finance/dashboard',
  vendor: '/vendor/dashboard',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'vendor', vendor_name: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.role) return 'Please fill in all required fields.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (form.role === 'vendor' && !form.vendor_name) return 'Vendor / Company name is required.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-700">VCIMS</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account</p>
        </div>
        <div className="card">
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" name="email" className="input" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                <option value="vendor">Vendor</option>
                <option value="finance_manager">Finance Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'vendor' && (
              <>
                <div>
                  <label className="label">Company / Vendor Name</label>
                  <input name="vendor_name" className="input" value={form.vendor_name} onChange={handleChange} placeholder="Acme Supplies Pvt Ltd" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" className="input" value={form.phone} onChange={handleChange} placeholder="9876543210" />
                </div>
              </>
            )}
            <div>
              <label className="label">Password</label>
              <input type="password" name="password" className="input" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" name="confirmPassword" className="input" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-slate-500 mt-4 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
