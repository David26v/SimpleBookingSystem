import Link from "next/link";
import type { Listing, User } from "@/generated/prisma/client";

type ListingWithHost = Listing & { host: User };

export function ListingCard({ listing }: { listing: ListingWithHost }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm">
          ${listing.pricePerNight.toLocaleString()}/night
        </div>
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] truncate">
            {listing.title}
          </h3>
          <p className="text-[var(--color-muted)] text-sm">
            {listing.location}
          </p>
          <p className="text-[var(--color-muted)] text-sm flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Up to {listing.maxGuests} guests
          </p>
        </div>
      </div>
      <p className="mt-2 text-[15px]">
        <span className="font-bold">
          ${listing.pricePerNight.toLocaleString()}
        </span>{" "}
        <span className="text-[var(--color-muted)]">/ night</span>
      </p>
    </Link>
  );
}
