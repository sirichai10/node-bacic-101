import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { mapUserToResponse } from "../models/user.model.js";
import { UnauthorizedError } from "../utils/errors.js";

export const getProfileData = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User profile not found in request");
    }

    res.status(200).json({
      success: true,
      data: mapUserToResponse(req.user),
    });
  } catch (error) {
    next(error);
  }
};

