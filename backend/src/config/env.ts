import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres?schema=public",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "",
};
