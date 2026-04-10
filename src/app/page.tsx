import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;

  const listings = await prisma.listing.findMany({
    where: location
      ? { location: { contains: location, mode: "insensitive" } }
      : undefined,
    include: { host: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#bd1e59] to-[#92174d] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Find your next getaway
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-lg">
            Discover and book unique stays across the Philippines. From
            beachfront villas to mountain retreats.
          </p>
          <SearchBar initialLocation={location || undefined} />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {location ? `Stays in ${location}` : "Popular stays"}
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              {listings.length} propert{listings.length === 1 ? "y" : "ies"}{" "}
              {location ? "found" : "available"}
            </p>
          </div>
          {location && (
            <a
              href="/"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Clear filter
            </a>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="mx-auto mb-4 text-[var(--color-border)]"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No stays found</h3>
            <p className="text-[var(--color-muted)] mb-6">
              No properties match &quot;{location}&quot;. Try another location.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
              style={{
                background: "linear-gradient(to right, #e61e4d, #bd1e59)",
              }}
            >
              View all stays
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
