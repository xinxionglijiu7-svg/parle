export default function VocabularyLoading() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-9 w-full bg-gray-50 rounded animate-pulse mt-4" />
      <div className="grid gap-2 sm:grid-cols-2 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 space-y-2">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-50 rounded animate-pulse" />
            <div className="h-3 w-full bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
