"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex bg-white rounded-full shadow-lg max-w-xl overflow-visible relative">
      <div
        className="flex-1 px-5 py-3 cursor-pointer relative"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
          Where
        </p>
        <p className="text-sm text-[var(--color-fg)] font-medium">{location}</p>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] py-2 z-50">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(loc);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface)] transition-colors flex items-center gap-3 ${
                  location === loc ? "font-semibold" : ""
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                {loc}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-l border-[var(--color-border)] px-5 py-3">
        <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
          When
        </p>
        <p className="text-sm text-[var(--color-fg)]">Any week</p>
      </div>

      <div className="flex items-center pr-2">
        <button
          onClick={handleSearch}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full p-3 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>
    </div>
  );
}
