import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-100 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">L</span>
              </div>
              <span className="font-display text-xl font-semibold text-white">Lumière</span>
            </div>
            <p className="font-body text-sm text-gray-400 leading-relaxed max-w-xs">
              Curated products for the discerning shopper. Quality over quantity, always.
            </p>
          </div>
          <div>
            <h4 className="font-body font-semibold text-white mb-4 text-sm tracking-widest uppercase">Navigation</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/products', 'Shop'], ['/cart', 'Cart'], ['/checkout', 'Checkout']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="font-body text-sm text-gray-400 hover:text-amber transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-body font-semibold text-white mb-4 text-sm tracking-widest uppercase">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-body">
              <li>hello@lumiere.store</li>
              <li>+1 (555) 000-0000</li>
              <li>123 Style Avenue, NY 10001</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-charcoal-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-mono text-xs text-gray-500">© 2025 Lumière. All rights reserved.</p>
          <p className="font-mono text-xs text-gray-500">Powered by Fake Store API</p>
        </div>
      </div>
    </footer>
  );
}
