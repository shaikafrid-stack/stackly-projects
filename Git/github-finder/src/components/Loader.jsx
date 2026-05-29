export default function Loader() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 fade-in">

      {/* Loading spinner */}
      <div className="flex justify-center py-4">
        <div className="spinner" />
      </div>

      {/* Profile skeleton */}
      <div className="card p-6 flex gap-6">
        <div className="skeleton w-24 h-24 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-40 rounded" />
          <div className="skeleton h-3 w-28 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="flex gap-6 mt-2">
            <div className="skeleton h-8 w-16 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        </div>
      </div>

      {/* Repo skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
