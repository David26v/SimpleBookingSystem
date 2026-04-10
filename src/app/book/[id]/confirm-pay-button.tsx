"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmPayButtonProps {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

export function ConfirmPayButton({
  listingId,
  checkIn,
  checkOut,
  guests,
}: ConfirmPayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmAndPay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleConfirmAndPay}
        disabled={loading}
        className={`w-full h-14 rounded-xl text-base font-semibold ${loading ? "shimmer" : ""}`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            Redirecting to payment...
          </span>
        ) : (
          "Confirm and pay"
        )}
      </Button>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
