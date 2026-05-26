export default function Header({ onMenuClick, onAddProduct }) {
  return (
    <header
      className="h-14 border-b sticky top-0 z-10 flex items-center px-4 lg:px-6 gap-4 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(13,17,23,0.85)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="lg:hidden text-slate-400 hover:text-white transition-colors text-xl leading-none"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>ProStock</span>
          <span>/</span>
          <span className="text-white font-semibold">Products</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>

        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs lg:text-sm font-semibold transition-colors"
        >
          <span className="text-base leading-none">+</span>
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>
    </header>
  );
}
