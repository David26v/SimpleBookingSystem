"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  format,
  eachDayOfInterval,
  differenceInCalendarDays,
  startOfDay,
  isWithinInterval,
  areIntervalsOverlapping,
} from "date-fns";
import "react-day-picker/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

interface BookedRange {
  checkIn: string;
  checkOut: string;
}

interface BookingPanelProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
  bookedRanges: BookedRange[];
}

export function BookingPanel({
  listingId,
  pricePerNight,
  maxGuests,
  bookedRanges,
}: BookingPanelProps) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [overlapError, setOverlapError] = useState(false);

  const disabledDates = useMemo(() => {
    const dates: Date[] = [];
    for (const b of bookedRanges) {
      const days = eachDayOfInterval({
        start: new Date(b.checkIn),
        end: new Date(b.checkOut),
      });
      dates.push(...days.slice(0, -1));
    }
    return dates;
  }, [bookedRanges]);

  // Validate that a selected range doesn't overlap with any booked range
  const handleRangeSelect = (newRange: DateRange | undefined) => {
    setOverlapError(false);

    if (newRange?.from && newRange?.to) {
      const hasOverlap = bookedRanges.some((b) => {
        const bookedStart = new Date(b.checkIn);
        const bookedEnd = new Date(b.checkOut);
        return areIntervalsOverlapping(
          { start: newRange.from!, end: newRange.to! },
          { start: bookedStart, end: bookedEnd }
        );
      });

      if (hasOverlap) {
        setOverlapError(true);
        setRange(undefined);
        return;
      }
    }

    setRange(newRange);
  };

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  const canReserve = range?.from && range?.to && nights > 0;

  const handleReserve = () => {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams({
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
      guests: guests.toString(),
    });
    router.push(`/book/${listingId}?${params.toString()}`);
  };

  return (
    <Card className="sticky top-24 shadow-lg rounded-2xl">
      <CardContent className="space-y-4">
        {/* Price header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-semibold">
              ${pricePerNight.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-sm">night</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-foreground text-foreground" />
            <span className="font-medium">4.9</span>
          </div>
        </div>

        {/* Date & Guest selector */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            <div
              className="p-3 border-r border-border cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => {}}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-in
              </p>
              <p className="text-sm font-medium">
                {range?.from ? format(range.from, "MM/dd/yyyy") : "Add date"}
              </p>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => {}}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Check-out
              </p>
              <p className="text-sm font-medium">
                {range?.to ? format(range.to, "MM/dd/yyyy") : "Add date"}
              </p>
            </div>
          </div>
          <div className="border-t border-border p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Guests
            </p>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-sm bg-transparent outline-none font-medium"
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleRangeSelect}
            disabled={[...disabledDates, { before: startOfDay(new Date()) }]}
            numberOfMonths={1}
            showOutsideDays
          />
        </div>

        {/* Reserve button */}
        <Button
          onClick={handleReserve}
          disabled={!canReserve}
          className="w-full h-12 rounded-xl text-[15px] font-semibold"
        >
          Reserve
        </Button>

        {!canReserve && (
          <p className="text-xs text-muted-foreground text-center">
            You won&apos;t be charged yet
          </p>
        )}

        {/* Price breakdown (only when dates selected) */}
        {canReserve && (
          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground underline underline-offset-2">
                ${pricePerNight.toLocaleString()} x {nights} night
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
            <div className="flex justify-between font-semibold">
              <span>Total before taxes</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        )}

        {overlapError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
            These dates overlap with an existing booking. Please select different dates.
          </div>
        )}

        {disabledDates.length > 0 && !overlapError && (
          <p className="text-xs text-muted-foreground text-center">
            Grayed-out dates are already booked
          </p>
        )}
      </CardContent>
    </Card>
  );
}
