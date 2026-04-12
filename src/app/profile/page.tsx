import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Star,
  Shield,
  Mail,
  Clock,
  Home,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

export const revalidate = 120;

export default async function ProfilePage() {
  const user = await prisma.user.findFirst({
    where: { email: "david@example.com" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          listings: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">No user found.</p>
      </div>
    );
  }

  // Get booking stats
  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    select: {
      totalPrice: true,
      status: true,
      checkIn: true,
      listing: {
        select: { location: true },
      },
    },
  });

  const now = new Date();
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const upcomingTrips = confirmedBookings.filter(
    (b) => new Date(b.checkIn) >= now
  ).length;
  const completedTrips = confirmedBookings.filter(
    (b) => new Date(b.checkIn) < now
  ).length;
  const totalSpent = confirmedBookings.reduce(
    (sum, b) => sum + b.totalPrice,
    0
  );

  // Get unique locations visited
  const locationsVisited = [
    ...new Set(
      confirmedBookings
        .filter((b) => new Date(b.checkIn) < now)
        .map((b) => b.listing.location)
    ),
  ];

  const memberSince = format(new Date(user.createdAt), "MMMM yyyy");
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
        <Avatar className="size-20 md:size-24 text-2xl">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="size-3.5" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              Member since {memberSince}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <Badge
              variant="secondary"
              className="rounded-full gap-1 px-3 py-1"
            >
              <Shield className="size-3" />
              Verified
            </Badge>
            {completedTrips >= 5 && (
              <Badge
                variant="secondary"
                className="rounded-full gap-1 px-3 py-1"
              >
                <Star className="size-3" />
                Frequent Traveler
              </Badge>
            )}
            {user._count.listings > 0 && (
              <Badge
                variant="secondary"
                className="rounded-full gap-1 px-3 py-1"
              >
                <Home className="size-3" />
                Host
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card className="py-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {confirmedBookings.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Bookings
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {upcomingTrips}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Upcoming Trips</p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              {locationsVisited.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Places Visited
            </p>
          </CardContent>
        </Card>
        <Card className="py-0">
          <CardContent className="p-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-primary">
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Places Visited */}
      {locationsVisited.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            Places you&apos;ve visited
          </h2>
          <div className="flex flex-wrap gap-2">
            {locationsVisited.map((loc) => (
              <Link
                key={loc}
                href={`/explore?location=${encodeURIComponent(loc)}`}
              >
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  <MapPin className="size-3 mr-1" />
                  {loc}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/my-trips">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">My Trips</p>
                  <p className="text-xs text-muted-foreground">
                    View and manage your reservations
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/explore">
            <Card className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Explore Stays</p>
                  <p className="text-xs text-muted-foreground">
                    Discover new destinations
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Upcoming trips preview */}
      {upcomingTrips > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Next trip
            </h2>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/my-trips" />}
            >
              View all
            </Button>
          </div>
          <NextTripCard userId={user.id} />
        </div>
      )}
    </div>
  );
}

async function NextTripCard({ userId }: { userId: string }) {
  const nextBooking = await prisma.booking.findFirst({
    where: {
      userId,
      status: "confirmed",
      checkIn: { gte: new Date() },
    },
    select: {
      checkIn: true,
      checkOut: true,
      guests: true,
      listing: {
        select: {
          id: true,
          title: true,
          location: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { checkIn: "asc" },
  });

  if (!nextBooking) return null;

  const daysUntil = Math.ceil(
    (new Date(nextBooking.checkIn).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Link href={`/listings/${nextBooking.listing.id}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer py-0 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold truncate">{nextBooking.listing.title}</h3>
            <Badge variant="secondary" className="rounded-full flex-shrink-0">
              {daysUntil === 0
                ? "Today!"
                : daysUntil === 1
                ? "Tomorrow!"
                : `In ${daysUntil} days`}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {nextBooking.listing.location}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {format(new Date(nextBooking.checkIn), "MMM d")} -{" "}
              {format(new Date(nextBooking.checkOut), "MMM d")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
