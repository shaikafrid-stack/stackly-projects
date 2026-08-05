import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [local, setLocal] = useState(value || '');

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
      <input
        className="input pl-9"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
    </div>
  );
}
