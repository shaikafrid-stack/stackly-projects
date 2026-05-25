import Modal from './Modal';
import Badge from './Badge';

const FALLBACK = 'https://placehold.co/120x120/1e2535/94a3b8?text=?';

export default function ViewModal({ product, onClose }) {
  return (
    <Modal title="Product Details" onClose={onClose}>
      <div className="flex gap-5 mb-4">
        <img
          src={product.image || FALLBACK}
          alt={product.title}
          className="w-28 h-28 object-contain rounded-xl bg-white/5 p-2 shrink-0 border border-white/8"
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        <div className="space-y-2 min-w-0">
          <h3 className="font-semibold text-white text-base leading-snug">{product.title}</h3>
          <p className="text-slate-400 capitalize text-sm">{product.category}</p>
          <p className="text-2xl font-bold text-indigo-400">${Number(product.price).toFixed(2)}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge status={product.status || 'In Stock'} />
            {product.quantity !== undefined && (
              <span className="text-xs text-slate-500">Qty: <span className="text-slate-300">{product.quantity}</span></span>
            )}
          </div>
        </div>
      </div>

      {product.description && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Description</p>
          <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Product ID</p>
          <p className="text-slate-300 font-mono text-xs">{product.id}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Rating</p>
          <p className="text-slate-300">
            {product.rating ? `${product.rating.rate} ★ (${product.rating.count})` : '—'}
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
