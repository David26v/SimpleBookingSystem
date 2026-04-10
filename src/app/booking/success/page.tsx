import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function LoadingFallback() {
  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
        <Loader2 className="size-10 text-muted-foreground animate-spin" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Processing your booking...</h1>
      <p className="text-muted-foreground">
        Please wait while we confirm your payment.
      </p>
    </div>
  );
}

async function BookingResult({ sessionId }: { sessionId: string }) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <XCircle className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment not completed</h1>
        <p className="text-muted-foreground mb-6">
          Your payment was not processed. Please try again.
        </p>
        <Button
          size="lg"
          className="rounded-xl px-6 h-11"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to listings
        </Button>
      </div>
    );
  }

  const { listingId, checkIn, checkOut, guests, totalPrice } =
    session.metadata!;

  let booking;
  try {
    let user = await prisma.user.findFirst({
      where: { email: "david@example.com" },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { name: "David Cruz", email: "david@example.com" },
      });
    }

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
            <AlertTriangle className="size-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Dates no longer available</h1>
          <p className="text-muted-foreground mb-2">
            Someone booked these dates just before you. Your payment has been
            processed but will be refunded automatically.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Stripe session: {sessionId.slice(0, 20)}...
          </p>
          <Button
            size="lg"
            className="rounded-xl px-6 h-11"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Find other stays
          </Button>
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
        <CheckCircle2 className="size-10 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-2">Booking confirmed!</h1>
      <p className="text-muted-foreground mb-8">
        Payment successful. Your reservation is all set.
      </p>

      {/* Booking card */}
      <Card className="overflow-hidden text-left mb-8 py-0 gap-0">
        <div className="aspect-[3/1] overflow-hidden">
          <img
            src={booking.listing.imageUrl}
            alt={booking.listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="space-y-3 pt-5">
          <h2 className="text-lg font-bold">{booking.listing.title}</h2>
          <p className="text-sm text-muted-foreground">
            {booking.listing.location}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-in
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {format(new Date(checkIn), "EEE, MMM d")}
              </p>
            </div>
            <div className="bg-secondary rounded-xl p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-out
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {format(new Date(checkOut), "EEE, MMM d")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">
                {nights} night{nights > 1 ? "s" : ""} &middot;{" "}
                {guests} guest{parseInt(guests) > 1 ? "s" : ""}
              </p>
              <Badge variant="outline" className="mt-1 font-mono text-[10px]">
                ID: {booking.id.slice(0, 12)}
              </Badge>
            </div>
            <p className="text-xl font-bold">
              ${parseFloat(totalPrice).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 rounded-xl h-11"
          nativeButton={false}
          render={<Link href="/my-trips" />}
        >
          View My Trips
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 rounded-xl h-11"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) redirect("/");

  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingResult sessionId={session_id} />
    </Suspense>
  );
}
