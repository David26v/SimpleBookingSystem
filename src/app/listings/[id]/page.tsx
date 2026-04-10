import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/BookingPanel";

export const dynamic = "force-dynamic";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      host: true,
      bookings: {
        where: { status: "confirmed" },
        select: { checkIn: true, checkOut: true },
      },
    },
  });

  if (!listing) notFound();

  const bookedRanges = listing.bookings.map((b) => ({
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
  }));

  const amenities = [
    { icon: "wifi", label: "Fast WiFi" },
    { icon: "ac", label: "Air conditioning" },
    { icon: "kitchen", label: "Kitchen" },
    { icon: "parking", label: "Free parking" },
    { icon: "pool", label: "Pool access" },
    { icon: "tv", label: "Smart TV" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-1">{listing.title}</h1>
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {listing.location}
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-10 h-[400px]">
        <div className="col-span-2 row-span-2">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1">
          <img
            src={`${listing.imageUrl}&crop=left`}
            alt={listing.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1">
          <img
            src={`${listing.imageUrl}&crop=top`}
            alt={listing.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1">
          <img
            src={`${listing.imageUrl}&crop=right`}
            alt={listing.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <img
            src={`${listing.imageUrl}&crop=bottom`}
            alt={listing.title}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
          <div className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1.5 text-xs font-medium shadow-md cursor-pointer hover:bg-gray-50">
            Show all photos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Listing details */}
        <div className="lg:col-span-2">
          {/* Host bar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Entire place hosted by {listing.host.name}
              </h2>
              <p className="text-[var(--color-muted)] text-sm mt-1">
                {listing.maxGuests} guests max
              </p>
            </div>
            {listing.host.avatarUrl && (
              <img
                src={listing.host.avatarUrl}
                alt={listing.host.name}
                className="w-14 h-14 rounded-full ring-2 ring-[var(--color-border)]"
              />
            )}
          </div>

          {/* Highlights */}
          <div className="border-b border-[var(--color-border)] pb-6 mb-6 space-y-4">
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-[var(--color-fg)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <div>
                <p className="font-medium text-sm">Entire home</p>
                <p className="text-[var(--color-muted)] text-sm">
                  You&apos;ll have the entire place to yourself.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-[var(--color-fg)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div>
                <p className="font-medium text-sm">Highly rated host</p>
                <p className="text-[var(--color-muted)] text-sm">
                  {listing.host.name} has received great reviews from guests.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <svg className="w-6 h-6 text-[var(--color-fg)] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div>
                <p className="font-medium text-sm">Free cancellation</p>
                <p className="text-[var(--color-muted)] text-sm">
                  Cancel up to 48 hours before check-in for a full refund.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-[var(--color-border)] pb-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">About this place</h2>
            <p className="text-[var(--color-fg)] leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-3 py-2.5"
                >
                  <svg className="w-5 h-5 text-[var(--color-fg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking panel */}
        <div className="lg:col-span-1">
          <BookingPanel
            listingId={listing.id}
            pricePerNight={listing.pricePerNight}
            maxGuests={listing.maxGuests}
            bookedRanges={bookedRanges}
          />
        </div>
      </div>
    </div>
  );
}
