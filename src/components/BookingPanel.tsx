"use client";

import { useState, useMemo } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import {
  format,
  eachDayOfInterval,
  differenceInCalendarDays,
  startOfDay,
} from "date-fns";
import "react-day-picker/style.css";

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

type Step = "dates" | "review";

export function BookingPanel({
  listingId,
  pricePerNight,
  maxGuests,
  bookedRanges,
}: BookingPanelProps) {
  const [step, setStep] = useState<Step>("dates");
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;
  const subtotal = nights * pricePerNight;
  const serviceFee = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + serviceFee;

  const handleStripeCheckout = async () => {
    if (!range?.from || !range?.to) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn: range.from.toISOString(),
          checkOut: range.to.toISOString(),
          guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        if (res.status === 409) {
          setStep("dates");
        }
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[var(--color-border)] rounded-2xl p-6 shadow-lg sticky top-24 animate-fade-in">
      {/* Price header */}
      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-2xl font-bold">
          ${pricePerNight.toLocaleString()}
        </span>
        <span className="text-[var(--color-muted)]">/ night</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-6">
        {(["dates", "review"] as const).map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <div
              className={`step-dot ${
                (step === "review" && i === 0)
                  ? "completed"
                  : step === s
                    ? "active"
                    : "pending"
              }`}
            >
              {step === "review" && i === 0 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < 1 && (
              <div
                className="step-line mx-2"
                style={{
                  background:
                    step === "review"
                      ? "var(--color-success)"
                      : "var(--color-border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Dates */}
      {step === "dates" && (
        <div className="animate-fade-in">
          <div className="flex justify-center mb-4">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              disabled={[...disabledDates, { before: startOfDay(new Date()) }]}
              numberOfMonths={1}
              showOutsideDays
            />
          </div>

          {range?.from && (
            <div className="grid grid-cols-2 border border-[var(--color-border)] rounded-xl overflow-hidden mb-4">
              <div className="p-3 border-r border-[var(--color-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                  Check-in
                </p>
                <p className="text-sm font-medium">
                  {format(range.from, "MMM d, yyyy")}
                </p>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                  Check-out
                </p>
                <p className="text-sm font-medium">
                  {range.to
                    ? format(range.to, "MMM d, yyyy")
                    : "Select date"}
                </p>
              </div>
            </div>
          )}

          <div className="border border-[var(--color-border)] rounded-xl p-3 mb-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] block mb-1">
              Guests
            </label>
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

          <button
            onClick={() => {
              setError(null);
              setStep("review");
            }}
            disabled={!range?.from || !range?.to}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
            style={{
              background:
                !range?.from || !range?.to
                  ? "#b0b0b0"
                  : "linear-gradient(to right, #e61e4d, #bd1e59)",
            }}
          >
            {!range?.from || !range?.to
              ? "Select dates to continue"
              : "Continue"}
          </button>

          {disabledDates.length > 0 && (
            <p className="mt-3 text-xs text-[var(--color-muted)] text-center">
              Grayed-out dates are already booked
            </p>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Review & Pay via Stripe */}
      {step === "review" && range?.from && range?.to && (
        <div className="animate-fade-in">
          <h3 className="font-semibold text-base mb-4">Review your booking</h3>

          <div className="bg-[var(--color-surface)] rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Check-in</span>
              <span className="font-medium">
                {format(range.from, "EEE, MMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Check-out</span>
              <span className="font-medium">
                {format(range.to, "EEE, MMM d, yyyy")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Guests</span>
              <span className="font-medium">
                {guests} guest{guests > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">
                ${pricePerNight.toLocaleString()} x {nights} night
                {nights > 1 ? "s" : ""}
              </span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold pt-3 border-t border-[var(--color-border)]">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Stripe badge */}
          <div className="flex items-center justify-center gap-2 mb-4 py-2 bg-[var(--color-surface)] rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-[var(--color-muted)]">
              Secure payment powered by <strong className="text-[#635bff]">Stripe</strong>
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("dates")}
              disabled={loading}
              className="flex-1 py-3.5 rounded-xl border border-[var(--color-border)] font-semibold text-sm hover:bg-[var(--color-surface)] transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className={`flex-[2] py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] ${loading ? "shimmer" : ""}`}
              style={{
                background: loading
                  ? undefined
                  : "linear-gradient(to right, #e61e4d, #bd1e59)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirecting...
                </span>
              ) : (
                <>Pay ${totalPrice.toLocaleString()} with Stripe</>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
