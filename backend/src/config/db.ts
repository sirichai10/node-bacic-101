import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../services/logger.service.js";
import { envConfig } from "./env.js";

const { Pool } = pg;

const databaseUrl = envConfig.databaseUrl;

if (!databaseUrl) {
  logger.warn("DATABASE_URL environment variable is not defined.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export const testDbConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();

    await prisma.$connect();
    logger.info("Connected to PostgreSQL and Prisma successfully.");
    return true;
  } catch (error) {
    logger.error(
      "Failed to connect to PostgreSQL:",
      error instanceof Error ? error : { error },
    );
    return false;
  }
};
