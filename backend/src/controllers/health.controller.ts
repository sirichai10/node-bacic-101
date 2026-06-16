import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";

export const getHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let dbStatus = "healthy";
    let dbMessage = "Connected";
    try {
      await pool.query("SELECT 1");
    } catch (dbErr) {
      dbStatus = "unhealthy";
      dbMessage = dbErr instanceof Error ? dbErr.message : String(dbErr);
    }

    // test ci
    res.status(dbStatus === "healthy" ? 200 : 500).json({
      success: dbStatus === "healthy",
      data: {
        status: "OK",
        database: {
          status: dbStatus,
          message: dbMessage,
        },
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
