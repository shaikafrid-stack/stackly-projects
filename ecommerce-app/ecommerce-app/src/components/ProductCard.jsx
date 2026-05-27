import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

export default function ProductCard({ product }) {
  const { dispatch, cart } = useCart();
  const [adding, setAdding] = useState(false);
  const inCart = cart.items.some(i => i.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setTimeout(() => setAdding(false), 600);
  };

  const categoryLabel = product.category.replace(/'/g, '').split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  return (
    <div className="group card flex flex-col overflow-hidden animate-fade-in">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative bg-gray-50 overflow-hidden" style={{ paddingBottom: '100%' }}>
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="tag text-[10px]">{categoryLabel}</span>
          </div>
          {product.rating?.count < 50 && (
            <div className="absolute top-3 right-3 bg-amber text-white text-xs font-mono px-2 py-0.5">
              NEW
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-body font-medium text-charcoal-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-amber transition-colors duration-200">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating?.rate || 0} size="sm" />
          <span className="text-xs font-mono text-charcoal-600">
            ({product.rating?.count || 0})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="font-display text-xl font-semibold text-charcoal-900">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-body font-medium tracking-wide transition-all duration-200 active:scale-95 ${
              adding
                ? 'bg-green-600 text-white'
                : inCart
                ? 'bg-amber text-white hover:bg-amber-dark'
                : 'bg-charcoal-900 text-cream-50 hover:bg-charcoal-700'
            }`}
          >
            {adding ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added
              </>
            ) : inCart ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                In Cart
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
