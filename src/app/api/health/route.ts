import { NextResponse } from "next/server";

export async function GET() {
  const hasDbUrl = !!process.env.BOOKING_DATABASE_URL;
  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

  if (!hasDbUrl) {
    return NextResponse.json({
      status: "error",
      message: "BOOKING_DATABASE_URL is not set",
      hasDbUrl,
      hasStripeKey,
    });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.listing.count();
    return NextResponse.json({
      status: "ok",
      listingCount: count,
      hasDbUrl,
      hasStripeKey,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      status: "error",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
      hasDbUrl,
      hasStripeKey,
    });
  }
}
