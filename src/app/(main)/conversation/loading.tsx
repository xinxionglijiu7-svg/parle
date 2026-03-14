export default function ConversationLoading() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-6 w-48 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-64 bg-gray-50 rounded animate-pulse" />
      <div className="grid gap-3 sm:grid-cols-2 mt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
