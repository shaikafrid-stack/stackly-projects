import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { state, toggleTheme } = useApp();
  const favCount = state.favourites.length;

  return (
    <nav style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
      className="sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--accent)' }}>
            Mise en Place
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Recipes
            </NavLink>
            <NavLink to="/favourites" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Favourites {favCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs text-white"
                  style={{ background: 'var(--accent)', fontSize: '0.65rem' }}>
                  {favCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Meal Planner
            </NavLink>
          </div>

          <button onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ border: '1px solid var(--border)' }}
            title="Toggle theme">
            {state.theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden flex items-center gap-4 px-4 pb-2 text-sm overflow-x-auto">
        {[['/', 'Home'], ['/recipes', 'Recipes'], ['/favourites', `❤️ ${favCount || ''}`], ['/planner', 'Planner']].map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link whitespace-nowrap ${isActive ? 'active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
