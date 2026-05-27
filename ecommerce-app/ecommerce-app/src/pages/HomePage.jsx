import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/Skeleton';

const CATEGORY_META = {
  "women's clothing": { label: "Women's Fashion", desc: 'Elegant styles for every occasion' },
  "men's clothing":   { label: "Men's Fashion",   desc: 'Sharp looks, premium quality' },
  electronics:        { label: 'Electronics',     desc: 'Tech that changes the game' },
  jewelery:           { label: 'Jewellery',        desc: 'Timeless pieces, lasting beauty' },
};

export default function HomePage() {
  const { products, loading, setSelectedCategory } = useProducts();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroCategories, setHeroCategories] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      // Build category cards using the first product image per category
      const catMap = {};
      products.forEach(p => {
        if (!catMap[p.category]) catMap[p.category] = p.image;
      });
      const cats = Object.keys(CATEGORY_META).map(id => ({
        id,
        label: CATEGORY_META[id].label,
        desc: CATEGORY_META[id].desc,
        image: catMap[id] || '',
      }));
      setHeroCategories(cats);
    }
  }, [products]);

  useEffect(() => {
    if (products.length > 0) {
      const sorted = [...products].sort((a, b) => b.rating.rate - a.rating.rate);
      setFeaturedProducts(sorted.slice(0, 4));
    }
  }, [products]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    navigate('/products');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-charcoal-900">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-amber/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="tag bg-amber/20 text-amber text-xs mb-6 inline-block">
              New Season 2025
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium text-white leading-tight mb-6">
              Style that
              <span className="block text-amber italic">speaks</span>
              for itself.
            </h1>
            <p className="font-body text-gray-300 text-lg leading-relaxed mb-10 max-w-md">
              Discover our curated collection of premium products across fashion, electronics, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-amber text-base px-8 py-4">
                Shop Now
              </Link>
              <button
                onClick={() => handleCategoryClick("women's clothing")}
                className="border border-white/30 text-white px-8 py-4 font-body font-medium text-base hover:border-amber hover:text-amber transition-all duration-200"
              >
                Explore Collections
              </button>
            </div>
            <div className="mt-12 flex gap-10">
              {[['10K+', 'Happy Customers'], ['200+', 'Premium Products'], ['4.8★', 'Average Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-amber">{val}</div>
                  <div className="font-body text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Product Grid */}
          <div className="hidden md:grid grid-cols-2 gap-4 animate-fade-in">
            {(heroCategories.length > 0 ? heroCategories : Object.keys(CATEGORY_META).map(id => ({ id, label: CATEGORY_META[id].label, desc: CATEGORY_META[id].desc, image: '' }))).slice(0, 4).map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative overflow-hidden group cursor-pointer ${i === 0 ? 'row-span-2' : ''}`}
                style={{ height: i === 0 ? '360px' : '170px' }}
              >
                <div className="w-full h-full bg-charcoal-800 flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full animate-pulse bg-charcoal-700" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <div>
                    <p className="font-display text-white font-medium text-sm">{cat.label}</p>
                    <p className="font-body text-gray-300 text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{cat.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="tag mb-2">Collections</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <Link to="/products" className="font-body text-sm text-amber hover:underline hidden md:block">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(heroCategories.length > 0 ? heroCategories : Object.keys(CATEGORY_META).map(id => ({ id, label: CATEGORY_META[id].label, desc: CATEGORY_META[id].desc, image: '' }))).map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="group text-left card p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 bg-cream-200 flex items-center justify-center mb-4 group-hover:bg-amber/10 transition-colors">
                {cat.image
                  ? <img src={cat.image} alt={cat.label} className="w-10 h-10 object-contain" />
                  : <div className="w-10 h-10 bg-gray-200 animate-pulse rounded" />
                }
              </div>
              <h3 className="font-body font-semibold text-charcoal-900 text-sm mb-1 group-hover:text-amber transition-colors">{cat.label}</h3>
              <p className="font-body text-xs text-charcoal-600 leading-relaxed">{cat.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="tag mb-2">Top Picks</span>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products" className="font-body text-sm text-amber hover:underline hidden md:block">
              See All Products →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array(4).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
          <div className="text-center mt-10">
            <Link to="/products" className="btn-secondary inline-flex items-center gap-2 text-base">
              Browse All Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On all orders over $50' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
            { icon: '🔒', title: 'Secure Payment', desc: '100% protected transactions' },
            { icon: '💬', title: '24/7 Support', desc: 'Expert help anytime' },
          ].map(item => (
            <div key={item.title} className="text-center">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-body font-semibold text-charcoal-900 text-sm mb-1">{item.title}</h3>
              <p className="font-body text-xs text-charcoal-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-amber mx-4 sm:mx-6 md:mx-12 mb-16 p-12 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-medium text-white mb-4">
          Ready to refresh your wardrobe?
        </h2>
        <p className="font-body text-white/90 mb-8">Join thousands of satisfied customers</p>
        <Link to="/products" className="inline-block bg-white text-amber px-8 py-3 font-body font-semibold hover:bg-cream-50 transition-colors duration-200">
          Start Shopping
        </Link>
      </section>
    </div>
  );
}
