import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

export const revalidate = 60;

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
            <p className="text-muted-foreground text-sm mt-1">
              {listings.length} propert{listings.length === 1 ? "y" : "ies"}{" "}
              {location ? "found" : "available"}
            </p>
          </div>
          {location && (
            <Button variant="link" nativeButton={false} render={<Link href="/" />}>
              Clear filter
            </Button>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <Search className="mx-auto mb-4 text-muted-foreground/40 size-16" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold mb-2">No stays found</h3>
            <p className="text-muted-foreground mb-6">
              No properties match &quot;{location}&quot;. Try another location.
            </p>
            <Button
              size="lg"
              className="rounded-xl px-6 h-11"
              nativeButton={false} render={<Link href="/" />}
            >
              View all stays
            </Button>
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
