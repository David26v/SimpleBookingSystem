import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function MyTripsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "david@example.com" },
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">My Trips</h1>
        <p className="text-[var(--color-muted)]">No trips found.</p>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { listing: { include: { host: true } } },
    orderBy: { checkIn: "desc" },
  });

  const now = new Date();

  const upcoming = bookings.filter(
    (b) => new Date(b.checkIn) >= now && b.status === "confirmed"
  );
  const past = bookings.filter(
    (b) => new Date(b.checkIn) < now || b.status !== "confirmed"
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">My Trips</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Manage your reservations and view past stays
      </p>

      {bookings.length === 0 ? (
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-[var(--color-muted)] mb-6">
            When you book a stay, it will appear here.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{
              background: "linear-gradient(to right, #e61e4d, #bd1e59)",
            }}
          >
            Explore stays
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Upcoming trips
              </h2>
              <div className="space-y-4">
                {upcoming.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} variant="upcoming" />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-muted)]" />
                Past trips
              </h2>
              <div className="space-y-4">
                {past.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} variant="past" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  variant,
}: {
  booking: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    totalPrice: number;
    status: string;
    listing: {
      id: string;
      title: string;
      imageUrl: string;
      location: string;
      host: { name: string };
    };
  };
  variant: "upcoming" | "past";
}) {
  const nights = Math.ceil(
    (new Date(booking.checkOut).getTime() -
      new Date(booking.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Link
      href={`/listings/${booking.listing.id}`}
      className={`flex gap-4 border border-[var(--color-border)] rounded-2xl p-4 hover:shadow-md transition-shadow ${
        variant === "past" ? "opacity-75" : ""
      }`}
    >
      <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={booking.listing.imageUrl}
          alt={booking.listing.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold truncate">{booking.listing.title}</h3>
          <span
            className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {booking.status}
          </span>
        </div>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          {booking.listing.location}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {format(new Date(booking.checkIn), "MMM d")} -{" "}
            {format(new Date(booking.checkOut), "MMM d, yyyy")}
          </span>
          <span className="text-[var(--color-muted)]">
            {nights} night{nights > 1 ? "s" : ""}
          </span>
        </div>
        <p className="mt-2 font-semibold text-sm">
          ${booking.totalPrice.toLocaleString()}{" "}
          <span className="font-normal text-[var(--color-muted)]">total</span>
        </p>
      </div>
    </Link>
  );
}
