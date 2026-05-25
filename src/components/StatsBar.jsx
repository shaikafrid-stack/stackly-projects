const CARDS = [
  {
    key: 'total',
    label: 'Total Products',
    icon: '⊞',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    ring: 'ring-indigo-500/20',
  },
  {
    key: 'inStock',
    label: 'In Stock',
    icon: '✓',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  {
    key: 'lowStock',
    label: 'Low Stock',
    icon: '⚠',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
  {
    key: 'avgPrice',
    label: 'Avg. Price',
    icon: '$',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
  },
];

export default function StatsBar({ products }) {
  const total = products.length;
  const inStock = products.filter((p) => p.status === 'In Stock').length;
  const lowStock = products.filter((p) => p.status === 'Low Stock').length;
  const avgPrice =
    total > 0
      ? `$${(products.reduce((s, p) => s + Number(p.price), 0) / total).toFixed(2)}`
      : '$0.00';

  const values = { total, inStock, lowStock, avgPrice };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className={`rounded-xl p-4 flex items-center gap-4 border border-white/8 ring-1 ${card.ring}`}
          style={{ backgroundColor: '#161b27' }}
        >
          <div
            className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color} text-base shrink-0`}
          >
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{values[card.key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
