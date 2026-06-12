import { app } from "./app.js";
import { pool, testDbConnection } from "./config/db.js";
import { envConfig } from "./config/env.js";
import { logger } from "./services/logger.service.js";

const PORT = envConfig.port || 8080;

const startServer = async () => {
  logger.info("Testing database connection...");
  await testDbConnection();

  const server = app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
  });

  // Graceful Shutdown
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info("Closed all active connections.");
      try {
        await pool.end();
        logger.info("Database connection pool closed.");
      } catch (err) {
        logger.error(
          "Error closing database connection pool",
          err instanceof Error ? err : { error: err },
        );
      }
      logger.info("Server exiting process.");
      process.exit(0);
    });

    // Force exit after 10 seconds if connections don't close
    setTimeout(() => {
      logger.error(
        "Forcefully shutting down because active connections could not be closed in time.",
      );
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer().catch((error) => {
  logger.error(
    "Critical error starting server",
    error instanceof Error ? error : { error },
  );
  process.exit(1);
});
