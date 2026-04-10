import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format, differenceInCalendarDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Star,
  Shield,
  CalendarDays,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { ConfirmPayButton } from "./confirm-pay-button";

export const dynamic = "force-dynamic";

export default async function BookConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}) {
  const { id } = await params;
  const { checkIn, checkOut, guests: guestsStr } = await searchParams;

  if (!checkIn || !checkOut) notFound();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { host: true },
  });

  if (!listing) notFound();

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const guests = parseInt(guestsStr || "1");
  const nights = differenceInCalendarDays(checkOutDate, checkInDate);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/listings/${id}`}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Confirm and pay</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Trip details */}
        <div className="space-y-6">
          {/* Your trip */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your trip</h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Dates</p>
                  <p className="text-muted-foreground text-sm">
                    {format(checkInDate, "MMM d")} -{" "}
                    {format(checkOutDate, "MMM d, yyyy")}
                  </p>
                </div>
                <Link
                  href={`/listings/${id}`}
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  Edit
                </Link>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-muted-foreground text-sm">
                    {guests} guest{guests > 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  href={`/listings/${id}`}
                  className="text-sm font-semibold underline underline-offset-2"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cancellation policy */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Cancellation policy</h2>
            <div className="flex gap-3">
              <CalendarDays className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  <strong>Free cancellation before check-in.</strong> Cancel up
                  to 48 hours before check-in for a full refund.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ground rules */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Ground rules</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We ask every guest to remember a few simple things about what makes
              a great guest.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Follow the house rules</li>
              <li>Treat your Host&apos;s home like your own</li>
            </ul>
          </div>

          <Separator />

          {/* Payment section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                Secure payment powered by{" "}
                <strong className="text-[#635bff]">Stripe</strong>
              </p>
            </div>

            <ConfirmPayButton
              listingId={id}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              totalPrice={totalPrice}
            />

            <div className="flex items-center justify-center gap-2 mt-4">
              <Lock className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Your payment info is encrypted and secure
              </p>
            </div>
          </div>
        </div>

        {/* Right: Listing summary card */}
        <div>
          <Card className="sticky top-24 rounded-2xl">
            <CardContent className="space-y-4">
              {/* Listing preview */}
              <div className="flex gap-4">
                <div className="w-28 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Entire home
                  </p>
                  <p className="font-medium text-sm truncate">
                    {listing.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {listing.location}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="size-3 fill-foreground text-foreground" />
                    <span className="text-xs font-medium">4.9</span>
                    <span className="text-xs text-muted-foreground">
                      (128 reviews)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Price details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline underline-offset-2">
                      ${listing.pricePerNight.toLocaleString()} x {nights} night
                      {nights > 1 ? "s" : ""}
                    </span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground underline underline-offset-2">
                      Service fee
                    </span>
                    <span>${serviceFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total (USD)</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
