import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import Link from "next/link";
import { MapPin, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 60;

const destinations = [
  { name: "Boracay", emoji: "🏖️", description: "White sand beaches" },
  { name: "Makati", emoji: "🏙️", description: "City life & nightlife" },
  { name: "Baguio", emoji: "🌲", description: "Cool mountain air" },
  { name: "Tagaytay", emoji: "🌋", description: "Scenic lake views" },
  { name: "Siargao", emoji: "🏄", description: "Surfing paradise" },
  { name: "Vigan", emoji: "🏛️", description: "Heritage town charm" },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
}) {
  const { location } = await searchParams;

  const listings = await prisma.listing.findMany({
    where: location
      ? { location: { contains: location, mode: "insensitive" } }
      : undefined,
    select: {
      id: true,
      title: true,
      imageUrl: true,
      pricePerNight: true,
      location: true,
      maxGuests: true,
      host: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  // Get unique locations with counts for the "trending" section
  const locationCounts = await prisma.listing.groupBy({
    by: ["location"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 6,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Search header */}
      <div className="pt-6 pb-4 md:pt-10 md:pb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Explore</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Discover amazing places to stay across the Philippines
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <form action="/explore" method="GET">
          <div className="flex items-center gap-2 border border-border rounded-xl px-4 h-12 bg-secondary/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
            <Search className="size-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              name="location"
              placeholder="Search by location..."
              defaultValue={location || ""}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button size="sm" className="rounded-lg h-8 px-4 text-xs font-semibold">
              Search
            </Button>
          </div>
        </form>
      </div>

      {/* Show results if searching */}
      {location ? (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Results for &ldquo;{location}&rdquo;
              </h2>
              <p className="text-muted-foreground text-sm">
                {listings.length} propert{listings.length === 1 ? "y" : "ies"} found
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/explore" />}
            >
              Clear
            </Button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16">
              <Search className="mx-auto mb-4 text-muted-foreground/40 size-12" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold mb-2">No stays found</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Try a different location or browse our popular destinations below.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Popular Destinations */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          Popular destinations
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              href={`/explore?location=${encodeURIComponent(dest.name)}`}
            >
              <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer py-0 overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{dest.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{dest.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dest.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending locations from actual data */}
      {locationCounts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Trending locations
          </h2>
          <div className="flex flex-wrap gap-2">
            {locationCounts.map((loc) => (
              <Link
                key={loc.location}
                href={`/explore?location=${encodeURIComponent(loc.location)}`}
              >
                <div className="flex items-center gap-2 border border-border rounded-full px-4 py-2 hover:bg-secondary/50 hover:border-primary/20 transition-all cursor-pointer">
                  <MapPin className="size-3 text-muted-foreground" />
                  <span className="text-sm font-medium">{loc.location}</span>
                  <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {loc._count.id} {loc._count.id === 1 ? "stay" : "stays"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All listings when not searching */}
      {!location && listings.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4">All stays</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
