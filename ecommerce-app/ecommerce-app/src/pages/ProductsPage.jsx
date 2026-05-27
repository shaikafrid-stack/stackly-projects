import { useState } from 'react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/Skeleton';

export default function ProductsPage() {
  const {
    filteredProducts, loading, error, categories,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    sortOrder, setSortOrder,
  } = useProducts();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryLabels = {
    all: 'All Products',
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
    electronics: 'Electronics',
    jewelery: 'Jewellery',
  };

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  if (error) {
    return (
      <div className="pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display text-2xl font-medium mb-2">Failed to Load Products</h2>
          <p className="font-body text-charcoal-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Page Header */}
      <div className="bg-charcoal-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="tag bg-amber/20 text-amber mb-3">Our Collection</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-white">
            {selectedCategory === 'all' ? 'All Products' : categoryLabels[selectedCategory] || selectedCategory}
          </h1>
          {!loading && (
            <p className="font-body text-gray-400 mt-2 text-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-600 hover:text-charcoal-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="input-field max-w-[220px] cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Mobile filter toggle */}
          <button
            className="md:hidden btn-secondary flex items-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (desktop) */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-body font-semibold text-charcoal-900 text-sm uppercase tracking-wide mb-4">
                Categories
              </h3>
              <ul className="space-y-1">
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 text-sm font-body transition-all duration-200 ${
                        selectedCategory === cat
                          ? 'bg-charcoal-900 text-white font-medium'
                          : 'text-charcoal-700 hover:bg-gray-100'
                      }`}
                    >
                      {categoryLabels[cat] || cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Mobile filters dropdown */}
          {filtersOpen && (
            <div className="md:hidden w-full mb-4 card p-4 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setFiltersOpen(false); }}
                    className={`px-3 py-1.5 text-xs font-body transition-all ${
                      selectedCategory === cat
                        ? 'bg-charcoal-900 text-white'
                        : 'border border-gray-200 text-charcoal-700 hover:border-charcoal-900'
                    }`}
                  >
                    {categoryLabels[cat] || cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Active filters */}
            {(searchQuery || selectedCategory !== 'all') && !loading && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-cream-200 px-3 py-1 text-xs font-body">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-amber">✕</button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="flex items-center gap-1 bg-cream-200 px-3 py-1 text-xs font-body">
                    {categoryLabels[selectedCategory] || selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-amber">✕</button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display text-2xl font-medium mb-2">No products found</h3>
                <p className="font-body text-charcoal-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
