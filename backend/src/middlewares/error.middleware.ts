import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { ZodError as ZodErrorV3 } from "zod/v3";
import { AppError } from "../utils/errors.js";
import { logger } from "../services/logger.service.js";

export const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = undefined;

  // 1. Handle our custom operational AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }
  // 2. Handle Zod Validation Errors
  else if (
    err instanceof ZodError ||
    err instanceof ZodErrorV3 ||
    err.name === "ZodError" ||
    err.constructor?.name === "ZodError"
  ) {
    statusCode = 400;
    message = "invalid type";
    details = err.issues.map((issue: any) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  // 3. Handle standard errors that have a status code attached
  else if (err.status && typeof err.status === "number") {
    statusCode = err.status;
    message = err.message || message;
  } else if (err.statusCode && typeof err.statusCode === "number") {
    statusCode = err.statusCode;
    message = err.message || message;
  }

  if (statusCode === 500) {
    logger.error(`API Error 500: ${req.method} ${req.originalUrl}`, err instanceof Error ? err : { error: err });
  } else {
    logger.warn(`API Error ${statusCode}: ${req.method} ${req.originalUrl} - ${message}`, {
      statusCode,
      message,
      details,
    });
  }

  // Send JSON response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(details !== undefined ? { details } : {}),
    },
  });
};
