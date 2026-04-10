import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  await prisma.booking.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
