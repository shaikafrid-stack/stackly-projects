import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, dispatch, totalItems, totalPrice } = useCart();

  const updateQty = (id, qty) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: qty } });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  if (cart.items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center max-w-md px-4 animate-fade-in">
          <div className="w-24 h-24 bg-cream-200 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-charcoal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-medium mb-3">Your cart is empty</h2>
          <p className="font-body text-charcoal-600 leading-relaxed mb-8">
            Looks like you haven't added anything yet. Browse our collection and find something you love.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Start Shopping
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-cream-50">
      <div className="bg-charcoal-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="tag bg-amber/20 text-amber mb-2">Shopping</span>
          <h1 className="font-display text-4xl font-medium text-white">
            Your Cart
            <span className="font-mono text-xl text-gray-400 ml-3 font-normal">({totalItems})</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-body uppercase tracking-widest text-charcoal-600 pb-3 border-b border-gray-200">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cart.items.map(item => (
              <div key={item.id} className="card p-4 md:p-5 animate-fade-in">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Product */}
                  <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                    <Link to={`/products/${item.id}`} className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-cream-100 flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain p-2" />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.id}`}>
                        <h3 className="font-body font-medium text-charcoal-900 text-sm leading-snug hover:text-amber transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <span className="tag text-[10px] mt-1 inline-block">{item.category}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-4 md:col-span-2 text-center">
                    <span className="md:hidden text-xs text-charcoal-600 font-body">Price: </span>
                    <span className="font-mono font-medium text-sm">${item.price.toFixed(2)}</span>
                  </div>

                  {/* Qty */}
                  <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 border border-gray-300 flex items-center justify-center text-charcoal-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors text-lg leading-none"
                    >
                      {item.quantity === 1 ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      ) : '−'}
                    </button>
                    <span className="w-8 text-center font-mono font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 border border-gray-300 flex items-center justify-center text-charcoal-700 hover:bg-gray-100 transition-colors"
                    >+</button>
                  </div>

                  {/* Total + Remove */}
                  <div className="col-span-4 md:col-span-2 flex flex-col items-end gap-1">
                    <span className="font-display font-semibold text-charcoal-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-body text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="flex justify-between items-center pt-4">
              <Link to="/products" className="btn-secondary text-sm inline-flex items-center gap-2">
                ← Continue Shopping
              </Link>
              <button
                onClick={() => dispatch({ type: 'CLEAR_CART' })}
                className="text-sm font-body text-red-500 hover:text-red-700 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-charcoal-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-charcoal-600">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-charcoal-600">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mb-4 bg-amber/10 px-3 py-2 text-xs font-body text-amber-dark">
                  Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                </div>
              )}

              <div className="flex justify-between items-baseline mb-8">
                <span className="font-body font-semibold text-charcoal-900">Total</span>
                <span className="font-display text-2xl font-bold text-charcoal-900">
                  ${orderTotal.toFixed(2)}
                </span>
              </div>

              <Link to="/checkout" className="btn-primary w-full text-center block text-base py-4">
                Proceed to Checkout →
              </Link>

              {/* Payment icons */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {['VISA', 'MC', 'AMEX', 'PP'].map(p => (
                  <span key={p} className="text-[10px] font-mono text-charcoal-600 border border-gray-200 px-1.5 py-0.5">{p}</span>
                ))}
              </div>
              <p className="text-center text-xs font-body text-charcoal-600 mt-2">🔒 Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
