import { useState, useMemo } from 'react';
import { Search, Star, SlidersHorizontal } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner, ErrorBox } from '../components/ui/index';

const CAT_STYLE = {
  'electronics':      { bg: '#e0e9ff', color: '#1d4ed8' },
  'jewelery':         { bg: '#fef3c7', color: '#92400e' },
  "men's clothing":   { bg: '#ede9fe', color: '#5b21b6' },
  "women's clothing": { bg: '#fce7f3', color: '#9d174d' },
};

export default function Products() {
  const { data: products, loading, error } = useApi('https://fakestoreapi.com/products');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    if (!products) return ['All'];
    return ['All', ...new Set(products.map(p => p.category))];
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || p.category === category)
    );
  }, [products, search, category]);

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>Products</h2>
            <span style={{ padding: '2px 10px', borderRadius: 99, background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>{filtered.length}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>Browse and manage your product catalog</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', fontSize: 13 }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <SlidersHorizontal size={13} style={{ position: 'absolute', left: 10, color: 'var(--text-faint)', pointerEvents: 'none' }} />
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ padding: '9px 12px 9px 30px', fontSize: 13, minWidth: 190 }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner text="Loading products…" />}
      {error && <ErrorBox message={`Failed: ${error}`} />}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
          {filtered.map(p => {
            const cat = CAT_STYLE[p.category] || { bg: 'var(--primary-soft)', color: 'var(--primary)' };
            return (
              <div key={p.id} className="card"
                style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                {/* Image */}
                <div style={{ height: 140, background: 'var(--bg-subtle)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                  <img src={p.image} alt={p.title} style={{ maxHeight: 115, maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: cat.bg, color: cat.color, textTransform: 'capitalize' }}>
                    {p.category}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, marginTop: 8, color: 'var(--text-heading)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.title}
                  </p>
                </div>
                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>${p.price}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: 700 }}>{p.rating?.rate}</span>
                    <span style={{ color: 'var(--text-faint)' }}>({p.rating?.count})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
