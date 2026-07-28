import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { readFileSync } from "fs";
import { resolve } from "path";

function createAdapter() {
  const url = new URL(process.env.DATABASE_URL!);
  return new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port, 10),
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace('/', ''),
    ssl: { rejectUnauthorized: false },
    connectionLimit: 5,
  });
}

const prisma = new PrismaClient({
  adapter: createAdapter(),
});

interface ServiceData {
  id: string;
  category: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  waxArea?: string;
  image?: string;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Load services data from JSON
  const servicesPath = resolve(__dirname, "../data/services.json");
  const rawData = readFileSync(servicesPath, "utf-8");
  const services: ServiceData[] = JSON.parse(rawData);

  console.log(`📋 Found ${services.length} services to seed.\n`);

  // Clear existing services
  const deleted = await prisma.service.deleteMany();
  console.log(`🗑️  Cleared ${deleted.count} existing services.\n`);

  // Seed services
  let count = 0;
  for (const service of services) {
    await prisma.service.create({
      data: {
        name: service.name,
        duration: service.duration,
        price: service.price,
        category: service.category,
        description: service.description ?? null,
        waxArea: service.waxArea ?? null,
        imageUrl: service.image ?? null,
      },
    });
    count++;
  }

  console.log(`✅ Successfully seeded ${count} services.\n`);

  // Clear existing blogs
  const deletedBlogs = await prisma.blogPost.deleteMany();
  console.log(`🗑️  Cleared ${deletedBlogs.count} existing blog posts.\n`);

  // Seed blogs
  const blogPosts = [
    {
      title: "The Ultimate Guide to Pre-Wax Care",
      slug: "ultimate-guide-pre-wax-care",
      content: "Preparing your skin before a waxing session can significantly improve your results and minimize discomfort. Start by gently exfoliating the area 24-48 hours prior to your appointment. Keep the skin hydrated, but avoid applying heavy lotions on the day of your wax.",
      imageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Why Regular Facials Are Essential",
      slug: "why-regular-facials-are-essential",
      content: "A professional facial does more than just relax you—it deeply cleanses, exfoliates, and nourishes your skin. Regular treatments help combat signs of aging, clear up acne, and give you that coveted healthy glow. Our estheticians customize each facial to your specific skin needs.",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    },
    {
      title: "Understanding Different Types of Hair Removal",
      slug: "understanding-different-types-of-hair-removal",
      content: "From traditional waxing to modern laser treatments, choosing the right hair removal method can be overwhelming. In this post, we break down the pros, cons, and ideal skin types for each method so you can make an informed decision for your body.",
      imageUrl: "https://images.unsplash.com/photo-1610992015762-45dca7fa3a85?auto=format&fit=crop&q=80&w=800",
    }
  ];

  let blogCount = 0;
  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
    blogCount++;
  }
  
  console.log(`✅ Successfully seeded ${blogCount} blog posts.\n`);

  // Print summary by category
  const categories = await prisma.service.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { category: "asc" },
  });

  console.log("📊 Services by category:");
  for (const cat of categories) {
    console.log(`   • ${cat.category}: ${cat._count.id} services`);
  }
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🎉 Seed complete!");
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
