import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search recipes...', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input pl-10"
        />
      </div>
      <button type="submit" className="btn-primary whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
