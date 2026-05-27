import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const STEPS = ['Cart', 'Details', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const { cart, dispatch, totalPrice } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US',
    paymentMethod: 'card',
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });

  const [errors, setErrors] = useState({});

  const shipping = totalPrice > 50 ? 0 : 5.99;
  const tax = totalPrice * 0.08;
  const orderTotal = totalPrice + shipping + tax;

  const validate = (fields) => {
    const errs = {};
    if (step === 1) {
      if (!fields.fullName.trim()) errs.fullName = 'Full name is required';
      if (!fields.email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Invalid email address';
      if (!fields.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^\+?[\d\s\-()]{7,}$/.test(fields.phone)) errs.phone = 'Invalid phone number';
      if (!fields.address.trim()) errs.address = 'Address is required';
      if (!fields.city.trim()) errs.city = 'City is required';
      if (!fields.zip.trim()) errs.zip = 'ZIP code is required';
    }
    if (step === 2 && fields.paymentMethod === 'card') {
      if (!fields.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) errs.cardNumber = 'Invalid card number (16 digits)';
      if (!fields.cardName.trim()) errs.cardName = 'Cardholder name is required';
      if (!fields.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) errs.expiry = 'Invalid format (MM/YY)';
      if (!fields.cvv.match(/^\d{3,4}$/)) errs.cvv = 'Invalid CVV';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    if (name === 'expiry') {
      v = value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    }
    if (name === 'cvv') v = value.replace(/\D/g, '').slice(0, 4);
    setForm(f => ({ ...f, [name]: v }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const nextStep = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const placeOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    dispatch({ type: 'CLEAR_CART' });
    setOrderPlaced(true);
    setLoading(false);
  };

  if (orderPlaced) {
    const orderId = 'LM' + Math.random().toString(36).substr(2, 8).toUpperCase();
    return (
      <div className="pt-20 min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-medium mb-3">Order Confirmed!</h1>
          <p className="font-body text-charcoal-600 mb-2">
            Thank you, {form.fullName.split(' ')[0]}! Your order has been placed successfully.
          </p>
          <p className="font-mono text-amber font-medium mb-8">Order #{orderId}</p>
          <p className="font-body text-sm text-charcoal-600 mb-8">
            A confirmation will be sent to <strong>{form.email}</strong>. 
            Expected delivery: 3-5 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary px-8 py-3">Back to Home</Link>
            <Link to="/products" className="btn-secondary px-8 py-3">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl mb-4">Your cart is empty</h2>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      </div>
    );
  }

  const InputField = ({ label, name, type = 'text', placeholder, half }) => (
    <div className={half ? 'flex-1' : 'w-full'}>
      <label className="block font-body text-xs font-semibold text-charcoal-900 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input-field ${errors[name] ? 'border-red-400 bg-red-50' : ''}`}
      />
      {errors[name] && <p className="text-red-500 text-xs font-body mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-charcoal-900 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-4xl font-medium text-white mb-6">Checkout</h1>
          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {['Shipping', 'Payment', 'Review'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 text-sm font-body ${
                  step > i ? 'text-green-400' : step === i + 1 ? 'text-amber' : 'text-gray-500'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    step > i ? 'bg-green-500 border-green-500 text-white' :
                    step === i + 1 ? 'border-amber text-amber' : 'border-gray-600 text-gray-500'
                  }`}>
                    {step > i ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:block">{s}</span>
                </div>
                {i < 2 && <div className={`w-12 sm:w-20 h-px mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-charcoal-700'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="card p-6 md:p-8 animate-fade-in">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-amber text-white text-xs flex items-center justify-center font-mono">1</span>
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <InputField label="Full Name *" name="fullName" placeholder="John Doe" />
                  <div className="flex gap-4">
                    <InputField label="Email Address *" name="email" type="email" placeholder="john@email.com" half />
                    <InputField label="Phone Number *" name="phone" placeholder="+1 555 000 0000" half />
                  </div>
                  <InputField label="Street Address *" name="address" placeholder="123 Main Street, Apt 4B" />
                  <div className="flex gap-4">
                    <InputField label="City *" name="city" placeholder="New York" half />
                    <InputField label="State / Province" name="state" placeholder="NY" half />
                  </div>
                  <div className="flex gap-4">
                    <InputField label="ZIP / Postal Code *" name="zip" placeholder="10001" half />
                    <div className="flex-1">
                      <label className="block font-body text-xs font-semibold text-charcoal-900 uppercase tracking-wide mb-1.5">Country</label>
                      <select name="country" value={form.country} onChange={handleChange} className="input-field">
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={nextStep} className="btn-primary w-full mt-8 py-4 text-base">
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card p-6 md:p-8 animate-fade-in">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-amber text-white text-xs flex items-center justify-center font-mono">2</span>
                  Payment Method
                </h2>

                {/* Method select */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'card', label: 'Credit Card', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setForm(f => ({ ...f, paymentMethod: m.id }))}
                      className={`p-3 border text-sm font-body text-center transition-all duration-200 ${
                        form.paymentMethod === m.id
                          ? 'border-charcoal-900 bg-charcoal-50'
                          : 'border-gray-200 hover:border-charcoal-400'
                      }`}
                    >
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-xs font-medium text-charcoal-900">{m.label}</div>
                    </button>
                  ))}
                </div>

                {form.paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-700 p-5 text-white mb-4">
                      <div className="flex justify-between items-start mb-8">
                        <div className="font-mono text-xs opacity-60">LUMIÈRE CARD</div>
                        <div className="text-right text-xs font-mono opacity-60">VISA</div>
                      </div>
                      <div className="font-mono text-lg tracking-widest mb-4">
                        {form.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <div>{form.cardName || 'CARDHOLDER NAME'}</div>
                        <div>{form.expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                    <InputField label="Card Number *" name="cardNumber" placeholder="1234 5678 9012 3456" />
                    <InputField label="Cardholder Name *" name="cardName" placeholder="John Doe" />
                    <div className="flex gap-4">
                      <InputField label="Expiry Date *" name="expiry" placeholder="MM/YY" half />
                      <InputField label="CVV *" name="cvv" placeholder="123" half />
                    </div>
                  </div>
                )}

                {form.paymentMethod === 'paypal' && (
                  <div className="bg-blue-50 border border-blue-200 p-6 text-center">
                    <p className="font-body text-blue-800 text-sm">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}

                {form.paymentMethod === 'cod' && (
                  <div className="bg-green-50 border border-green-200 p-6 text-center">
                    <p className="font-body text-green-800 text-sm">
                      Pay cash when your order is delivered. Available for orders under $500.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button onClick={nextStep} className="btn-primary flex-1 py-3 text-base">Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="card p-6 md:p-8 animate-fade-in">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-amber text-white text-xs flex items-center justify-center font-mono">3</span>
                  Review Your Order
                </h2>

                {/* Shipping summary */}
                <div className="border border-gray-200 p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-body font-semibold text-sm mb-1">Shipping to</p>
                      <p className="font-body text-sm text-charcoal-600">{form.fullName}</p>
                      <p className="font-body text-sm text-charcoal-600">{form.address}, {form.city}, {form.zip}</p>
                      <p className="font-body text-sm text-charcoal-600">{form.email} · {form.phone}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-amber text-xs font-body hover:underline">Edit</button>
                  </div>
                </div>

                <div className="border border-gray-200 p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-body font-semibold text-sm mb-1">Payment</p>
                      <p className="font-body text-sm text-charcoal-600">
                        {form.paymentMethod === 'card' ? `Card ending in ${form.cardNumber.slice(-4)}` :
                         form.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
                      </p>
                    </div>
                    <button onClick={() => setStep(2)} className="text-amber text-xs font-body hover:underline">Edit</button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3 items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <img src={item.image} alt={item.title} className="w-12 h-12 object-contain bg-cream-100 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-charcoal-900 truncate">{item.title}</p>
                        <p className="font-body text-xs text-charcoal-600">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="btn-amber flex-1 py-3 text-base flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Placing...
                      </>
                    ) : (
                      `Place Order · $${orderTotal.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto cart-scroll">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-2 items-center py-2 border-b border-gray-100 last:border-0">
                    <img src={item.image} alt="" className="w-10 h-10 object-contain bg-cream-100 p-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body font-medium text-charcoal-900 truncate">{item.title}</p>
                      <p className="text-xs font-mono text-charcoal-600">×{item.quantity}</p>
                    </div>
                    <span className="text-xs font-mono font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 mb-4">
                <div className="flex justify-between text-xs font-body">
                  <span className="text-charcoal-600">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-charcoal-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-charcoal-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                <span className="font-body font-semibold text-sm">Total</span>
                <span className="font-display text-xl font-bold text-charcoal-900">${orderTotal.toFixed(2)}</span>
              </div>

              <p className="text-center text-xs font-body text-charcoal-600 mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL encrypted & secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
