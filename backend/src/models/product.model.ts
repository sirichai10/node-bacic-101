import { z } from "zod/v3";
import type { Product as PrismaProduct, Category as PrismaCategory } from "@prisma/client";

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductWithCategory = PrismaProduct & {
  category: PrismaCategory;
};

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "Name is required and must be a string",
      invalid_type_error: "Name is required and must be a string",
    })
    .min(1, "Name is required and must be a string"),
  price: z
    .number({
      required_error: "Price is required and must be a non-negative number",
      invalid_type_error: "Price is required and must be a non-negative number",
    })
    .min(0, "Price is required and must be a non-negative number"),
  category: z
    .string({
      required_error: "Category is required and must be a string",
      invalid_type_error: "Category is required and must be a string",
    })
    .min(1, "Category is required and must be a string"),
  stock: z
    .number({
      required_error: "Stock is required and must be a non-negative integer",
      invalid_type_error: "Stock is required and must be a non-negative integer",
    })
    .int("Stock is required and must be a non-negative integer")
    .min(0, "Stock is required and must be a non-negative integer"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string({ invalid_type_error: "Name must be a string" }).optional(),
  price: z
    .number({ invalid_type_error: "Price must be a non-negative number" })
    .min(0, "Price must be a non-negative number")
    .optional(),
  category: z
    .string({ invalid_type_error: "Category must be a string" })
    .optional(),
  stock: z
    .number({ invalid_type_error: "Stock must be a non-negative integer" })
    .int("Stock must be a non-negative integer")
    .min(0, "Stock must be a non-negative integer")
    .optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export interface ProductQueryParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  page?: string;
  limit?: string;
}

export interface PaginatedProductsResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

export function mapProductToResponse(product: ProductWithCategory): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    category: product.category.name,
    stock: product.stock,
    imageUrl: product.imageUrl || FALLBACK_IMAGE_URL,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
