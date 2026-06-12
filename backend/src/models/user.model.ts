import { z } from "zod/v3";
import type { User as PrismaUser } from "@prisma/client";

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, "Password must be at least 6 characters long"),
  name: z.string().optional(),
  avatarUrl: z.string().url("Invalid avatar URL format").optional(),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email("Invalid email format"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function mapUserToResponse(user: PrismaUser): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
