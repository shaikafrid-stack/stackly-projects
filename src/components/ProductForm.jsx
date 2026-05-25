import { useState } from 'react';
import { CATEGORIES, STATUS_OPTIONS, INITIAL_FORM } from '../utils/constants';
import { validateProduct } from '../utils/validation';

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none border transition focus:ring-2 focus:ring-indigo-500 ${
    hasError ? 'border-rose-500 bg-rose-950/30' : 'border-white/10'
  }`;

const BG = { backgroundColor: '#0d1117' };

export default function ProductForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || INITIAL_FORM);
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateProduct(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Product Name */}
      <Field label="Product Name" required error={errors.title}>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. Premium Wireless Headphones"
          className={inputClass(!!errors.title)}
          style={BG}
        />
      </Field>

      {/* Category */}
      <Field label="Category" required error={errors.category}>
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className={inputClass(!!errors.category)}
          style={BG}
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c}
            </option>
          ))}
        </select>
      </Field>

      {/* Price + Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price ($)" required error={errors.price}>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={inputClass(!!errors.price)}
            style={BG}
          />
        </Field>

        <Field label="Quantity" required error={errors.quantity}>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className={inputClass(!!errors.quantity)}
            style={BG}
          />
        </Field>
      </div>

      {/* Status */}
      <Field label="Status">
        <select
          value={form.status}
          onChange={(e) => set('status', e.target.value)}
          className={inputClass(false)}
          style={BG}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      {/* Image URL */}
      <Field label="Image URL" error={errors.image}>
        <input
          type="url"
          value={form.image}
          onChange={(e) => set('image', e.target.value)}
          placeholder="https://example.com/product.jpg"
          className={inputClass(!!errors.image)}
          style={BG}
        />
        {form.image && !errors.image && (
          <img
            src={form.image}
            alt="preview"
            className="mt-2 w-16 h-16 object-contain rounded-lg bg-white/5 p-1"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Optional product description…"
          className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:ring-2 focus:ring-indigo-500 transition resize-none"
          style={BG}
        />
      </Field>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          )}
          {loading ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
