import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "StayBook - Find Your Perfect Stay",
  description: "Book unique places to stay around the Philippines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <header className="border-b border-[var(--color-border)] sticky top-0 bg-white/95 backdrop-blur-sm z-50">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xl font-bold text-[var(--color-fg)]">
                Stay<span className="text-[var(--color-primary)]">Book</span>
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/my-trips"
                className="text-sm font-medium text-[var(--color-fg)] hover:text-[var(--color-primary)] transition-colors"
              >
                My Trips
              </Link>
              <div className="flex items-center gap-2 border border-[var(--color-border)] rounded-full py-1.5 px-3 hover:shadow-md transition-shadow cursor-default">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-sm font-medium">David</span>
              </div>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
