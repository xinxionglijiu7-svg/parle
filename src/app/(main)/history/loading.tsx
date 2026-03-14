export default function HistoryLoading() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-24 bg-gray-50 rounded animate-pulse" />
      <div className="space-y-3 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-5 w-44 bg-gray-100 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-50 rounded-full animate-pulse" />
            </div>
            <div className="h-3 w-28 bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
