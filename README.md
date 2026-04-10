# Simple Booking System

An Airbnb-style booking platform built with Next.js, featuring calendar-based reservations, double-booking prevention, and real Stripe payment integration.

**Live Demo:** [simple-booking-system-orcin.vercel.app](https://simple-booking-system-orcin.vercel.app)

## Features

- **Browse Listings** - Search and filter properties by location
- **Calendar Booking** - Date picker with real-time availability (booked dates are blocked)
- **Double-Booking Prevention** - Atomic database transactions with serializable isolation prevent overlapping reservations
- **Stripe Payments** - Real checkout flow using Stripe test mode
- **My Trips** - View upcoming/past bookings with cancel functionality
- **Responsive UI** - Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Payments:** Stripe Checkout
- **UI:** shadcn/ui, Tailwind CSS v4, Lucide Icons
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/David26v/SimpleBookingSystem.git
   cd SimpleBookingSystem
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   BOOKING_DATABASE_URL="your-postgresql-connection-string"
   STRIPE_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

4. Push the schema to your database:
   ```bash
   npx prisma db push
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
  app/
    page.tsx                    # Home page with listings grid
    listings/[id]/page.tsx      # Listing detail with booking panel
    book/[id]/page.tsx          # Confirm & pay page
    booking/success/page.tsx    # Post-payment success page
    my-trips/page.tsx           # User's bookings with cancel
    api/
      checkout/route.ts         # Stripe session creation
      bookings/route.ts         # Booking CRUD with double-book prevention
      listings/route.ts         # Listings API
  components/
    BookingPanel.tsx             # Date picker + guest selector
    ListingCard.tsx              # Listing grid card
    SearchBar.tsx                # Location search with dropdown
  lib/
    prisma.ts                   # Prisma client singleton
    stripe.ts                   # Stripe client
prisma/
  schema.prisma                 # Database schema
  seed.ts                       # Sample data seeder
```

## Performance Optimizations

- **ISR Caching** - Public pages revalidate every 60 seconds
- **Database Indexes** - On frequently queried columns (userId, status, location, hostId, createdAt)
- **Selective Queries** - Only fetch needed fields with Prisma `select`
- **Image Optimization** - next/image with automatic WebP conversion and lazy loading
- **Loading Skeletons** - Instant visual feedback while pages load
- **Response Compression** - Enabled in Next.js config

## Deployment

The app is deployed on Vercel. Push to `main` triggers automatic deployment.

**Build command:** `prisma generate && next build`

**Environment variables required on Vercel:**
- `BOOKING_DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
