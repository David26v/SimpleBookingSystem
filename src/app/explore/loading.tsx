export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="pt-6 pb-4 md:pt-10 md:pb-6">
        <div className="h-8 w-32 bg-secondary rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-secondary rounded-lg animate-pulse mt-2" />
      </div>

      <div className="h-12 bg-secondary/30 rounded-xl animate-pulse mb-8" />

      <div className="mb-10">
        <div className="h-5 w-48 bg-secondary rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </div>

      <div className="mb-10">
        <div className="h-5 w-32 bg-secondary rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] bg-secondary rounded-xl animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-secondary rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
