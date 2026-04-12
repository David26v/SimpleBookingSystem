import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { CancelButton } from "./cancel-button";

export const revalidate = 30;

export default async function MyTripsPage() {
  const user = await prisma.user.findFirst({
    where: { email: "david@example.com" },
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">My Trips</h1>
        <p className="text-muted-foreground">No trips found.</p>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
      guests: true,
      totalPrice: true,
      status: true,
      listing: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          location: true,
          host: { select: { name: true } },
        },
      },
    },
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
      <p className="text-muted-foreground mb-8">
        Manage your reservations and view past stays
      </p>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="mx-auto mb-4 text-muted-foreground/40 size-16" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6">
            When you book a stay, it will appear here.
          </p>
          <Button
            size="lg"
            className="rounded-xl px-6 h-11"
            nativeButton={false} render={<Link href="/" />}
          >
            Explore stays
          </Button>
        </div>
      ) : (
        <>
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

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground" />
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
    <Card
      className={`flex-row overflow-hidden hover:shadow-md transition-shadow p-0 ${
        variant === "past" ? "opacity-75" : ""
      }`}
    >
      <Link href={`/listings/${booking.listing.id}`} className="relative w-28 h-auto overflow-hidden flex-shrink-0">
        <Image
          src={booking.listing.imageUrl}
          alt={booking.listing.title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </Link>
      <CardContent className="flex-1 min-w-0 py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${booking.listing.id}`} className="font-semibold truncate hover:underline">
            {booking.listing.title}
          </Link>
          <Badge
            variant={booking.status === "confirmed" ? "default" : "secondary"}
            className={
              booking.status === "confirmed"
                ? "bg-green-100 text-green-800 border-0"
                : ""
            }
          >
            {booking.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {booking.listing.location}
        </p>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {format(new Date(booking.checkIn), "MMM d")} -{" "}
            {format(new Date(booking.checkOut), "MMM d, yyyy")}
          </span>
          <span className="text-muted-foreground">
            {nights} night{nights > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="font-semibold text-sm">
            ${booking.totalPrice.toLocaleString()}{" "}
            <span className="font-normal text-muted-foreground">total</span>
          </p>
          <CancelButton bookingId={booking.id} />
        </div>
      </CardContent>
    </Card>
  );
}
