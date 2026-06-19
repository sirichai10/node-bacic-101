import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import type { Request, Response, NextFunction } from "express";

import { loggingMiddleware } from "./middlewares/logging.middleware.js";
import { envConfig } from "./config/env.js";

const app = express();

// Configure CORS
app.use(
  cors({
    origin: envConfig.corsOrigin,
    optionsSuccessStatus: 200,
  })
);

// Body parsers
app.use(express.json());

// Use request logging and correlation ID middleware
app.use(loggingMiddleware);

// Register API Routes
app.use("/", apiRouter);

// Fallback 404 handler for unmatched routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Endpoint not found: ${req.method} ${req.originalUrl}`);
  (err as { status?: number }).status = 404;
  next(err);
});

// Register global error handler
app.use(errorMiddleware);

export { app };
