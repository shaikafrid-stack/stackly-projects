const NAV_ITEMS = [
  { icon: '⬡', label: 'Dashboard' },
  { icon: '⊞', label: 'Products', active: true },
  { icon: '◈', label: 'Categories' },
  { icon: '⊕', label: 'Orders' },
  { icon: '◎', label: 'Analytics' },
  { icon: '⚙', label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 h-full w-60 z-30 flex flex-col',
          'border-r border-white/8 transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ backgroundColor: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm font-display">
            P
          </div>
          <span className="font-display font-bold text-white tracking-wide text-lg">
            ProStock
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              className={[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
                item.active
                  ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
              ].join(' ')}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              {item.label}
              {item.active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@prostock.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
