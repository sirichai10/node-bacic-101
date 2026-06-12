import { prisma } from "../src/config/db.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Cleaning up database...");
  // Cascade delete or delete in correct order
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding users...");
  const adminPasswordHash = await bcrypt.hash("adminpassword123", 10);
  const userPasswordHash = await bcrypt.hash("userpassword123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: adminPasswordHash,
      name: "Admin User",
      role: "ADMIN",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
      status: "active",
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: userPasswordHash,
      name: "Regular User",
      role: "USER",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=User",
      status: "active",
    },
  });

  console.log("Seeding categories...");
  const electronics = await prisma.category.create({
    data: {
      name: "Electronics",
      description: "Devices, gadgets, and accessories",
    },
  });

  const furniture = await prisma.category.create({
    data: {
      name: "Furniture",
      description: "Comfortable and stylish office & home furniture",
    },
  });

  const lifestyle = await prisma.category.create({
    data: {
      name: "Lifestyle",
      description: "Everyday items and utilities",
    },
  });

  console.log("Seeding products...");
  await prisma.product.createMany({
    data: [
      {
        name: "Wireless Mechanical Keyboard",
        description: "75% layout, hot-swappable mechanical keyboard with RGB backlighting.",
        price: 89.99,
        stock: 12,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
        categoryId: electronics.id,
      },
      {
        name: "Ergonomic Office Chair",
        description: "Breathable mesh office chair with adjustable lumbar support and armrests.",
        price: 199.99,
        stock: 5,
        imageUrl: "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27",
        categoryId: furniture.id,
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Double-wall vacuum insulated water bottle, keeps drinks cold for 24 hours.",
        price: 24.99,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
        categoryId: lifestyle.id,
      },
      {
        name: "Noise Cancelling Headphones",
        description: "Over-ear wireless headphones with active noise cancellation and 40h battery life.",
        price: 299.99,
        stock: 0,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        categoryId: electronics.id,
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
