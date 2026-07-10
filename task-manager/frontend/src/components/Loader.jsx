export default function Loader({ size = 'md', label }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-brand-200 border-t-brand-600`}
      />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
