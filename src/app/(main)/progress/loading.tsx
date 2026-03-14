export default function ProgressLoading() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
            <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-4 space-y-3">
        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between py-1.5">
            <div className="h-4 w-40 bg-gray-50 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
