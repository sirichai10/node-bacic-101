import type { Request, Response, NextFunction } from "express";
import type { User } from "@prisma/client";
import { authService } from "../services/auth.service.js";
import { prisma } from "../config/db.js";
import { UnauthorizedError } from "../utils/errors.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError("Authorization token is missing");
    }

    // Verify token using authService
    const decoded = authService.verifyToken(token);

    // Find user in DB to check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("User matching this token no longer exists");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("User account is inactive");
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    next(error);
  }
};
