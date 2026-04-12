import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
        {/* Desktop header */}
        <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xl font-bold text-foreground">
                Stay<span className="text-primary">Book</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/my-trips" />}>
                My Trips
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 border border-border rounded-full py-1 px-2 hover:shadow-md transition-shadow cursor-default">
                <Avatar size="sm">
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium pr-1">David</span>
              </div>
            </div>
          </nav>
        </header>

        <main className="pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </body>
    </html>
  );
}
