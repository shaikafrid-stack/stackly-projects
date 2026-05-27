import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import StarRating from '../components/StarRating';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/Skeleton';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { dispatch, cart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const inCart = product && cart.items.some(i => i.id === product.id);
  const cartItem = product && cart.items.find(i => i.id === product.id);

  const relatedProducts = products
    .filter(p => p.id !== Number(id) && product && p.category === product.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryLabels = {
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
    electronics: 'Electronics',
    jewelery: 'Jewellery',
  };

  if (loading) return <div className="pt-20"><PageLoader /></div>;

  if (error) {
    return (
      <div className="pt-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="font-display text-2xl font-medium mb-2">Product Not Found</h2>
          <p className="font-body text-charcoal-600 mb-6">{error}</p>
          <Link to="/products" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-cream-100 py-3 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs font-body text-charcoal-600">
            <Link to="/" className="hover:text-amber transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-amber transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-charcoal-900 font-medium truncate max-w-[200px]">{product?.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <div className="relative">
            <div className="sticky top-24 bg-cream-100 p-8 md:p-16 flex items-center justify-center aspect-square">
              <img
                src={product.image}
                alt={product.title}
                className="max-w-full max-h-full object-contain animate-fade-in drop-shadow-xl"
              />
              <div className="absolute top-4 left-4">
                <span className="tag text-xs">
                  {categoryLabels[product.category] || product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-up">
            <h1 className="font-display text-2xl md:text-3xl font-medium text-charcoal-900 leading-tight mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <StarRating rating={product.rating?.rate || 0} size="lg" showValue />
              <span className="font-body text-sm text-charcoal-600">
                {product.rating?.count} reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-200">
              <span className="font-display text-4xl font-bold text-charcoal-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="font-body text-sm text-green-600 font-medium bg-green-50 px-2 py-0.5">
                Free Shipping
              </span>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-slow" />
              <span className="font-body text-sm text-green-700 font-medium">In Stock</span>
              <span className="font-body text-sm text-charcoal-600">· Ready to ship in 1-2 days</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-body font-semibold text-charcoal-900 text-sm uppercase tracking-wide mb-3">
                Description
              </h3>
              <p className="font-body text-charcoal-700 leading-relaxed text-[15px]">
                {product.description}
              </p>
            </div>

            {/* Quantity */}
            {!inCart && (
              <div className="mb-6">
                <h3 className="font-body font-semibold text-charcoal-900 text-sm uppercase tracking-wide mb-3">
                  Quantity
                </h3>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center text-charcoal-700 hover:bg-gray-100 transition-colors"
                  >−</button>
                  <div className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center font-mono font-medium text-sm">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(q => Math.min(99, q + 1))}
                    className="w-10 h-10 border border-gray-300 flex items-center justify-center text-charcoal-700 hover:bg-gray-100 transition-colors"
                  >+</button>
                </div>
              </div>
            )}

            {/* Cart actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {inCart ? (
                <>
                  <div className="flex-1 bg-green-50 border border-green-200 py-3 flex items-center justify-center gap-2 text-green-700 font-body font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    In Cart ({cartItem?.quantity})
                  </div>
                  <Link to="/cart" className="btn-amber text-center text-sm py-3 px-6">
                    View Cart →
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 font-body font-medium text-sm tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
                      added ? 'bg-green-600 text-white' : 'bg-charcoal-900 text-white hover:bg-charcoal-700'
                    }`}
                  >
                    {added ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity } });
                      navigate('/checkout');
                    }}
                    className="btn-amber text-sm py-3 px-6"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            {/* Product specs */}
            <div className="border border-gray-200 divide-y divide-gray-100">
              {[
                ['Category', categoryLabels[product.category] || product.category],
                ['Rating', `${product.rating?.rate}/5 (${product.rating?.count} reviews)`],
                ['Availability', 'In Stock'],
                ['SKU', `SKU-${product.id.toString().padStart(4, '0')}`],
              ].map(([key, value]) => (
                <div key={key} className="flex px-4 py-3">
                  <span className="font-body text-xs text-charcoal-600 uppercase tracking-wide w-28 flex-shrink-0">{key}</span>
                  <span className="font-body text-sm text-charcoal-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="tag mb-2">More Like This</span>
                <h2 className="section-title text-2xl md:text-3xl">Related Products</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
