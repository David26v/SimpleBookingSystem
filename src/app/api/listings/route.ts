import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      pricePerNight: true,
      location: true,
      maxGuests: true,
      createdAt: true,
      host: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(listings);
}
