export default function Loading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-[#bd1e59] to-[#92174d]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="h-10 w-80 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-96 bg-white/15 rounded-lg animate-pulse mb-8" />
          <div className="h-12 w-full max-w-xl bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-32 bg-muted/60 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] rounded-xl bg-muted animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-muted/60 rounded animate-pulse mb-1" />
              <div className="h-3 w-1/3 bg-muted/60 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
