import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  // Create host user
  const host = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=maria",
    },
  });

  // Create guest user
  const guest = await prisma.user.create({
    data: {
      name: "David Cruz",
      email: "david@example.com",
      avatarUrl: "https://i.pravatar.cc/150?u=david",
    },
  });

  // Create listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "Cozy Beachfront Villa",
        description:
          "A beautiful beachfront villa with stunning ocean views. Perfect for a relaxing getaway with family or friends. Features a private pool, spacious living area, and direct beach access.",
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
        pricePerNight: 250,
        location: "Boracay, Philippines",
        maxGuests: 6,
        hostId: host.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Modern City Loft",
        description:
          "Stylish loft in the heart of the city. Walking distance to restaurants, bars, and attractions. Features floor-to-ceiling windows, a fully equipped kitchen, and high-speed WiFi.",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
        pricePerNight: 120,
        location: "Makati, Metro Manila",
        maxGuests: 2,
        hostId: host.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Mountain Retreat Cabin",
        description:
          "Escape to this charming mountain cabin surrounded by pine trees. Ideal for hikers and nature lovers. Includes a fireplace, hot tub, and panoramic mountain views.",
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
        pricePerNight: 180,
        location: "Baguio, Philippines",
        maxGuests: 4,
        hostId: host.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Lakeside Cottage",
        description:
          "Peaceful lakeside cottage with a private dock. Wake up to serene lake views and enjoy kayaking, fishing, or just relaxing on the porch.",
        imageUrl: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80",
        pricePerNight: 150,
        location: "Tagaytay, Philippines",
        maxGuests: 4,
        hostId: host.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Tropical Garden Studio",
        description:
          "A charming studio apartment surrounded by lush tropical gardens. Features a private terrace, outdoor shower, and is just minutes from the best surf spots.",
        imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
        pricePerNight: 90,
        location: "Siargao, Philippines",
        maxGuests: 2,
        hostId: host.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Heritage Spanish Colonial",
        description:
          "Stay in a beautifully restored Spanish colonial house. Original hardwood floors, antique furniture, and modern amenities blend seamlessly in this unique heritage property.",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
        pricePerNight: 200,
        location: "Vigan, Philippines",
        maxGuests: 5,
        hostId: host.id,
      },
    }),
  ]);

  // Create a sample booking (to show some dates as unavailable)
  const today = new Date();
  const checkIn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
  const checkOut = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  await prisma.booking.create({
    data: {
      checkIn,
      checkOut,
      guests: 2,
      totalPrice: listings[0].pricePerNight * nights,
      listingId: listings[0].id,
      userId: guest.id,
    },
  });

  console.log("Seed data created successfully!");
  console.log(`  - 2 users (host: ${host.email}, guest: ${guest.email})`);
  console.log(`  - ${listings.length} listings`);
  console.log(`  - 1 sample booking`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
