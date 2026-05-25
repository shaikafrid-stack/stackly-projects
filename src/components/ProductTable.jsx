import Badge from './Badge';

const FALLBACK_IMG = 'https://placehold.co/40x40/1e2535/94a3b8?text=?';

export default function ProductTable({ products, onView, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div
        className="rounded-2xl border border-white/8 flex flex-col items-center justify-center py-24 gap-4"
        style={{ backgroundColor: '#161b27' }}
      >
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-3xl">
          📦
        </div>
        <p className="text-slate-400 text-sm font-medium">No products found</p>
        <p className="text-slate-600 text-xs">Try adjusting your search or filter, or add a new product.</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ backgroundColor: '#161b27' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['#', 'Product', 'Category', 'Price', 'Qty', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr
                key={product.id}
                className="group transition-colors hover:bg-white/[0.03]"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: idx % 2 !== 0 ? 'rgba(255,255,255,0.015)' : undefined,
                }}
              >
                {/* Index */}
                <td className="px-4 py-3 text-slate-600 text-xs">{idx + 1}</td>

                {/* Product name + thumbnail */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 max-w-[240px]">
                    <img
                      src={product.image || FALLBACK_IMG}
                      alt={product.title}
                      className="w-9 h-9 rounded-lg object-contain bg-white/5 p-1 shrink-0"
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                    />
                    <span className="truncate font-medium text-white" title={product.title}>
                      {product.title}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3 text-slate-400 capitalize whitespace-nowrap">
                  {product.category}
                </td>

                {/* Price */}
                <td className="px-4 py-3 font-semibold text-indigo-400 whitespace-nowrap">
                  ${Number(product.price).toFixed(2)}
                </td>

                {/* Qty */}
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                  {product.quantity ?? '—'}
                </td>

                {/* Status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge status={product.status || 'In Stock'} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {/* View */}
                    <button
                      onClick={() => onView(product)}
                      title="View"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-500"
                    >
                      👁
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(product)}
                      title="Edit"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-500"
                    >
                      ✏
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(product)}
                      title="Delete"
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-500"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
