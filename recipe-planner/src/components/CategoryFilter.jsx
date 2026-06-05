import { QUICK_CATEGORIES } from '../utils/constants';
import { useApp } from '../context/AppContext';

export default function CategoryFilter({ onSelect }) {
  const { state, setCategory } = useApp();

  const handleClick = (name) => {
    const next = state.activeCategory === name ? '' : name;
    setCategory(next);
    onSelect?.(next);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => handleClick('')}
        className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0"
        style={{
          background: !state.activeCategory ? 'var(--accent)' : 'var(--surface)',
          color: !state.activeCategory ? 'white' : 'var(--muted)',
          border: '1px solid var(--border)',
        }}
      >
        All
      </button>
      {QUICK_CATEGORIES.map(({ name, emoji }) => (
        <button
          key={name}
          onClick={() => handleClick(name)}
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5"
          style={{
            background: state.activeCategory === name ? 'var(--accent)' : 'var(--surface)',
            color: state.activeCategory === name ? 'white' : 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          <span>{emoji}</span> {name}
        </button>
      ))}
    </div>
  );
}
