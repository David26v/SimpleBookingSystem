"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="h-7 text-xs"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            "Yes, cancel"
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="h-7 text-xs"
        >
          No, keep it
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      className="h-7 text-xs text-muted-foreground hover:text-destructive mt-2"
    >
      <Trash2 className="size-3" />
      Cancel booking
    </Button>
  );
}
