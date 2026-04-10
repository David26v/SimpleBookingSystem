import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { listingId, checkIn, checkOut, guests } = body;

  if (!listingId || !checkIn || !checkOut || !guests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (checkInDate >= checkOutDate) {
    return NextResponse.json(
      { error: "Check-out must be after check-in" },
      { status: 400 }
    );
  }

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

  // Check for overlapping bookings before creating Stripe session
  const overlapping = await prisma.booking.findMany({
    where: {
      listingId,
      status: "confirmed",
      AND: [
        { checkIn: { lt: checkOutDate } },
        { checkOut: { gt: checkInDate } },
      ],
    },
  });

  if (overlapping.length > 0) {
    return NextResponse.json(
      { error: "These dates are already booked. Please choose different dates." },
      { status: 409 }
    );
  }

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = listing.pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;

  const origin = request.headers.get("origin") || "http://localhost:3001";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: listing.title,
            description: `${nights} night${nights > 1 ? "s" : ""} in ${listing.location}`,
            images: [listing.imageUrl],
          },
          unit_amount: Math.round(subtotal * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Service fee",
          },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/listings/${listingId}`,
    metadata: {
      listingId,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      guests: String(guests),
      totalPrice: String(total),
    },
  });

  return NextResponse.json({ url: session.url });
}
