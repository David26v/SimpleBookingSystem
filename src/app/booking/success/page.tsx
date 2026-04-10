import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/");

  // Retrieve the Stripe checkout session
  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.payment_status !== "paid") {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment not completed</h1>
        <p className="text-[var(--color-muted)] mb-6">
          Your payment was not processed. Please try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
          style={{ background: "linear-gradient(to right, #e61e4d, #bd1e59)" }}
        >
          Back to listings
        </Link>
      </div>
    );
  }

  const { listingId, checkIn, checkOut, guests, totalPrice } =
    session.metadata!;

  // Atomically create the booking (prevent double-booking even after payment)
  let booking;
  try {
    // Get or create user
    let user = await prisma.user.findFirst({
      where: { email: "david@example.com" },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { name: "David Cruz", email: "david@example.com" },
      });
    }

    // Check if booking already exists for this session (idempotency)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        userId: user.id,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: "confirmed",
      },
      include: { listing: true },
    });

    if (existingBooking) {
      booking = existingBooking;
    } else {
      // Create booking inside a serializable transaction
      booking = await prisma.$transaction(
        async (tx) => {
          const overlapping = await tx.booking.findMany({
            where: {
              listingId,
              status: "confirmed",
              AND: [
                { checkIn: { lt: new Date(checkOut) } },
                { checkOut: { gt: new Date(checkIn) } },
              ],
            },
          });

          if (overlapping.length > 0) {
            throw new Error("DATES_TAKEN");
          }

          return tx.booking.create({
            data: {
              checkIn: new Date(checkIn),
              checkOut: new Date(checkOut),
              guests: parseInt(guests),
              totalPrice: parseFloat(totalPrice),
              listingId,
              userId: user!.id,
              status: "confirmed",
            },
            include: { listing: true },
          });
        },
        { isolationLevel: "Serializable" }
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "DATES_TAKEN") {
      return (
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Dates no longer available</h1>
          <p className="text-[var(--color-muted)] mb-2">
            Someone booked these dates just before you. Your payment has been
            processed but will be refunded automatically.
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Stripe session: {session_id.slice(0, 20)}...
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{
              background: "linear-gradient(to right, #e61e4d, #bd1e59)",
            }}
          >
            Find other stays
          </Link>
        </div>
      );
    }
    throw err;
  }

  const nights = Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      {/* Success animation */}
      <div className="animate-success inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#008a05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-2">Booking confirmed!</h1>
      <p className="text-[var(--color-muted)] mb-8">
        Payment successful. Your reservation is all set.
      </p>

      {/* Booking card */}
      <div className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden text-left mb-8 shadow-sm">
        <div className="aspect-[3/1] overflow-hidden">
          <img
            src={booking.listing.imageUrl}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-bold">{booking.listing.title}</h2>
          <p className="text-sm text-[var(--color-muted)]">
            {booking.listing.location}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[var(--color-surface)] rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Check-in
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {format(new Date(checkIn), "EEE, MMM d")}
              </p>
            </div>
            <div className="bg-[var(--color-surface)] rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Check-out
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {format(new Date(checkOut), "EEE, MMM d")}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
            <div>
              <p className="text-xs text-[var(--color-muted)]">
                {nights} night{nights > 1 ? "s" : ""} &middot;{" "}
                {guests} guest{parseInt(guests) > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
                ID: {booking.id.slice(0, 12)}
              </p>
            </div>
            <p className="text-xl font-bold">
              ${parseFloat(totalPrice).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/my-trips"
          className="flex-1 py-3.5 rounded-xl text-white font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          style={{
            background: "linear-gradient(to right, #e61e4d, #bd1e59)",
          }}
        >
          View My Trips
        </Link>
        <Link
          href="/"
          className="flex-1 py-3.5 rounded-xl border border-[var(--color-border)] font-semibold text-sm text-center hover:bg-[var(--color-surface)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
