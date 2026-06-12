import winston from "winston";
import { AsyncLocalStorage } from "async_hooks";
import { envConfig } from "../config/env.js";

export interface LogContext {
  requestId: string;
}

export const loggerStore = new AsyncLocalStorage<LogContext>();

// Custom format to inject request ID from context
const contextFormat = winston.format((info) => {
  const store = loggerStore.getStore();
  if (store?.requestId) {
    info.requestId = store.requestId;
  }
  return info;
});

// For development: pretty printing colorized logs
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, requestId, stack, ...meta } = info;
    const reqIdStr = requestId ? ` [${requestId}]` : "";
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    const stackStr = stack ? `\n${stack}` : "";
    return `[${String(timestamp)}] ${String(level)}${reqIdStr}: ${String(message)}${metaStr}${stackStr}`;
  })
);

// For production: structured JSON format
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }), // automatically capture stack trace
  winston.format.json()
);

const env = envConfig.nodeEnv || "development";
const logLevel = process.env.LOG_LEVEL || (env === "development" ? "debug" : "info");

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    contextFormat(),
    env === "development" ? devFormat : prodFormat
  ),
  defaultMeta: {
    service: "backend-service",
    env,
  },
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error", "warn"],
    }),
  ],
});
