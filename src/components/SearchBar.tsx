"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

const locations = [
  "Anywhere in the Philippines",
  "Boracay",
  "Makati",
  "Baguio",
  "Tagaytay",
  "Siargao",
  "Vigan",
];

export function SearchBar({
  initialLocation,
}: {
  initialLocation?: string;
}) {
  const router = useRouter();
  const [location, setLocation] = useState(
    initialLocation || "Anywhere in the Philippines"
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = () => {
    if (location === "Anywhere in the Philippines" || !location) {
      router.push("/");
    } else {
      router.push(`/?location=${encodeURIComponent(location)}`);
    }
    setShowDropdown(false);
  };

  const handleSelect = (loc: string) => {
    setLocation(loc);
    setShowDropdown(false);
    if (loc === "Anywhere in the Philippines") {
      router.push("/");
    } else {
      router.push(`/?location=${encodeURIComponent(loc)}`);
    }
  };

  return (
    <div className="flex bg-background rounded-full shadow-lg max-w-xl overflow-visible relative">
      <div
        className="flex-1 px-5 py-3 cursor-pointer relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
          Where
        </p>
        <p className="text-sm text-foreground font-medium">{location}</p>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-popover rounded-xl shadow-xl ring-1 ring-foreground/10 py-2 z-50">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(loc);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-3 ${
                  location === loc ? "font-semibold text-accent-foreground" : "text-popover-foreground"
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="size-3.5 text-muted-foreground" />
                </span>
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-l border-border px-5 py-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          When
        </p>
        <p className="text-sm text-foreground">Any week</p>
      </div>

      <div className="flex items-center pr-2">
        <Button
          onClick={handleSearch}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Search className="size-4" />
        </Button>
      </div>
    </div>
  );
}
