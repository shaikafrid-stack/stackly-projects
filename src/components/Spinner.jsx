export default function Spinner({ size = 'lg', label = 'Loading…' }) {
  const sz = size === 'sm' ? 'w-5 h-5 border-2' : 'w-10 h-10 border-2';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className={`${sz} rounded-full border-indigo-500 border-t-transparent animate-spin`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
