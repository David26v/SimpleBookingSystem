export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Profile header skeleton */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
        <div className="size-20 md:size-24 rounded-full bg-secondary animate-pulse" />
        <div className="text-center sm:text-left flex-1">
          <div className="h-8 w-40 bg-secondary rounded-lg animate-pulse mx-auto sm:mx-0" />
          <div className="h-4 w-56 bg-secondary rounded-lg animate-pulse mt-2 mx-auto sm:mx-0" />
          <div className="flex gap-2 mt-3 justify-center sm:justify-start">
            <div className="h-6 w-20 bg-secondary rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="h-px bg-border mb-8" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-4 text-center">
            <div className="h-8 w-12 bg-secondary rounded-lg animate-pulse mx-auto" />
            <div className="h-3 w-20 bg-secondary rounded animate-pulse mt-2 mx-auto" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-secondary animate-pulse" />
            <div>
              <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-40 bg-secondary rounded animate-pulse mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
