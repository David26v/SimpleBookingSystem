export default function LoadingListing() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="h-7 w-64 bg-muted rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-40 bg-muted/60 rounded animate-pulse mb-6" />

      {/* Gallery skeleton */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-10 h-[400px]">
        <div className="col-span-2 row-span-2 bg-muted animate-pulse" />
        <div className="bg-muted animate-pulse" />
        <div className="bg-muted animate-pulse" />
        <div className="bg-muted animate-pulse" />
        <div className="bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-72 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted/60 rounded animate-pulse" />
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted/40 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted/40 rounded animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-80 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
