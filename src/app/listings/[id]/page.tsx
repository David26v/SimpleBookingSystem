import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookingPanel } from "@/components/BookingPanel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Home,
  Star,
  CalendarDays,
  Wifi,
  Wind,
  UtensilsCrossed,
  Car,
  Waves,
  Tv,
  Check,
} from "lucide-react";

export const revalidate = 60;

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
    { icon: Wifi, label: "Fast WiFi" },
    { icon: Wind, label: "Air conditioning" },
    { icon: UtensilsCrossed, label: "Kitchen" },
    { icon: Car, label: "Free parking" },
    { icon: Waves, label: "Pool access" },
    { icon: Tv, label: "Smart TV" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* Title */}
      <h1 className="text-xl md:text-2xl font-bold mb-1">{listing.title}</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 md:mb-6">
        <MapPin className="size-3.5" />
        {listing.location}
      </div>

      {/* Image gallery - single image on mobile, grid on desktop */}
      <div className="relative aspect-[4/3] md:aspect-auto md:grid md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden mb-6 md:mb-10 md:h-[400px]">
        <div className="md:col-span-2 md:row-span-2 relative h-full">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            className="object-cover"
          />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative">
          <Image
            src={`${listing.imageUrl}&crop=left`}
            alt={listing.title}
            fill
            sizes="25vw"
            className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative">
          <Image
            src={`${listing.imageUrl}&crop=top`}
            alt={listing.title}
            fill
            sizes="25vw"
            className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative">
          <Image
            src={`${listing.imageUrl}&crop=right`}
            alt={listing.title}
            fill
            sizes="25vw"
            className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
        </div>
        <div className="hidden md:block col-span-1 row-span-1 relative">
          <Image
            src={`${listing.imageUrl}&crop=bottom`}
            alt={listing.title}
            fill
            sizes="25vw"
            className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
          />
          <Badge
            variant="secondary"
            className="absolute bottom-3 right-3 bg-background shadow-md cursor-pointer hover:bg-secondary rounded-lg h-7 px-3"
          >
            Show all photos
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left: Listing details */}
        <div className="lg:col-span-2">
          {/* Host bar */}
          <div className="flex items-center justify-between pb-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Entire place hosted by {listing.host.name}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {listing.maxGuests} guests max
              </p>
            </div>
            <Avatar size="lg">
              {listing.host.avatarUrl ? (
                <AvatarImage src={listing.host.avatarUrl} alt={listing.host.name} />
              ) : null}
              <AvatarFallback>{listing.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <Separator className="mb-6" />

          {/* Highlights */}
          <div className="pb-6 mb-6 space-y-4">
            <div className="flex gap-4">
              <Home className="size-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Entire home</p>
                <p className="text-muted-foreground text-sm">
                  You&apos;ll have the entire place to yourself.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Star className="size-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Highly rated host</p>
                <p className="text-muted-foreground text-sm">
                  {listing.host.name} has received great reviews from guests.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CalendarDays className="size-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Free cancellation</p>
                <p className="text-muted-foreground text-sm">
                  Cancel up to 48 hours before check-in for a full refund.
                </p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <div className="pb-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">About this place</h2>
            <p className="text-foreground leading-relaxed">
              {listing.description}
            </p>
          </div>

          <Separator className="mb-6" />

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">What this place offers</h2>
            <div className="grid grid-cols-2 gap-3">
              {amenities.map((a) => (
                <div
                  key={a.label}
                  className="flex items-center gap-3 py-2.5"
                >
                  <Check className="size-4 text-primary" />
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
