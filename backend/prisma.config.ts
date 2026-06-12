/// <reference types="node" />
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres?schema=public",
  },
});
