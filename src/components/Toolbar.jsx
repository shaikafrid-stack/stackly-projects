import { CATEGORIES } from '../utils/constants';

export default function Toolbar({ search, onSearch, category, onCategory }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">
          🔍
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by product name or category…"
          className="w-full rounded-lg pl-9 pr-9 py-2 text-sm text-white placeholder-slate-600 outline-none border border-white/10 focus:ring-2 focus:ring-indigo-500 transition"
          style={{ backgroundColor: '#161b27' }}
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className="rounded-lg px-3 py-2 text-sm text-white outline-none border border-white/10 focus:ring-2 focus:ring-indigo-500 transition min-w-[170px] capitalize"
        style={{ backgroundColor: '#161b27' }}
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c} className="capitalize">
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
