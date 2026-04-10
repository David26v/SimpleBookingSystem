import Link from "next/link";
import type { Listing, User } from "@/generated/prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";

type ListingWithHost = Listing & { host: User };

export function ListingCard({ listing }: { listing: ListingWithHost }) {
  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <Card className="overflow-hidden border-0 ring-0 shadow-none bg-transparent py-0 gap-0">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm shadow-sm text-foreground border-0 rounded-full px-2.5 h-6"
          >
            ${listing.pricePerNight.toLocaleString()}/night
          </Badge>
        </div>
        <CardContent className="px-0 space-y-1">
          <h3 className="font-semibold text-[15px] truncate">
            {listing.title}
          </h3>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <MapPin className="size-3" />
            {listing.location}
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <Users className="size-3" />
            Up to {listing.maxGuests} guests
          </p>
          <p className="pt-1 text-[15px]">
            <span className="font-bold">
              ${listing.pricePerNight.toLocaleString()}
            </span>{" "}
            <span className="text-muted-foreground">/ night</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
