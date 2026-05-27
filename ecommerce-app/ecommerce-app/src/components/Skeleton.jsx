export default function ProductSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="bg-gray-200 aspect-square" />
      <div className="p-5">
        <div className="h-3 bg-gray-200 rounded mb-3 w-2/3" />
        <div className="h-3 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded mb-4 w-4/5" />
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-gray-200 rounded" />)}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
        <p className="font-body text-sm text-charcoal-600 tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
