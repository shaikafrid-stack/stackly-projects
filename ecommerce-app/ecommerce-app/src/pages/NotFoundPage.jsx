import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-cream-50">
      <div className="text-center max-w-md px-4 animate-fade-in">
        <div className="font-display text-[120px] font-bold text-cream-200 leading-none mb-4 select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-medium mb-3 -mt-8">Page Not Found</h1>
        <p className="font-body text-charcoal-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-8 py-3">Go Home</Link>
          <Link to="/products" className="btn-secondary px-8 py-3">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
