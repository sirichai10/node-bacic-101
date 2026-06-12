import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";
import { envConfig } from "../config/env.js";
import type {
  RegisterInput,
  LoginInput,
} from "../models/user.model.js";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  type: "access" | "refresh";
}

export class AuthService {
  private readonly jwtSecret = envConfig.jwtSecret;
  private readonly jwtAccessExpiresIn = envConfig.jwtAccessExpiresIn;
  private readonly jwtRefreshExpiresIn = envConfig.jwtRefreshExpiresIn;

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        password: hashedPassword,
        name: input.name ?? null,
        avatarUrl: input.avatarUrl ?? null,
      },
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = this.verifyToken(refreshToken, "refresh");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError("User matching this token no longer exists");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("User account is inactive");
    }

    const newAccessToken = this.generateAccessToken(user.id);
    const newRefreshToken = this.generateRefreshToken(user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  generateAccessToken(userId: string): string {
    return this.signToken({ userId, type: "access" }, this.jwtAccessExpiresIn);
  }

  generateRefreshToken(userId: string): string {
    return this.signToken({ userId, type: "refresh" }, this.jwtRefreshExpiresIn);
  }

  signToken(payload: TokenPayload, expiresIn: string | number): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: expiresIn as any,
    });
  }

  verifyToken(token: string, type: "access" | "refresh" = "access"): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      if (decoded.type !== type) {
        throw new UnauthorizedError(`Invalid token type: expected ${type}`);
      }
      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}

export const authService = new AuthService();
