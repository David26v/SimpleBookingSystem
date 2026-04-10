import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  const where = listingId
    ? { listingId, status: "confirmed" }
    : { status: "confirmed" };

  const bookings = await prisma.booking.findMany({
    where,
    include: { listing: true, user: true },
    orderBy: { checkIn: "asc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { listingId, checkIn, checkOut, guests } = body;

  // Validate required fields
  if (!listingId || !checkIn || !checkOut || !guests) {
    return NextResponse.json(
      { error: "Missing required fields: listingId, checkIn, checkOut, guests" },
      { status: 400 }
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validate dates
  if (checkInDate >= checkOutDate) {
    return NextResponse.json(
      { error: "Check-out date must be after check-in date" },
      { status: 400 }
    );
  }

  if (checkInDate < new Date(new Date().toDateString())) {
    return NextResponse.json(
      { error: "Check-in date cannot be in the past" },
      { status: 400 }
    );
  }

  // Get listing to validate guests and calculate price
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  if (guests > listing.maxGuests) {
    return NextResponse.json(
      { error: `Maximum ${listing.maxGuests} guests allowed` },
      { status: 400 }
    );
  }

  // Calculate total price
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = listing.pricePerNight * nights;

  let user = await prisma.user.findFirst({
    where: { email: "david@example.com" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Guest User",
        email: "david@example.com",
      },
    });
  }

  // ATOMIC DOUBLE-BOOKING PREVENTION
  // Use a serializable transaction so the overlap check + insert happen atomically.
  // If two requests race, the second one will see the first's booking and fail.
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const overlappingBookings = await tx.booking.findMany({
        where: {
          listingId,
          status: "confirmed",
          AND: [
            { checkIn: { lt: checkOutDate } },
            { checkOut: { gt: checkInDate } },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        throw {
          type: "CONFLICT",
          conflictingDates: overlappingBookings.map((b) => ({
            checkIn: b.checkIn,
            checkOut: b.checkOut,
          })),
        };
      }

      return tx.booking.create({
        data: {
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests,
          totalPrice,
          listingId,
          userId: user!.id,
        },
        include: { listing: true, user: true },
      });
    }, {
      isolationLevel: "Serializable",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "type" in err && err.type === "CONFLICT") {
      const conflict = err as { conflictingDates: { checkIn: Date; checkOut: Date }[] };
      return NextResponse.json(
        {
          error: "These dates are already booked. Please choose different dates.",
          conflictingDates: conflict.conflictingDates,
        },
        { status: 409 }
      );
    }
    throw err;
  }
}
