import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger, loggerStore } from "../services/logger.service.js";

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Extract or generate Request/Correlation ID
  const rawId = req.headers["x-request-id"] || req.headers["x-correlation-id"];
  const requestId = (Array.isArray(rawId) ? rawId[0] : rawId) || crypto.randomUUID();

  // 2. Set response header for client traceability
  res.setHeader("x-request-id", requestId);

  // 3. Run the remainder of the request execution within the AsyncLocalStorage context
  loggerStore.run({ requestId }, () => {
    const start = Date.now();

    // Log the request arrival
    logger.debug(`Inbound HTTP Request: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // Capture response completion
    res.on("finish", () => {
      const duration = Date.now() - start;
      const contentLength = res.getHeader("content-length");

      logger.info(`Outbound HTTP Response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: duration,
        contentLength: contentLength ? Number(contentLength) : undefined,
      });
    });

    next();
  });
};
